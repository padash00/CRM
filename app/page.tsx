// app/page.tsx (Дашборд с АКТИВНЫМИ вкладками)
"use client";

// Импорты для UI компонентов и React Hooks
import { useState, useEffect, useCallback } from "react"; // Добавили импорты React, если их не было
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav"; // Убедись, что путь верный
import { Plus, BarChart, Clock, Users, List, Tv, LineChart, Map } from "lucide-react"; // Добавили иконки
import { toast } from "sonner"; // Добавили импорт toast

// Импорты для получения данных и других компонентов (пока закомментированы)
// import { supabase } from "@/lib/supabaseClient";
// import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // Добавим позже
// import { RevenueChart } from "@/components/dashboard/revenue-chart";
// import { RecentBookings } from "@/components/dashboard/recent-bookings";
// import { ActiveSessionsList } from "@/components/dashboard/active-sessions-list"; // Пример
// import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"; // Пример
// import { ClubMap } from "@/components/dashboard/club-map"; // Пример

// Компонент страницы Дашборда
export default function DashboardPage() {

  // Состояние для активной вкладки
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Состояние для диалога бронирования (добавим позже, пока кнопка не активна)
  // const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);

  // Статичные данные для карточек статистики (пока заглушки)
  const stats = [
    { title: "Активные бронирования", value: "0", icon: Clock, description: "Загрузка..." },
    { title: "Активные клиенты", value: "0", icon: Users, description: "Загрузка..." },
    { title: "Выручка сегодня", value: "₸0", icon: BarChart, description: "Загрузка..." },
    { title: "Среднее время сессии", value: "- ч", icon: Clock, description: "Нет данных" },
  ];

  // TODO: Добавить useState и useEffect для загрузки РЕАЛЬНЫХ данных

  // Коллбэк для создания брони (добавим позже)
  // const handleBookingCreated = () => { ... };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">

        {/* Заголовок и кнопка "+ Новое бронирование" */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          <Button disabled> {/* TODO: Убрать disabled и добавить onClick={() => setIsCreateBookingDialogOpen(true)} */}
            <Plus className="mr-2 h-4 w-4" /> Новое бронирование
          </Button>
        </div>

        {/* Система вкладок */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4"> {/* Используем activeTab */}
          {/* Переключатели вкладок (УБРАН disabled) */}
          <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> {/* Добавлен flex-wrap */}
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="sessions">Активные сессии</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            <TabsTrigger value="map">Карта клуба</TabsTrigger>
          </TabsList>

          {/* === Содержимое вкладок === */}

          {/* 1. Вкладка "Обзор" */}
          <TabsContent value="overview" className="space-y-6">
            {/* Карточки статистики */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => ( /* ... код карточек ... */
                 <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground">{stat.description}</p> </CardContent> </Card>
              ))}
            </div>
            {/* График и Список Бронирований */}
            <div className="grid gap-6 lg:grid-cols-3">
               <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка </CardTitle> </CardHeader> <CardContent className="min-h-[300px] flex items-center justify-center text-muted-foreground"> (Компонент графика выручки) </CardContent> </Card>
               <Card className="lg:col-span-1 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader> <CardContent className="min-h-[300px] flex flex-col text-sm p-4"> <div className="flex-grow flex items-center justify-center text-muted-foreground text-center text-xs"> (Компонент <br/> последних бронирований) </div> <Button variant="outline" size="sm" className="w-full mt-4" disabled> Все бронирования </Button> </CardContent> </Card>
            </div>
          </TabsContent>

          {/* 2. Вкладка "Активные сессии" (заглушка) */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Tv className="h-5 w-5 text-primary"/> {/* Иконка для активных сессий */}
                    Активные сессии
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Здесь будет отображаться информация о текущих активных сессиях клиентов.</p>
                {/* TODO: Создать компонент ActiveSessionsList и получать для него данные */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. Вкладка "Аналитика" (заглушка) */}
          <TabsContent value="analytics">
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary"/> {/* Иконка для аналитики */}
                    Аналитика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Здесь будут отображаться различные аналитические отчеты и графики.</p>
                 {/* TODO: Создать компоненты для аналитики */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. Вкладка "Карта клуба" (заглушка) */}
          <TabsContent value="map">
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary"/> {/* Иконка для карты */}
                    Карта клуба
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-muted-foreground">Здесь будет интерактивная или статичная карта компьютерного клуба.</p>
                 {/* TODO: Создать компонент ClubMap */}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>

       {/* Модальные окна (добавим позже) */}
       {/*
       <CreateBookingDialog
         open={isCreateBookingDialogOpen}
         onOpenChange={setIsCreateBookingDialogOpen}
         onBookingCreated={handleBookingCreated}
       />
       */}

    </div>
  );
}
