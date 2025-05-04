// app/components/dashboard/recent-bookings.tsx
"use client";

import { Badge } from "@/components/ui/badge"; // Используем Badge для статуса
import { Clock, UserCircle, Computer } from "lucide-react"; // Иконки
import { format, parseISO } from 'date-fns'; // Для форматирования времени
import { ru } from 'date-fns/locale'; // Локаль для русского формата времени, если нужно

// Интерфейс для одного бронирования (должен совпадать с тем, что в page.tsx)
// Убедись, что ENUM статусы здесь и в page.tsx/БД совпадают
type BookingStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
interface Booking {
  id: string;
  created_at: string;
  customer_name: string | null;
  station_name: string | null;
  start_time: string; // ISO string (timestamptz)
  end_time: string;   // ISO string (timestamptz)
  status: BookingStatus;
}

// Интерфейс пропсов для компонента
interface RecentBookingsProps {
  bookings: Booking[];
  loading: boolean;
}

// Стилизация статусов (можно вынести в отдельный файл)
const bookingStatusDisplay: Record<BookingStatus, { text: string; className: string }> = {
  PLANNED: { text: "План", className: "bg-blue-100 text-blue-800 border-blue-200" },
  ACTIVE: { text: "Активен", className: "bg-green-100 text-green-800 border-green-200 animate-pulse" },
  COMPLETED: { text: "Завершен", className: "bg-gray-100 text-gray-700 border-gray-200" },
  CANCELLED: { text: "Отменен", className: "bg-red-100 text-red-800 border-red-200" },
  NO_SHOW: { text: "Неявка", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
};


// Компонент для отображения списка
export function RecentBookings({ bookings, loading }: RecentBookingsProps) {

  // Состояние загрузки
  if (loading) {
    // Простой лоадер
    return (
      <div className="flex-grow flex items-center justify-center text-muted-foreground p-4">
        Загрузка бронирований...
      </div>
    );
  }

  // Состояние, когда нет данных
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center text-muted-foreground p-4 text-center text-sm">
        Нет недавних бронирований.
      </div>
    );
  }

  // Отображение списка
  return (
    // Используем div со скроллом, если контент не поместится в родительском CardContent
    // Уберем min-h из CardContent в page.tsx и дадим этому div flex-grow
    <div className="space-y-3 overflow-y-auto px-4 pb-4 pt-1 flex-grow"> {/* Добавлен flex-grow */}
      {bookings.map((booking) => {
        // Форматируем время начала и конца
        let timeString = "Время не указано";
        try {
          // parseISO преобразует строку ISO в объект Date
          const startTime = parseISO(booking.start_time);
          const endTime = parseISO(booking.end_time);
          // format форматирует дату; используем русскую локаль для возможного форматирования дня недели/месяца
          const startTimeFormatted = format(startTime, 'HH:mm', { locale: ru });
          const endTimeFormatted = format(endTime, 'HH:mm', { locale: ru });
          // Проверяем, относятся ли начало и конец к одному дню
          const startDay = format(startTime, 'yyyy-MM-dd');
          const endDay = format(endTime, 'yyyy-MM-dd');
          if (startDay === endDay) {
             timeString = `${startTimeFormatted} - ${endTimeFormatted}`;
          } else {
             // Если бронь переходит на след. день
             timeString = `${format(startTime, 'dd.MM HH:mm')} - ${format(endTime, 'dd.MM HH:mm')}`;
          }

        } catch (e) {
          console.error("Ошибка форматирования даты для бронирования:", booking.id, e);
        }

        // Получаем стиль и текст для статуса
        const statusInfo = bookingStatusDisplay[booking.status] || {
             text: booking.status, // Показать как есть, если статус неизвестен
             className: "bg-gray-100 text-gray-800 border-gray-200"
         };

        return (
          <div key={booking.id} className="flex items-center gap-3 p-2 rounded-md border bg-background hover:bg-muted/50">
            {/* Иконка клиента */}
            <div className="p-1.5 bg-muted rounded-full">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            {/* Информация */}
            <div className="flex-grow text-xs">
              <div className="font-medium text-foreground truncate" title={booking.customer_name ?? undefined}>
                  {booking.customer_name || "Неизвестный клиент"}
              </div>
              <div className="text-muted-foreground truncate" title={booking.station_name ?? undefined}>
                 <Computer className="h-3 w-3 inline-block mr-1"/> {booking.station_name || "Станция не указана"}
              </div>
              <div className="text-muted-foreground mt-0.5">
                 <Clock className="h-3 w-3 inline-block mr-1"/> {timeString}
              </div>
            </div>
            {/* Статус */}
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${statusInfo.className}`}>
              {statusInfo.text}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
