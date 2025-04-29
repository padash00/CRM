"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { translations } from "@/lib/i18n"
import { getStorageItem, setStorageItem } from "@/lib/storage-helper"

// Типизация языков
export type Language = "ru"

// Типизация переводов
type TranslationKey = keyof typeof translations["ru"] | keyof typeof translations["kz"]
type Translations = Record<Language, Record<string, string>>

// Интерфейс контекста
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Интерфейс пропсов провайдера
interface LanguageProviderProps {
  children: ReactNode
  defaultLanguage?: Language // Опциональный пропс для дефолтного языка
}

export function LanguageProvider({
  children,
  defaultLanguage = "ru",
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [isClient, setIsClient] = useState(false)

  // Инициализация языка при монтировании
  useEffect(() => {
    setIsClient(true)
    const savedLanguage = getStorageItem<Language>("language", defaultLanguage)
    if (savedLanguage) {
      setLanguageState(savedLanguage)
      document.documentElement.setAttribute("lang", savedLanguage)
    }
  }, [defaultLanguage])

  // Функция смены языка
  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang)
      if (isClient) {
        setStorageItem("language", lang)
        document.documentElement.setAttribute("lang", lang)
      }
    },
    [isClient]
  )

  // Функция перевода
  const t = useCallback(
    (key: TranslationKey): string => {
      const langTranslations = translations[language] as Record<string, string>
      return langTranslations?.[key] || key
    },
    [language]
  )

  // Значение контекста
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

// Хук для использования контекста
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

