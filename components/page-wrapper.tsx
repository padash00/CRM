"use client"

import type { ReactNode } from "react"
import { LanguageProvider } from "@/contexts/language-context"
import { MainNav } from "@/components/main-nav"
import { Toaster } from "@/components/ui/toaster"

// Интерфейс пропсов компонента
interface PageWrapperProps {
  children: ReactNode
  className?: string // Дополнительный класс для кастомизации
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <LanguageProvider>
      <div className={`flex min-h-screen w-full flex-col ${className}`}>
        <MainNav />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {children}
        </main>
      </div>
      <Toaster /> {/* Добавлен для отображения уведомлений */}
    </LanguageProvider>
  )
}

