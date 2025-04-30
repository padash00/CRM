// pos/transaction-history.tsx
"use client";

import { useState, useEffect } from "react";
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

// Типизация транзакции
interface Transaction {
  id: string;
  date: string;
  time: string;
  customer: string;
  items: string;
  total: number;
  paymentMethod: "card" | "cash";
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

// Компонент строки таблицы
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
      description: `Печать чека для транзакции ${transaction.id} будет доступна в следующей версии.`,
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
          variant={transaction.paymentMethod === "card" ? "outline" : "secondary"}
          className={transaction.paymentMethod === "card" ? "bg-blue-100 text-blue-800" : ""}
        >
          {transaction.paymentMethod === "card" ? "Карта" : "Наличные"}
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

      // Фильтрация по поиску (по имени клиента)
      if (searchQuery) {
        query = query.ilike("customers.name", `%${searchQuery}%`);
      }

      // Фильтрация по клиенту
      if (filters.customerId && filters.customerId !== "all") {
        query = query.eq("customer_id", filters.customerId);
      }

      // Фильтрация по дате
      if (filters.dateFrom) {
        query = query.gte("transaction_date", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("transaction_date", filters.dateTo);
      }

      // Фильтрация по сумме
      if (filters.amountMin) {
        query = query.gte("amount", parseFloat(filters.amountMin));
      }
      if (filters.amountMax) {
        query = query.lte("amount", parseFloat(filters.amountMax));
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Ошибка загрузки транзакций",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const transformedTransactions = (data || []).map((transaction) => {
          const date = new Date(transaction.transaction_date);
          return {
            id: transaction.id,
            date: date.toLocaleDateString("ru-RU"),
            time: date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
            customer: transaction.customers?.name || "Неизвестный клиент",
            items: "Игровое время", // Пока захардкодим, можно добавить отдельную таблицу для товаров
            total: transaction.amount,
            paymentMethod: transaction.payment_type === "card" ? "card" : "cash",
            operator: "Кассир", // Пока захардкодим, можно добавить таблицу для операторов
          };
        });
        setTransactions(transformedTransactions);
      }
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
