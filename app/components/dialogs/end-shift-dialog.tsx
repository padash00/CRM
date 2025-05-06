// app/components/dialogs/end-shift-dialog.tsx (Пример пути)
"use client";

import { useState, useEffect, useCallback } from "react"; // Добавил useCallback
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient"; // Проверь путь
import { toast } from "sonner"; // Используем sonner, как в page.tsx
import { Loader2, User, Landmark, CreditCard, Sigma } from "lucide-react";

// Интерфейс для информации о смене, получаемой из page.tsx
// Убедись, что он совпадает с тем, что используется в page.tsx
interface CurrentShiftInfo {
  shiftId: string | null;
  operatorName: string;
  activeSessionsCount: number | null;
  cashRevenue: number | null;
  cardRevenue: number | null;
  totalRevenue: number | null;
}

// Интерфейс пропсов диалога
interface EndShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftInfo: CurrentShiftInfo | null; // Информация о текущей смене для отображения
  onShiftEnded?: () => void; // Коллбэк после успешного завершения
}

// Функция форматирования валюты (можно вынести в утилиты)
const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "0 ₸"; // Показываем 0 по умолчанию
    // Форматируем с пробелом как разделителем тысяч и без копеек
    return `₸ ${value.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Компонент диалога
export function EndShiftDialog({ open, onOpenChange, shiftInfo, onShiftEnded }: EndShiftDialogProps) {
  // Состояния
  const [endCash, setEndCash] = useState<string>(""); // Фактический остаток наличных (строка для input)
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Сброс состояния при закрытии/открытии
  useEffect(() => {
    if (open) {
       // При открытии можно сразу подставить расчетную кассу в поле ввода, если нужно
       // setEndCash(shiftInfo?.cashRevenue?.toString() ?? "");
       setEndCash(""); // Или оставить пустым
       setFormError(null);
       setLoading(false);
    }
  }, [open]); // Убрали shiftInfo из зависимостей, чтобы поле не сбрасывалось при обновлении пропса

  // Обработчик кнопки "Завершить смену"
  const handleEndShift = useCallback(async () => {
    setFormError(null);

    // Проверка наличия ID смены
    if (!shiftInfo?.shiftId) {
      toast.error("Ошибка: ID активной смены не найден.");
      setFormError("Не удалось определить активную смену.");
      return;
    }

    // Валидация введенной суммы
    // Удаляем пробелы (на случай если скопировали с пробелами) и заменяем запятую на точку
    const endCashString = endCash.replace(/\s/g, '').replace(',', '.');
    const endCashNumber = parseFloat(endCashString);

    if (endCash === "" || isNaN(endCashNumber) || endCashNumber < 0) { // Проверяем и пустую строку
      toast.error("Введите корректный фактический остаток наличных (неотрицательное число).");
      setFormError("Некорректная сумма.");
      return;
    }

    setLoading(true);

    try {
      // Данные для обновления записи смены в таблице 'shifts'
      const updateData = {
        end_time: new Date().toISOString(), // Текущее время как время окончания
        status: 'CLOSED', // Устанавливаем статус ENUM 'CLOSED'
        end_cash: endCashNumber, // Фактический остаток наличных
        // calculated_cash: shiftInfo.cashRevenue, // Можно сохранить и расчетный остаток, если нужно
      };

      console.log(`Завершение смены ${shiftInfo.shiftId} с данными:`, updateData); // DEBUG

      // Обновляем запись в Supabase
      // ВАЖНО: Убедись, что RLS политика для UPDATE таблицы shifts разрешает это действие
      const { error } = await supabase
        .from("shifts")
        .update(updateData)
        .eq("id", shiftInfo.shiftId) // Обновляем по ID
        .eq("status", 'ACTIVE'); // Обновляем только если статус все еще ACTIVE (предохранитель)

      if (error) {
         // Ошибка PGRST116 здесь может означать, что смена уже была закрыта другим запросом/действием
         if (error.code === 'PGRST116') { // "Exactly one row expected, but 0 rows were found or updated"
             throw new Error("Эта смена уже была завершена или не найдена.");
         }
        throw error; // Передаем другие ошибки Supabase в catch
      }

      // Успех
      toast.success(`Смена оператора ${shiftInfo.operatorName} успешно завершена!`);
      if (onShiftEnded) {
        onShiftEnded(); // Вызываем коллбэк для обновления дашборда в page.tsx
      }
      onOpenChange(false); // Закрываем диалог

    } catch (error: any) {
      // Обработка ошибок
      console.error("Ошибка при завершении смены:", error);
      const message = error.message || "Произошла неизвестная ошибка.";
      setFormError(`Не удалось завершить смену: ${message}`);
      toast.error(`Не удалось завершить смену: ${message}`);
    } finally {
      setLoading(false); // Выключаем индикатор загрузки
    }
  }, [shiftInfo, endCash, onOpenChange, onShiftEnded]); // Добавили зависимости


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Завершение текущей смены</DialogTitle>
          <DialogDescription>
            Проверьте расчетные данные и введите фактический остаток наличных для завершения.
          </DialogDescription>
        </DialogHeader>

        {/* Отображаем информацию, только если она есть */}
        {shiftInfo && shiftInfo.shiftId ? (
            <div className="space-y-4 py-4">
                {/* Блок с информацией по смене */}
                <div className="space-y-2 rounded-md border p-3 bg-muted/30">
                    <div className="flex justify-between items-center text-sm"> <span className="text-muted-foreground flex items-center gap-1.5"><User size={14}/>Оператор:</span> <span className="font-medium">{shiftInfo.operatorName}</span> </div>
                    <div className="flex justify-between items-center text-sm"> <span className="text-muted-foreground flex items-center gap-1.5"><Landmark size={14}/>Наличные (расчет):</span> <span className="font-medium">{formatCurrency(shiftInfo.cashRevenue)}</span> </div>
                    <div className="flex justify-between items-center text-sm"> <span className="text-muted-foreground flex items-center gap-1.5"><CreditCard size={14}/>Картой (расчет):</span> <span className="font-medium">{formatCurrency(shiftInfo.cardRevenue)}</span> </div>
                    <div className="flex justify-between items-center text-sm border-t pt-2 mt-2"> <span className="text-muted-foreground flex items-center gap-1.5"><Sigma size={14}/>Итого (расчет):</span> <span className="font-semibold">{formatCurrency(shiftInfo.totalRevenue)}</span> </div>
                </div>

                {/* Поле ввода фактического остатка */}
                <div className="space-y-1.5 pt-2">
                    <Label htmlFor="endCash">Фактический остаток наличных <span className="text-red-500">*</span></Label>
                    <Input
                        id="endCash"
                        type="number" // Тип number для удобного ввода цифр
                        min="0" step="0.01" // Разрешаем копейки/тиины
                        value={endCash}
                        onChange={(e) => setEndCash(e.target.value)}
                        placeholder="0.00" required disabled={loading}
                        className="text-lg font-semibold" // Крупный шрифт для суммы
                    />
                    <p className="text-xs text-muted-foreground">Введите сумму наличных в кассе по факту пересчета.</p>
                </div>
                 {/* Отображение ошибок формы */}
                 {formError && <p className="text-sm text-red-600 pt-1">{formError}</p>}
            </div>
        ) : (
            // Заглушка, если данных о смене нет (хотя диалог не должен открываться)
            <div className="py-6 text-center text-muted-foreground">
                Нет данных об активной смене.
            </div>
        )}
        {/* Футер с кнопками */}
        <DialogFooter>
          <DialogClose asChild> <Button type="button" variant="outline" disabled={loading}>Отмена</Button> </DialogClose>
          <Button
            type="button"
            onClick={handleEndShift}
            // Блокируем кнопку, если идет загрузка, нет ID смены или не введена сумма
            disabled={loading || !shiftInfo?.shiftId || endCash === ""}
            variant="destructive" // Красная кнопка для завершения
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Завершение..." : "Завершить смену"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
