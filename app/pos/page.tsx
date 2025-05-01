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
import { Search, ShoppingCart, Filter, Package } from "lucide-react";
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

export const dynamic = "force-dynamic"; // Отключаем prerendering

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

interface Item {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
  quantity: number;
  type: "time" | "product" | "service";
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

interface InventoryAction {
  itemType: "product" | "service";
  itemId: string;
  name: string;
  quantity: string;
  price: string;
  salePrice: string;
  action: "add" | "remove";
}

interface ReportData {
  transactions: { id: string; amount: number; transaction_date: string; payment_type: string; customer_id?: string; guest_name?: string }[];
  inventoryLogs: { item_id: string; item_type: string; action: string; quantity: number; price: number; sale_price?: number; created_at: string }[];
  totalSales: number;
  totalCash: number;
  totalCard: number;
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("pos");
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false);
  const [openSaleDialog, setOpenSaleDialog] = useState(false);
  const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    customerId: "all",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [services, setServices] = useState<Item[]>([]);
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    customerId: "",
    amount: "",
    paymentType: "cash",
  });
  const [inventoryAction, setInventoryAction] = useState<InventoryAction>({
    itemType: "product",
    itemId: "",
    name: "",
    quantity: "",
    price: "",
    salePrice: "",
    action: "add",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("id, name");

      if (customersError) {
        toast({
          title: "Ошибка загрузки клиентов",
          description: customersError.message,
          variant: "destructive",
        });
      } else {
        setCustomers(customersData || []);
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*");

      if (itemsError) {
        toast({
          title: "Ошибка загрузки товаров",
          description: itemsError.message,
          variant: "destructive",
        });
      } else {
        setItems(itemsData || []);
      }

      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("id, name, price, quantity, type");

      if (servicesError) {
        toast({
          title: "Ошибка загрузки услуг",
          description: servicesError.message,
          variant: "destructive",
        });
      } else {
        setServices(servicesData || []);
      }
    };

    fetchData();
  }, []);

  const fetchReportData = useCallback(async (isZReport: boolean) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // Получаем транзакции за текущую смену (за день)
    let transactionsQuery = supabase
      .from("transactions")
      .select("id, amount, transaction_date, payment_type, customer_id, guest_name")
      .gte("transaction_date", startOfDay);

    const { data: transactionsData, error: transactionsError } = await transactionsQuery;

    if (transactionsError) {
      toast({
        title: "Ошибка загрузки транзакций для отчёта",
        description: transactionsError.message,
        variant: "destructive",
      });
      return null;
    }

    // Получаем логи операций за текущую смену
    let inventoryQuery = supabase
      .from("inventory_log")
      .select("item_id, item_type, action, quantity, price, sale_price, created_at")
      .gte("created_at", startOfDay);

    const { data: inventoryData, error: inventoryError } = await inventoryQuery;

    if (inventoryError) {
      toast({
        title: "Ошибка загрузки логов операций",
        description: inventoryError.message,
        variant: "destructive",
      });
      return null;
    }

    // Рассчитываем общую выручку
    const totalSales = transactionsData.reduce((sum, tx) => sum + tx.amount, 0);
    const totalCash = transactionsData
      .filter((tx) => tx.payment_type === "cash")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalCard = transactionsData
      .filter((tx) => tx.payment_type === "card")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      transactions: transactionsData,
      inventoryLogs: inventoryData,
      totalSales,
      totalCash,
      totalCard,
    };
  }, []);

  const reportActions: ReportAction[] = [
    {
      title: "Z-отчет",
      description: "Сформировать Z-отчет за текущую смену",
      buttonText: "Сформировать Z-отчет",
      variant: "default",
      action: async () => {
        const reportData = await fetchReportData(true);
        if (!reportData) return;

        const { transactions, inventoryLogs, totalSales, totalCash, totalCard } = reportData;

        // Формируем текст отчёта
        const transactionsText = transactions
          .map((tx) => `Транзакция ${tx.id}: ₸${tx.amount} (${tx.payment_type})`)
          .join("\n");
        const inventoryText = inventoryLogs
          .map((log) => `${log.action === "add" ? "Оприходование" : "Списание"} ${log.item_type} (ID: ${log.item_id}): ${log.quantity} шт.`)
          .join("\n");

        toast({
          title: "Z-отчет",
          description: `Общая выручка: ₸${totalSales}\nНаличные: ₸${totalCash}\nКарта: ₸${totalCard}\n\nТранзакции:\n${transactionsText || "Нет транзакций"}\n\nОперации:\n${inventoryText || "Нет операций"}`,
          duration: 10000,
        });

        // Очищаем данные (закрываем смену)
        await supabase
          .from("transactions")
          .delete()
          .gte("transaction_date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString());

        await supabase
          .from("inventory_log")
          .delete()
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString());
      },
    },
    {
      title: "X-отчет",
      description: "Сформировать X-отчет без закрытия смены",
      buttonText: "Сформировать X-отчет",
      variant: "outline",
      action: async () => {
        const reportData = await fetchReportData(false);
        if (!reportData) return;

        const { transactions, inventoryLogs, totalSales, totalCash, totalCard } = reportData;

        // Формируем текст отчёта
        const transactionsText = transactions
          .map((tx) => `Транзакция ${tx.id}: ₸${tx.amount} (${tx.payment_type})`)
          .join("\n");
        const inventoryText = inventoryLogs
          .map((log) => `${log.action === "add" ? "Оприходование" : "Списание"} ${log.item_type} (ID: ${log.item_id}): ${log.quantity} шт.`)
          .join("\n");

        toast({
          title: "X-отчет",
          description: `Общая выручка: ₸${totalSales}\nНаличные: ₸${totalCash}\nКарта: ₸${totalCard}\n\nТранзакции:\n${transactionsText || "Нет транзакций"}\n\nОперации:\n${inventoryText || "Нет операций"}`,
          duration: 10000,
        });
      },
    },
    {
      title: "Отчет по продажам",
      description: "Детальный отчет по продажам за период",
      buttonText: "Сформировать отчет",
      variant: "outline",
      action: async () => {
        const reportData = await fetchReportData(false);
        if (!reportData) return;

        const { transactions, inventoryLogs, totalSales, totalCash, totalCard } = reportData;

        // Формируем текст отчёта
        const transactionsText = transactions
          .map((tx) => `Транзакция ${tx.id}: ₸${tx.amount} (${tx.payment_type})`)
          .join("\n");
        const inventoryText = inventoryLogs
          .map((log) => `${log.action === "add" ? "Оприходование" : "Списание"} ${log.item_type} (ID: ${log.item_id}): ${log.quantity} шт.`)
          .join("\n");

        toast({
          title: "Отчет по продажам",
          description: `Общая выручка: ₸${totalSales}\nНаличные: ₸${totalCash}\nКарта: ₸${totalCard}\n\nТранзакции:\n${transactionsText || "Нет транзакций"}\n\nОперации:\n${inventoryText || "Нет операций"}`,
          duration: 10000,
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
      setNewTransaction({ customerId: "", amount: "", paymentType: "cash" });
    }
  };

  const handleInventorySubmit = async () => {
    if (inventoryAction.action === "add") {
      if (!inventoryAction.name || !inventoryAction.quantity || !inventoryAction.price || (inventoryAction.itemType === "product" && !inventoryAction.salePrice)) {
        toast({
          title: "Ошибка",
          description: "Заполните все поля для добавления",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!inventoryAction.itemId || !inventoryAction.quantity) {
        toast({
          title: "Ошибка",
          description: "Выберите элемент и укажите количество для списания",
          variant: "destructive",
        });
        return;
      }
    }

    const quantity = parseInt(inventoryAction.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Ошибка",
        description: "Количество должно быть положительным числом",
        variant: "destructive",
      });
      return;
    }

    if (inventoryAction.action === "add") {
      const price = parseFloat(inventoryAction.price);
      const salePrice = parseFloat(inventoryAction.salePrice);

      if (isNaN(price) || price <= 0) {
        toast({
          title: "Ошибка",
          description: "Цена закупки должна быть положительным числом",
          variant: "destructive",
        });
        return;
      }

      if (inventoryAction.itemType === "product") {
        if (isNaN(salePrice) || salePrice <= 0) {
          toast({
            title: "Ошибка",
            description: "Цена продажи должна быть положительным числом",
            variant: "destructive",
          });
          return;
        }

        if (salePrice < price) {
          toast({
            title: "Ошибка",
            description: "Цена продажи должна быть больше или равна цене закупки",
            variant: "destructive",
          });
          return;
        }
      }

      // Добавление нового товара/услуги
      const tableName = inventoryAction.itemType === "product" ? "items" : "services";
      const { data: newItem, error: insertError } = await supabase
        .from(tableName)
        .insert([
          {
            name: inventoryAction.name,
            price: price,
            sale_price: inventoryAction.itemType === "product" ? salePrice : undefined,
            quantity: quantity,
            type: inventoryAction.itemType === "product" ? "product" : inventoryAction.itemType,
          },
        ])
        .select()
        .single();

      if (insertError) {
        toast({
          title: "Ошибка добавления",
          description: insertError.message,
          variant: "destructive",
        });
        return;
      }

      // Логируем операцию
      const { error: logError } = await supabase.from("inventory_log").insert([
        {
          item_id: newItem.id,
          item_type: inventoryAction.itemType,
          action: "add",
          quantity: quantity,
          price: price,
          sale_price: inventoryAction.itemType === "product" ? salePrice : null,
        },
      ]);

      if (logError) {
        toast({
          title: "Ошибка логирования",
          description: logError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Элемент добавлен",
        description: `${inventoryAction.name} успешно добавлен в количестве ${quantity} шт.`,
      });
    } else {
      // Списание товара/услуги
      const tableName = inventoryAction.itemType === "product" ? "items" : "services";
      const { data: itemData, error: fetchError } = await supabase
        .from(tableName)
        .select("id, quantity, price, sale_price")
        .eq("id", inventoryAction.itemId)
        .single();

      if (fetchError || !itemData) {
        toast({
          title: "Ошибка",
          description: "Элемент не найден",
          variant: "destructive",
        });
        return;
      }

      const currentQuantity = itemData.quantity;
      if (quantity > currentQuantity) {
        toast({
          title: "Ошибка",
          description: `Недостаточно на складе (осталось: ${currentQuantity})`,
          variant: "destructive",
        });
        return;
      }

      const newQuantity = currentQuantity - quantity;
      if (newQuantity === 0) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq("id", inventoryAction.itemId);

        if (deleteError) {
          toast({
            title: "Ошибка списания",
            description: deleteError.message,
            variant: "destructive",
          });
          return;
        }
      } else {
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ quantity: newQuantity })
          .eq("id", inventoryAction.itemId);

        if (updateError) {
          toast({
            title: "Ошибка списания",
            description: updateError.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Логируем операцию
      const { error: logError } = await supabase.from("inventory_log").insert([
        {
          item_id: itemData.id,
          item_type: inventoryAction.itemType,
          action: "remove",
          quantity: quantity,
          price: itemData.price,
          sale_price: itemData.sale_price || null,
        },
      ]);

      if (logError) {
        toast({
          title: "Ошибка логирования",
          description: logError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Элемент списан",
        description: `${inventoryAction.name} успешно списан в количестве ${quantity} шт.`,
      });
    }

    // Обновляем данные о товарах и услугах
    const { data: updatedItems } = await supabase.from("items").select("*");
    const { data: updatedServices } = await supabase.from("services").select("id, name, price, quantity, type");
    setItems(updatedItems || []);
    setServices(updatedServices || []);

    setOpenInventoryDialog(false);
    setInventoryAction({ itemType: "product", itemId: "", name: "", quantity: "", price: "", salePrice: "", action: "add" });
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
          <div className="flex gap-2">
            <Button onClick={() => setOpenInventoryDialog(true)}>
              <Package className="mr-2 h-4 w-4" /> Управление товарами
            </Button>
            <Button onClick={handleNewSale}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Новая продажа
            </Button>
          </div>
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
                  <SelectItem value="cash">Наличные</SelectItem>
                  <SelectItem value="card">Карта</SelectItem>
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

      <Dialog open={openInventoryDialog} onOpenChange={setOpenInventoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Управление товарами и услугами</DialogTitle>
            <DialogDescription>Добавьте или спишите товар/услугу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inventoryAction">Действие</Label>
              <Select
                value={inventoryAction.action}
                onValueChange={(value) =>
                  setInventoryAction((prev) => ({ ...prev, action: value as "add" | "remove", itemId: "", name: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите действие" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Оприходовать</SelectItem>
                  <SelectItem value="remove">Списать</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventoryItemType">Тип</Label>
              <Select
                value={inventoryAction.itemType}
                onValueChange={(value) =>
                  setInventoryAction((prev) => ({ ...prev, itemType: value as "product" | "service", itemId: "", name: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Товар</SelectItem>
                  <SelectItem value="service">Услуга</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventoryName">
                {inventoryAction.action === "add" ? "Название" : "Элемент для списания"}
              </Label>
              {inventoryAction.action === "add" ? (
                <Input
                  id="inventoryName"
                  value={inventoryAction.name}
                  onChange={(e) =>
                    setInventoryAction((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Введите название"
                />
              ) : (
                <Select
                  value={inventoryAction.itemId}
                  onValueChange={(value) => {
                    const selectedItem = (inventoryAction.itemType === "product" ? items : services).find(item => item.id === value);
                    setInventoryAction((prev) => ({
                      ...prev,
                      itemId: value,
                      name: selectedItem ? selectedItem.name : "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите элемент" />
                  </SelectTrigger>
                  <SelectContent>
                    {(inventoryAction.itemType === "product" ? items : services).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} (Остаток: {item.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventoryQuantity">Количество</Label>
              <Input
                id="inventoryQuantity"
                type="number"
                value={inventoryAction.quantity}
                onChange={(e) =>
                  setInventoryAction((prev) => ({ ...prev, quantity: e.target.value }))
                }
                placeholder="Введите количество"
                min="1"
              />
            </div>
            {inventoryAction.action === "add" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="inventoryPrice">Цена закупки за единицу (₸)</Label>
                  <Input
                    id="inventoryPrice"
                    type="number"
                    value={inventoryAction.price}
                    onChange={(e) =>
                      setInventoryAction((prev) => ({ ...prev, price: e.target.value }))
                    }
                    placeholder="Введите цену закупки"
                    min="0"
                  />
                </div>
                {inventoryAction.itemType === "product" && (
                  <div className="space-y-2">
                    <Label htmlFor="inventorySalePrice">Цена продажи за единицу (₸)</Label>
                    <Input
                      id="inventorySalePrice"
                      type="number"
                      value={inventoryAction.salePrice}
                      onChange={(e) =>
                        setInventoryAction((prev) => ({ ...prev, salePrice: e.target.value }))
                      }
                      placeholder="Введите цену продажи"
                      min="0"
                    />
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenInventoryDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleInventorySubmit}>
              {inventoryAction.action === "add" ? "Оприходовать" : "Списать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
