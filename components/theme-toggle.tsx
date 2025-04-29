"use client"

import { useState, useEffect, useCallback } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"

// Типизация темы
type Theme = "light" | "dark"

export function ThemeToggle() {
  const { t } = useLanguage()
  const [theme, setTheme] = useState<Theme>("light")
  const [isClient, setIsClient] = useState(false)

  // Инициализация темы при монтировании
  useEffect(() => {
    setIsClient(true)
    const savedTheme = getStorageItem<Theme>("theme", null)
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const initialTheme: Theme = savedTheme || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  // Переключение темы
  const toggleTheme = useCallback(() => {
    if (!isClient) return

    const newTheme: Theme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    setStorageItem("theme", newTheme)

    toast({
      title: t(newTheme === "dark" ? "darkTheme" : "lightTheme"),
      description: t(newTheme === "dark" ? "darkThemeEnabled" : "lightThemeEnabled"),
    })
  }, [theme, isClient, t])

  // Проверка на стороне клиента для рендеринга
  if (!isClient) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
        <span className="sr-only">{t("changeTheme")}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={t("changeTheme")}
      className="hover:bg-muted/50 transition-colors"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">{t("changeTheme")}</span>
    </Button>
  )
}

