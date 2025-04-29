"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Clock, DollarSign, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { BookingStats } from "@/components/booking-stats"
import { RevenueChart } from "@/components/revenue-chart"
import { ClubMap } from "@/components/club-map"
import { RecentBookings } from "@/components/recent-bookings"
import { CreateBookingModal } from "@/components/create-booking-modal"
import { MainNav } from "@/components/main-nav"
import { ActiveSessions } from "@/components/active-sessions"

// Типизация данных статистики
interface Stat {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
}

// Типизация популярных игр
interface GameStat {
  name: string
  percentage: number
}

export function TranslatedDashboard() {
  const { t } = useLanguage()

  // Данные статистики
  const stats: Stat[] = [
    {
      title: t("activeBookings"),
      value: "12",
      change: `${t("lastHour")} +2`,
      icon: CalendarDays,
    },
    {
      title: t("activeCustomers"),
      value: "18",
      change: `${t("lastHour")} +4`,
      icon: Users,
    },
    {
      title: t("todayRevenue"),
      value: "₸15,240",
      change: `${t("sinceLastShift")} +₸2,350`,
      icon: DollarSign,
    },
    {
      title: t("avgSessionTime"),
      value: `2.5 ${t("hoursShort")}`,
      change: `${t("sinceLastWeek")} +0.3 ${t("hoursShort")}`,
      icon: Clock,
    },
  ]

  // Данные популярных игр
  const popularGames: GameStat[] = [
    { name: "Counter-Strike 2", percentage: 42 },
    { name: "Dota 2", percentage: 28 },
    { name: "Fortnite", percentage: 15 },
    { name: "League of Legends", percentage: 10 },
    { name: "Valorant", percentage: 5 },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h2>
          <div className="flex items-center gap-2">
            <CreateBookingModal />
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="sessions">{t("activeSessions")}</TabsTrigger>
            <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
            <TabsTrigger value="map">{t("clubMap")}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index} className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 shadow-sm">
                <CardHeader>
                  <CardTitle>{t("revenue")}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <RevenueChart />
                </CardContent>
              </Card>
              <Card className="col-span-3 shadow-sm">
                <CardHeader>
                  <CardTitle>{t("recentBookings")}</CardTitle>
                  <CardDescription>
                    {t("bookingsToday")} 12
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentBookings />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="sessions" className="space-y-4">
            <ActiveSessions />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{t("bookingStats")}</CardTitle>
                  <CardDescription>{t("bookingDistribution")}</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <BookingStats />
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>{t("popularGames")}</CardTitle>
                  <CardDescription>{t("top5GamesByUsage")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularGames.map((game) => (
                      <div key={game.name} className="flex items-center">
                        <div className="w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{game.name}</span>
                            <span className="text-sm text-muted-foreground">{game.percentage}%</span>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${game.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="map" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>{t("clubMap")}</CardTitle>
                <CardDescription>{t("interactiveClubMap")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ClubMap />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

