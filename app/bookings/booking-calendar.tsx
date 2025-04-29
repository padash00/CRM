"use client"

import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Типизация данных бронирования
interface Booking {
  time: string
  customer: string
  station: string
}

interface BookingsByDate {
  [date: string]: Booking[]
}

// Компонент для отображения отдельного бронирования
const BookingItem = ({ booking }: { booking: Booking }) => (
  <div className="flex items-center justify-between rounded-lg border p-3">
    <div>
      <div className="font-medium">{booking.customer}</div>
      <div className="text-sm text-muted-foreground">
        {booking.station} • {booking.time}
      </div>
    </div>
    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
      Детали
    </Badge>
  </div>
)

export function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Данные о бронированиях
  const bookingsByDate: BookingsByDate = {
    "2025-03-29": [
      { time: "10:00 - 12:15", customer: "Иван П.", station: "PC-07" },
      { time: "19:00 - 22:00", customer: "Артем С.", station: "PC-02" },
      { time: "17:30 - 19:30", customer: "Максим К.", station: "XBOX-01" },
    ],
    "2025-03-30": [
      { time: "14:30 - 17:30", customer: "Алексей К.", station: "PC-01" },
      { time: "15:00 - 18:00", customer: "Михаил С.", station: "PC-03" },
      { time: "13:45 - 14:30", customer: "Дмитрий В.", station: "PC-04" },
      { time: "12:00 - 15:00", customer: "Сергей Л.", station: "VIP-01" },
      { time: "18:00 - 21:00", customer: "Андрей К.", station: "VIP-03" },
      { time: "16:00 - 18:00", customer: "Николай Р.", station: "PS5-01" },
    ],
    "2025-03-31": [
      { time: "15:00 - 18:00", customer: "Владимир Н.", station: "PC-05" },
    ],
  }

  // Форматирование даты с мемоизацией
  const formatDate = (date: Date): string => date.toISOString().split("T")[0]

  // Мемоизация выбранных бронирований
  const selectedDateBookings = useMemo(() => {
    if (!date) return []
    return bookingsByDate[formatDate(date)] || []
  }, [date])

  // Мемоизация отформатированной строки даты
  const formattedDate = useMemo(
    () => date?.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) || "",
    [date]
  )

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-4">
      {/* Календарь */}
      <div className="md:w-1/2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow-sm"
          components={{
            DayContent: ({ date: dayDate }) => {
              const dateStr = formatDate(dayDate)
              const hasBookings = !!bookingsByDate[dateStr]?.length
              return (
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <span>{dayDate.getDate()}</span>
                  {hasBookings && (
                    <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
              )
            },
          }}
        />
      </div>

      {/* Список бронирований */}
      <div className="md:w-1/2">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="mb-4 text-lg font-semibold">
              Бронирования на {formattedDate}
            </h3>
            {selectedDateBookings.length > 0 ? (
              <div className="space-y-3">
                {selectedDateBookings.map((booking, index) => (
                  <BookingItem key={index} booking={booking} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Нет бронирований на выбранную дату
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

