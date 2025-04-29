"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Trophy, Users, Calendar } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { TournamentList } from "@/components/tournament-list"
import { TournamentCalendar } from "@/components/tournament-calendar"

// Типизация данных статистики
interface StatCard {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("list")

  // Данные статистики
  const stats: StatCard[] = [
    {
      title: "Активные турниры",
      value: "3",
      description: "2 турнира на этой неделе",
      icon: Trophy,
    },
    {
      title: "Участники",
      value: "48",
      description: "+12 с прошлого месяца",
      icon: Users,
    },
    {
      title: "Призовой фонд",
      value: "₸150,000",
      description: "За все активные турниры",
      icon: Trophy,
    },
    {
      title: "Запланировано",
      value: "5",
      description: "На следующие 30 дней",
      icon: Calendar,
    },
  ]

  // Обработчик поиска
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // Здесь можно передать searchQuery в TournamentList для фильтрации
  }, [])

  // Обработчик смены вкладки
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    setSearchQuery("") // Сброс поиска при смене вкладки
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Управление турнирами</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Новый турнир
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="list">Список турниров</TabsTrigger>
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
          </TabsList>

          {/* Вкладка "Список турниров" */}
          <TabsContent value="list" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск турниров..."
                  className="pl-8 border shadow-sm"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" className="shadow-sm">
                Фильтры
              </Button>
            </div>
            <TournamentList />
          </TabsContent>

          {/* Вкладка "Календарь" */}
          <TabsContent value="calendar" className="space-y-4">
            <TournamentCalendar />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

