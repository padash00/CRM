// app/page.tsx (Код для Дашборда)
"use client";

// Импорты для UI компонентов (убедись, что пути верны)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav"; // Убедись, что путь верный
// Импорты иконок
import { Plus, BarChart, Clock, Users, List } from "lucide-react";
// Импорты для получения данных (пока закомментированы, добавим позже)
// import { useState, useEffect, useCallback } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { toast } from "sonner";

// TODO: Позже сюда добавим импорт компонента графика и списка бронирований
// import { RevenueChart } from "@/components/dashboard/revenue-chart"; // Пример
// import { RecentBookings } from "@/components/dashboard/recent-bookings"; // Пример

// Компонент страницы Дашборда (главной страницы)
export default function DashboardPage() {

  // Пока используем статичные данные для карточек статистики
  // В будущем здесь будет state и useEffect для загрузки реальных данных
  const stats = [
    { title: "Активные бронирования", value: "0", icon: Clock, description: "Загрузка..." },
    { title: "Активные клиенты", value: "0", icon: Users, description: "Загрузка..." },
    { title: "Выручка сегодня", value: "₸0", icon: BarChart, description: "Загрузка..." },
    { title: "Среднее время сессии", value: "- ч", icon: Clock, description: "Нет данных" },
  ];

  // TODO: Добавить useState и useEffect для загрузки реальных данных для stats, графика и бронирований

  return (
    // Основная структура страницы с использованием Flexbox
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Верхняя навигация */}
      <MainNav />
      {/* Основное содержимое */}
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">

        {/* Заголовок страницы и кнопка "+ Новое бронирование" */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          {/* Кнопка пока неактивна, нужно будет добавить логику */}
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" /> Новое бронирование
          </Button>
        </div>

        {/* Система вкладок */}
        <Tabs defaultValue="overview" className="space-y-4">
          {/* Переключатели вкладок */}
          <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            {/* Другие вкладки пока отключены (disabled) */}
            <TabsTrigger value="sessions" disabled>Активные сессии</TabsTrigger>
            <TabsTrigger value="analytics" disabled>Аналитика</TabsTrigger>
            <TabsTrigger value="map" disabled>Карта клуба</TabsTrigger>
          </TabsList>

          {/* Содержимое вкладки "Обзор" */}
          <TabsContent value="overview" className="space-y-6">
            {/* Блок с карточками статистики */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="shadow-sm bg-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    {/* Отображаем иконку */}
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {/* Отображаем значение */}
                    <div className="text-2xl font-bold">{stat.value}</div>
                     {/* Отображаем описание */}
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Блок с Графиком и Списком Бронирований */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Заглушка для Графика Выручки (занимает 2 колонки на больших экранах) */}
              <Card className="lg:col-span-2 shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-primary" /> Выручка
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-h-[300px] flex items-center justify-center text-muted-foreground">
                  {/* Здесь позже будет компонент графика */}
                  (Компонент графика выручки)
                </CardContent>
              </Card>

              {/* Заглушка для Списка Бронирований (занимает 1 колонку) */}
              <Card className="lg:col-span-1 shadow-sm bg-card">
                 <CardHeader>
                   <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <List className="h-5 w-5 text-primary" /> Последние бронирования
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="min-h-[300px] flex flex-col text-sm p-4">
                   {/* Здесь позже будет компонент списка */}
                   <div className="flex-grow flex items-center justify-center text-muted-foreground text-center text-xs">
                       (Компонент <br/> последних бронирований)
                   </div>
                   {/* Кнопка "Все бронирования" пока неактивна */}
                   <Button variant="outline" size="sm" className="w-full mt-4" disabled>
                       Все бронирования
                   </Button>
                 </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Здесь будет содержимое других вкладок, когда мы их реализуем */}
          {/* <TabsContent value="sessions">...</TabsContent> */}
          {/* <TabsContent value="analytics">...</TabsContent> */}
          {/* <TabsContent value="map">...</TabsContent> */}

        </Tabs>
      </main>
    </div>
  );
}
