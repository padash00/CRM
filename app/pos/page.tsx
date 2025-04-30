// pos/PosPage.tsx
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
import { Search, ShoppingCart, Filter } from "lucide-react";
import Link from "next/link";
import { POSInterface } from "./pos-interface";
import { TransactionHistory } from "./transaction-history";
import { toast } from "@/components/ui/use-toast";
import { MainNav } from "@/components/main-nav";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportAction {
  title: string;
  description: string;
  buttonText: string;
  variant?: "outline" | "default";
  action: () => void;
}

interface Customer {
  id: string;
  name: string;
}

interface Filters {
  customerId: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

interface NewTransaction {
  customerId: string;
  amount: string;
  paymentType: string;
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("pos");
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
  const [openSaleDialog, setOpenSaleDialog] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    customerId: "all",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    customerId: "",
    amount: "",
    paymentType: "наличные",
  });

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

  const reportActions: ReportAction[] = [
    {
      title: "Z-отчет",
      description: "Сформировать Z-отчет за текущую смену",
      buttonText: "Сформировать Z-отчет",
      variant: "default",
      action: () => {
        toast({
          title: "Z-отчет",
          description: "Z-отчет за текущую смену формируется...",
        });
      },
    },
    {
      title: "X-отчет",
      description: "Сформировать X-отчет без закрытия смены",
      buttonText: "Сформировать X-отчет",
      variant: "outline",
      action: () => {
        toast({
          title: "X-отчет",
          description: "X-отчет формируется без закрытия смены...",
        });
      },
    },
    {
      title: "Отчет по продажам",
      description: "Детальный отчет по продажам за период",
      buttonText: "Сформировать отчет",
      variant: "outline",
      action: () => {
        toast({
          title: "Отчет по продажам",
          description: "Детальный отчет по продажам формируется...",
        });
      },
    },
  ];

  const handleNewSale = useCallback(() => {
    setOpenSaleDialog(true);
  }, []);

  const handleSaleSubmit = async () => {
    if (!newTransaction.customerId || !newTransaction.amount || !newTransaction.paymentType) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля для создания транзакции",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Сумма должна быть положительным числом",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("transactions").insert([
      {
        customer_id: newTransaction.customerId,
        amount: amount,
        transaction_date: new Date().toISOString(),
        payment_type: newTransaction.paymentType,
      },
    ]);

    if (error) {
      toast({
        title: "Ошибка создания транзакции",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Транзакция создана",
        description: `Транзакция на сумму ${amount} ₸ успешно создана`,
      });
      setOpenSaleDialog(false);
      setNewTransaction({ customerId: "", amount: "", paymentType: "наличные" });
    }
  };

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setSearchQuery("");
  }, []);

  const handleApplyFilters = useCallback(() => {
    setOpenFiltersDialog(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Кассовые операции</h2>
          <Button onClick={handleNewSale}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Новая продажа
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="pos">Касса</TabsTrigger>
            <TabsTrigger value="history">История транзакций</TabsTrigger>
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="space-y-4">
            <POSInterface />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск транзакций..."
                  className="pl-8 border shadow-sm"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" className="shadow-sm" onClick={() => setOpenFiltersDialog(true)}>
                <Filter className="mr-2 h-4 w-4" /> Фильтры
              </Button>
            </div>
            <TransactionHistory searchQuery={searchQuery} filters={filters} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportActions.map((action) => (
                <Card key={action.title} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant={action.variant || "default"}
                      className="w-full"
                      onClick={action.action}
                    >
                      {action.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={openFiltersDialog} onOpenChange={setOpenFiltersDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Фильтры транзакций</DialogTitle>
            <DialogDescription>Выберите критерии для фильтрации транзакций</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filterCustomer">Клиент</Label>
              <Select
                value={filters.customerId}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, customerId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все клиенты</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterDateFrom">Дата (с)</Label>
              <Input
                id="filterDateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterDateTo">Дата (по)</Label>
              <Input
                id="filterDateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterAmountMin">Сумма (от)</Label>
              <Input
                id="filterAmountMin"
                type="number"
                value={filters.amountMin}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, amountMin: e.target.value }))
                }
                placeholder="Например, 1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterAmountMax">Сумма (до)</Label>
              <Input
                id="filterAmountMax"
                type="number"
                value={filters.amountMax}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, amountMax: e.target.value }))
                }
                placeholder="Например, 5000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenFiltersDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleApplyFilters}>Применить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openSaleDialog} onOpenChange={setOpenSaleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая продажа</DialogTitle>
            <DialogDescription>Введите данные для новой транзакции</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="saleCustomer">Клиент</Label>
              <Select
                value={newTransaction.customerId}
                onValueChange={(value) =>
                  setNewTransaction((prev) => ({ ...prev, customerId: value }))
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
              <Label htmlFor="saleAmount">Сумма (₸)</Label>
              <Input
                id="saleAmount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="Например, 1500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salePaymentType">Тип оплаты</Label>
              <Select
                value={newTransaction.paymentType}
                onValueChange={(value) =>
                  setNewTransaction((prev) => ({ ...prev, paymentType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип оплаты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="наличные">Наличные</SelectItem>
                  <SelectItem value="карта">Карта</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSaleDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaleSubmit}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
