import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  applyThemeToDocument,
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeContextValue = {
  /** User preference: light, dark, or system */
  theme: Theme
  /** Resolved appearance applied to the document */
  currentTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return getStoredTheme() ?? defaultTheme
  })

  const [currentTheme, setCurrentTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(getStoredTheme() ?? defaultTheme)
  )

  const applyResolved = useCallback((resolved: ResolvedTheme) => {
    applyThemeToDocument(resolved)
    setCurrentTheme(resolved)
  }, [])

  useEffect(() => {
    const resolved = resolveTheme(theme)
    applyResolved(resolved)
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey, applyResolved])

  useEffect(() => {
    if (theme !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyResolved(getSystemTheme())

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme, applyResolved])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const resolved = resolveTheme(prev)
      return resolved === "dark" ? "light" : "dark"
    })
  }, [])

  const value = useMemo(
    () => ({
      theme,
      currentTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, currentTheme, setTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
