// app/page.tsx (Добавлены кнопки Начать/Завершить смену с условиями)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UserCheck, Tv2, Landmark, CreditCard, List, Map, LineChart, BarChart, Loader2, UserPlus, LogOut as EndShiftIcon } from "lucide-react"; // Добавил EndShiftIcon
import { MainNav } from "@/components/main-nav";
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog";
import { StartShiftDialog } from "@/components/dialogs/start-shift-dialog"; // Проверь путь
// import { EndShiftDialog } from "@/components/dialogs/end-shift-dialog"; // TODO: Создать этот диалог
import { ClubMap } from "@/components/club-map";
import { RecentBookings } from "@/app/components/dashboard/recent-bookings";
import { RevenueChart } from "@/components/revenue-chart";

import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { addMinutes, formatISO } from 'date-fns';

// --- Интерфейсы ---
interface StatCardData { title: string; value: string; icon: React.ComponentType<{ className?: string }>; description: string; }
interface Booking { /* ... */ }
interface Computer { /* ... */ }
interface CurrentShiftInfo { shiftId: string | null; operatorName: string; activeSessionsCount: number | null; cashRevenue: number | null; cardRevenue: number | null; totalRevenue: number | null; }

// --- Компонент страницы ---
export default function DashboardPage() {
  // --- Состояния ---
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [shiftInfo, setShiftInfo] = useState<CurrentShiftInfo>({ shiftId: null, operatorName: "...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null });
  const [loadingShiftData, setLoadingShiftData] = useState(true);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingRecentBookings, setLoadingRecentBookings] = useState(false);
  const [mapComputers, setMapComputers] = useState<Computer[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [isStartShiftDialogOpen, setIsStartShiftDialogOpen] = useState(false);
  // const [isEndShiftDialogOpen, setIsEndShiftDialogOpen] = useState(false); // TODO: Добавить состояние для диалога завершения смены

  // --- Функции загрузки данных ---
  const fetchCurrentShiftData = useCallback(async () => { /* ... код fetchCurrentShiftData ... */ }, []);
  const fetchRecentBookings = useCallback(async (limit = 5) => { /* ... код fetchRecentBookings ... */ }, []);
  const fetchMapData = useCallback(async () => { /* ... код fetchMapData ... */ }, []);

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    fetchCurrentShiftData(); // Всегда грузим данные смены
    if (activeTab === "overview") { fetchRecentBookings(); /* TODO: chart data */ }
    else if (activeTab === "sessions") { /* TODO: fetch active sessions list */ }
    else if (activeTab === "analytics") { /* TODO: fetch analytics data */ }
    else if (activeTab === "map") { fetchMapData(); }
  }, [ activeTab, fetchCurrentShiftData, fetchRecentBookings, fetchMapData ]);

  // --- Обработчики событий ---
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); fetchCurrentShiftData(); fetchRecentBookings(); };
  const handleShiftStarted = useCallback(() => { console.log("Смена начата, обновляем..."); fetchCurrentShiftData(); }, [fetchCurrentShiftData]);
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleMapComputerEdit = (computer: Computer) => { toast.info(`Клик по ${computer.name}`); };

  // --- ДОБАВЛЕНО: Обработчик для кнопки "Завершить смену" (заглушка) ---
  const handleEndShiftClick = () => {
      if (!shiftInfo.shiftId) return; // Доп. проверка
      console.log("Нажата кнопка Завершить смену ID:", shiftInfo.shiftId);
      toast.info("Логика завершения смены еще не реализована.");
      // TODO: Открыть диалог подтверждения/ввода конечной кассы (EndShiftDialog)
      // Внутри EndShiftDialog:
      // 1. Получить конечную кассу (end_cash).
      // 2. Рассчитать разницу? (Пока не надо).
      // 3. Обновить запись в shifts: установить end_time = now(), status = 'CLOSED', записать end_cash.
      // 4. Обновить дашборд: вызвать fetchCurrentShiftData().
      // setIsEndShiftDialogOpen(true);
  }
  // -------------------------------------------------------------

  // --- Статистика ---
  const stats: StatCardData[] = [
      { title: "Оператор на смене", value: loadingShiftData ? "..." : shiftInfo.operatorName, icon: UserCheck, description: shiftInfo.shiftId ? `Смена активна` : "Смена не активна" },
      { title: "Активные сессии", value: loadingShiftData || shiftInfo.activeSessionsCount === null ? "..." : shiftInfo.activeSessionsCount.toString(), icon: Tv2, description: "Текущие игровые сессии" },
      { title: "Наличные за смену", value: loadingShiftData || shiftInfo.cashRevenue === null ? "..." : `₸${shiftInfo.cashRevenue.toLocaleString()}`, icon: Landmark, description: "Принято наличными" },
      { title: "Картой за смену", value: loadingShiftData || shiftInfo.cardRevenue === null ? "..." : `₸${shiftInfo.cardRevenue.toLocaleString()}`, icon: CreditCard, description: "Принято картами" },
  ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Заголовок и Кнопки */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          <div className="flex gap-2 flex-wrap">
            {/* --- УСЛОВНЫЕ КНОПКИ УПРАВЛЕНИЯ СМЕНОЙ --- */}
            {/* Показываем "Начать", если загрузка НЕ идет И ID смены НЕТ */}
            {!loadingShiftData && !shiftInfo.shiftId && (
                <Button onClick={() => setIsStartShiftDialogOpen(true)} variant="secondary">
                    <UserPlus className="mr-2 h-4 w-4"/> Начать смену
                </Button>
            )}
            {/* Показываем "Завершить", если загрузка НЕ идет И ID смены ЕСТЬ */}
            {!loadingShiftData && shiftInfo.shiftId && (
                <Button onClick={handleEndShiftClick} variant="destructive">
                    <EndShiftIcon className="mr-2 h-4 w-4"/> Завершить смену
                </Button>
            )}
            {/* --- КОНЕЦ КНОПОК УПРАВЛЕНИЯ СМЕНОЙ --- */}

            <Button onClick={() => setIsCreateBookingDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Новое бронирование
            </Button>
          </div>
        </div>

        {/* Карточки Статистики СМЕНЫ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium truncate" title={stat.title}>{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground truncate" title={stat.description}>{stat.description}</p> </CardContent> </Card> ))} </div>

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           {/* ... TabsList ... */}
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>
           {/* ... Содержимое вкладок ... */}
            <TabsContent value="overview" className="space-y-6"> <div className="grid gap-6 lg:grid-cols-3"> <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка </CardTitle> </CardHeader> <CardContent className="pt-4"> <RevenueChart /> </CardContent> </Card> <Card className="lg:col-span-1 shadow-sm bg-card flex flex-col"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader> <CardContent className="flex flex-col flex-grow p-0"> <RecentBookings bookings={recentBookings} loading={loadingRecentBookings} /> <div className="p-4 pt-2 border-t mt-auto"> <Button variant="outline" size="sm" className="w-full" disabled> Все бронирования </Button> </div> </CardContent> </Card> </div> </TabsContent>
            <TabsContent value="sessions"> <Card> {/* ... */} </Card> </TabsContent>
            <TabsContent value="analytics"> <Card> {/* ... */} </Card> </TabsContent>
            <TabsContent value="map"> <Card> {/* ... */} </Card> </TabsContent>
        </Tabs>
      </main>

      {/* Модальные окна */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      <StartShiftDialog open={isStartShiftDialogOpen} onOpenChange={setIsStartShiftDialogOpen} onShiftStarted={handleShiftStarted} />
      {/* TODO: Добавить EndShiftDialog */}
      {/* <EndShiftDialog open={isEndShiftDialogOpen} onOpenChange={setIsEndShiftDialogOpen} shiftId={shiftInfo.shiftId} onShiftEnded={handleShiftStarted} /> */} {/* Используем тот же коллбэк для обновления */}

    </div>
  )
}
