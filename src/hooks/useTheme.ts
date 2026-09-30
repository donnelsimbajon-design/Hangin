import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ============================================================================
 * HANGIN THEME — persistence for the light/dark sanctuary
 * ---------------------------------------------------------------------------
 * The visual system itself lives in `index.css`: `@custom-variant dark`
 * re-points the emerald / slate / zinc ramps at mode-aware variables, so a
 * single `.dark` class on <html> re-themes the entire app without any
 * component needing to know which theme is active.
 *
 * This module owns the three things that class alone does not give us:
 *
 *   1. Persistence  — the choice survives a refresh, reload, or app reopen.
 *   2. System default — first-time visitors inherit `prefers-color-scheme`,
 *                     matching the `theme-color` meta tags in index.html.
 *   3. No flash      — `initThemeScript()` is inlined in <head> so the class
 *                     is set *before* first paint (see BOOT SCRIPT below).
 *
 * Storage is best-effort: private-mode Safari throws on `localStorage`, and a
 * theme preference failing to save must never take the app down with it.
 * ============================================================================
 */

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'hangin_theme';

/* ------------------------------------------------------------------ *
 * Storage
 * ------------------------------------------------------------------ */

/**
 * Read the stored preference.
 *
 * Returns `null` when nothing is stored *or* when the stored value is
 * unrecognised, so a hand-edited or stale value silently falls back to the
 * system default instead of pinning the app to a theme nobody asked for.
 */
const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    console.error('Error reading saved theme:', error);
  }

  return null;
};

const writeStoredTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

/* ------------------------------------------------------------------ *
 * Resolution
 * ------------------------------------------------------------------ */

/** Does the visitor's OS currently ask for a dark UI? */
const prefersDark = (): boolean => {
  try {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  } catch (error) {
    console.error('Error reading color scheme preference:', error);
    return false;
  }
};

/**
 * The theme to start from: an explicit saved choice if we have one,
 * otherwise whatever the operating system is set to.
 */
export const getInitialTheme = (): Theme => {
  const stored = readStoredTheme();

  if (stored) {
    return stored;
  }

  return prefersDark() ? 'dark' : 'light';
};

/* ------------------------------------------------------------------ *
 * DOM application
 * ------------------------------------------------------------------ */

/**
 * Reflect a theme onto <html>.
 *
 * Also writes the resolved theme to the two `theme-color` meta tags in
 * index.html. Those carry a `media` qualifier so the browser only honours the
 * one matching the OS — we drop the qualifier from the active tag so the
 * browser chrome (Android status bar, iOS Safari tint) matches the theme the
 * person actually chose rather than the theme their OS prefers.
 */
export const applyTheme = (theme: Theme): void => {
  const isDark = theme === 'dark';

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = theme;

  if (typeof document.querySelectorAll !== 'function') {
    return;
  }

  const metaTags = document.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );

  metaTags.forEach((tag) => {
    tag.removeAttribute('media');
    tag.setAttribute(
      'content',
      isDark ? '#0b1411' : '#f4f8f5'
    );
  });
};

/* ------------------------------------------------------------------ *
 * Boot script — runs before first paint
 * ------------------------------------------------------------------ */

/**
 * A tiny, dependency-free snippet inlined in <head>.
 *
 * The React effect in `useTheme` cannot prevent a flash of the light theme:
 * effects run *after* the first paint, so a dark-mode visitor would see a
 * white screen repaint to dark. Applying the class from a blocking inline
 * script in <head> closes that window.
 *
 * Kept as an exported string (rather than a component) so the ordering is
 * obvious at the call site, and deliberately mirrors the logic above —
 * change one, change both.
 */
export const initThemeScript = (): string => `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    /* Storage blocked: fall through to the light default already in the HTML. */
  }
})();
`.trim();

/* ------------------------------------------------------------------ *
 * Hook
 * ------------------------------------------------------------------ */

export interface ThemeControls {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * App-wide theme state.
 *
 * Initialised lazily from `getInitialTheme()` so the very first render is
 * already correct — the boot script has painted the right colours, and React
 * then agrees with it instead of briefly disagreeing.
 */
export const useTheme = (): ThemeControls => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  /*
   * Has the visitor ever chosen a theme themselves?
   *
   * This has to be a ref rather than derived state, and it has to be sampled
   * once at mount. Deriving it from "is a theme stored?" would be circular:
   * this hook is what writes the stored value, so a fresh visitor would look
   * like they had already chosen — and the OS listener below would never
   * attach, silently freezing the app on whatever the OS said at first load.
   *
   * A ref captures the honest answer instead: "did a choice exist before I
   * ever ran?" True means they chose it (previously, or in this session) and
   * their choice wins. False means we are still borrowing the OS's, so it is
   * worth listening for changes — and not worth persisting.
   */
  const hasExplicitChoice = useRef(readStoredTheme() !== null);

  /* Keep <html> in step with state, and save a deliberate choice. */
  useEffect(() => {
    applyTheme(theme);

    if (hasExplicitChoice.current) {
      writeStoredTheme(theme);
    }
  }, [theme]);

  /*
   * Follow the OS until the visitor expresses a preference of their own.
   *
   * Read the ref (not storage) so an in-session toggle correctly pins the
   * theme, while a first-time visitor keeps tracking the OS at sunset.
   */
  useEffect(() => {
    if (hasExplicitChoice.current) {
      return;
    }

    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setThemeState(event.matches ? 'dark' : 'light');
    };

    query.addEventListener('change', handleChange);

    return () => {
      query.removeEventListener('change', handleChange);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    hasExplicitChoice.current = true;
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    hasExplicitChoice.current = true;
    setThemeState((previous) =>
      previous === 'dark' ? 'light' : 'dark'
    );
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
};
