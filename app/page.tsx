// app/page.tsx (Исправлена ошибка 'Tv is not defined')
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Убедимся, что импортируем Tv2 и убрали лишнее
import { Plus, BarChart, Clock, Users, List, Tv2, LineChart, Map, UserCheck, Landmark, CreditCard, Loader2 } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // Проверь путь
import { ClubMap } from "@/components/club-map"; // Проверь путь
import { RecentBookings } from "@/app/components/dashboard/recent-bookings"; // Проверь путь
import { RevenueChart } from "@/components/revenue-chart"; // Проверь путь

// Убрали импорты диалогов/компонентов для турниров/команд
// import { CreateTournamentDialog } from "./tournaments/create-tournament-dialog";
// import { CreateTeamDialog } from "./tournaments/create-team-dialog";
// import { TeamList } from "./tournaments/team-list";
// import { EditTournamentDialog } from "./tournaments/edit-tournament-dialog";
// import { EditTeamDialog } from "./tournaments/edit-team-dialog";
// import { DeleteConfirmationDialog } from "./tournaments/delete-confirmation-dialog";
// import { TournamentList } from "./tournaments/tournament-list";
// import { TournamentCalendar } from "./tournaments/tournament-calendar";

import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
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
  // Статистика Смены
  const [shiftInfo, setShiftInfo] = useState<CurrentShiftInfo>({ shiftId: null, operatorName: "...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null });
  const [loadingShiftData, setLoadingShiftData] = useState(true);
  // Последние бронирования
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingRecentBookings, setLoadingRecentBookings] = useState(false);
  // Карта клуба
  const [mapComputers, setMapComputers] = useState<Computer[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  // Диалоги
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  // Убраны состояния для диалогов турниров/команд

  // --- Функции загрузки данных ---
  const fetchCurrentShiftData = useCallback(async () => { /* ... код fetchCurrentShiftData ... */ }, []);
  const fetchRecentBookings = useCallback(async (limit = 5) => { /* ... код fetchRecentBookings ... */ }, []);
  const fetchMapData = useCallback(async () => { /* ... код fetchMapData ... */ }, []);

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    fetchCurrentShiftData(); // Всегда грузим данные смены
    if (activeTab === "overview") { fetchRecentBookings(); /* fetch chart data */ }
    else if (activeTab === "sessions") { /* TODO: fetch sessions */ }
    else if (activeTab === "analytics") { /* TODO: fetch analytics */ }
    else if (activeTab === "map") { fetchMapData(); }
    // Убрали зависимости и вызовы для турниров/команд
  }, [ activeTab, fetchCurrentShiftData, fetchRecentBookings, fetchMapData ]);

  // --- Обработчики событий ---
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); fetchCurrentShiftData(); fetchRecentBookings(); };
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleMapComputerEdit = (computer: Computer) => { toast.info(`Клик по ${computer.name}`); };
  // Убрали обработчики для турниров/команд

  // --- Статистика ---
  const stats: StatCardData[] = [
      { title: "Оператор на смене", value: loadingShiftData ? "..." : shiftInfo.operatorName, icon: UserCheck, description: shiftInfo.shiftId ? `Смена активна` : "Смена не активна" },
      { title: "Активные сессии", value: loadingShiftData || shiftInfo.activeSessionsCount === null ? "..." : shiftInfo.activeSessionsCount.toString(), icon: Tv2, description: "Текущие игровые сессии" }, // Иконка Tv2
      { title: "Наличные за смену", value: loadingShiftData || shiftInfo.cashRevenue === null ? "..." : `₸${shiftInfo.cashRevenue.toLocaleString()}`, icon: Landmark, description: "Принято наличными" },
      { title: "Картой за смену", value: loadingShiftData || shiftInfo.cardRevenue === null ? "..." : `₸${shiftInfo.cardRevenue.toLocaleString()}`, icon: CreditCard, description: "Принято картами" },
  ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Заголовок и Кнопка Бронирования */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          {/* Убрали кнопки турниров/команд */}
          <Button onClick={() => setIsCreateBookingDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новое бронирование </Button>
        </div>

        {/* Карточки Статистики СМЕНЫ */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium truncate" title={stat.title}>{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground truncate" title={stat.description}>{stat.description}</p> </CardContent> </Card> ))} </div>

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>

           {/* Вкладка: Обзор */}
           <TabsContent value="overview" className="space-y-6">
               <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка </CardTitle> </CardHeader> <CardContent className="pt-4"> <RevenueChart /> </CardContent> </Card>
                  <Card className="lg:col-span-1 shadow-sm bg-card flex flex-col"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader> <CardContent className="flex flex-col flex-grow p-0"> <RecentBookings bookings={recentBookings} loading={loadingRecentBookings} /> <div className="p-4 pt-2 border-t mt-auto"> <Button variant="outline" size="sm" className="w-full" disabled> Все бронирования </Button> </div> </CardContent> </Card>
               </div>
           </TabsContent>

           {/* Вкладка: Активные сессии (Исправлена иконка) */}
            <TabsContent value="sessions">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2">
                        {/* === ИСПРАВЛЕНО ЗДЕСЬ === */}
                        <Tv2 className="h-5 w-5 text-primary"/>
                        {/* ======================= */}
                        Активные сессии
                    </CardTitle></CardHeader>
                    <CardContent> <p className="text-muted-foreground">Здесь будет список активных сессий...</p> </CardContent>
                </Card>
            </TabsContent>

           {/* Вкладка: Аналитика */}
           <TabsContent value="analytics"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5 text-primary"/>Аналитика</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будут графики и отчеты...</p> </CardContent> </Card> </TabsContent>

           {/* Вкладка: Карта клуба */}
           <TabsContent value="map"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary"/>Карта клуба</CardTitle></CardHeader> <CardContent> {loadingMap ? (<div className="text-center p-10 text-muted-foreground">Загрузка карты...</div>) : mapComputers.length > 0 ? (<ClubMap computers={mapComputers} onEdit={handleMapComputerEdit} />) : (<div className="text-center p-10 text-muted-foreground">Нет данных о компьютерах.</div>) } </CardContent> </Card> </TabsContent>
        </Tabs>
      </main>

      {/* Модальные окна */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      {/* Убрал ненужные здесь диалоги турниров/команд */}

    </div>
  )
}
