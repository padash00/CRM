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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

// Типизация сотрудника
interface Staff {
  id: string
  name: string
  initials: string
  position: string
  phone: string
  email: string
  status: "active" | "inactive"
  workingHours: string
}

// Компонент строки таблицы
const StaffRow = ({ employee }: { employee: Staff }) => {
  const handleEdit = useCallback(() => {
    toast({
      title: "Редактирование",
      description: `Редактирование сотрудника ${employee.name} будет доступно в следующей версии.`,
    })
  }, [employee.name])

  const handleDelete = useCallback(() => {
    toast({
      title: "Удаление",
      description: `Удаление сотрудника ${employee.name} будет доступно в следующей версии.`,
      variant: "destructive",
    })
  }, [employee.name])

  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{employee.initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{employee.name}</div>
            <div className="text-sm text-muted-foreground">{employee.id}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{employee.position}</TableCell>
      <TableCell>
        <div>{employee.phone}</div>
        <div className="text-sm text-muted-foreground">{employee.email}</div>
      </TableCell>
      <TableCell>
        <Badge
          variant={employee.status === "active" ? "default" : "secondary"}
          className={
            employee.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {employee.status === "active" ? "Активен" : "Неактивен"}
        </Badge>
      </TableCell>
      <TableCell>{employee.workingHours}</TableCell>
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
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash className="mr-2 h-4 w-4" /> Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function StaffTable() {
  const staff: Staff[] = [
    {
      id: "S001",
      name: "Иван Смирнов",
      initials: "ИС",
      position: "Администратор",
      phone: "+7 (999) 123-45-67",
      email: "ivan@example.com",
      status: "active",
      workingHours: "40 ч/нед",
    },
    {
      id: "S002",
      name: "Мария Петрова",
      initials: "МП",
      position: "Оператор",
      phone: "+7 (999) 234-56-78",
      email: "maria@example.com",
      status: "active",
      workingHours: "30 ч/нед",
    },
    {
      id: "S003",
      name: "Анна Козлова",
      initials: "АК",
      position: "Бармен",
      phone: "+7 (999) 345-67-89",
      email: "anna@example.com",
      status: "active",
      workingHours: "20 ч/нед",
    },
    {
      id: "S004",
      name: "Алексей Новиков",
      initials: "АН",
      position: "Техник",
      phone: "+7 (999) 456-78-90",
      email: "alexey@example.com",
      status: "inactive",
      workingHours: "20 ч/нед",
    },
    {
      id: "S005",
      name: "Екатерина Соколова",
      initials: "ЕС",
      position: "Администратор",
      phone: "+7 (999) 567-89-01",
      email: "ekaterina@example.com",
      status: "active",
      workingHours: "40 ч/нед",
    },
    {
      id: "S006",
      name: "Дмитрий Волков",
      initials: "ДВ",
      position: "Оператор",
      phone: "+7 (999) 678-90-12",
      email: "dmitry@example.com",
      status: "inactive",
      workingHours: "30 ч/нед",
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
            <TableHead>Сотрудник</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Контакты</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Рабочее время</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((employee) => (
            <StaffRow key={employee.id} employee={employee} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

