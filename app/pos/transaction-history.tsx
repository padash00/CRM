// pos/transaction-history.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Printer, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface Transaction {
  id: string;
  date: string;
  time: string;
  customer: string;
  items: string;
  total: number;
  paymentMethod: "CARD" | "CASH";
  operator: string;
}

interface Filters {
  customerId: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

interface TransactionHistoryProps {
  searchQuery: string;
  filters: Filters;
}

const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const handleViewDetails = useCallback(() => {
    toast({
      title: "Детали чека",
      description: `Открытие деталей чека для транзакции ${transaction.id} будет доступно в следующей версии.`,
    });
  }, [transaction.id]);

  const handlePrintReceipt = useCallback(() => {
    toast({
      title: "Печать чека",
      description: `Печать чека для транзакции ${transaction.id} будет доступно в следующей версии.`,
    });
  }, [transaction.id]);

  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>{transaction.id}</TableCell>
      <TableCell>
        {transaction.date}
        <br />
        <span className="text-muted-foreground">{transaction.time}</span>
      </TableCell>
      <TableCell>{transaction.customer}</TableCell>
      <TableCell className="max-w-[200px] truncate">{transaction.items}</TableCell>
      <TableCell>₸{transaction.total.toLocaleString()}</TableCell>
      <TableCell>
        <Badge
          variant={transaction.paymentMethod === "CARD" ? "outline" : "secondary"}
          className={transaction.paymentMethod === "CARD" ? "bg-blue-100 text-blue-800" : ""}
        >
          {transaction.paymentMethod === "CARD" ? "Карта" : "Наличные"}
        </Badge>
      </TableCell>
      <TableCell>{transaction.operator}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Открыть меню</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewDetails}>
              <Receipt className="mr-2 h-4 w-4" /> Детали чека
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrintReceipt}>
              <Printer className="mr-2 h-4 w-4" /> Печать чека
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export function TransactionHistory({ searchQuery, filters }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      let query = supabase
        .from("transactions")
        .select("*, customers(name)")
        .order("transaction_date", { ascending: false });

      if (searchQuery) {
        query = query.ilike("customers.name", `%${searchQuery}%`);
      }

      if (filters.customerId && filters.customerId !== "all") {
        query = query.eq("customer_id", filters.customerId);
      }

      if (filters.dateFrom) {
        query = query.gte("transaction_date", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("transaction_date", filters.dateTo);
      }

      if (filters.amountMin) {
        query = query.gte("amount", parseFloat(filters.amountMin));
      }
      if (filters.amountMax) {
        query = query.lte("amount", parseFloat(filters.amountMax));
      }

      const { data: transactionsData, error: transactionsError } = await query;

      if (transactionsError) {
        toast({
          title: "Ошибка загрузки транзакций",
          description: transactionsError.message,
          variant: "destructive",
        });
        return;
      }

      const transformedTransactions = await Promise.all(
        (transactionsData || []).map(async (transaction) => {
          // Получаем элементы транзакции
          const { data: itemsData, error: itemsError } = await supabase
            .from("transaction_items")
            .select("*")
            .eq("transaction_id", transaction.id);

          if (itemsError) {
            toast({
              title: "Ошибка загрузки товаров транзакции",
              description: itemsError.message,
              variant: "destructive",
            });
            return null;
          }

          // Для каждой записи в transaction_items определяем, к какой таблице она относится
          const itemsList = await Promise.all(
            (itemsData || []).map(async (item) => {
              let itemName = "Неизвестный элемент";
              if (item.item_type === "product") {
                const { data: productData, error: productError } = await supabase
                  .from("items")
                  .select("name")
                  .eq("id", item.item_id)
                  .single();

                if (productError) {
                  console.error("Ошибка загрузки товара:", productError.message);
                } else {
                  itemName = productData?.name || "Неизвестный товар";
                }
              } else if (item.item_type === "service") {
                const { data: serviceData, error: serviceError } = await supabase
                  .from("services")
                  .select("name")
                  .eq("id", item.item_id)
                  .single();

                if (serviceError) {
                  console.error("Ошибка загрузки услуги:", serviceError.message);
                } else {
                  itemName = serviceData?.name || "Неизвестная услуга";
                }
              }
              return `${itemName} (${item.quantity} шт.)`;
            })
          );

          const date = new Date(transaction.transaction_date);
          return {
            id: transaction.id,
            date: date.toLocaleDateString("ru-RU"),
            time: date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
            customer: transaction.customers?.name || "Неизвестный клиент",
            items: itemsList.join(", ") || "Нет товаров",
            total: transaction.amount,
            paymentMethod: transaction.payment_type === "CARD" ? "CARD" : "CASH",
            operator: "Кассир", // Пока захардкодим
          };
        })
      );

      setTransactions(transformedTransactions.filter((t) => t !== null) as Transaction[]);
    };

    fetchTransactions();
  }, [searchQuery, filters]);

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]">
              <Checkbox />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Дата/Время</TableHead>
            <TableHead>Клиент</TableHead>
            <TableHead>Товары/Услуги</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Способ оплаты</TableHead>
            <TableHead>Оператор</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                Нет транзакций для отображения
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
