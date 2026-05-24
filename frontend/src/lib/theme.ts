export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "vite-ui-theme"

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return getSystemTheme()
  return theme
}

export function applyThemeToDocument(resolved: ResolvedTheme): void {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  if (resolved === "dark") {
    root.classList.add("dark")
  }
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored
  }
  return null
}

/** Inline script source — runs before React to prevent theme flash */
export const themeInitScript = `
(function () {
  try {
    var key = "${THEME_STORAGE_KEY}";
    var stored = localStorage.getItem(key);
    var theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    var resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    if (resolved === "dark") root.classList.add("dark");
  } catch (e) {}
})();
`.trim()
