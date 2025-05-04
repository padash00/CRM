// app/page.tsx (Код для Дашборда с активной кнопкой бронирования)
"use client";

// Добавляем useState и useEffect (если еще не были)
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav"; // Убедись, что путь верный
import { Plus, BarChart, Clock, Users, List } from "lucide-react";
import { toast } from "sonner"; // Добавляем импорт toast

// --- ИМПОРТИРУЕМ ДИАЛОГ СОЗДАНИЯ БРОНИ ---
// ВАЖНО: Укажи правильный путь к твоему файлу CreateBookingDialog.tsx!
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog";

// TODO: Позже сюда добавим импорт компонента графика и списка бронирований
// import { RevenueChart } from "@/components/dashboard/revenue-chart";
// import { RecentBookings } from "@/components/dashboard/recent-bookings";

// Компонент страницы Дашборда
export default function DashboardPage() {

  // --- ДОБАВЛЯЕМ СОСТОЯНИЕ ДЛЯ ДИАЛОГА БРОНИРОВАНИЯ ---
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);

  // Статичные данные для карточек статистики (пока оставляем)
  const stats = [
    { title: "Активные бронирования", value: "0", icon: Clock, description: "Загрузка..." },
    { title: "Активные клиенты", value: "0", icon: Users, description: "Загрузка..." },
    { title: "Выручка сегодня", value: "₸0", icon: BarChart, description: "Загрузка..." },
    { title: "Среднее время сессии", value: "- ч", icon: Clock, description: "Нет данных" },
  ];

  // TODO: Добавить useState и useEffect для загрузки РЕАЛЬНЫХ данных для stats, графика и бронирований

  // --- ДОБАВЛЯЕМ ФУНКЦИЮ-КОЛЛБЭК ПОСЛЕ СОЗДАНИЯ БРОНИ ---
  const handleBookingCreated = () => {
    console.log("Бронирование создано! Нужно обновить дашборд.");
    // Здесь в будущем будет логика обновления данных на дашборде
    // Например: fetchDashboardStats(); fetchRecentBookings();
    toast.success("Бронирование успешно создано!");
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">

        {/* Заголовок и кнопка "+ Новое бронирование" */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          {/* --- ОБНОВЛЕННАЯ КНОПКА --- */}
          <Button onClick={() => setIsCreateBookingDialogOpen(true)}> {/* Убрали disabled, добавили onClick */}
            <Plus className="mr-2 h-4 w-4" /> Новое бронирование
          </Button>
          {/* --- КОНЕЦ ОБНОВЛЕННОЙ КНОПКИ --- */}
        </div>

        {/* Система вкладок */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="sessions" disabled>Активные сессии</TabsTrigger>
            <TabsTrigger value="analytics" disabled>Аналитика</TabsTrigger>
            <TabsTrigger value="map" disabled>Карта клуба</TabsTrigger>
          </TabsList>

          {/* Содержимое вкладки "Обзор" */}
          <TabsContent value="overview" className="space-y-6">
            {/* Карточки статистики */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                 <Card key={stat.title} className="shadow-sm bg-card">
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader>
                   <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground">{stat.description}</p> </CardContent>
                 </Card>
               ))}
            </div>

            {/* Блок с Графиком и Списком Бронирований */}
            <div className="grid gap-6 lg:grid-cols-3">
               {/* Заглушка для Графика */}
               <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка </CardTitle> </CardHeader> <CardContent className="min-h-[300px] flex items-center justify-center text-muted-foreground"> (Компонент графика выручки) </CardContent> </Card>
               {/* Заглушка для Списка Бронирований */}
               <Card className="lg:col-span-1 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader> <CardContent className="min-h-[300px] flex flex-col text-sm p-4"> <div className="flex-grow flex items-center justify-center text-muted-foreground text-center text-xs"> (Компонент <br/> последних бронирований) </div> <Button variant="outline" size="sm" className="w-full mt-4" disabled> Все бронирования </Button> </CardContent> </Card>
            </div>
          </TabsContent>

          {/* TODO: Добавить TabsContent для других вкладок */}

        </Tabs>
      </main>

      {/* --- РЕНДЕРИНГ ДИАЛОГА СОЗДАНИЯ БРОНИ --- */}
      <CreateBookingDialog
        open={isCreateBookingDialogOpen}
        onOpenChange={setIsCreateBookingDialogOpen} // Функция для закрытия
        onBookingCreated={handleBookingCreated} // Функция после успешного создания
      />
      {/* --- КОНЕЦ РЕНДЕРИНГА ДИАЛОГА --- */}

    </div>
  );
}
