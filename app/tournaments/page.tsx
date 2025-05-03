"use client"

import { useState, useCallback, useEffect } from "react"
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
import { supabase } from "@/lib/supabaseClient"

interface StatCard {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface Tournament {
  id: string
  name: string
  date: string
  prize_pool: number
  participants: number
  status: "active" | "past" | "upcoming"
  created_at: string
}

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("list")
  const [tournaments, setTournaments] = useState<Tournament[]>([])

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("date", { ascending: true })

      if (error) {
        console.error("Ошибка загрузки турниров:", error.message)
      } else {
        setTournaments(data || [])
      }
    }

    fetchTournaments()
  }, [])

  const stats: StatCard[] = [
    {
      title: "Активные турниры",
      value: `${tournaments.filter(t => t.status === "active").length}`,
      description: "Обновлено автоматически",
      icon: Trophy,
    },
    {
      title: "Участники",
      value: `${tournaments.reduce((acc, t) => acc + (t.participants || 0), 0)}`,
      description: "Общее число участников",
      icon: Users,
    },
    {
      title: "Призовой фонд",
      value: `₸${tournaments.reduce((acc, t) => acc + (t.prize_pool || 0), 0).toLocaleString()}`,
      description: "Суммарный фонд всех турниров",
      icon: Trophy,
    },
    {
      title: "Запланировано",
      value: `${tournaments.filter(t => t.status === "upcoming").length}`,
      description: "Турниров в будущем",
      icon: Calendar,
    },
  ]

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    setSearchQuery("")
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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="list">Список турниров</TabsTrigger>
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
          </TabsList>

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
            <TournamentList tournaments={tournaments} search={searchQuery} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <TournamentCalendar tournaments={tournaments} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
