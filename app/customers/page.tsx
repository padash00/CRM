"use client";

import { useState, useEffect } from "react";
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
import { Plus, Search, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CustomerTable } from "./customer-table";
import { CustomerStats } from "./customer-stats";
import { MainNav } from "@/components/main-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Stat {
  title: string;
  value: string;
  description: string;
}

interface MonthlyVisit {
  month: string;
  totalVisits: number;
  year: number;
}

interface Customer {
  id: string;
  name: string;
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    username: "",
    password: "",
  });
  const [newVisit, setNewVisit] = useState({
    customerId: "",
    duration: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshTable, setRefreshTable] = useState(0);
  const [stats, setStats] = useState<Stat[]>([]);
  const [monthlyVisits, setMonthlyVisits] = useState<MonthlyVisit[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from("customers").select("id, name");
      if (error) {
        toast({
          title: "Ошибка загрузки клиентов",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setCustomers(data || []);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      // Запрос 1: Всего клиентов
      const { count: totalCustomers, error: totalError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      // Запрос 2: Активные клиенты
      const { count: activeCustomers, error: activeError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Запрос 3: VIP клиенты
      const { count: vipCustomers, error: vipError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("vip", true);

      // Запрос 4: Общее количество посещений из visits
      const { count: totalVisits, error: visitsError } = await supabase
        .from("visits")
        .select("*", { count: "exact", head: true });

      // Запрос 5: Посещения по месяцам из visits
      const { data: monthlyData, error: monthlyError } = await supabase
        .from("visits")
        .select("visit_date");

      // Запрос 6: Общий доход клуба из orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("amount");

      if (totalError || activeError || vipError || visitsError || monthlyError || ordersError) {
        toast({
          title: "Ошибка загрузки статистики",
          description: "Не удалось загрузить данные из базы.",
          variant: "destructive",
        });
        return;
      }

      // Считаем общий доход клуба
      const totalRevenue =
        ordersData && ordersData.length > 0
          ? ordersData.reduce((sum, order) => sum + order.amount, 0).toFixed(0)
          : "0";

      // Обрабатываем данные для графика посещений по месяцам
      const monthlyVisitsMap: { [key: string]: number } = {};
      if (monthlyData) {
        monthlyData.forEach((visit) => {
          const date = new Date(visit.visit_date);
          const monthYear = date.toISOString().slice(0, 7); // Формат YYYY-MM
          monthlyVisitsMap[monthYear] = (monthlyVisitsMap[monthYear] || 0) + 1; // Считаем количество посещений
        });
      }

      const monthNames = [
        "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
        "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
      ];

      const currentYear = new Date().getFullYear();
      const monthlyVisitsArray: MonthlyVisit[] = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, new Date().getMonth() - i, 1);
        const monthYear = date.toISOString().slice(0, 7);
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const totalVisits = monthlyVisitsMap[monthYear] || 0;

        monthlyVisitsArray.push({
          month: monthNames[monthIndex],
          totalVisits,
          year,
        });
      }

      // Формируем массив stats
      const newStats: Stat[] = [
        {
          title: "Всего клиентов",
          value: totalCustomers?.toString() || "0",
          description: "",
        },
        {
          title: "Активные клиенты",
          value: activeCustomers?.toString() || "0",
          description: totalCustomers
            ? `${((activeCustomers! / totalCustomers!) * 100).toFixed(1)}% от общего числа`
            : "",
        },
        {
          title: "VIP клиенты",
          value: vipCustomers?.toString() || "0",
          description: totalCustomers
            ? `${((vipCustomers! / totalCustomers!) * 100).toFixed(1)}% от общего числа`
            : "",
        },
        {
          title: "Общее количество посещений",
          value: totalVisits?.toString() || "0",
          description: "",
        },
        {
          title: "Общий доход клуба",
          value: `₸${totalRevenue}`,
          description: "",
        },
      ];

      setStats(newStats);
      setMonthlyVisits(monthlyVisitsArray);
    };

    fetchStats();
  }, [refreshTable]);

  const handleDialogSubmit = async () => {
    const loginRegex = /^[a-zA-Z0-9_]+$/;
    const passwordRegex = /^\d{6}$/;

    if (!loginRegex.test(newCustomer.username)) {
      toast({
        title: "Неверный логин",
        description: "Логин должен содержать только латиницу и цифры",
      });
      return;
    }

    if (!passwordRegex.test(newCustomer.password)) {
      toast({ title: "Неверный пароль", description: "Пароль должен состоять из 6 цифр" });
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("customers").insert([
      {
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        username: newCustomer.username,
        password: newCustomer.password,
        visits: 0,
        lastVisit: today,
        status: "active",
        vip: false,
      },
    ]);

    if (error) {
      if (error.message.includes("duplicate key value")) {
        toast({
          title: "Логин уже занят",
          description: "Выберите другой логин",
          variant: "destructive",
        });
      } else {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Клиент добавлен", description: "Новый клиент успешно создан" });
      setOpenDialog(false);
      setNewCustomer({ name: "", phone: "", email: "", username: "", password: "" });
      setRefreshTable((prev) => prev + 1);
    }
  };

  const handleVisitSubmit = async () => {
    if (!newVisit.customerId) {
      toast({
        title: "Ошибка",
        description: "Выберите клиента",
        variant: "destructive",
      });
      return;
    }

    if (!newVisit.duration || isNaN(parseInt(newVisit.duration)) || parseInt(newVisit.duration) <= 0) {
      toast({
        title: "Ошибка",
        description: "Укажите корректную длительность посещения (в минутах)",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const duration = parseInt(newVisit.duration);

    const { error: visitError } = await supabase.from("visits").insert([
      {
        customer_id: newVisit.customerId,
        visit_date: today,
        duration: duration,
      },
    ]);

    if (visitError) {
      toast({
        title: "Ошибка записи посещения",
        description: visitError.message,
        variant: "destructive",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from("customers")
      .update({ lastVisit: today })
      .eq("id", newVisit.customerId);

    if (updateError) {
      toast({
        title: "Ошибка обновления клиента",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Посещение зафиксировано",
      description: `Клиент посетил клуб ${today} на ${duration} минут`,
    });
    setOpenVisitDialog(false);
    setNewVisit({ customerId: "", duration: "" });
    setRefreshTable((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Управление клиентами</h2>
          <div className="flex gap-2">
            <Button onClick={() => setOpenVisitDialog(true)}>
              <Clock className="mr-2 h-4 w-4" /> Зафиксировать посещение
            </Button>
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Новый клиент
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Все клиенты</TabsTrigger>
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 w-full">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск клиентов..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">Фильтры</Button>
            </div>
            <div className="overflow-x-auto w-full">
              <CustomerTable
                filterActive={false}
                filterVip={false}
                className="w-full border border-border rounded-md table-auto text-left"
                refresh={refreshTable}
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4 w-full">
            <div className="overflow-x-auto w-full">
              <CustomerTable
                filterActive={true}
                className="w-full border border-border rounded-md table-auto text-left"
                refresh={refreshTable}
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>

          <TabsContent value="vip" className="space-y-4 w-full">
            <div className="overflow-x-auto w-full">
              <CustomerTable
                filterVip={true}
                className="w-full border border-border rounded-md table-auto text-left"
                refresh={refreshTable}
                searchQuery={searchQuery}
              />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 w-full">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Статистика посещений</CardTitle>
                <CardDescription>Количество посещений по месяцам</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerStats monthlyVisits={monthlyVisits} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать нового клиента</DialogTitle>
            <DialogDescription>Введите данные клиента ниже</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Логин (только латиница)</Label>
              <Input
                id="username"
                value={newCustomer.username}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль (6 цифр)</Label>
              <Input
                id="password"
                type="password"
                value={newCustomer.password}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleDialogSubmit}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openVisitDialog} onOpenChange={setOpenVisitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зафиксировать посещение</DialogTitle>
            <DialogDescription>Укажите клиента и длительность посещения</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Клиент</Label>
              <Select
                value={newVisit.customerId}
                onValueChange={(value) =>
                  setNewVisit((prev) => ({ ...prev, customerId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Длительность (минуты)</Label>
              <Input
                id="duration"
                type="number"
                value={newVisit.duration}
                onChange={(e) => setNewVisit((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="Например, 120"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenVisitDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleVisitSubmit}>Зафиксировать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
