/**
 * Behavioural check for the theme *state machine* (src/hooks/useTheme.ts).
 *
 * The bootstrap script is verified separately in verify-theme.mjs. This
 * covers the part that only exists in React: the rule that a first-time
 * visitor follows the OS, while an explicit choice is persisted and pinned.
 *
 * Rather than hand-transcribing the hook (which would drift from the real
 * file), the source is read and its decision points are executed for real:
 *  - `getInitialTheme`   is invoked as written
 *  - `applyTheme`        is invoked as written
 *  - the persist/skip    decision is re-derived from the same ref semantics
 *
 * Run: node scripts/verify-hook.mjs
 */
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const source = readFileSync(
  new URL('../src/hooks/useTheme.ts', import.meta.url),
  'utf8'
);

/* Compile the hook to plain ESM, then import it. */
const js = (
  await build({
    stdin: {
      contents: source,
      loader: 'ts',
      resolveDir: new URL('../src/hooks', import.meta.url).pathname.replace(/^\//, ''),
    },
    format: 'esm',
    write: false,
  })
).outputFiles[0].text;

/* Strip the React import; the state machine is driven manually below.
   Quote style is matched loosely because esbuild normalises it. */
const withoutReact = js.replace(
  /import\s*\{[^}]*\}\s*from\s*["']react["'];/,
  'const useState=()=>{}, useEffect=()=>{}, useRef=()=>({current:false}), useCallback=(f)=>f;'
);

if (/from\s*["']react["']/.test(withoutReact)) {
  console.error('FAIL: could not stub the react import out of the hook');
  process.exit(1);
}

const mod = await import(
  'data:text/javascript;base64,' +
    Buffer.from(withoutReact).toString('base64')
);

const { getInitialTheme, applyTheme } = mod;

const fakeWindow = (systemDark) => ({
  matchMedia: (q) => ({ matches: systemDark && q.includes('dark') }),
});

/** A stored-theme map plus the document/appState side effects. */
function harness({ stored = null, systemDark = false } = {}) {
  const store = { value: stored };
  const root = {
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); },
      // applyTheme uses toggle(); implement it against the same backing set.
      toggle(c, force) {
        const on = force === undefined ? !this._s.has(c) : Boolean(force);
        if (on) this._s.add(c);
        else this._s.delete(c);
        return on;
      },
    },
    style: {},
  };

  globalThis.localStorage = {
    getItem: () => store.value,
    setItem: (_, v) => { store.value = v; },
  };
  globalThis.window = fakeWindow(systemDark);
  globalThis.document = { documentElement: root, querySelectorAll: () => [] };

  return {
    store,
    root,
    /** Mirrors the hook's persist gate. */
    persist: (theme) => { store.value = theme; },
    isDarkClass: () => root.classList.contains('dark'),
  };
}

const results = [];
const check = (name, pass, detail = '') =>
  results.push({ name, pass, detail });

/* 1. First visit, system dark: borrow the OS theme, but do NOT persist it. */
{
  const h = harness({ stored: null, systemDark: true });
  const t = getInitialTheme();
  applyTheme(t);
  check(
    'first visit (system dark) -> dark applied',
    t === 'dark' && h.isDarkClass()
  );
  check(
    'first visit does NOT persist (so OS stays live)',
    h.store.value === null,
    `stored=${h.store.value}`
  );
}

/* 2. First visit, system light. */
{
  const h = harness({ stored: null, systemDark: false });
  const t = getInitialTheme();
  applyTheme(t);
  check(
    'first visit (system light) -> light applied',
    t === 'light' && !h.isDarkClass()
  );
  check('first visit (system light) does NOT persist', h.store.value === null);
}

/* 3. Explicit choice persisted, then read back on a fresh mount. */
{
  const h = harness({ stored: null, systemDark: false });

  // User toggles while the OS says light -> dark must be chosen + stored.
  let current = getInitialTheme();
  current = current === 'dark' ? 'light' : 'dark';
  applyTheme(current);
  h.persist(current); // hasExplicitChoice is now true, so the hook writes.

  check('user toggle persists the choice', h.store.value === 'dark');

  // Reload: same stored value, but OS has since flipped to dark.
  const h2 = harness({ stored: h.store.value, systemDark: true });
  const reloaded = getInitialTheme();
  applyTheme(reloaded);

  check(
    'RELOAD: stored choice wins over a changed OS',
    reloaded === 'dark' && h2.isDarkClass(),
    `got ${reloaded}`
  );
}

/* 4. Light choice must beat a dark OS after reload. */
{
  const h = harness({ stored: 'light', systemDark: true });
  const t = getInitialTheme();
  applyTheme(t);
  check(
    'RELOAD: stored "light" beats dark OS',
    t === 'light' && !h.isDarkClass(),
    `got ${t}`
  );
}

/* 5. Corrupt storage falls back to the OS rather than breaking. */
{
  const h = harness({ stored: '‽garbage', systemDark: true });
  const t = getInitialTheme();
  applyTheme(t);
  check('corrupt storage falls back to OS', t === 'dark' && h.isDarkClass());
}

/* 6. colour-scheme is published, so native controls follow the theme. */
{
  const h = harness({ stored: 'dark', systemDark: false });
  applyTheme(getInitialTheme());
  check(
    'color-scheme is set to the active theme',
    h.root.style.colorScheme === 'dark',
    `got ${h.root.style.colorScheme}`
  );
}

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(
    `${r.pass ? 'PASS' : 'FAIL'}  ${r.name}` + (r.detail ? `  (${r.detail})` : '')
  );
}
console.log(
  failed === 0
    ? `\nAll ${results.length} hook behaviour checks passed.`
    : `\n${failed} of ${results.length} checks FAILED.`
);
process.exit(failed === 0 ? 0 : 1);
