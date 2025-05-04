// components/dialogs/create-booking-dialog.tsx (УЛУЧШЕННАЯ ВЕРСИЯ)
"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Используем Select из shadcn/ui
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { addMinutes, formatISO } from 'date-fns'; // Библиотека для работы с датами

// Опции длительности в минутах (значение value будет числом минут)
const durationOptions = [
  { value: '30', label: '30 минут' },
  { value: '60', label: '1 час' },
  { value: '90', label: '1.5 часа' },
  { value: '120', label: '2 часа' },
  { value: '150', label: '2.5 часа' },
  { value: '180', label: '3 часа' },
  { value: '240', label: '4 часа' },
  { value: '300', label: '5 часов' },
];

// Возможные статусы при создании (соответствуют ENUM)
const statusOptions = ['PLANNED', 'ACTIVE']; // 'PLANNED' по умолчанию

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated?: () => void;
}

export function CreateBookingDialog({ open, onOpenChange, onBookingCreated }: CreateBookingDialogProps) {

  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const getDefaultTimeString = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Устанавливаем начало следующего часа
    return nextHour.toTimeString().slice(0, 5); // Формат HH:MM
  };

  // Состояния формы
  const [customerName, setCustomerName] = useState("");
  const [stationName, setStationName] = useState("");
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState(getDefaultTimeString()); // Формат HH:MM
  const [durationMinutes, setDurationMinutes] = useState(durationOptions[1].value); // Значение в минутах (строка), по умолчанию '60'
  const [status, setStatus] = useState(statusOptions[0]); // 'PLANNED'
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Сброс формы
  const resetForm = () => {
      setCustomerName("");
      setStationName("");
      setStartDate(getTodayDateString());
      setStartTime(getDefaultTimeString());
      setDurationMinutes(durationOptions[1].value);
      setStatus(statusOptions[0]);
      setFormError(null);
      setLoading(false);
  }

   useEffect(() => {
     if (open) { resetForm(); } // Сбрасываем при открытии
   }, [open]);

  // Обработчик создания
  const handleCreateBooking = async () => {
    setFormError(null);

    // Валидация
    if (!customerName.trim()) { toast.error("Введите имя клиента."); return; }
    if (!stationName.trim()) { toast.error("Введите станцию/ПК."); return; }
    if (!startDate || !startTime || !durationMinutes || !status) {
        toast.error("Заполните все поля даты, времени, длительности и статуса.");
        return;
    }

    setLoading(true);

    try {
      // --- Собираем дату и время начала ---
      // ВАЖНО: new Date() парсит дату в ЛОКАЛЬНОМ времени пользователя.
      // Если время на сервере и у клиента разное, это может вызвать проблемы.
      // Для надежности лучше использовать библиотеки для работы с часовыми поясами (напр., date-fns-tz)
      // или всегда работать в UTC. Пока оставим простой вариант.
      const startDateTimeString = `${startDate}T${startTime}:00`; // Формируем строку YYYY-MM-DDTHH:MM:SS
      const startDateTime = new Date(startDateTimeString);

      if (isNaN(startDateTime.getTime())) {
          throw new Error("Некорректная дата или время начала.");
      }

      // --- Рассчитываем время окончания ---
      const durationNum = parseInt(durationMinutes, 10);
      if (isNaN(durationNum) || durationNum <= 0) {
          throw new Error("Некорректная длительность.");
      }
      const endDateTime = addMinutes(startDateTime, durationNum); // Используем date-fns для добавления минут

      // --- Подготовка данных для вставки (улучшенная схема) ---
      const bookingData = {
        customer_name: customerName.trim(),
        station_name: stationName.trim(),
        start_time: formatISO(startDateTime), // Преобразуем в ISO строку (YYYY-MM-DDTHH:mm:ss.sssZ) - timestamptz
        end_time: formatISO(endDateTime),     // Преобразуем в ISO строку - timestamptz
        status: status, // Сохраняем значение ENUM
      };
      console.log("Отправка данных бронирования (улучш.):", bookingData); // DEBUG

      // --- Вставка в Supabase ---
      const { error } = await supabase.from("bookings").insert([bookingData]);

      if (error) throw error;

      // --- Успех ---
      toast.success(`Бронирование для "${customerName.trim()}" успешно создано!`);
      if (onBookingCreated) onBookingCreated();
      onOpenChange(false);

    } catch (error: any) {
      console.error("Ошибка при создании бронирования:", error);
      const message = error.details || error.message || "Произошла неизвестная ошибка.";
      setFormError(`Не удалось создать бронирование: ${message}`);
      toast.error(`Не удалось создать бронирование: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader> <DialogTitle>Новое бронирование</DialogTitle> <DialogDescription>Заполните данные для создания брони.</DialogDescription> </DialogHeader>
        <div className="grid gap-4 py-4">
            {/* Клиент */}
            <div className="space-y-1.5"> <Label htmlFor="customerName-edit">Клиент <span className="text-red-500">*</span></Label> <Input id="customerName-edit" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Имя или никнейм" required disabled={loading} /> </div>
            {/* Станция */}
            <div className="space-y-1.5"> <Label htmlFor="stationName-edit">Станция/ПК <span className="text-red-500">*</span></Label> <Input id="stationName-edit" value={stationName} onChange={(e) => setStationName(e.target.value)} placeholder="Номер ПК" required disabled={loading} /> </div>
            {/* Дата и Время начала */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"> <Label htmlFor="bookingStartDate">Дата начала <span className="text-red-500">*</span></Label> <Input id="bookingStartDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required disabled={loading} /> </div>
                <div className="space-y-1.5"> <Label htmlFor="bookingStartTime">Время начала <span className="text-red-500">*</span></Label> <Input id="bookingStartTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required disabled={loading} /> </div>
            </div>
            {/* Длительность и Статус */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label htmlFor="bookingDuration-edit">Длительность <span className="text-red-500">*</span></Label>
                 {/* Используем Select из shadcn/ui */}
                 <Select value={durationMinutes} onValueChange={setDurationMinutes} disabled={loading}>
                     <SelectTrigger id="bookingDuration-edit"> <SelectValue placeholder="Выберите длительность..." /> </SelectTrigger>
                     <SelectContent>
                         {durationOptions.map(option => ( <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem> ))}
                     </SelectContent>
                 </Select>
               </div>
               <div className="space-y-1.5">
                 <Label htmlFor="bookingStatus-edit">Статус <span className="text-red-500">*</span></Label>
                 <Select value={status} onValueChange={(value) => setStatus(value as typeof statusOptions[number])} disabled={loading}>
                     <SelectTrigger id="bookingStatus-edit"> <SelectValue placeholder="Выберите статус..." /> </SelectTrigger>
                     <SelectContent>
                         {statusOptions.map(option => ( <SelectItem key={option} value={option}>{option}</SelectItem> ))}
                     </SelectContent>
                 </Select>
               </div>
           </div>
           {formError && <p className="text-sm text-red-600 pt-1">{formError}</p>}
        </div>
        <DialogFooter> <DialogClose asChild> <Button type="button" variant="outline" disabled={loading}>Отмена</Button> </DialogClose> <Button type="button" onClick={handleCreateBooking} disabled={loading}> {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {loading ? "Создание..." : "Создать бронь"} </Button> </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
