"use client";

import { useCallback, useEffect, useState } from "react";
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
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  visits: number;
  lastVisit: string;
  status: "active" | "inactive";
  vip: boolean;
  visitDates: string[]; // Даты посещений из visits
  totalSpent: number; // Сумма трат из orders
}

interface CustomerTableProps {
  filterActive?: boolean;
  filterVip?: boolean;
  className?: string;
  refresh?: number;
  searchQuery?: string;
}

type SortKey = keyof Pick<Customer, "name" | "visits" | "lastVisit" | "totalSpent">;
type SortOrder = "asc" | "desc";

const CustomerRow = ({
  customer,
  onDelete,
  onEdit,
}: {
  customer: Customer;
  onDelete: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell>{customer.id}</TableCell>
      <TableCell>{customer.name || "-"}</TableCell>
      <TableCell>{customer.phone || "-"}</TableCell>
      <TableCell>{customer.email || "-"}</TableCell>
      <TableCell>{customer.username || "-"}</TableCell>
      <TableCell className="min-w-[120px] max-w-[120px]">
        <div className="flex flex-col items-start gap-1">
          <span className="whitespace-nowrap">{showPassword ? customer.password : "****"}</span>
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-xs"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "Скрыть" : "Показать"}
          </Button>
        </div>
      </TableCell>
      <TableCell>{customer.visits ?? 0}</TableCell>
      <TableCell>
        {customer.visitDates.length > 0 ? customer.visitDates.join(", ") : "-"}
      </TableCell>
      <TableCell>{customer.totalSpent ? `₸${customer.totalSpent}` : "-"}</TableCell>
      <TableCell>{customer.lastVisit || "-"}</TableCell>
      <TableCell>
        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
          {customer.status === "active" ? "Активен" : "Неактивен"}
        </Badge>
      </TableCell>
      <TableCell>
        {customer.vip ? (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
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
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(customer)}>
              <Pencil className="mr-2 h-4 w-4" /> Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(customer)}>
              <Trash className="mr-2 h-4 w-4" /> Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export function CustomerTable({
  filterActive,
  filterVip,
  className,
  refresh,
  searchQuery = "",
}: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    const fetchCustomers = async () => {
      // Загружаем базовые данные клиентов
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*");

      if (customersError) {
        toast({
          title: "Ошибка загрузки клиентов",
          description: customersError.message,
          variant: "destructive",
        });
        return;
      }

      // Для каждого клиента загружаем данные из visits и orders
      const customersWithDetails = await Promise.all(
        (customersData || []).map(async (customer) => {
          // Загружаем даты посещений из visits
          const { data: visitsData, error: visitsError } = await supabase
            .from("visits")
            .select("visit_date")
            .eq("customer_id", customer.id);

          // Загружаем сумму трат из orders
          const { data: ordersData, error: ordersError } = await supabase
            .from("orders")
            .select("amount")
            .eq("customer_id", customer.id);

          if (visitsError || ordersError) {
            toast({
              title: "Ошибка загрузки данных клиента",
              description: visitsError?.message || ordersError?.message,
              variant: "destructive",
            });
            return {
              ...customer,
              visitDates: [],
              totalSpent: 0,
            };
          }

          const visitDates = visitsData?.map((visit) => visit.visit_date) || [];
          const totalSpent =
            ordersData?.reduce((sum, order) => sum + order.amount, 0) || 0;

          return {
            ...customer,
            visitDates,
            totalSpent,
          };
        })
      );

      setCustomers(customersWithDetails);
    };

    fetchCustomers();

    const channel = supabase
      .channel("realtime:customers")
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, (payload) => {
        const newRow = payload.new as Customer;
        const oldRow = payload.old as Customer;
        if (payload.eventType === "INSERT") {
          setCustomers((prev) => [...prev, { ...newRow, visitDates: [], totalSpent: 0 }]);
        } else if (payload.eventType === "UPDATE") {
          setCustomers((prev) =>
            prev.map((c) => (c.id === newRow.id ? { ...c, ...newRow } : c))
          );
        } else if (payload.eventType === "DELETE") {
          setCustomers((prev) => prev.filter((c) => c.id !== oldRow.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery);

      if (filterActive && customer.status !== "active") return false;
      if (filterVip && !customer.vip) return false;
      return matchesSearch;
    })
    .sort((a, b) => {
      const valueA = a[sortKey] || "";
      const valueB = b[sortKey] || "";
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    const { error } = await supabase.from("customers").delete().eq("id", customerToDelete.id);
    if (error) {
      toast({ title: "Ошибка удаления", description: error.message, variant: "destructive" });
    } else {
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
      toast({ title: "Удалено", description: `Клиент ${customerToDelete.name} удалён.` });
    }
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const handleEdit = (customer: Customer) => {
    setCustomerToEdit(customer);
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!customerToEdit) return;
    
    console.log("Отправляем в Supabase:", customerToEdit);

    // Удаляем все поля с пустыми массивами
    const cleaned = Object.fromEntries(
      Object.entries(customerToEdit).filter(
        ([_, value]) => !(Array.isArray(value) && value.length === 0)
      )
    );
    
    console.log("Очищенные данные для Supabase:", cleaned);
    
    const { error } = await supabase
      .from("customers")
      .update(cleaned)
      .eq("id", customerToEdit.id);
    if (error) {
      toast({ title: "Ошибка обновления", description: error.message, variant: "destructive" });
    } else {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerToEdit.id ? { ...c, ...customerToEdit } : c
        )
      );
      
      toast({ title: "Обновлено", description: `Клиент ${customerToEdit.name} обновлён.` });
    }
    setEditDialogOpen(false);
    setCustomerToEdit(null);
  };

  return (
    <>
      <div className="rounded-md border shadow-sm">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
              <TableHead>UUID</TableHead>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                Имя
              </TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Логин</TableHead>
              <TableHead className="w-[160px]">Пароль</TableHead>
              <TableHead onClick={() => handleSort("visits")} className="cursor-pointer">
                Посещения
              </TableHead>
              <TableHead>Даты посещений</TableHead>
              <TableHead onClick={() => handleSort("totalSpent")} className="cursor-pointer">
                Сумма трат
              </TableHead>
              <TableHead onClick={() => handleSort("lastVisit")} className="cursor-pointer">
                Последний визит
              </TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>VIP</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить клиента?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Ты уверен, что хочешь удалить клиента{" "}
            <span className="font-bold text-foreground">{customerToDelete?.name}</span>? Это
            действие нельзя будет отменить.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать клиента</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Имя"
              value={customerToEdit?.name || ""}
              onChange={(e) =>
                setCustomerToEdit((prev) => (prev ? { ...prev, name: e.target.value } : null))
              }
            />
            <Input
              placeholder="Телефон"
              value={customerToEdit?.phone || ""}
              onChange={(e) =>
                setCustomerToEdit((prev) => (prev ? { ...prev, phone: e.target.value } : null))
              }
            />
            <Input
              placeholder="Email"
              value={customerToEdit?.email || ""}
              onChange={(e) =>
                setCustomerToEdit((prev) => (prev ? { ...prev, email: e.target.value } : null))
              }
            />
            <Input
              placeholder="Логин"
              value={customerToEdit?.username || ""}
              onChange={(e) =>
                setCustomerToEdit((prev) => (prev ? { ...prev, username: e.target.value } : null))
              }
            />
            <Input
              placeholder="Пароль"
              value={customerToEdit?.password || ""}
              onChange={(e) =>
                setCustomerToEdit((prev) => (prev ? { ...prev, password: e.target.value } : null))
              }
            />
            <div className="flex items-center space-x-2">
              <Label htmlFor="vip">VIP</Label>
              <Switch
                id="vip"
                checked={!!customerToEdit?.vip}
                onCheckedChange={(checked) =>
                  setCustomerToEdit((prev) => (prev ? { ...prev, vip: checked } : null))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={confirmEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
