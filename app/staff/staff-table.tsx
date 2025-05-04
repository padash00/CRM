// app/staff/staff-table.tsx
"use client";

import { useState, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
const StaffRow = ({ operator, onEdit, onDelete, canEdit, canDelete }: { operator: Operator; onEdit: (updatedOperator: Operator) => void; onDelete: (id: string) => void; canEdit: boolean; canDelete: boolean }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(operator.name);
  const [editRole, setEditRole] = useState<"maindev" | "operator">(operator.role);

  const handleEdit = () => {
    if (!canEdit) {
      toast({
        title: "Ошибка доступа",
        description: "Только maindev может редактировать операторов",
        variant: "destructive",
      });
      return;
    }
    setIsEditDialogOpen(true);
  };

  const saveEdit = () => {
    onEdit({ ...operator, name: editName, role: editRole });
    setIsEditDialogOpen(false);
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
    <>
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

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать оператора</DialogTitle>
            <DialogDescription>Измените данные оператора {operator.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editOperatorName">Имя оператора</Label>
              <Input
                id="editOperatorName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Введите имя оператора"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editOperatorRole">Роль</Label>
              <Select
                value={editRole}
                onValueChange={(value: "maindev" | "operator") => setEditRole(value)}
              >
                <SelectTrigger id="editOperatorRole">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">Оператор</SelectItem>
                  <SelectItem value="maindev">Maindev</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export function StaffTable({ searchQuery, operators, setOperators, currentOperator }: StaffTableProps) {
  const filteredOperators = operators.filter((operator) =>
    operator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditOperator = async (updatedOperator: Operator) => {
    const { error } = await supabase
      .from("operators")
      .update({ name: updatedOperator.name, role: updatedOperator.role })
      .eq("id", updatedOperator.id);

    if (error) {
      console.error("Ошибка редактирования оператора:", error);
      toast({
        title: "Ошибка редактирования оператора",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setOperators((prev) =>
      prev.map((op) => (op.id === updatedOperator.id ? updatedOperator : op))
    );
    toast({
      title: "Оператор обновлён",
      description: "Данные оператора успешно обновлены",
    });
  };

  const handleDeleteOperator = async (operatorId: string) => {
    const { error } = await supabase
      .from("operators")
      .delete()
      .eq("id", operatorId);

    if (error) {
      console.error("Ошибка удаления оператора:", error);
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
                onEdit={handleEditOperator}
                onDelete={handleDeleteOperator}
                canEdit={currentOperator?.role === "maindev"}
                canDelete={currentOperator?.role === "maindev"}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
