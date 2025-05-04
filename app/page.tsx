// components/dialogs/create-booking-dialog.tsx (Пример пути)
"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog"; // Путь к UI компонентам
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Убедись, что Select и его части импортированы ПРАВИЛЬНО из shadcn/ui
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient"; // Путь к supabase
import { toast } from "sonner"; // Путь к sonner
import { Loader2 } from "lucide-react";
import { addMinutes, formatISO } from 'date-fns'; // Импорт date-fns

// Опции для длительности в минутах (value будет числом минут в виде строки)
const durationOptions = [
  { value: '30', label: '30 минут' }, { value: '60', label: '1 час' }, { value: '90', label: '1.5 часа' },
  { value: '120', label: '2 часа' }, { value: '150', label: '2.5 часа' }, { value: '180', label: '3 часа' },
  { value: '240', label: '4 часа' }, { value: '300', label: '5 часов' },
];

// Статусы при создании (должны совпадать с ENUM 'booking_status' в БД)
const statusOptions = ['PLANNED', 'ACTIVE'];

// Интерфейс пропсов диалога
interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated?: () => void;
}

// Компонент диалога
export function CreateBookingDialog({ open, onOpenChange, onBookingCreated }: CreateBookingDialogProps) {

  // Функции для значений по умолчанию
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const getDefaultTimeString = () => {
    const now = new Date(); const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour.toTimeString().slice(0, 5); // Формат HH:MM
  };

  // Состояния формы
  const [customerName, setCustomerName] = useState("");
  const [stationName, setStationName] = useState("");
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState(getDefaultTimeString());
  const [durationMinutes, setDurationMinutes] = useState(durationOptions[1].value); // '60'
  const [status, setStatus] = useState(statusOptions[0]); // 'PLANNED'
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Функция сброса формы
  const resetForm = () => {
      setCustomerName(""); setStationName(""); setStartDate(getTodayDateString());
      setStartTime(getDefaultTimeString()); setDurationMinutes(durationOptions[1].value);
      setStatus(statusOptions[0]); setFormError(null); setLoading(false);
  };

   // Сброс формы при открытии диалога
   useEffect(() => {
     if (open) {
       resetForm();
     }
   }, [open]); // Зависимость только от open

  // Обработчик нажатия кнопки "Создать бронь"
  const handleCreateBooking = async () => {
    setFormError(null); // Сброс ошибки

    // --- Валидация ---
    if (!customerName.trim()) { toast.error("Введите имя клиента."); return; }
    if (!stationName.trim()) { toast.error("Введите станцию/ПК."); return; }
    if (!startDate || !startTime || !durationMinutes || !status) { toast.error("Заполните все поля даты, времени, длительности и статуса."); return; }

    setLoading(true); // Включаем индикатор загрузки

    try {
      // --- Собираем дату/время начала ---
      const startDateTimeString = `${startDate}T${startTime}:00`; // YYYY-MM-DDTHH:MM:SS
      const startDateTime = new Date(startDateTimeString);
      if (isNaN(startDateTime.getTime())) throw new Error("Некорректная дата или время начала.");

      // --- Рассчитываем время окончания ---
      const durationNum = parseInt(durationMinutes, 10);
      if (isNaN(durationNum) || durationNum <= 0) throw new Error("Некорректная длительность.");
      const endDateTime = addMinutes(startDateTime, durationNum); // Используем date-fns

      // --- Подготовка данных для Supabase (улучшенная схема) ---
      const bookingData = {
        customer_name: customerName.trim(), // Используем text поле пока нет FK
        station_name: stationName.trim(),   // Используем text поле пока нет FK
        start_time: formatISO(startDateTime), // Преобразуем в ISO строку (timestamptz)
        end_time: formatISO(endDateTime),     // Преобразуем в ISO строку (timestamptz)
        status: status,                       // Передаем выбранное значение ENUM
      };
      console.log("Отправка данных бронирования:", bookingData); // DEBUG

      // --- Вставка в Supabase ---
      // Убедись, что RLS на таблице 'bookings' разрешает INSERT для твоего пользователя
      const { error } = await supabase.from("bookings").insert([bookingData]);
      if (error) throw error; // Передаем ошибку Supabase в catch блок

      // --- Успех ---
      toast.success(`Бронирование для "${customerName.trim()}" успешно создано!`);
      if (onBookingCreated) onBookingCreated(); // Вызываем коллбэк для обновления дашборда
      onOpenChange(false); // Закрываем диалог

    } catch (error: any) {
      // --- Обработка ошибок ---
      console.error("Ошибка при создании бронирования:", error);
      const message = error.details || error.message || "Произошла неизвестная ошибка.";
      setFormError(`Не удалось создать бронирование: ${message}`); // Показываем ошибку в форме
      toast.error(`Не удалось создать бронирование: ${message}`); // Показываем ошибку в уведомлении
    } finally {
      setLoading(false); // Выключаем индикатор загрузки
    }
  };

  // --- JSX разметка диалога ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md"> {/* Можно сделать чуть уже */}
        <DialogHeader>
          <DialogTitle>Новое бронирование</DialogTitle>
          <DialogDescription>Заполните данные для создания брони.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            {/* Клиент */}
            <div className="space-y-1.5">
              <Label htmlFor="customerName-create">Клиент <span className="text-red-500">*</span></Label>
              <Input id="customerName-create" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Имя или никнейм" required disabled={loading} />
            </div>
            {/* Станция */}
            <div className="space-y-1.5">
              <Label htmlFor="stationName-create">Станция/ПК <span className="text-red-500">*</span></Label>
              <Input id="stationName-create" value={stationName} onChange={(e) => setStationName(e.target.value)} placeholder="Номер ПК" required disabled={loading} />
            </div>
            {/* Дата и Время начала */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bookingStartDate-create">Дата начала <span className="text-red-500">*</span></Label>
                  <Input id="bookingStartDate-create" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required disabled={loading} min={getTodayDateString()} /> {/* Нельзя выбрать прошлую дату */}
                </div>
                <div className="space-y-1.5">
                   <Label htmlFor="bookingStartTime-create">Время начала <span className="text-red-500">*</span></Label>
                   <Input id="bookingStartTime-create" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required disabled={loading} />
                </div>
            </div>
            {/* Длительность и Статус */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label htmlFor="bookingDuration-create">Длительность <span className="text-red-500">*</span></Label>
                 {/* Select из shadcn/ui */}
                 <Select value={durationMinutes} onValueChange={setDurationMinutes} disabled={loading}>
                     <SelectTrigger id="bookingDuration-create">
                       <SelectValue placeholder="Выберите..." />
                     </SelectTrigger>
                     <SelectContent>
                       {durationOptions.map(option => (
                         <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                       ))}
                     </SelectContent>
                 </Select>
               </div>
               <div className="space-y-1.5">
                 <Label htmlFor="bookingStatus-create">Статус <span className="text-red-500">*</span></Label>
                  {/* Select из shadcn/ui */}
                 <Select value={status} onValueChange={(value) => setStatus(value as typeof statusOptions[number])} disabled={loading}>
                     <SelectTrigger id="bookingStatus-create">
                       <SelectValue placeholder="Выберите..." />
                     </SelectTrigger>
                     <SelectContent>
                       {statusOptions.map(option => (
                         <SelectItem key={option} value={option}>{option}</SelectItem>
                       ))}
                     </SelectContent>
                 </Select>
               </div>
           </div>
           {/* Отображение ошибки формы */}
           {formError && <p className="text-sm text-red-600 pt-1">{formError}</p>}
        </div>
        {/* Футер с кнопками */}
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" disabled={loading}>Отмена</Button>
            </DialogClose>
            <Button type="button" onClick={handleCreateBooking} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Создание..." : "Создать бронь"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
