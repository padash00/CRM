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
import { Search, ShoppingCart, Filter, Package, Loader2 } from "lucide-react";
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
  downloadCsv: () => void;
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

type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER' | 'OTHER';

interface NewTransaction {
  customerId: string;
  amount: string;
  paymentType: string;
  paymentType: PaymentMethod;
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
  transactions: { id: string; amount: number; transaction_date: string; payment_type: string; customer_id?: string; guest_name?: string; operator_id?: string; operators?: { name: string } }[];
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
  const [reportDateFrom, setReportDateFrom] = useState<string>("");
  const [reportDateTo, setReportDateTo] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Состояние загрузки
  const [error, setError] = useState<string | null>(null); // Состояние ошибки

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Загружаем клиентов
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("id, name");

        if (customersError) {
          throw new Error(`Ошибка загрузки клиентов: ${customersError.message}`);
        }
        setCustomers(customersData || []);

        // Загружаем товары
        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select("*");

        if (itemsError) {
          throw new Error(`Ошибка загрузки товаров: ${itemsError.message}`);
        }
        setItems(itemsData || []);

        // Загружаем услуги
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("id, name, price, quantity, type");

        if (servicesError) {
          throw new Error(`Ошибка загрузки услуг: ${servicesError.message}`);
        }
        setServices(servicesData || []);

