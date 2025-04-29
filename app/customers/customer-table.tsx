"use client"

import { useCallback, useEffect, useState } from "react"
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
import { supabase } from "@/lib/supabaseClient"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

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

const CustomerRow = ({ customer, onDelete, onEdit }: { customer: Customer, onDelete: (customer: Customer) => void, onEdit: (customer: Customer) => void }) => {
  const handleEditClick = () => onEdit(customer)
  const handleDeleteClick = () => onDelete(customer)

  return (
    <TableRow>
      <TableCell><Checkbox /></TableCell>
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
              <span className="sr-only">Открыть меню</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEditClick}>
              <Pencil className="mr-2 h-4 w-4" /> Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleDeleteClick}>
              <Trash className="mr-2 h-4 w-4" /> Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export function CustomerTable({ filterActive, filterVip }: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from("customers").select("*")
      if (error) {
        toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" })
      } else {
        setCustomers(data as Customer[])
      }
    }
    fetchCustomers()
  }, [])

  const handleDelete = useCallback((customer: Customer) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = async () => {
    if (!customerToDelete) return

    const { error } = await supabase.from("customers").delete().eq("id", customerToDelete.id)

    if (error) {
      toast({ title: "Ошибка удаления", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Удалено", description: `Клиент ${customerToDelete.name} удалён.` })
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id))
    }

    setDeleteDialogOpen(false)
    setCustomerToDelete(null)
  }

  const handleEdit = useCallback((customer: Customer) => {
    setCustomerToEdit(customer)
    setEditDialogOpen(true)
  }, [])

  const confirmEdit = async () => {
    if (!customerToEdit) return

    const { error } = await supabase.from("customers").update(customerToEdit).eq("id", customerToEdit.id)

    if (error) {
      toast({ title: "Ошибка обновления", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Обновлено", description: `Клиент ${customerToEdit.name} обновлён.` })
    }

    setEditDialogOpen(false)
    setCustomerToEdit(null)
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search) ||
      customer.email.toLowerCase().includes(search.toLowerCase())

    if (filterActive && customer.status !== "active") return false
    if (filterVip && !customer.vip) return false
    return matchesSearch
  })

  return (
    <>
      <div className="flex justify-between mb-4">
        <Input placeholder="Поиск клиента..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"><Checkbox /></TableHead>
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
              <CustomerRow key={customer.id} customer={customer} onDelete={handleDelete} onEdit={handleEdit} />
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
            Ты уверен, что хочешь удалить клиента <span className="font-bold text-foreground">{customerToDelete?.name}</span>? Это действие нельзя будет отменить.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={confirmDelete}>Удалить</Button>
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
              onChange={(e) => setCustomerToEdit((prev) => prev ? { ...prev, name: e.target.value } : null)}
            />
            <Input
              placeholder="Телефон"
              value={customerToEdit?.phone || ""}
              onChange={(e) => setCustomerToEdit((prev) => prev ? { ...prev, phone: e.target.value } : null)}
            />
            <Input
              placeholder="Email"
              value={customerToEdit?.email || ""}
              onChange={(e) => setCustomerToEdit((prev) => prev ? { ...prev, email: e.target.value } : null)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Отмена</Button>
            <Button onClick={confirmEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
