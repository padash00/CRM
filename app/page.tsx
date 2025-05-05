// app/page.tsx (Дашборд с ДАННЫМИ ПО ТЕКУЩЕЙ СМЕНЕ + Кнопка/Диалог НАЧАТЬ СМЕНУ)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav"; // Проверь путь
// Иконки
import { Plus, UserCheck, Tv2, Landmark, CreditCard, List, Map, LineChart, BarChart, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
// Диалоги
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // Проверь путь
import { StartShiftDialog } from "@/app/components/dialogs/start-shift-dialog"; // <-- ДОБАВЛЕН ИМПОРТ (Проверь путь!)
// Компоненты для вкладок
import { ClubMap } from "@/components/club-map"; // Проверь путь
import { RecentBookings } from "@/app/components/dashboard/recent-bookings"; // Проверь путь
import { RevenueChart } from "@/components/revenue-chart"; // Проверь путь

import { supabase } from "@/lib/supabaseClient"; // Проверь путь
import { addMinutes, formatISO } from 'date-fns';

// --- Интерфейсы ---
interface StatCardData { title: string; value: string; icon: React.ComponentType<{ className?: string }>; description: string; }
interface Booking { id: string; created_at: string; customer_name: string | null; customer_id?: string | null; station_name: string | null; computer_id?: string | null; start_time: string; end_time: string; status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'; }
interface Computer { id: string; name: string; type: "PC" | "PlayStation"; status: "available" | "occupied"; zone: string; position_x: number; position_y: number; timeLeft?: string; customer?: string; created_at: string; }
interface CurrentShiftInfo { shiftId: string | null; operatorName: string; activeSessionsCount: number | null; cashRevenue: number | null; cardRevenue: number | null; totalRevenue: number | null; }

// --- Компонент страницы ---
export default function DashboardPage() {
  // --- Состояния ---
  const [activeTab, setActiveTab] = useState<string>("overview");
  // Данные смены
  const [shiftInfo, setShiftInfo] = useState<CurrentShiftInfo>({ shiftId: null, operatorName: "...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null });
  const [loadingShiftData, setLoadingShiftData] = useState(true);
  // Компоненты дашборда
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingRecentBookings, setLoadingRecentBookings] = useState(false);
  const [mapComputers, setMapComputers] = useState<Computer[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  // Диалоги
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [isStartShiftDialogOpen, setIsStartShiftDialogOpen] = useState(false); // <-- ДОБАВЛЕНО СОСТОЯНИЕ

  // --- Функции загрузки данных ---
  const fetchCurrentShiftData = useCallback(async () => { /* ... код fetchCurrentShiftData (без изменений) ... */ }, []);
  const fetchRecentBookings = useCallback(async (limit = 5) => { /* ... код fetchRecentBookings (без изменений) ... */ }, []);
  const fetchMapData = useCallback(async () => { /* ... код fetchMapData (без изменений) ... */ }, []);

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    fetchCurrentShiftData(); // Грузим данные смены
    if (activeTab === "overview") { fetchRecentBookings(); /* TODO: chart data */ }
    else if (activeTab === "sessions") { /* TODO: sessions list */ }
    else if (activeTab === "analytics") { /* TODO: analytics data */ }
    else if (activeTab === "map") { fetchMapData(); }
  }, [ activeTab, fetchCurrentShiftData, fetchRecentBookings, fetchMapData ]);

  // --- Обработчики событий ---
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); fetchCurrentShiftData(); fetchRecentBookings(); };
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleMapComputerEdit = (computer: Computer) => { toast.info(`Клик по ${computer.name}`); };
  // Коллбэк после начала смены
  const handleShiftStarted = useCallback(() => {
      console.log("Смена начата (из page.tsx), обновляем дашборд...");
      fetchCurrentShiftData(); // Перезагружаем данные по смене
      // Возможно, стоит обновить и другие данные, если это нужно
      // fetchRecentBookings();
  }, [fetchCurrentShiftData]); // <-- ДОБАВЛЕН КОЛЛБЭК


  // --- Статистика (без изменений) ---
  const stats: StatCardData[] = [ /* ... */ ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Заголовок и Кнопки */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          {/* Контейнер для кнопок справа */}
          <div className="flex gap-2 flex-wrap">
            {/* --- ДОБАВЛЕНА КНОПКА "НАЧАТЬ СМЕНУ" (условно) --- */}
            {/* Показываем кнопку только если загрузка данных смены завершена И активной смены НЕТ */}
            {!loadingShiftData && !shiftInfo.shiftId && (
                <Button onClick={() => setIsStartShiftDialogOpen(true)} variant="secondary">
                    <UserPlus className="mr-2 h-4 w-4"/> Начать смену
                </Button>
            )}
            {/* TODO: Позже добавить кнопку "Завершить смену", если shiftInfo.shiftId ЕСТЬ */}

            {/* Кнопка Новое Бронирование */}
            <Button onClick={() => setIsCreateBookingDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Новое бронирование
            </Button>
          </div>
        </div>

        {/* Карточки Статистики СМЕНЫ */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium truncate" title={stat.title}>{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground truncate" title={stat.description}>{stat.description}</p> </CardContent> </Card> ))} </div>

        {/* Вкладки (без изменений) */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>
           <TabsContent value="overview" className="space-y-6">
              {/* ... Содержимое вкладки Обзор (график, бронирования) ... */}
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка (Заглушка)</CardTitle> </CardHeader> <CardContent className="pt-4"> <RevenueChart /> </CardContent> </Card>
                  <Card className="lg:col-span-1 shadow-sm bg-card flex flex-col"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader> <CardContent className="flex flex-col flex-grow p-0"> <RecentBookings bookings={recentBookings} loading={loadingRecentBookings} /> <div className="p-4 pt-2 border-t mt-auto"> <Button variant="outline" size="sm" className="w-full" disabled> Все бронирования </Button> </div> </CardContent> </Card>
               </div>
           </TabsContent>
           <TabsContent value="sessions"> {/* ... Содержимое вкладки Сессии ... */} <Card><CardHeader><CardTitle>Активные сессии</CardTitle></CardHeader><CardContent>Заглушка</CardContent></Card> </TabsContent>
           <TabsContent value="analytics"> {/* ... Содержимое вкладки Аналитика ... */} <Card><CardHeader><CardTitle>Аналитика</CardTitle></CardHeader><CardContent>Заглушка</CardContent></Card> </TabsContent>
           <TabsContent value="map"> {/* ... Содержимое вкладки Карта ... */} <Card><CardHeader><CardTitle>Карта клуба</CardTitle></CardHeader><CardContent>{loadingMap ? "Загрузка..." : <ClubMap computers={mapComputers} onEdit={handleMapComputerEdit} />}</CardContent></Card> </TabsContent>
        </Tabs>
      </main>

      {/* Модальные окна */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      {/* --- ДОБАВЛЕН ВЫЗОВ ДИАЛОГА НАЧАЛА СМЕНЫ --- */}
      <StartShiftDialog
         open={isStartShiftDialogOpen}
         onOpenChange={setIsStartShiftDialogOpen}
         onShiftStarted={handleShiftStarted} // Передаем коллбэк
       />
      {/* --- КОНЕЦ ДИАЛОГА НАЧАЛА СМЕНЫ --- */}

    </div>
  )
}
