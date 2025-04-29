"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Search } from "lucide-react"
import Link from "next/link"
import { BookingTable } from "./booking-table"
import { BookingCalendar } from "./booking-calendar"
import { CreateBookingModal } from "@/components/create-booking-modal"
import { type FormEvent, useState } from "react"
import { toast } from "@/components/ui/use-toast"

// Типизация данных формы быстрого бронирования
interface QuickBookingForm {
  customer: string
  station: string
  date: string
  time: string
  duration: string
}

export default function BookingsPage() {
  const [formData, setFormData] = useState<QuickBookingForm>({
    customer: "",
    station: "",
    date: "",
    time: "",
    duration: "2",
  })

  // Обработчик отправки формы
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast({
      title: "Бронирование создано",
      description: `Бронирование для ${formData.customer} на ${formData.date} в ${formData.time} успешно создано.`,
    })
    // Здесь можно добавить логику отправки данных на сервер
    setFormData({ customer: "", station: "", date: "", time: "", duration: "2" })
  }

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Шапка */}
      <header className="border-b bg-background">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-lg font-semibold">GameZone CRM</span>
          </div>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            {[
              { href: "/", label: "Панель" },
              { href: "/bookings", label: "Бронирования" },
              { href: "/customers", label: "Клиенты" },
              { href: "/staff", label: "Персонал" },
              { href: "/pos", label: "Касса" },
              { href: "/games", label: "Игры" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Управление бронированиями</h2>
          <CreateBookingModal />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-6">
          {/* Быстрое бронирование */}
          <div className="md:w-1/3">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Быстрое бронирование</CardTitle>
                <CardDescription>Создайте новое бронирование</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Клиент</Label>
                    <Input
                      id="customer"
                      placeholder="Выберите клиента"
                      value={formData.customer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="station">Компьютер/Консоль</Label>
                    <Input
                      id="station"
                      placeholder="Выберите станцию"
                      value={formData.station}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Дата</Label>
                      <Input id="date" type="date" value={formData.date} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Время</Label>
                      <Input id="time" type="time" value={formData.time} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Продолжительность (часы)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Создать бронирование
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Таблица и календарь */}
          <div className="md:w-2/3">
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Список</TabsTrigger>
                <TabsTrigger value="calendar">Календарь</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Поиск бронирований..." className="pl-8" />
                  </div>
                  <Button variant="outline">Фильтры</Button>
                </div>
                <BookingTable />
              </TabsContent>
              <TabsContent value="calendar" className="space-y-4">
                <BookingCalendar />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

