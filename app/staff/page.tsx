// app/staff/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { StaffTable } from "./staff-table";
import { ShiftSchedule } from "./shift-schedule";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

// Типизация данных формы передачи смены
interface ShiftTransferForm {
  employee: string;
  comment: string;
  cashAmount: string;
}

// Типизация текущей смены
interface CurrentShift {
  id: string;
  date: string;
  time: string;
  responsible: string;
  responsibleId: string;
  operators: string[];
  revenue: number;
  customerCount: number;
}

// Типизация оператора
interface Operator {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  working_hours: string;
  role: "maindev" | "operator"; // Добавляем поле role
}

export default function StaffPage() {
  const [formData, setFormData] = useState<ShiftTransferForm>({
    employee: "",
    comment: "",
    cashAmount: "",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("staff");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [currentShift, setCurrentShift] = useState<CurrentShift | null>(null);
  const [newOperatorName, setNewOperatorName] = useState<string>("");
  const [newOperatorRole, setNewOperatorRole] = useState<"maindev" | "operator">("operator");
  const [isAddOperatorDialogOpen, setIsAddOperatorDialogOpen] = useState<boolean>(false);
  const [currentOperator, setCurrentOperator] = useState<Operator | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Загружаем операторов
      const { data: operatorsData, error: operatorsError } = await supabase
        .from("operators")
        .select("id, name, position, phone, email, status, working_hours, role");

      if (operatorsError) {
        toast({
          title: "Ошибка загрузки операторов",
          description: operatorsError.message,
          variant: "destructive",
        });
      } else {
        setOperators(operatorsData || []);
      }

      // Загружаем текущего оператора (заглушка, в будущем замени на авторизацию)
      const { data: currentOpData, error: currentOpError } = await supabase
        .from("operators")
        .select("*")
        .eq("name", "Кассир 1")
        .single();

      if (currentOpError) {
        toast({
          title: "Ошибка загрузки текущего оператора",
          description: currentOpError.message,
          variant: "destructive",
        });
      } else {
        setCurrentOperator(currentOpData || null);
      }

      // Загружаем текущую смену (последнюю за сегодня)
      const today = new Date().toISOString().split("T")[0];
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("shifts")
        .select("id, date, time, shift_operators!inner(operator_id, operators!inner(*))")
        .eq("date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (shiftsError || !shiftsData) {
        toast({
          title: "Ошибка загрузки текущей смены",
          description: shiftsError?.message || "Текущая смена не найдена",
          variant: "destructive",
        });
        return;
      }

      // Загружаем выручку и количество клиентов за день
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("amount, customer_id")
        .gte("transaction_date", today + "T00:00:00")
        .lte("transaction_date", today + "T23:59:59");

      if (transactionsError) {
        toast({
          title: "Ошибка загрузки транзакций",
          description: transactionsError.message,
          variant: "destructive",
        });
        return;
      }

      const revenue = transactionsData.reduce((sum, tx) => sum + tx.amount, 0);
      const customerCount = new Set(transactionsData.map(tx => tx.customer_id)).size;

      const responsibleOperator = shiftsData.shift_operators[0]?.operators;
      setCurrentShift({
        id: shiftsData.id,
        date: shiftsData.date,
        time: shiftsData.time,
        responsible: responsibleOperator?.name || "Не указан",
        responsibleId: responsibleOperator?.id || "",
        operators: shiftsData.shift_operators.map((so: any) => so.operators.name),
        revenue,
        customerCount,
      });
    };

    fetchData();
  }, []);

  // Обработчик добавления нового оператора
  const handleAddOperator = useCallback(async () => {
    if (!currentOperator || currentOperator.role !== "maindev") {
      toast({
        title: "Ошибка доступа",
        description: "Только maindev может добавлять новых операторов",
        variant: "destructive",
      });
      return;
    }

    if (!newOperatorName) {
      toast({
        title: "Ошибка",
        description: "Введите имя оператора",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("operators")
      .insert([
        {
          name: newOperatorName,
          position: newOperatorRole === "maindev" ? "Администратор" : "Кассир",
          phone: "",
          email: "",
          status: "active",
          working_hours: "40 ч/нед",
          role: newOperatorRole,
        },
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Ошибка добавления оператора",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setOperators((prev) => [...prev, data]);
    setNewOperatorName("");
    setNewOperatorRole("operator");
    setIsAddOperatorDialogOpen(false);
    toast({
      title: "Оператор добавлен",
      description: `Оператор ${data.name} успешно добавлен`,
    });
  }, [newOperatorName, newOperatorRole, currentOperator]);

  // Обработчик передачи смены
  const handleShiftTransfer = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const { employee, cashAmount, comment } = formData;

      if (!employee) {
        toast({
          title: "Ошибка",
          description: "Выберите оператора для передачи смены",
          variant: "destructive",
        });
        return;
      }

      if (!cashAmount || Number(cashAmount) < 0) {
        toast({
          title: "Ошибка",
          description: "Укажите корректный остаток в кассе",
          variant: "destructive",
        });
        return;
      }

      if (!currentShift) {
        toast({
          title: "Ошибка",
          description: "Текущая смена не найдена",
          variant: "destructive",
        });
        return;
      }

      const toOperatorId = operators.find(op => op.name === employee)?.id;
      if (!toOperatorId) {
        toast({
          title: "Ошибка",
          description: "Оператор для передачи смены не найден",
          variant: "destructive",
        });
        return;
      }

      // Фиксируем передачу смены в базе
      const { error } = await supabase
        .from("shift_transfers")
        .insert([
          {
            shift_id: currentShift.id,
            from_operator_id: currentShift.responsibleId,
            to_operator_id: toOperatorId,
            comment,
            cash_amount: parseFloat(cashAmount),
          },
        ]);

      if (error) {
        toast({
          title: "Ошибка передачи смены",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Смена передана",
        description: `Смена успешно передана оператору ${employee}. Остаток в кассе: ₸${cashAmount}.`,
      });

      // Обновляем текущую смену
      setCurrentShift((prev) =>
        prev
          ? {
              ...prev,
              responsible: employee,
              responsibleId: toOperatorId,
            }
          : null
      );

      setFormData({ employee: "", comment: "", cashAmount: "" });
    },
    [formData, currentShift, operators]
  );

  // Обработчик изменения формы
  const handleFormChange = useCallback(
    (field: keyof ShiftTransferForm, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Обработчик поиска
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Обработчик смены вкладки
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setSearchQuery("");
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Шапка */}
      <header className="border-b bg-background shadow-sm">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-lg font-semibold">GameZone CRM</span>
          </div>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            {[
              { href: "/", label: "Панель" },
              { href: "/bookings", label: "Бронирования" },
              { href: "/customers", label: "Клиенты" },
              { href: "/staff", label: "Персонал" },
              { href: "/pos", label: "Касса" },
              { href: "/games", label: "Игры" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Управление персоналом</h2>
          <Button onClick={() => setIsAddOperatorDialogOpen(true)} disabled={currentOperator?.role !== "maindev"}>
            <Plus className="mr-2 h-4 w-4" /> Новый оператор
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="staff">Операторы</TabsTrigger>
            <TabsTrigger value="shifts">Смены</TabsTrigger>
            <TabsTrigger value="current">Текущая смена</TabsTrigger>
          </TabsList>

          {/* Вкладка "Операторы" */}
          <TabsContent value="staff" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск операторов..."
                  className="pl-8 border shadow-sm"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" className="shadow-sm">
                Фильтры
              </Button>
            </div>
            <StaffTable
              searchQuery={searchQuery}
              operators={operators}
              setOperators={setOperators}
              currentOperator={currentOperator}
            />
          </TabsContent>

          {/* Вкладка "Смены" */}
          <TabsContent value="shifts" className="space-y-4">
            <ShiftSchedule operators={operators} currentOperator={currentOperator} />
          </TabsContent>

          {/* Вкладка "Текущая смена" */}
          <TabsContent value="current" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Текущая смена</CardTitle>
                  <CardDescription>Информация о текущей рабочей смене</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Дата</div>
                    <div>{currentShift?.date || "Не указана"}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Время смены</div>
                    <div>{currentShift?.time || "Не указано"}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Ответственный</div>
                    <div>{currentShift?.responsible || "Не указан"}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Операторы на смене</div>
                    <ul className="list-disc pl-4 space-y-1">
                      {currentShift?.operators.map((emp) => (
                        <li key={emp}>{emp}</li>
                      )) || <li>Нет операторов</li>}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Выручка за смену</div>
                    <div>₸{(currentShift?.revenue || 0).toLocaleString()}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Количество клиентов</div>
                    <div>{currentShift?.customerCount || 0}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Передача смены</CardTitle>
                  <CardDescription>Передача смены другому оператору</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleShiftTransfer}>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Оператор, принимающий смену
                      </Label>
                      <Select
                        value={formData.employee}
                        onValueChange={(value) => handleFormChange("employee", value)}
                      >
                        <SelectTrigger className="shadow-sm">
                          <SelectValue placeholder="Выберите оператора" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.id} value={op.name}>
                              {op.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label className="text-sm font-medium">Комментарий</Label>
                      <Input
                        placeholder="Добавьте комментарий к передаче смены"
                        value={formData.comment}
                        onChange={(e) => handleFormChange("comment", e.target.value)}
                        className="shadow-sm"
                      />
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label className="text-sm font-medium">Остаток в кассе</Label>
                      <Input
                        placeholder="Введите сумму"
                        type="number"
                        min="0"
                        value={formData.cashAmount}
                        onChange={(e) => handleFormChange("cashAmount", e.target.value)}
                        className="shadow-sm"
                      />
                    </div>
                    <Button className="w-full mt-4" type="submit">
                      Передать смену
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Диалог для добавления нового оператора */}
      <Dialog open={isAddOperatorDialogOpen} onOpenChange={setIsAddOperatorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить нового оператора</DialogTitle>
            <DialogDescription>Введите данные нового оператора</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="operatorName">Имя оператора</Label>
              <Input
                id="operatorName"
                value={newOperatorName}
                onChange={(e) => setNewOperatorName(e.target.value)}
                placeholder="Введите имя оператора"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatorRole">Роль</Label>
              <Select
                value={newOperatorRole}
                onValueChange={(value: "maindev" | "operator") => setNewOperatorRole(value)}
              >
                <SelectTrigger id="operatorRole">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">Оператор</SelectItem>
                  <SelectItem value="maindev">Maindev</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOperatorDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddOperator}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
