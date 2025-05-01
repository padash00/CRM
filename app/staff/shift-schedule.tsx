// app/staff/shift-schedule.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

// Типизация оператора
interface Operator {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  working_hours: string;
  role: "maindev" | "operator";
}

// Типизация смены
interface Shift {
  id: string;
  date: string;
  time: string;
  operators: Operator[];
}

interface ShiftScheduleProps {
  operators: Operator[];
  currentOperator: Operator | null;
}

export function ShiftSchedule({ operators, currentOperator }: ShiftScheduleProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState<boolean>(false);
  const [shiftTime, setShiftTime] = useState<string>("10:00 - 22:00");
  const [selectedOperatorIds, setSelectedOperatorIds] = useState<string[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Форматирование даты в строку
  const formatDate = useCallback((date: Date): string => {
    return date.toISOString().split("T")[0];
  }, []);

  // Загружаем смены из базы
  useEffect(() => {
    const fetchShifts = async () => {
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("shifts")
        .select("id, date, time, shift_operators!inner(operator_id, operators!inner(*))");

      if (shiftsError) {
        toast({
          title: "Ошибка загрузки смен",
          description: shiftsError.message,
          variant: "destructive",
        });
        return;
      }

      const formattedShifts = shiftsData.map((shift: any) => ({
        id: shift.id,
        date: shift.date,
        time: shift.time,
        operators: shift.shift_operators.map((so: any) => so.operators),
      }));

      setShifts(formattedShifts);
    };

    fetchShifts();
  }, []);

  // Получение смен для выбранной даты
  const selectedDateShifts = useCallback(() => {
    if (!date) return [];
    const dateStr = formatDate(date);
    return shifts.filter((shift) => shift.date === dateStr);
  }, [date, shifts, formatDate]);

  // Обработчик добавления смены
  const handleAddShift = useCallback(() => {
    if (!currentOperator || currentOperator.role !== "maindev") {
      toast({
        title: "Ошибка доступа",
        description: "Только maindev может добавлять смены",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Ошибка",
        description: "Выберите дату для добавления смены",
        variant: "destructive",
      });
      return;
    }
    setSelectedOperatorIds([]);
    setShiftTime("10:00 - 22:00");
    setAddShiftDialogOpen(true);
  }, [date, currentOperator]);

  // Обработчик выбора операторов
  const handleOperatorSelection = useCallback((operatorId: string) => {
    setSelectedOperatorIds((prev) =>
      prev.includes(operatorId)
        ? prev.filter((id) => id !== operatorId)
        : [...prev, operatorId]
    );
  }, []);

  // Сохранение смены
  const saveShift = useCallback(async () => {
    if (!date) return;

    if (selectedOperatorIds.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы одного оператора для смены",
        variant: "destructive",
      });
      return;
    }

    const dateStr = formatDate(date);

    // Создаём новую смену
    const { data: newShift, error: shiftError } = await supabase
      .from("shifts")
      .insert([{ date: dateStr, time: shiftTime }])
      .select()
      .single();

    if (shiftError) {
      toast({
        title: "Ошибка добавления смены",
        description: shiftError.message,
        variant: "destructive",
      });
      return;
    }

    // Связываем смену с операторами
    const shiftOperatorEntries = selectedOperatorIds.map((operatorId) => ({
      shift_id: newShift.id,
      operator_id: operatorId,
    }));

    const { error: linkError } = await supabase
      .from("shift_operators")
      .insert(shiftOperatorEntries);

    if (linkError) {
      toast({
        title: "Ошибка связывания операторов",
        description: linkError.message,
        variant: "destructive",
      });
      return;
    }

    // Обновляем состояние смен
    const newShiftWithOperators: Shift = {
      id: newShift.id,
      date: newShift.date,
      time: newShift.time,
      operators: operators.filter((op) => selectedOperatorIds.includes(op.id)),
    };

    setShifts((prev) => [...prev, newShiftWithOperators]);

    toast({
      title: "Смена добавлена",
      description: `Смена на ${date.toLocaleDateString("ru-RU")} успешно добавлена`,
    });

    setAddShiftDialogOpen(false);
  }, [date, shiftTime, selectedOperatorIds, operators, formatDate]);

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      {/* Календарь */}
      <div className="md:w-1/2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Календарь смен</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm"
              components={{
                DayContent: (props) => {
                  const dateStr = formatDate(props.date);
                  const hasShifts = shifts.some((shift) => shift.date === dateStr);
                  return (
                    <div className="relative flex items-center justify-center">
                      <div>{props.date.getDate()}</div>
                      {hasShifts && (
                        <div className="absolute bottom-0 h-1 w-1 rounded-full bg-primary" />
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Список смен */}
      <div className="md:w-1/2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Смены на {date?.toLocaleDateString("ru-RU") || "Выберите дату"}
            </CardTitle>
            <Button size="sm" onClick={handleAddShift}>
              Добавить смену
            </Button>
          </CardHeader>
          <CardContent>
            {selectedDateShifts().length > 0 ? (
              <div className="space-y-4">
                {selectedDateShifts().map((shift) => (
                  <div
                    key={shift.id}
                    className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-2 font-medium">{shift.time}</div>
                    <div className="space-y-3">
                      {shift.operators.map((operator) => (
                        <div key={operator.id} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {operator.name
                                .split(" ")
                                .map((word) => word.charAt(0))
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{operator.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {operator.position}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-muted-foreground">Нет смен на выбранную дату</div>
                <Button className="mt-4" onClick={handleAddShift}>
                  Добавить смену
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог добавления смены */}
      <Dialog open={addShiftDialogOpen} onOpenChange={setAddShiftDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить смену</DialogTitle>
            <DialogDescription>
              Добавьте новую смену на {date?.toLocaleDateString("ru-RU")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shift-time">Время смены</Label>
              <Input
                id="shift-time"
                value={shiftTime}
                onChange={(e) => setShiftTime(e.target.value)}
                placeholder="Например: 10:00 - 22:00"
                className="shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Выберите операторов</Label>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 shadow-sm">
                {operators.map((operator) => (
                  <div key={operator.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`operator-${operator.id}`}
                      checked={selectedOperatorIds.includes(operator.id)}
                      onCheckedChange={() => handleOperatorSelection(operator.id)}
                    />
                    <label
                      htmlFor={`operator-${operator.id}`}
                      className="text-sm font-medium flex items-center w-full cursor-pointer"
                    >
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {operator.name
                            .split(" ")
                            .map((word) => word.charAt(0))
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{operator.name} ({operator.position})</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddShiftDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveShift}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
