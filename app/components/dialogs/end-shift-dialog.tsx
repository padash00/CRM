// app/components/dialogs/end-shift-dialog.tsx (СИЛЬНО УПРОЩЕННАЯ ВЕРСИЯ ДЛЯ ТЕСТА)
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Убрали Input, Label, supabase, toast, иконки, date-fns для теста

// Упрощенные интерфейсы для теста
interface CurrentShiftInfo {
  shiftId: string | null;
  operatorName: string;
}
interface EndShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftInfo: CurrentShiftInfo | null;
  onShiftEnded?: () => void;
}

export function EndShiftDialog({ open, onOpenChange, shiftInfo, onShiftEnded }: EndShiftDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDummyEndShift = () => {
    console.log("Dummy End Shift Clicked. Shift ID:", shiftInfo?.shiftId);
    if (onShiftEnded) onShiftEnded();
    onOpenChange(false);
  }

  console.log("Рендеринг УПРОЩЕННОГО EndShiftDialog, open:", open, "shiftInfo:", shiftInfo); // DEBUG

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Завершение смены (Тест)</DialogTitle>
          <DialogDescription>
            Это тестовый диалог.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p>Оператор: {shiftInfo?.operatorName || "N/A"}</p>
          <p>ID Смены: {shiftInfo?.shiftId || "N/A"}</p>
          <p className="mt-4">Просто текст в диалоге.</p>
        </div>

        <DialogFooter>
          {/* Проверяем DialogClose asChild с Button */}
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>Отмена</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDummyEndShift}
            disabled={loading || !shiftInfo?.shiftId}
            variant="destructive"
          >
            {loading ? "Загрузка..." : "Тест Завершить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
