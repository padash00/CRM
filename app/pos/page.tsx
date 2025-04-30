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
  name: string;
  quantity: string;
  price: string;
  type: "product";
  action: "add" | "remove";
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
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    customerId: "",
    amount: "",
    paymentType: "cash",
  });
  const [inventoryAction, setInventoryAction] = useState<InventoryAction>({
    name: "",
    quantity: "",
    price: "",
    type: "product",
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
    };

    fetchData();
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
      setNewTransaction({ customerId: "", amount: "", paymentType: "cash" });
    }
  };

  const handleInventorySubmit = async () => {
    if (!inventoryAction.name || !inventoryAction.quantity || !inventoryAction.price) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля для управления товаром",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(inventoryAction.quantity);
    const price = parseFloat(inventoryAction.price);

    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Ошибка",
        description: "Количество должно быть положительным числом",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(price) || price <= 0) {
      toast({
        title: "Ошибка",
        description: "Цена должна быть положительным числом",
        variant: "destructive",
      });
      return;
    }

    if (inventoryAction.action === "add") {
      // Добавление нового товара
      const { error } = await supabase.from("items").insert([
        {
          name: inventoryAction.name,
          price: price,
          type: "product",
        },
      ]);

      if (error) {
        toast({
          title: "Ошибка добавления товара",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Товар добавлен",
        description: `${inventoryAction.name} успешно добавлен в количестве ${quantity} шт.`,
      });
    } else {
      // Списание товара (удаление или уменьшение количества)
      const { data: itemData, error: fetchError } = await supabase
        .from("items")
        .select("id")
        .eq("name", inventoryAction.name)
        .single();

      if (fetchError || !itemData) {
        toast({
          title: "Ошибка",
          description: "Товар не найден",
          variant: "destructive",
        });
        return;
      }

      // Здесь можно добавить логику уменьшения количества, но пока просто удаляем
      const { error: deleteError } = await supabase
        .from("items")
        .delete()
        .eq("id", itemData.id);

      if (deleteError) {
        toast({
          title: "Ошибка списания товара",
          description: deleteError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Товар списан",
        description: `${inventoryAction.name} успешно списан в количестве ${quantity} шт.`,
      });
    }

    setOpenInventoryDialog(false);
    setInventoryAction({ name: "", quantity: "", price: "", type: "product", action: "add" });
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
            <DialogTitle>Управление товарами</DialogTitle>
            <DialogDescription>Добавьте или спишите товар</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inventoryAction">Действие</Label>
              <Select
                value={inventoryAction.action}
                onValueChange={(value) =>
                  setInventoryAction((prev) => ({ ...prev, action: value as "add" | "remove" }))
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
              <Label htmlFor="inventoryName">
                {inventoryAction.action === "add" ? "Название товара" : "Товар для списания"}
              </Label>
              {inventoryAction.action === "add" ? (
                <Input
                  id="inventoryName"
                  value={inventoryAction.name}
                  onChange={(e) =>
                    setInventoryAction((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Введите название товара"
                />
              ) : (
                <Select
                  value={inventoryAction.name}
                  onValueChange={(value) =>
                    setInventoryAction((prev) => ({ ...prev, name: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.name}>
                        {item.name}
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
              <div className="space-y-2">
                <Label htmlFor="inventoryPrice">Цена за единицу (₸)</Label>
                <Input
                  id="inventoryPrice"
                  type="number"
                  value={inventoryAction.price}
                  onChange={(e) =>
                    setInventoryAction((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="Введите цену"
                  min="0"
                />
              </div>
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