        // Устанавливаем начальные значения для фильтра дат (например, текущий месяц)
        const now = new Date();
        setReportDateFrom(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
        setReportDateTo(now.toISOString().split("T")[0]);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Ошибка загрузки данных",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchReportData = useCallback(async (isZReport: boolean, dateFrom: string, dateTo: string) => {
    setIsLoading(true);
    try {
      const formattedDateFrom = dateFrom + "T00:00:00";
      const formattedDateTo = dateTo + "T23:59:59";

      // Получаем транзакции за выбранный период, включая оператора
      let transactionsQuery = supabase
        .from("transactions")
        .select("id, amount, transaction_date, payment_type, customer_id, guest_name, operator_id, operators!inner(name)")
        .gte("transaction_date", formattedDateFrom)
        .lte("transaction_date", formattedDateTo);

      const { data: transactionsData, error: transactionsError } = await transactionsQuery;

      if (transactionsError) {
        throw new Error(`Ошибка загрузки транзакций: ${transactionsError.message}`);
      }

      // Получаем логи операций
      let inventoryQuery = supabase
        .from("inventory_log")
        .select("item_id, item_type, action, quantity, price, sale_price, created_at")
        .gte("created_at", formattedDateFrom)
        .lte("created_at", formattedDateTo);

      const { data: inventoryData, error: inventoryError } = await inventoryQuery;

      if (inventoryError) {
        throw new Error(`Ошибка загрузки логов операций: ${inventoryError.message}`);
      }

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
    } catch (err: any) {
      toast({
        title: "Ошибка формирования отчёта",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reportActions: ReportAction[] = [
    {
      title: "Z-отчет",
      description: "Сформировать Z-отчет за выбранный период",
      buttonText: "Сформировать Z-отчет",
      variant: "default",
      action: async () => {
        const data = await fetchReportData(true, reportDateFrom, reportDateTo);
        if (!data) return;

        setReportData(data);

        const { transactions, inventoryLogs, totalSales, totalCash, totalCard } = data;

        const transactionsText = transactions
          .map((tx) => `Транзакция ${tx.id}: ₸${tx.amount} (${tx.payment_type}), Оператор: ${tx.operators?.name || "Не указан"}`)
          .join("\n");
        const inventoryText = inventoryLogs
          .map((log) => `${log.action === "add" ? "Оприходование" : "Списание"} ${log.item_type} (ID: ${log.item_id}): ${log.quantity} шт.`)
          .join("\n");

        toast({
          title: "Z-отчет",
          description: `Общая выручка: ₸${totalSales}\nНаличные: ₸${totalCash}\nКарта: ₸${totalCard}\n\nТранзакции:\n${transactionsText || "Нет транзакций"}\n\nОперации:\n${inventoryText || "Нет операций"}`,
          duration: 10000,
        });

        await supabase
          .from("transactions")
          .delete()
          .gte("transaction_date", reportDateFrom + "T00:00:00")
          .lte("transaction_date", reportDateTo + "T23:59:59");

        await supabase
          .from("inventory_log")
          .delete()
          .gte("created_at", reportDateFrom + "T00:00:00")
          .lte("created_at", reportDateTo + "T23:59:59");
      },
      downloadCsv: () => {
        if (!reportData) return;

        const { transactions, inventoryLogs, totalSales, totalCash, totalCard } = reportData;

        const headers = ["ID", "Сумма", "Дата", "Тип оплаты", "Клиент", "Оператор"];
        const csvRows = [
          headers.join(","),
          ...transactions.map((tx) =>
            [
              tx.id,
              tx.amount,
              tx.transaction_date,
              tx.payment_type,
              tx.guest_name || "Клиент " + (tx.customer_id || "Не указан"),
              tx.operators?.name || "Не указан",
            ].join(",")
          ),
          "",
          `Общая выручка,${totalSales}`,
          `Наличные,${totalCash}`,
          `Карта,${totalCard}`,
          "",
          "Логи операций",
          ["Item ID", "Тип", "Действие", "Количество", "Цена", "Цена продажи", "Дата"].join(","),
          ...inventoryLogs.map((log) =>
            [
              log.item_id,
              log.item_type,
              log.action,
              log.quantity,
              log.price,
              log.sale_price || "",
              log.created_at,
            ].join(",")
          ),
        ];
        const csvString = csvRows.join("\n");

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "z-report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
    {
      title: "X-отчет",
      description: "Сформировать X-отчет без закрытия смены",
      buttonText: "Сформировать X-отчет",
      variant: "outline",
      action: async () => {
        const data = await fetchReportData(false, reportDateFrom, reportDateTo);
        if (!data) return;

        setReportData(data);

        const { transactions, inventoryLogs, totalSales, totalCash, totalCard } = data;

        const transactionsText = transactions
          .map((tx) => `Транзакция ${tx.id}: ₸${tx.amount} (${tx.payment_type}), Оператор: ${tx.operators?.name || "Не указан"}`)
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
      downloadCsv: () => {
        if (!reportData) return;

        const { transactions, inventoryLogs, totalSales, totalCash, totalCard } = reportData;

        const headers = ["ID", "Сумма", "Дата", "Тип оплаты", "Клиент", "Оператор"];
        const csvRows = [
          headers.join(","),
          ...transactions.map((tx) =>
            [
              tx.id,
              tx.amount,
              tx.transaction_date,
              tx.payment_type,
              tx.guest_name || "Клиент " + (tx.customer_id || "Не указан"),
              tx.operators?.name || "Не указан",
            ].join(",")
          ),
          "",
          `Общая выручка,${totalSales}`,
          `Наличные,${totalCash}`,
          `Карта,${totalCard}`,
          "",
          "Логи операций",
          ["Item ID", "Тип", "Действие", "Количество", "Цена", "Цена продажи", "Дата"].join(","),
          ...inventoryLogs.map((log) =>
            [
              log.item_id,
              log.item_type,
              log.action,
              log.quantity,
              log.price,
              log.sale_price || "",
              log.created_at,
            ].join(",")
          ),
        ];
        const csvString = csvRows.join("\n");

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "x-report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
    {
      title: "Отчет по продажам",
      description: "Детальный отчет по продажам за период",
      buttonText: "Сформировать отчет",
      variant: "outline",
      action: async () => {
        const data = await fetchReportData(false, reportDateFrom, reportDateTo);
        if (!data) return;

        setReportData(data);

        const { transactions, inventoryLogs, totalSales, totalCash, totalCard } = data;

        const transactionsText = transactions
          .map((tx) => `Транзакция ${tx.id}: ₸${tx.amount} (${tx.payment_type}), Оператор: ${tx.operators?.name || "Не указан"}`)
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
      downloadCsv: () => {
        if (!reportData) return;

        const { transactions, inventoryLogs, totalSales, totalCash, totalCard } = reportData;

        const headers = ["ID", "Сумма", "Дата", "Тип оплаты", "Клиент", "Оператор"];
        const csvRows = [
          headers.join(","),
          ...transactions.map((tx) =>
            [
              tx.id,
              tx.amount,
              tx.transaction_date,
              tx.payment_type,
              tx.guest_name || "Клиент " + (tx.customer_id || "Не указан"),
              tx.operators?.name || "Не указан",
            ].join(",")
          ),
          "",
          `Общая выручка,${totalSales}`,
          `Наличные,${totalCash}`,
          `Карта,${totalCard}`,
          "",
          "Логи операций",
          ["Item ID", "Тип", "Действие", "Количество", "Цена", "Цена продажи", "Дата"].join(","),
          ...inventoryLogs.map((log) =>
            [
              log.item_id,
              log.item_type,
              log.action,
              log.quantity,
              log.price,
              log.sale_price || "",
              log.created_at,
            ].join(",")
          ),
        ];
        const csvString = csvRows.join("\n");

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "sales-report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <MainNav />
        <main className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Загрузка данных...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <MainNav />
        <main className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={handleRetry} className="mt-4">
              Повторить попытку
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
            <div className="flex items-center gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="reportDateFrom">Дата (с)</Label>
                <Input
                  id="reportDateFrom"
                  type="date"
                  value={reportDateFrom}
                  onChange={(e) => setReportDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportDateTo">Дата (по)</Label>
                <Input
                  id="reportDateTo"
                  type="date"
                  value={reportDateTo}
                  onChange={(e) => setReportDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportActions.map((action) => (
                <Card key={action.title} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant={action.variant || "default"}
                      className="w-full"
                      onClick={action.action}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {action.buttonText}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={action.downloadCsv}
                      disabled={!reportData}
                    >
                      Скачать в CSV
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
