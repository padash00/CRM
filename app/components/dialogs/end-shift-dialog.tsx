// app/components/dialogs/end-shift-dialog.tsx (ПОЛНАЯ ВЕРСИЯ С ФУТЕРОМ)
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient"; // Проверь путь
import { toast } from "sonner"; // Используем sonner
import { Loader2, User, Landmark, CreditCard, Sigma } from "lucide-react";

// Интерфейс для информации о смене, получаемой из page.tsx
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

// Функция форматирования валюты
const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "0 ₸";
    return `₸ ${value.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Компонент диалога
export function EndShiftDialog({ open, onOpenChange, shiftInfo, onShiftEnded }: EndShiftDialogProps) {
  const [endCash, setEndCash] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEndCash(""); // Очищаем поле при открытии
      setFormError(null);
      setLoading(false);
    }
  }, [open]);

  const handleEndShift = useCallback(async () => {
    setFormError(null);
    if (!shiftInfo?.shiftId) {
      toast.error("Ошибка: ID активной смены не найден.");
      setFormError("Не удалось определить активную смену.");
      return;
    }
    const endCashString = endCash.replace(/\s/g, '').replace(',', '.');
    const endCashNumber = parseFloat(endCashString);
    if (endCash === "" || isNaN(endCashNumber) || endCashNumber < 0) {
      toast.error("Введите корректный фактический остаток наличных (неотрицательное число).");
      setFormError("Некорректная сумма.");
      return;
    }
    setLoading(true);
    try {
      const updateData = {
        end_time: new Date().toISOString(),
        status: 'CLOSED' as const, // Явно указываем тип для ENUM
        end_cash: endCashNumber,
      };
      console.log(`Завершение смены ${shiftInfo.shiftId} с данными:`, updateData);
      const { error } = await supabase
        .from("shifts")
        .update(updateData)
        .eq("id", shiftInfo.shiftId)
        .eq("status", 'ACTIVE' as const); // Обновляем только если статус ACTIVE
      if (error) {
         if (error.code === 'PGRST116') {
             throw new Error("Эта смена уже была завершена или не найдена.");
         }
        throw error;
      }
      toast.success(`Смена оператора ${shiftInfo.operatorName} успешно завершена!`);
      if (onShiftEnded) onShiftEnded();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Ошибка при завершении смены:", error);
      const message = error.message || "Произошла неизвестная ошибка.";
      setFormError(`Не удалось завершить смену: ${message}`);
      toast.error(`Не удалось завершить смену: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [shiftInfo, endCash, onOpenChange, onShiftEnded]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Завершение текущей смены</DialogTitle>
          <DialogDescription>
            Проверьте расчетные данные и введите фактический остаток наличных для завершения.
          </DialogDescription>
        </DialogHeader>

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
                    <Label htmlFor="endCashDialog">Фактический остаток наличных <span className="text-red-500">*</span></Label> {/* Изменил id для уникальности */}
                    <Input
                        id="endCashDialog"
                        type="number"
                        min="0" step="0.01"
                        value={endCash}
                        onChange={(e) => setEndCash(e.target.value)}
                        placeholder="0.00" required disabled={loading}
                        className="text-lg font-semibold"
                    />
                    <p className="text-xs text-muted-foreground">Введите сумму наличных в кассе по факту пересчета.</p>
                </div>
                 {formError && <p className="text-sm text-red-600 pt-1">{formError}</p>}
            </div>
        ) : (
            <div className="py-6 text-center text-muted-foreground"> Нет данных об активной смене. </div>
        )}
        {/* === ВОТ ФУТЕР, КОТОРЫЙ НУЖНО ПРОВЕРИТЬ === */}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>Отмена</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleEndShift}
            disabled={loading || !shiftInfo?.shiftId || endCash === ""}
            variant="destructive"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Завершение..." : "Завершить смену"}
          </Button>
        </DialogFooter>
        {/* ========================================= */}
      </DialogContent>
    </Dialog>
  );
}
