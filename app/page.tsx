"use client";
import { useState, useEffect } from "react";
import { LanguageProvider } from "@/contexts/language-context"
import { TranslatedDashboard } from "@/components/translated-dashboard"
import type { ReactNode } from "react"


// Типизация пропсов (если они появятся в будущем)
interface DashboardProps {
  children?: ReactNode
}

export default function Dashboard({ children }: DashboardProps = {}) {
  return (
    <LanguageProvider>
      <TranslatedDashboard />
      {children}
    </LanguageProvider>
  )
}

