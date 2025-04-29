"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"

interface Booking {
  id: string
  customer: string
  station: string
  date: string
  time: string
  duration: string
}

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
  const [allBookings, setAllBookings] = useState<Booking[]>([])

  const formatDate = (date: Date): string => date.toISOString().split("T")[0]

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase.from("bookings").select("*")
      if (error) {
        console.error("Ошибка при загрузке бронирований:", error)
      } else {
        setAllBookings(data || [])
      }
    }

    fetchBookings()

    const subscription = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('Реалтайм событие (календарь):', payload)

        if (payload.eventType === 'INSERT') {
          setAllBookings((prev) => [...prev, payload.new as Booking])
        } else if (payload.eventType === 'DELETE') {
          setAllBookings((prev) => prev.filter((b) => b.id !== (payload.old as Booking).id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const bookingsByDate = useMemo(() => {
    const grouped: { [date: string]: Booking[] } = {}
    for (const booking of allBookings) {
      if (!grouped[booking.date]) grouped[booking.date] = []
      grouped[booking.date].push(booking)
    }
    return grouped
  }, [allBookings])

  const selectedDateBookings = useMemo(() => {
    if (!date) return []
    return bookingsByDate[formatDate(date)] || []
  }, [date, bookingsByDate])

  const formattedDate = useMemo(
    () =>
      date?.toLocaleDateString("ru-RU", {
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

      {/* Список */}
      <div className="md:w-1/2">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h3 className="mb-4 text-lg font-semibold">
              Бронирования на {formattedDate}
            </h3>
            {selectedDateBookings.length > 0 ? (
              <div className="space-y-3">
                {selectedDateBookings.map((booking) => (
                  <BookingItem key={booking.id} booking={booking} />
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
