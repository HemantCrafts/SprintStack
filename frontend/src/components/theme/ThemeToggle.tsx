import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/providers/ThemeProvider"

type ThemeToggleProps = {
  className?: string
  size?: "default" | "sm" | "icon"
}

export function ThemeToggle({ className, size = "icon" }: ThemeToggleProps) {
  const { currentTheme, toggleTheme } = useTheme()
  const isDark = currentTheme === "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <Sun
        className={cn(
          "h-[1.2rem] w-[1.2rem] transition-all duration-500",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] transition-all duration-500",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        )}
        aria-hidden
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
