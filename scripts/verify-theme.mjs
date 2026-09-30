/**
 * Verifies the real theme bootstrap contract.
 *
 * Extracts the inline <script> from index.html (the exact code the browser
 * runs before first paint) and executes it against a minimal DOM/Storage
 * shim, so we assert on shipped code rather than a re-implementation.
 *
 * Run: node scripts/verify-theme.mjs
 */
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

const match = html.match(
  /<script>\s*(\(function \(\) \{[\s\S]*?\}\)\(\);)\s*<\/script>/
);

if (!match) {
  console.error('FAIL: could not locate the theme bootstrap script in index.html');
  process.exit(1);
}

const bootstrap = match[1];

/** Build a fake window/document/localStorage and run the bootstrap. */
function run({ stored = null, systemDark = false, storageThrows = false } = {}) {
  const root = { classList: createClassList(), style: {} };
  const meta = [{ removeAttribute() {}, setAttribute(k, v) { this.content = v; } }];

  const sandbox = {
    document: {
      documentElement: root,
      querySelectorAll: () => meta,
    },
    localStorage: {
      getItem: () => {
        if (storageThrows) throw new Error('SecurityError: storage disabled');
        return stored;
      },
      setItem: () => {},
    },
    window: {
      matchMedia: (q) => ({ matches: systemDark && q.includes('dark') }),
    },
  };

  // Indirect eval keeps the script out of this module's lexical scope,
  // mirroring how the browser evaluates it as its own script.
  new Function(
    'document',
    'localStorage',
    'window',
    bootstrap
  )(sandbox.document, sandbox.localStorage, sandbox.window);

  return {
    isDark: root.classList.contains('dark'),
    colorScheme: root.style.colorScheme,
  };
}

function createClassList() {
  const set = new Set();
  return {
    add: (c) => set.add(c),
    remove: (c) => set.delete(c),
    contains: (c) => set.has(c),
  };
}

const cases = [
  {
    name: 'no stored value + system prefers dark  -> dark',
    input: { stored: null, systemDark: true },
    expect: { isDark: true, colorScheme: 'dark' },
  },
  {
    name: 'no stored value + system prefers light -> light',
    input: { stored: null, systemDark: false },
    expect: { isDark: false, colorScheme: 'light' },
  },
  {
    name: 'stored "dark"  overrides system light   -> dark',
    input: { stored: 'dark', systemDark: false },
    expect: { isDark: true, colorScheme: 'dark' },
  },
  {
    name: 'stored "light" overrides system dark    -> light',
    input: { stored: 'light', systemDark: true },
    expect: { isDark: false, colorScheme: 'light' },
  },
  {
    name: 'corrupt stored value -> falls back to system dark',
    input: { stored: 'banana', systemDark: true },
    expect: { isDark: true, colorScheme: 'dark' },
  },
  {
    name: 'corrupt stored value -> falls back to system light',
    input: { stored: 'banana', systemDark: false },
    expect: { isDark: false, colorScheme: 'light' },
  },
  {
    name: 'storage throws -> safe light default, no crash',
    input: { stored: null, systemDark: true, storageThrows: true },
    expect: { isDark: false, colorScheme: undefined },
  },
];

let failed = 0;

for (const test of cases) {
  const actual = run(test.input);
  const pass =
    actual.isDark === test.expect.isDark &&
    actual.colorScheme === test.expect.colorScheme;

  if (!pass) failed++;
  console.log(
    `${pass ? 'PASS' : 'FAIL'}  ${test.name}` +
      (pass
        ? ''
        : `\n        expected ${JSON.stringify(test.expect)}, got ${JSON.stringify(actual)}`)
  );
}

console.log(
  failed === 0
    ? `\nAll ${cases.length} theme bootstrap checks passed.`
    : `\n${failed} of ${cases.length} checks FAILED.`
);
process.exit(failed === 0 ? 0 : 1);
