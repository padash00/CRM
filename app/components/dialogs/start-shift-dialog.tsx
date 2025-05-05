// app/components/dialogs/start-shift-dialog.tsx (Пример пути)
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

// Интерфейс для оператора (из твоей таблицы operators)
interface Operator {
  id: string;
  name: string;
  // Добавь другие поля, если они нужны для отображения
}

// Интерфейс пропсов диалога
interface StartShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShiftStarted?: () => void; // Коллбэк после успешного начала смены
}

export function StartShiftDialog({ open, onOpenChange, onShiftStarted }: StartShiftDialogProps) {
  // Состояния
  const [operators, setOperators] = useState<Operator[]>([]); // Список операторов для выбора
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(""); // Выбранный оператор
  const [startCash, setStartCash] = useState<string>(""); // Начальная сумма (строка для input)
  const [loading, setLoading] = useState(false);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Загрузка списка активных операторов при открытии диалога
  useEffect(() => {
    if (open) {
      const fetchOperators = async () => {
        setLoadingOperators(true);
        setOperators([]); // Очищаем перед загрузкой
        setSelectedOperatorId(""); // Сбрасываем выбор
        setStartCash(""); // Сбрасываем кассу
        setFormError(null);

        try {
          // Загружаем только активных операторов
          const { data, error } = await supabase
            .from("operators")
            .select("id, name")
            .eq("status", 'ACTIVE') // Фильтр по ENUM статусу 'ACTIVE'
            .order("name");

          if (error) throw error;
          setOperators(data || []);
        } catch (error: any) {
          console.error("Ошибка загрузки операторов:", error);
          toast.error(`Не удалось загрузить список операторов: ${error.message}`);
          setFormError("Не удалось загрузить список операторов.");
        } finally {
          setLoadingOperators(false);
        }
      };
      fetchOperators();
    }
  }, [open]); // Зависимость от открытия диалога

  // Обработчик начала смены
  const handleStartShift = async () => {
    setFormError(null);

    // --- Валидация ---
    if (!selectedOperatorId) { toast.error("Выберите оператора."); return; }
    const startCashNumber = parseFloat(startCash.replace(',', '.')); // Преобразуем в число, заменяя запятую на точку
    if (isNaN(startCashNumber) || startCashNumber < 0) { toast.error("Начальная сумма наличных должна быть неотрицательным числом."); return; }

    setLoading(true);

    try {
        // 1. Проверяем, нет ли УЖЕ активной смены
        const { data: existingActiveShift, error: checkError } = await supabase
            .from('shifts')
            .select('id')
            .eq('status', 'ACTIVE') // Ищем активную
            .limit(1)
            .maybeSingle(); // Может вернуть одну или null

        if (checkError) throw new Error(`Ошибка проверки активной смены: ${checkError.message}`);

        if (existingActiveShift) {
            throw new Error("Уже есть активная смена. Завершите ее перед началом новой.");
        }

        // 2. Создаем запись о новой смене
        const startTime = new Date(); // Текущее время как время начала
        const { data: newShift, error: shiftInsertError } = await supabase
            .from('shifts')
            .insert({
                start_time: startTime.toISOString(), // Сохраняем как timestamptz
                end_time: null, // Окончание не установлено
                status: 'ACTIVE', // Устанавливаем статус ENUM
                start_cash: startCashNumber
            })
            .select('id') // Нам нужен ID новой смены
            .single(); // Ожидаем одну созданную запись

        if (shiftInsertError) throw new Error(`Ошибка создания смены: ${shiftInsertError.message}`);
        if (!newShift || !newShift.id) throw new Error("Не удалось получить ID созданной смены.");

        const newShiftId = newShift.id;
        console.log("Создана новая смена ID:", newShiftId);

        // 3. Привязываем оператора к смене
        const { error: operatorLinkError } = await supabase
            .from('shift_operators')
            .insert({
                shift_id: newShiftId,
                operator_id: selectedOperatorId
            });

        if (operatorLinkError) {
            // ВАЖНО: Если здесь ошибка, смена создана, но оператор не привязан!
            // В реальном приложении это нужно обрабатывать (например, удалить созданную смену - транзакция!)
            // Пока просто покажем серьезную ошибку
            console.error("Критическая ошибка: смена создана, но оператор не привязан!", operatorLinkError);
            throw new Error(`Смена создана, но не удалось привязать оператора: ${operatorLinkError.message}. Обратитесь к администратору.`);
        }

        // --- Успех ---
        toast.success(`Смена успешно начата!`);
        if (onShiftStarted) {
            onShiftStarted(); // Вызываем коллбэк для обновления дашборда
        }
        onOpenChange(false); // Закрываем диалог

    } catch (error: any) {
        console.error("Ошибка при начале смены:", error);
        setFormError(error.message);
        toast.error(`Не удалось начать смену: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Начать новую смену</DialogTitle>
          <DialogDescription>
            Выберите оператора и укажите начальную сумму наличных в кассе.
          </DialogDescription>
        </DialogHeader>
        {loadingOperators ? (
            <div className="py-10 text-center text-muted-foreground">Загрузка операторов...</div>
        ) : (
            <div className="grid gap-4 py-4">
                {/* Выбор оператора */}
                <div className="space-y-1.5">
                    <Label htmlFor="operatorSelect">Оператор <span className="text-red-500">*</span></Label>
                    <Select value={selectedOperatorId} onValueChange={setSelectedOperatorId} disabled={loading}>
                        <SelectTrigger id="operatorSelect">
                            <SelectValue placeholder="Выберите оператора..." />
                        </SelectTrigger>
                        <SelectContent>
                            {operators.length > 0 ? operators.map(op => (
                                <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                            )) : <div className="p-4 text-center text-sm text-muted-foreground">Нет активных операторов</div>}
                        </SelectContent>
                    </Select>
                </div>
                {/* Начальная касса */}
                <div className="space-y-1.5">
                    <Label htmlFor="startCash">Наличные в кассе <span className="text-red-500">*</span></Label>
                    <Input
                        id="startCash"
                        type="number" // Используем number для удобства ввода
                        min="0"
                        step="0.01" // Для копеек/тиынов
                        value={startCash}
                        onChange={(e) => setStartCash(e.target.value)}
                        placeholder="0.00"
                        required
                        disabled={loading}
                    />
                </div>
                {/* Отображение ошибок */}
                {formError && <p className="text-sm text-red-600 pt-1">{formError}</p>}
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
            onClick={handleStartShift}
            disabled={loading || loadingOperators || !selectedOperatorId || !startCash} // Блокируем, если не все выбрано/введено
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Запуск..." : "Начать смену"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
