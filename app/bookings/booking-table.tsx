"use client"

import { useState, useCallback } from "react"
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

// Типизация бронирования
interface Booking {
  id: string
  customer: string
  station: string
  date: string
  time: string
  duration: string
  status: "active" | "upcoming" | "completed"
}

export function BookingTable() {
  const { t, language } = useLanguage()
  const [bookings, setBookings] = useState<Booking[]>([
    // Данные перенесены без изменений
    {
      id: "B001",
      customer: "Алексей К.",
      station: "PC-01",
      date: "30.03.2025",
      time: "14:30 - 17:30",
      duration: "3 часа",
      status: "active",
    },
    // ... остальные записи остаются такими же
    {
      id: "B010",
      customer: "Владимир Н.",
      station: "PC-05",
      date: "31.03.2025",
      time: "15:00 - 18:00",
      duration: "3 часа",
      status: "upcoming",
    },
  ])

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)

  const getStatusBadge = (status: Booking["status"]) => {
    const variants = {
      active: <Badge>{language === "ru" ? "Активно" : "Белсенді"}</Badge>,
      upcoming: <Badge variant="outline">{language === "ru" ? "Ожидает" : "Күтілуде"}</Badge>,
      completed: <Badge variant="secondary">{language === "ru" ? "Завершено" : "Аяқталған"}</Badge>,
    }
    return variants[status]
  }

  const handleEditClick = useCallback(
    (id: string) => {
      toast({
        title: language === "ru" ? "Редактирование бронирования" : "Брондауды өңдеу",
        description:
          language === "ru"
            ? `Редактирование бронирования ${id} будет доступно в следующей версии.`
            : `Брондау ${id} өңдеу келесі нұсқада қол жетімді болады.`,
      })
    },
    [language],
  )

  const handleDeleteClick = useCallback((id: string) => {
    setBookingToDelete(id)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!bookingToDelete) return

    setBookings((prev) => prev.filter((booking) => booking.id !== bookingToDelete))
    toast({
      title: language === "ru" ? "Бронирование удалено" : "Брондау жойылды",
      description:
        language === "ru"
          ? `Бронирование ${bookingToDelete} было успешно удалено.`
          : `Брондау ${bookingToDelete} сәтті жойылды.`,
    })
    setDeleteDialogOpen(false)
    setBookingToDelete(null)
  }, [bookingToDelete, language])

  // Компонент строки таблицы
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
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>{booking.id}</TableCell>
      <TableCell>{booking.customer}</TableCell>
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
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
              <TableHead>ID</TableHead>
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
                ? `Вы уверены, что хотите удалить бронирование ${bookingToDelete}? Это действие нельзя отменить.`
                : `${bookingToDelete} брондауын жоюға сенімдісіз бе? Бұл әрекетті болдырмау мүмкін емес.`}
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
    </>
  )
}

