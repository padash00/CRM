"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Printer, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

// Типизация транзакции
interface Transaction {
  id: string
  date: string
  time: string
  customer: string
  items: string
  total: number
  paymentMethod: "card" | "cash"
  operator: string
}

// Компонент строки таблицы
const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const handleViewDetails = useCallback(() => {
    toast({
      title: "Детали чека",
      description: `Открытие деталей чека для транзакции ${transaction.id} будет доступно в следующей версии.`,
    })
  }, [transaction.id])

  const handlePrintReceipt = useCallback(() => {
    toast({
      title: "Печать чека",
      description: `Печать чека для транзакции ${transaction.id} будет доступна в следующей версии.`,
    })
  }, [transaction.id])

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
      <TableCell>₽{transaction.total.toLocaleString()}</TableCell>
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
  )
}

export function TransactionHistory() {
  const transactions: Transaction[] = [
    {
      id: "T001",
      date: "30.03.2025",
      time: "14:35",
      customer: "Алексей К.",
      items: "Игровое время (3 часа), Энергетический напиток x2",
      total: 800,
      paymentMethod: "card",
      operator: "Иван С.",
    },
    {
      id: "T002",
      date: "30.03.2025",
      time: "15:10",
      customer: "Михаил С.",
      items: "Игровое время (2 часа), Чипсы, Кофе",
      total: 570,
      paymentMethod: "cash",
      operator: "Иван С.",
    },
    {
      id: "T003",
      date: "30.03.2025",
      time: "13:45",
      customer: "Дмитрий В.",
      items: "Игровое время (1 час)",
      total: 200,
      paymentMethod: "card",
      operator: "Мария П.",
    },
    {
      id: "T004",
      date: "30.03.2025",
      time: "12:00",
      customer: "Сергей Л.",
      items: "VIP зона (3 часа), Сэндвич, Вода",
      total: 970,
      paymentMethod: "cash",
      operator: "Мария П.",
    },
    {
      id: "T005",
      date: "30.03.2025",
      time: "16:20",
      customer: "Николай Р.",
      items: "Консоль (2 часа), Энергетический напиток, Чипсы",
      total: 820,
      paymentMethod: "card",
      operator: "Иван С.",
    },
    {
      id: "T006",
      date: "29.03.2025",
      time: "19:15",
      customer: "Артем С.",
      items: "Игровое время (3 часа), Печать документов x5",
      total: 575,
      paymentMethod: "cash",
      operator: "Анна К.",
    },
    {
      id: "T007",
      date: "29.03.2025",
      time: "17:30",
      customer: "Максим К.",
      items: "Консоль (2 часа), Сэндвич, Кофе",
      total: 800,
      paymentMethod: "card",
      operator: "Анна К.",
    },
    {
      id: "T008",
      date: "29.03.2025",
      time: "14:45",
      customer: "Владимир Н.",
      items: "Игровое время (2 часа), Шоколадный батончик x2",
      total: 510,
      paymentMethod: "cash",
      operator: "Мария П.",
    },
  ]

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
          {transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

