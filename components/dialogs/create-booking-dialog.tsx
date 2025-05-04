// components/dialogs/create-booking-dialog.tsx (Пример пути)
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Интерфейс пропсов
interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated?: () => void; // Коллбэк после создания
}

// Опции для длительности
const durationOptions = [
  "30 минут",
  "1 час",
  "1.5 часа",
  "2 часа",
  "2.5 часа",
  "3 часа",
  "4 часа",
  "5 часов",
  "Весь день", // Пример
];

// Опции для статуса при создании
const statusOptions = [
  "Запланирован",
  "Активен", // Если можно сразу активное создать
];

export function CreateBookingDialog({ open, onOpenChange, onBookingCreated }: CreateBookingDialogProps) {
  // --- Функции для получения даты/времени по умолчанию ---
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const getDefaultTimeString = () => {
    const now = new Date();
    const nextHour = new Date(now);
    // Устанавливаем начало следующего часа
    nextHour.setHours(now.getHours() + 1);
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    // Форматируем как HH:MM
    return nextHour.toTimeString().slice(0, 5);
  };

  // --- Состояния формы ---
  const [customer, setCustomer] = useState(""); // text
  const [station, setStation] = useState("");   // text
  const [date, setDate] = useState(getTodayDateString()); // date
  const [time, setTime] = useState(getDefaultTimeString()); // text (из input type="time")
  const [duration, setDuration] = useState(durationOptions[1]); // text (из select, по умолчанию "1 час")
  const [status, setStatus] = useState(statusOptions[0]);     // text (из select, по умолчанию "Запланирован")
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Сброс формы при закрытии
   useEffect(() => {
     if (!open) {
       const timer = setTimeout(() => {
          setCustomer("");
          setStation("");
          setDate(getTodayDateString());
          setTime(getDefaultTimeString());
          setDuration(durationOptions[1]);
          setStatus(statusOptions[0]);
          setLoading(false);
          setFormError(null);
       }, 150);
       return () => clearTimeout(timer);
     } else {
         // Можно сбросить значения при открытии, если нужно начинать с чистого листа
         // resetForm(); // или вызвать функцию сброса
     }
   }, [open]);

  // Обработчик создания бронирования
  const handleCreateBooking = async () => {
    setFormError(null);

    // --- Валидация (базовая) ---
    if (!customer.trim()) { toast.error("Имя клиента не может быть пустым."); return; }
    if (!station.trim()) { toast.error("Номер станции/ПК не может быть пустым."); return; }
    if (!date) { toast.error("Выберите дату."); return; }
    if (!time) { toast.error("Выберите время."); return; }
    if (!duration) { toast.error("Выберите длительность."); return; }
    if (!status) { toast.error("Выберите статус."); return; }
    // TODO: Добавить более сложную валидацию (например, проверка на пересечение времени бронирования, если нужно)

    setLoading(true);

    try {
      // --- Подготовка данных для вставки (согласно ТЕКУЩЕЙ схеме) ---
      const bookingData = {
        customer: customer.trim(),
        station: station.trim(),
        date: date, // тип date
        time: time, // тип text (из <input type="time">)
        duration: duration, // тип text (из <select>)
        status: status, // тип text (из <select>)
        // created_at: не указываем, т.к. в схеме нет default now()
      };
      console.log("Отправка данных бронирования:", bookingData); // DEBUG

      // --- Вставка в Supabase ---
      const { error } = await supabase
        .from("bookings")
        .insert([bookingData]); // Вставляем одну запись

      if (error) {
        throw error; // Передаем ошибку в catch
      }

      // --- Успех ---
      toast.success(`Бронирование для "${customer.trim()}" успешно создано!`);
      if (onBookingCreated) {
        onBookingCreated(); // Вызываем коллбэк для обновления дашборда
      }
      onOpenChange(false); // Закрываем диалог

    } catch (error: any) {
      console.error("Ошибка при создании бронирования:", error);
      const message = error.details || error.message || "Произошла неизвестная ошибка.";
      const displayError = `Не удалось создать бронирование: ${message}`;
      setFormError(displayError);
      toast.error(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md"> {/* Немного уже стандартного */}
        <DialogHeader>
          <DialogTitle>Новое бронирование</DialogTitle>
          <DialogDescription>
            Заполните данные для создания нового бронирования.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Поле: Клиент */}
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Клиент <span className="text-red-500">*</span></Label>
            {/* TODO: В идеале здесь нужен поиск/выбор существующих клиентов */}
            <Input
              id="customerName"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Имя или никнейм клиента"
              required
              disabled={loading}
            />
          </div>

          {/* Поле: Станция/ПК */}
          <div className="space-y-1.5">
            <Label htmlFor="stationName">Станция/ПК <span className="text-red-500">*</span></Label>
             {/* TODO: В идеале здесь нужен поиск/выбор свободных ПК */}
            <Input
              id="stationName"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              placeholder="Номер ПК или название зоны"
              required
              disabled={loading}
            />
          </div>

          {/* Поля: Дата и Время */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <Label htmlFor="bookingDate">Дата <span className="text-red-500">*</span></Label>
               <Input
                 id="bookingDate"
                 type="date"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 required
                 disabled={loading}
               />
             </div>
             <div className="space-y-1.5">
               <Label htmlFor="bookingTime">Время <span className="text-red-500">*</span></Label>
               <Input
                 id="bookingTime"
                 type="time" // Дает нативный выбор времени
                 value={time}
                 onChange={(e) => setTime(e.target.value)}
                 required
                 disabled={loading}
               />
             </div>
          </div>

          {/* Поля: Длительность и Статус */}
           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <Label htmlFor="bookingDuration">Длительность <span className="text-red-500">*</span></Label>
                 <select
                    id="bookingDuration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={loading}
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Стилизация под shadcn/ui Input/Select
                 >
                   {durationOptions.map(option => (
                       <option key={option} value={option}>{option}</option>
                   ))}
                 </select>
               </div>
               <div className="space-y-1.5">
                 <Label htmlFor="bookingStatus">Статус <span className="text-red-500">*</span></Label>
                 <select
                    id="bookingStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={loading}
                    required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 >
                   {statusOptions.map(option => (
                       <option key={option} value={option}>{option}</option>
                   ))}
                 </select>
               </div>
           </div>

           {/* Отображение ошибок */}
           {formError && <p className="text-sm text-red-600 pt-1">{formError}</p>}

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Отмена
            </Button>
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
