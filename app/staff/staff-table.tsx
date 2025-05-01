// app/staff/staff-table.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Checkbox } from "@/components/ui/checkbox";

// Типизация оператора
interface Operator {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  working_hours: string;
  role: "maindev" | "operator";
}

interface StaffTableProps {
  searchQuery: string;
  operators: Operator[];
  setOperators: React.Dispatch<React.SetStateAction<Operator[]>>;
  currentOperator: Operator | null;
}

// Компонент строки таблицы
const StaffRow = ({ operator, onDelete, canDelete }: { operator: Operator; onDelete: (id: string) => void; canDelete: boolean }) => {
  const handleEdit = () => {
    toast({
      title: "Редактирование",
      description: `Редактирование оператора ${operator.name} будет доступно в следующей версии.`,
    });
  };

  const handleDelete = () => {
    if (!canDelete) {
      toast({
        title: "Ошибка доступа",
        description: "Только maindev может удалять операторов",
        variant: "destructive",
      });
      return;
    }
    onDelete(operator.id);
  };

  // Вычисляем инициалы из имени
  const initials = operator.name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{operator.name}</div>
            <div className="text-sm text-muted-foreground">{operator.id}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{operator.position}</TableCell>
      <TableCell>
        <div>{operator.phone}</div>
        <div className="text-sm text-muted-foreground">{operator.email}</div>
      </TableCell>
      <TableCell>
        <Badge
          variant={operator.status === "active" ? "default" : "secondary"}
          className={
            operator.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {operator.status === "active" ? "Активен" : "Неактивен"}
        </Badge>
      </TableCell>
      <TableCell>{operator.working_hours}</TableCell>
      <TableCell>
        <Badge
          variant={operator.role === "maindev" ? "default" : "secondary"}
          className={
            operator.role === "maindev"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {operator.role === "maindev" ? "Maindev" : "Оператор"}
        </Badge>
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
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash className="mr-2 h-4 w-4" /> Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export function StaffTable({ searchQuery, operators, setOperators, currentOperator }: StaffTableProps) {
  const filteredOperators = operators.filter((operator) =>
    operator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteOperator = async (operatorId: string) => {
    const { error } = await supabase
      .from("operators")
      .delete()
      .eq("id", operatorId);

    if (error) {
      toast({
        title: "Ошибка удаления оператора",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setOperators((prev) => prev.filter((op) => op.id !== operatorId));
    toast({
      title: "Оператор удалён",
      description: "Оператор успешно удалён",
    });
  };

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]">
              <Checkbox />
            </TableHead>
            <TableHead>Оператор</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Контакты</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Рабочее время</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOperators.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Нет операторов для отображения
              </TableCell>
            </TableRow>
          ) : (
            filteredOperators.map((operator) => (
              <StaffRow
                key={operator.id}
                operator={operator}
                onDelete={handleDeleteOperator}
                canDelete={currentOperator?.role === "maindev"}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
