"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TournamentCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Пример данных о турнирах
  const tournamentsByDate: Record<string, { name: string; game: string; time: string; status: string }[]> = {
    "2025-04-05": [{ name: "CS2 Weekly Cup", game: "Counter-Strike 2", time: "18:00", status: "active" }],
    "2025-04-10": [{ name: "Dota 2 Championship", game: "Dota 2", time: "16:00", status: "registration" }],
    "2025-04-15": [{ name: "Fortnite Solo Tournament", game: "Fortnite", time: "19:00", status: "registration" }],
    "2025-04-20": [{ name: "FIFA 25 Cup", game: "FIFA 25", time: "17:00", status: "registration" }],
    "2025-04-02": [{ name: "Valorant Team Battle", game: "Valorant", time: "20:00", status: "active" }],
    "2025-03-25": [{ name: "League of Legends Cup", game: "League of Legends", time: "18:00", status: "completed" }],
    "2025-03-20": [{ name: "CS2 Pro League", game: "Counter-Strike 2", time: "19:00", status: "completed" }],
  }

  // Функция для форматирования даты в строку для поиска в tournamentsByDate
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0]
  }

  // Получение турниров для выбранной даты
  const selectedDateTournaments = date ? tournamentsByDate[formatDate(date)] || [] : []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge>Активен</Badge>
      case "registration":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Регистрация
          </Badge>
        )
      case "completed":
        return <Badge variant="secondary">Завершен</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      <div className="md:w-1/2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          components={{
            DayContent: (props) => {
              const dateStr = formatDate(props.date)
              const hasTournaments = tournamentsByDate[dateStr]?.length > 0
              return (
                <div className="relative">
                  <div>{props.date.getDate()}</div>
                  {hasTournaments && (
                    <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"></div>
                  )}
                </div>
              )
            },
          }}
        />
      </div>
      <div className="md:w-1/2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-medium">Турниры на {date?.toLocaleDateString("ru-RU")}</h3>
            {selectedDateTournaments.length > 0 ? (
              <div className="space-y-3">
                {selectedDateTournaments.map((tournament, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{tournament.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {tournament.game} • {tournament.time}
                      </div>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">Нет турниров на выбранную дату</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

