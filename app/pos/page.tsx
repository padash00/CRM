// pos/transaction-history.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  transaction_date: string;
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
        const transformedTransactions = (data || []).map((transaction) => ({
          id: transaction.id,
          customer_id: transaction.customer_id,
          customer_name: transaction.customers?.name || "Неизвестный клиент",
          amount: transaction.amount,
          transaction_date: new Date(transaction.transaction_date).toLocaleDateString("ru-RU"),
        }));
        setTransactions(transformedTransactions);
      }
    };

    fetchTransactions();
  }, [searchQuery, filters]);

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Клиент</TableHead>
            <TableHead>Сумма (₸)</TableHead>
            <TableHead>Дата</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.customer_name}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.transaction_date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
