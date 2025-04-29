"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Search, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { POSInterface } from "./pos-interface"
import { TransactionHistory } from "./transaction-history"
import { toast } from "@/components/ui/use-toast"

// Типизация данных для отчетов
interface ReportAction {
  title: string
  description: string
  buttonText: string
  variant?: "outline" | "default"
  action: () => void
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("pos")

  // Данные для вкладки отчетов
  const reportActions: ReportAction[] = [
    {
      title: "Z-отчет",
      description: "Сформировать Z-отчет за текущую смену",
      buttonText: "Сформировать Z-отчет",
      variant: "default",
      action: () => {
        toast({
          title: "Z-отчет",
          description: "Z-отчет за текущую смену формируется...",
        })
      },
    },
    {
      title: "X-отчет",
      description: "Сформировать X-отчет без закрытия смены",
      buttonText: "Сформировать X-отчет",
      variant: "outline",
      action: () => {
        toast({
          title: "X-отчет",
          description: "X-отчет формируется без закрытия смены...",
        })
      },
    },
    {
      title: "Отчет по продажам",
      description: "Детальный отчет по продажам за период",
      buttonText: "Сформировать отчет",
      variant: "outline",
      action: () => {
        toast({
          title: "Отчет по продажам",
          description: "Детальный отчет по продажам формируется...",
        })
      },
    },
  ]

  // Обработчик новой продажи
  const handleNewSale = useCallback(() => {
    toast({
      title: "Новая продажа",
      description: "Инициализация новой продажи в процессе...",
    })
  }, [])

  // Обработчик поиска
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // Здесь можно передать searchQuery в TransactionHistory для фильтрации
  }, [])

  // Обработчик смены вкладки
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    setSearchQuery("") // Сброс поиска при смене вкладки
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Шапка */}
      <header className="border-b bg-background shadow-sm">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-lg font-semibold">GameZone CRM</span>
          </div>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            {[
              { href: "/", label: "Панель" },
              { href: "/bookings", label: "Бронирования" },
              { href: "/customers", label: "Клиенты" },
              { href: "/staff", label: "Персонал" },
              { href: "/pos", label: "Касса" },
              { href: "/games", label: "Игры" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Кассовые операции</h2>
          <Button onClick={handleNewSale}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Новая продажа
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="pos">Касса</TabsTrigger>
            <TabsTrigger value="history">История транзакций</TabsTrigger>
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
          </TabsList>

          {/* Вкладка "Касса" */}
          <TabsContent value="pos" className="space-y-4">
            <POSInterface />
          </TabsContent>

          {/* Вкладка "История транзакций" */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск транзакций..."
                  className="pl-8 border shadow-sm"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" className="shadow-sm">
                Фильтры
              </Button>
            </div>
            <TransactionHistory />
          </TabsContent>

          {/* Вкладка "Отчеты" */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportActions.map((action) => (
                <Card key={action.title} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant={action.variant || "default"}
                      className="w-full"
                      onClick={action.action}
                    >
                      {action.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

