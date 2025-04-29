"use client"

import { useLanguage } from "@/contexts/language-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Типизация бронирования
interface Booking {
  id: string
  customer: string
  initials: string
  time: string
  station: string
  status: "active" | "upcoming"
}

export function RecentBookings() {
  const { t } = useLanguage()

  const bookings: Booking[] = [
    {
      id: "B001",
      customer: "Алексей К.",
      initials: "АК",
      time: "14:30 - 17:30",
      station: "PC-01",
      status: "active",
    },
    {
      id: "B002",
      customer: "Михаил С.",
      initials: "МС",
      time: "15:00 - 18:00",
      station: "PC-03",
      status: "upcoming",
    },
    {
      id: "B003",
      customer: "Дмитрий В.",
      initials: "ДВ",
      time: "13:45 - 14:30",
      station: "PC-04",
      status: "active",
    },
    {
      id: "B004",
      customer: "Сергей Л.",
      initials: "СЛ",
      time: "12:00 - 15:00",
      station: "VIP-01",
      status: "active",
    },
    {
      id: "B005",
      customer: "Андрей К.",
      initials: "АК",
      time: "18:00 - 21:00",
      station: "VIP-03",
      status: "upcoming",
    },
  ]

  // Функция для получения текста статуса с учетом локализации
  const getStatusText = (status: Booking["status"]) =>
    status === "active" ? t("active") : t("upcoming")

  return (
    <div className="space-y-8">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {booking.initials}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{booking.customer}</p>
            <p className="text-sm text-muted-foreground">
              {booking.station} • {booking.time}
            </p>
          </div>
          <div className="ml-auto">
            <Badge
              variant={booking.status === "active" ? "default" : "outline"}
              className={booking.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {getStatusText(booking.status)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

