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
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

// Типизация клиента
interface Customer {
  id: string
  name: string
  phone: string
  email: string
  visits: number
  lastVisit: string
  status: "active" | "inactive"
  vip: boolean
}

interface CustomerTableProps {
  filterActive?: boolean
  filterVip?: boolean
}

// Компонент строки таблицы
const CustomerRow = ({ customer }: { customer: Customer }) => {
  const handleEdit = useCallback(() => {
    toast({
      title: "Редактирование клиента",
      description: `Редактирование клиента ${customer.id} будет доступно в следующей версии.`,
    })
  }, [customer.id])

  const handleDelete = useCallback(() => {
    toast({
      title: "Удаление клиента",
      description: `Удаление клиента ${customer.id} будет доступно в следующей версии.`,
      variant: "destructive",
    })
  }, [customer.id])

  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>{customer.id}</TableCell>
      <TableCell>{customer.name}</TableCell>
      <TableCell>{customer.phone}</TableCell>
      <TableCell>{customer.email}</TableCell>
      <TableCell>{customer.visits}</TableCell>
      <TableCell>{customer.lastVisit}</TableCell>
      <TableCell>
        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
          {customer.status === "active" ? "Активен" : "Неактивен"}
        </Badge>
      </TableCell>
      <TableCell>
        {customer.vip ? (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          >
            VIP
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
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
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" /> Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function CustomerTable({ filterActive, filterVip }: CustomerTableProps) {
  const customers: Customer[] = [
    {
      id: "C001",
      name: "Алексей Кузнецов",
      phone: "+7 (999) 123-45-67",
      email: "alexey@example.com",
      visits: 42,
      lastVisit: "30.03.2025",
      status: "active",
      vip: true,
    },
    // ... остальные данные остаются без изменений
    {
      id: "C010",
      name: "Владимир Новиков",
      phone: "+7 (999) 012-34-56",
      email: "vladimir@example.com",
      visits: 25,
      lastVisit: "27.03.2025",
      status: "inactive",
      vip: true,
    },
  ]

  // Мемоизация фильтрации клиентов
  const filteredCustomers = useCallback(() => {
    return customers.filter((customer) => {
      if (filterActive && customer.status !== "active") return false
      if (filterVip && !customer.vip) return false
      return true
    })
  }, [filterActive, filterVip])()

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Имя</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Посещения</TableHead>
            <TableHead>Последний визит</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>VIP</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.map((customer) => (
            <CustomerRow key={customer.id} customer={customer} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

