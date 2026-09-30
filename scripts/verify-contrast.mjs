/**
 * Contrast audit for the dark palette.
 *
 * The token system re-points emerald/slate/zinc at mode-aware values, which
 * means a stock class like `text-emerald-600` means something very different
 * in dark mode. This checks the pairs that actually appear in the app so the
 * readability of both themes is measured, not assumed.
 *
 * Run: node scripts/verify-contrast.mjs
 */

const hex = (h) => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};

const lin = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const luminance = (h) => {
  const [r, g, b] = hex(h);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* Values taken verbatim from index.css. */
const DARK = {
  canvas: '#0b1411',
  surface: '#13221b',
  surface2: '#182a22',
  em400: '#6fcf97',
  em500: '#57b581',
  em600: '#2a7052',
  em700: '#236048',
  em300: '#bcd9c9',
  em200: '#d2e8dc',
  em50: '#e6f1eb',
  ink2: '#a8bdb3',
  ink3: '#80988e',
  slate700: '#4a5f55',
  slate800: '#2f4139',
  rose300: '#fda4af',
  purple200: '#e9d5ff',
};

const LIGHT = {
  canvas: '#f4f8f5',
  surface: '#ffffff',
  em700: '#047857',
  em800: '#065f46',
  em600: '#059669',
  slate600: '#475569',
  ink: '#17352a',
};

/* [label, foreground, background, minimum ratio required] */
const checks = [
  /* ---- Dark mode: text on dark surfaces (WCAG AA = 4.5) ---- */
  ['dark: em-50  on surface2', DARK.em50, DARK.surface2, 4.5],
  ['dark: em-200 on surface2', DARK.em200, DARK.surface2, 4.5],
  ['dark: em-300 on surface2', DARK.em300, DARK.surface2, 4.5],
  ['dark: em-300 on surface ', DARK.em300, DARK.surface, 4.5],
  ['dark: em-300 on canvas  ', DARK.em300, DARK.canvas, 4.5],
  ['dark: ink-2  on surface2', DARK.ink2, DARK.surface2, 4.5],
  ['dark: ink-3  on surface2', DARK.ink3, DARK.surface2, 4.5],
  ['dark: ink-3  on surface ', DARK.ink3, DARK.surface, 4.5],

  /* Accent text/icons — these are the ones the audit flagged. */
  ['dark: em-400 on surface2 (accent icon)', DARK.em400, DARK.surface2, 3.0],
  ['dark: em-400 on slate700 (border/hover)', DARK.em400, DARK.slate700, 3.0],
  ['dark: rose-300 on surface2', DARK.rose300, DARK.surface2, 4.5],
  ['dark: purple-200 on surface2', DARK.purple200, DARK.surface2, 4.5],

  /* The regressions this change fixes — asserted to be genuinely bad. */
  ['BROKEN em-600 on surface2 (was: em-600 text)', DARK.em600, DARK.surface2, 4.5],
  ['BROKEN em-700 on surface2 (was: crisis link)', DARK.em700, DARK.surface2, 4.5],

  /* ---- Light mode: unchanged by this work (regression guard) ---- */
  ['light: em-700 on surface', LIGHT.em700, LIGHT.surface, 4.5],
  ['light: em-800 on surface', LIGHT.em800, LIGHT.surface, 4.5],
  ['light: ink   on canvas ', LIGHT.ink, LIGHT.canvas, 4.5],
  ['light: slate-600 on surface', LIGHT.slate600, LIGHT.surface, 4.5],
];

let failures = 0;
const lines = [];

for (const [label, fg, bg, min] of checks) {
  const r = ratio(fg, bg);
  const expectBad = label.startsWith('BROKEN');
  const ok = expectBad ? r < min : r >= min;
  if (!ok) failures++;
  lines.push(
    `${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${label}`
  );
}

console.log(lines.join('\n'));
console.log(
  `\n${lines.length - failures}/${lines.length} contrast checks passed.`
);
process.exit(failures === 0 ? 0 : 1);
