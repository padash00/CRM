"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"

interface Booking {
  id: string
  customer: { id: string; name: string } | null
  station: string
  date: string
  time: string
  duration: string
  status: "booked" | "active" | "upcoming" | "completed"
}

export function BookingTable() {
  const { language } = useLanguage()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)

  const fetchBookings = async () => {
    const { data, error } = await supabase.from("bookings").select(`
  id,
  start_time,
  end_time,
  status,
  duration,
  station,
  customer (
    id,
    name
  )
  `)
    
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" })
      return
    }

    if (!data) return

    const formatted = data.map((b: any) => ({
      id: b.id,
      customer: b.customer, // { id, name }
      station: b.station,
      duration: b.duration,
      status: (b.status?.toLowerCase?.() || "booked") as Booking["status"],
      date: b.start_time ? new Date(b.start_time).toLocaleDateString() : "",
      time: 
        b.start_time && b.end_time
        ? `${new Date(b.start_time).toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit" 
        })} - ${new Date(b.end_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}`
        : "",
    }))
       setBookings(formatted)
    }

  useEffect(() => {
    fetchBookings()

    const subscription = supabase
      .channel("public:bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (payload) => {
        console.log("📡 Realtime payload:", payload)
        fetchBookings()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const getStatusBadge = (status: Booking["status"]) => {
    const variants = {
      booked: <Badge variant="secondary">{language === "ru" ? "Забронировано" : "Брондалған"}</Badge>,
      active: <Badge>{language === "ru" ? "Активно" : "Белсенді"}</Badge>,
      upcoming: <Badge variant="outline">{language === "ru" ? "Ожидает" : "Күтілуде"}</Badge>,
      completed: <Badge variant="secondary">{language === "ru" ? "Завершено" : "Аяқталған"}</Badge>,
    }
    return variants[status]
  }

  const handleEditClick = useCallback((id: string) => {
  const booking = bookings.find((b) => b.id === id)
  if (booking) {
    setEditingBooking(booking)
    setEditDialogOpen(true)
  }
}, [bookings])

  const handleDeleteClick = useCallback((id: string) => {
    setBookingToDelete(id)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!bookingToDelete) return

    const { error } = await supabase.from("bookings").delete().eq("id", bookingToDelete)

    if (error) {
      toast({
        title: language === "ru" ? "Ошибка удаления" : "Жою қатесі",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: language === "ru" ? "Бронирование удалено" : "Брондау жойылды",
        description:
          language === "ru"
            ? `Бронирование ${bookingToDelete} успешно удалено.`
            : `Брондау ${bookingToDelete} сәтті жойылды.`,
      })
      // 👇 Вместо ручного удаления обновляем список
      await fetchBookings()
    }

    setDeleteDialogOpen(false)
    setBookingToDelete(null)
  }, [bookingToDelete, language])

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  
  const BookingRow = ({
    booking,
    onEdit,
    onDelete,
  }: {
    booking: Booking
    onEdit: (id: string) => void
    onDelete: (id: string) => void
  }) => (
    <TableRow>
      <TableCell><Checkbox /></TableCell>
      
      <TableCell>{booking.customer?.name ?? "—"}</TableCell>
      <TableCell>{booking.station}</TableCell>
      <TableCell>{booking.date}</TableCell>
      <TableCell>{booking.time}</TableCell>
      <TableCell>{booking.duration}</TableCell>
      <TableCell>{getStatusBadge(booking.status)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{language === "ru" ? "Открыть меню" : "Мәзірді ашу"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{language === "ru" ? "Действия" : "Әрекеттер"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(booking.id)}>
              <Pencil className="mr-2 h-4 w-4" /> {language === "ru" ? "Редактировать" : "Өңдеу"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(booking.id)}>
              <Trash className="mr-2 h-4 w-4" /> {language === "ru" ? "Удалить" : "Жою"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  return (
    <>
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"><Checkbox /></TableHead>
              
              <TableHead>{language === "ru" ? "Клиент" : "Клиент"}</TableHead>
              <TableHead>{language === "ru" ? "Станция" : "Станция"}</TableHead>
              <TableHead>{language === "ru" ? "Дата" : "Күні"}</TableHead>
              <TableHead>{language === "ru" ? "Время" : "Уақыты"}</TableHead>
              <TableHead>{language === "ru" ? "Длительность" : "Ұзақтығы"}</TableHead>
              <TableHead>{language === "ru" ? "Статус" : "Күйі"}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} onEdit={handleEditClick} onDelete={handleDeleteClick} />
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "ru" ? "Удалить бронирование" : "Брондауды жою"}</DialogTitle>
            <DialogDescription>
              {language === "ru"
                ? `Вы уверены, что хотите удалить бронирование ${bookingToDelete}?`
                : `Сіз ${bookingToDelete} брондауын жойғыңыз келетініне сенімдісіз бе?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {language === "ru" ? "Отмена" : "Болдырмау"}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {language === "ru" ? "Удалить" : "Жою"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
  <DialogContent className="bg-black text-white space-y-4">
    <DialogHeader>
      <DialogTitle>{language === "ru" ? "Редактировать бронирование" : "Брондауды өңдеу"}</DialogTitle>
      <DialogDescription className="text-gray-400">
        {language === "ru" ? "Измените данные и сохраните." : "Мәліметтерді өзгертіп, сақтаңыз."}
      </DialogDescription>
    </DialogHeader>

    {editingBooking && (
      <form
        onSubmit={async (e) => {
          e.preventDefault()

          const formData = new FormData(e.currentTarget)
          const status = formData.get("status") as string
          const duration = formData.get("duration") as string

          const { error } = await supabase
            .from("bookings")
            .update({ status, duration })
            .eq("id", editingBooking.id)

          if (error) {
            toast({
              title: "Ошибка",
              description: error.message,
              variant: "destructive",
            })
          } else {
            toast({ title: "Сохранено", description: "Бронирование обновлено." })
            await fetchBookings()
            setEditDialogOpen(false)
          }
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Статус</label>
          <select
            name="status"
            defaultValue={editingBooking.status}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white"
          >
            <option value="booked">Забронировано</option>
            <option value="active">Активно</option>
            <option value="upcoming">Ожидает</option>
            <option value="completed">Завершено</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Длительность (мин)</label>
          <input
            type="text"
            name="duration"
            defaultValue={editingBooking.duration}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white"
          />
        </div>

        <DialogFooter>
          <Button type="submit">{language === "ru" ? "Сохранить" : "Сақтау"}</Button>
        </DialogFooter>
      </form>
    )}
  </DialogContent>
</Dialog>



    </>
  )
}
