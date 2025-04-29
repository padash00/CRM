"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { CustomerTable } from "./customer-table"
import { CustomerStats } from "./customer-stats"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabaseClient"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Stat {
  title: string
  value: string
  description: string
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  })

  const stats: Stat[] = [
    { title: "Всего клиентов", value: "256", description: "+24 за последний месяц" },
    { title: "Активные клиенты", value: "128", description: "50% от общего числа" },
    { title: "VIP клиенты", value: "32", description: "12.5% от общего числа" },
    { title: "Средний чек", value: "₸850", description: "+₸120 с прошлого месяца" },
  ]

  // 👇 Генераторы
  const generateUsername = (name: string) => {
    const suffix = Math.random().toString(36).substring(2, 5)
    return `${name.toLowerCase().replace(/\s+/g, "_")}_${suffix}`
  }

  const generatePassword = () => {
    return String(Math.floor(1000 + Math.random() * 9000)) // 4 цифры
  }

  // 👇 Создание клиента
  const handleDialogSubmit = async () => {
    const username = generateUsername(newCustomer.name)
    const password = generatePassword()

    const { error } = await supabase.from("customers").insert([
      {
        ...newCustomer,
        username,
        password,
        visits: 0,
        lastVisit: new Date().toISOString().split("T")[0],
        status: "active",
        vip: false,
      },
    ])

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" })
    } else {
      toast({
        title: "Клиент добавлен",
        description: `Логин: ${username} | Пароль: ${password}`,
      })
      setOpenDialog(false)
      setNewCustomer({ name: "", phone: "", email: "" })
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />

      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Управление клиентами</h2>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Новый клиент
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Все клиенты</TabsTrigger>
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск клиентов..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline">Фильтры</Button>
            </div>
            <CustomerTable />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <CustomerTable filterActive />
          </TabsContent>

          <TabsContent value="vip" className="space-y-4">
            <CustomerTable filterVip />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Статистика посещений</CardTitle>
                <CardDescription>Количество посещений по месяцам</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerStats />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать нового клиента</DialogTitle>
            <DialogDescription>Введите данные клиента ниже</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Отмена</Button>
            <Button onClick={handleDialogSubmit}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
