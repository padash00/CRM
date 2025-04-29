"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Типизация доступных языков
type Language = "ru"

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  // Обработчик смены языка
  const changeLanguage = useCallback(
    (newLanguage: Language) => {
      setLanguage(newLanguage)
      toast({
        title: newLanguage === "ru" ? t("kazakhLanguage") : t("russianLanguage"),
        description:
          newLanguage === "ru" ? t("kazakhSelected") : t("russianSelected"),
      })
    },
    [setLanguage, t]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={t("changeLanguage")}
          className="hover:bg-muted/50 transition-colors"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("changeLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="shadow-md">
        <DropdownMenuItem
          onClick={() => changeLanguage("ru")}
          className="flex justify-between items-center cursor-pointer hover:bg-muted/20"
        >
          {t("russian")}
          {language === "ru" && <span className="text-green-500">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("ru")}
          className="flex justify-between items-center cursor-pointer hover:bg-muted/20"
        >
          {t("kazakh")}
          {language === "ru" && <span className="text-green-500">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

