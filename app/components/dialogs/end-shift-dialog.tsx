// app/components/dialogs/end-shift-dialog.tsx (Пример пути)
"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Loader2, User, Landmark, CreditCard, Sigma } from "lucide-react"; // Добавил иконки

// Интерфейс для информации о смене, передаваемой из page.tsx
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
  shiftInfo: CurrentShiftInfo | null; // Информация о текущей смене
  onShiftEnded?: () => void; // Коллбэк после успешного завершения
}

export function EndShiftDialog({ open, onOpenChange, shiftInfo, onShiftEnded }: EndShiftDialogProps) {
  // Состояния
  const [endCash, setEndCash] = useState<string>(""); // Фактический остаток наличных (строка)
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!open) {
       const timer = setTimeout(() => {
         setEndCash("");
         setLoading(false);
         setFormError(null);
       }, 150);
       return () => clearTimeout(timer);
    }
  }, [open]);

  // Обработчик завершения смены
  const handleEndShift = async () => {
    setFormError(null);

    // Проверка наличия ID смены
    if (!shiftInfo?.shiftId) {
      toast.error("Ошибка: Не определена текущая смена для завершения.");
      setFormError("Не определена текущая смена.");
      return;
    }

    // Валидация введенной суммы
    const endCashNumber = parseFloat(endCash.replace(',', '.'));
    if (isNaN(endCashNumber) || endCashNumber < 0) {
      toast.error("Укажите корректный фактический остаток наличных (неотрицательное число).");
      setFormError("Некорректная сумма наличных.");
      return;
    }

    setLoading(true);

    try {
      // Данные для обновления записи смены
      const updateData = {
        end_time: new Date().toISOString(), // Текущее время как время окончания
        status: 'CLOSED', // Устанавливаем статус ENUM 'CLOSED'
        end_cash: endCashNumber, // Фактический остаток наличных
        // calculated_cash: shiftInfo.cashRevenue, // Можно сохранить и расчетный остаток
      };

      console.log(`Завершение смены ${shiftInfo.shiftId} с данными:`, updateData); // DEBUG

      // Обновляем запись в Supabase
      // ВАЖНО: Убедись, что RLS политика для UPDATE таблицы shifts разрешает это действие
      const { error } = await supabase
        .from("shifts")
        .update(updateData)
        .eq("id", shiftInfo.shiftId) // Обновляем по ID
        .is('end_time', null); // Доп. проверка, что смена еще не закрыта

      if (error) {
        // Проверка на случай, если смена уже была закрыта другим запросом
         if (error.code === 'PGRST116') { // "Exactly one row expected, but 0 rows were found"
             throw new Error("Смена уже была завершена.");
         }
        throw error; // Передаем другие ошибки Supabase в catch
      }

      // Успех
      toast.success(`Смена оператора ${shiftInfo.operatorName} успешно завершена!`);
      if (onShiftEnded) {
        onShiftEnded(); // Вызываем коллбэк для обновления дашборда
      }
      onOpenChange(false); // Закрываем диалог

    } catch (error: any) {
      console.error("Ошибка при завершении смены:", error);
      const message = error.message || "Произошла неизвестная ошибка.";
      setFormError(`Не удалось завершить смену: ${message}`);
      toast.error(`Не удалось завершить смену: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // Форматирование для отображения (или можно использовать Intl.NumberFormat)
  const formatCurrency = (value: number | null | undefined) => {
      if (value === null || value === undefined) return "N/A";
      return `₸${value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Завершение текущей смены</DialogTitle>
          <DialogDescription>
            Проверьте расчетные данные и введите фактический остаток наличных для завершения смены.
          </DialogDescription>
        </DialogHeader>
        {/* Отображаем информацию о смене, если она есть */}
        {shiftInfo && shiftInfo.shiftId ? (
            <div className="space-y-4 py-4">
                {/* Информация по смене */}
                <div className="space-y-2 rounded-md border p-3 bg-muted/30">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center"><User className="h-4 w-4 mr-1.5"/>Оператор:</span>
                        <span className="font-medium">{shiftInfo.operatorName}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center"><Landmark className="h-4 w-4 mr-1.5"/>Расчет наличными:</span>
                        <span className="font-medium">{formatCurrency(shiftInfo.cashRevenue)}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center"><CreditCard className="h-4 w-4 mr-1.5"/>Расчет картой:</span>
                        <span className="font-medium">{formatCurrency(shiftInfo.cardRevenue)}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                        <span className="text-muted-foreground flex items-center"><Sigma className="h-4 w-4 mr-1.5"/>Общая расчетная выручка:</span>
                        <span className="font-semibold">{formatCurrency(shiftInfo.totalRevenue)}</span>
                    </div>
                </div>

                {/* Поле ввода фактического остатка */}
                <div className="space-y-1.5 pt-2">
                    <Label htmlFor="endCash">Фактический остаток наличных <span className="text-red-500">*</span></Label>
                    <Input
                        id="endCash"
                        type="number"
                        min="0"
                        step="0.01"
                        value={endCash}
                        onChange={(e) => setEndCash(e.target.value)}
                        placeholder="0.00"
                        required
                        disabled={loading}
                        className="text-lg font-semibold" // Крупнее для важности
                    />
                    <p className="text-xs text-muted-foreground">Введите сумму наличных в кассе по факту пересчета.</p>
                </div>

                 {/* Отображение ошибок */}
                 {formError && <p className="text-sm text-red-600 pt-1">{formError}</p>}
            </div>
        ) : (
            // Если вдруг нет информации о смене (хотя диалог не должен был открыться)
            <div className="py-6 text-center text-muted-foreground">
                Нет данных об активной смене.
            </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Отмена
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleEndShift}
            disabled={loading || !shiftInfo?.shiftId || !endCash} // Блокируем, если нет ID или суммы
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
