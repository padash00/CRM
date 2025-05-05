// app/page.tsx (С ПРИНУДИТЕЛЬНЫМ ОТОБРАЖЕНИЕМ КНОПКИ "Начать смену" для теста)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Оставим, может понадобиться
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UserCheck, Tv2, Landmark, CreditCard, List, Map, LineChart, BarChart, Loader2, UserPlus } from "lucide-react"; // Добавили UserPlus
import { MainNav } from "@/components/main-nav";
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // Проверь путь
import { StartShiftDialog } from "@/app/components/dialogs/start-shift-dialog"; // Проверь путь
import { ClubMap } from "@/components/club-map"; // Проверь путь
import { RecentBookings } from "@/app/components/dashboard/recent-bookings"; // Проверь путь
import { RevenueChart } from "@/components/revenue-chart"; // Проверь путь
// Диалоги для турниров/команд убраны с этой страницы

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
  const [shiftInfo, setShiftInfo] = useState<CurrentShiftInfo>({ shiftId: null, operatorName: "...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null });
  const [loadingShiftData, setLoadingShiftData] = useState(true);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingRecentBookings, setLoadingRecentBookings] = useState(false);
  const [mapComputers, setMapComputers] = useState<Computer[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [isStartShiftDialogOpen, setIsStartShiftDialogOpen] = useState(false);

  // --- Функции загрузки данных ---
  const fetchCurrentShiftData = useCallback(async () => {
      console.log("Загрузка данных текущей смены...");
      setLoadingShiftData(true);
      setShiftInfo({ shiftId: null, operatorName: "Загрузка...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null });
      let currentShiftId: string | null = null;
      try {
          const { data: activeShift, error: shiftError } = await supabase.from('shifts').select('id').eq('status', 'ACTIVE').limit(1).single();
          if (shiftError && shiftError.code !== 'PGRST116') throw new Error(`Ошибка поиска активной смены: ${shiftError.message}`);
          if (!activeShift) {
              console.log("Активная смена не найдена.");
              setShiftInfo({ shiftId: null, operatorName: "Нет", activeSessionsCount: 0, cashRevenue: 0, cardRevenue: 0, totalRevenue: 0 });
              return;
          }
          currentShiftId = activeShift.id;
          console.log("Активная смена ID:", currentShiftId);
          const results = await Promise.allSettled([
              supabase.from('shift_operators').select('operators ( name )').eq('shift_id', currentShiftId),
              supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('shift_id', currentShiftId).eq('status', 'ACTIVE'),
              supabase.from('transactions').select('amount, payment_method').eq('shift_id', currentShiftId)
          ]);
          const [operatorsResult, sessionsResult, transactionsResult] = results;
          let operatorName = "Не назначен"; let activeSessions = 0; let cashSum = 0; let cardSum = 0; let otherSum = 0;
          if (operatorsResult.status === 'fulfilled' && operatorsResult.value.data && operatorsResult.value.data.length > 0) { /* @ts-ignore */ operatorName = operatorsResult.value.data.map(op => op.operators?.name).filter(Boolean).join(', ') || "Имя не указано"; } else if (operatorsResult.status === 'rejected') { console.error("Ошибка оператора:", operatorsResult.reason); operatorName = "Ошибка"; }
          if (sessionsResult.status === 'fulfilled') { activeSessions = sessionsResult.value.count ?? 0; } else { console.error("Ошибка сессий:", sessionsResult.reason); }
          if (transactionsResult.status === 'fulfilled' && transactionsResult.value.data) { transactionsResult.value.data.forEach((tr: { amount: number | null, payment_method: string | null }) => { const amount = tr.amount ?? 0; if (tr.payment_method === 'CASH') { cashSum += amount; } else if (tr.payment_method === 'CARD') { cardSum += amount; } else { otherSum += amount; } }); } else if (transactionsResult.status === 'rejected') { console.error("Ошибка транзакций:", transactionsResult.reason); }
          console.log(`Статистика: Оператор='${operatorName}', Сессии=${activeSessions}, Нал=₸${cashSum}, Карта=₸${cardSum}`);
          setShiftInfo({ shiftId: currentShiftId, operatorName: operatorName, activeSessionsCount: activeSessions, cashRevenue: cashSum, cardRevenue: cardSum, totalRevenue: cashSum + cardSum + otherSum });
      } catch (error: any) { console.error("Общая ошибка загрузки данных смены:", error.message); toast.error(`Не удалось загрузить данные по смене: ${error.message}`); setShiftInfo({ shiftId: null, operatorName: "Ошибка", activeSessionsCount: 0, cashRevenue: 0, cardRevenue: 0, totalRevenue: 0 }); }
      finally { setLoadingShiftData(false); }
  }, []);
  const fetchRecentBookings = useCallback(async (limit = 5) => { setLoadingRecentBookings(true); try { const { data, error } = await supabase .from('bookings') .select('id, created_at, customer_name, station_name, start_time, end_time, status') .order('start_time', { ascending: true }) .limit(limit); if (error) throw error; setRecentBookings(data as Booking[] || []); } catch (error: any) { console.error("Ошибка загрузки последних бронирований:", error.message); toast.error(`Не удалось загрузить последние бронирования: ${error.message}`); setRecentBookings([]); } finally { setLoadingRecentBookings(false); } }, []);
  const fetchMapData = useCallback(async () => { setLoadingMap(true); try { const { data, error } = await supabase .from('computers') .select(`id, name, type, status, position_x, position_y, created_at, zones ( name )`); if (error) throw error; const processedData: Computer[] = (data || []).map((comp: any) => ({ ...comp, zone: comp.zones?.name?.toLowerCase() ?? 'unknown', status: comp.status === 'free' ? 'available' : 'occupied', })); setMapComputers(processedData); } catch (error: any) { console.error("Ошибка загрузки данных карты:", error.message); toast.error(`Не удалось загрузить данные карты: ${error.message}`); setMapComputers([]); } finally { setLoadingMap(false); } }, []);

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    fetchCurrentShiftData();
    if (activeTab === "overview") { fetchRecentBookings(); /* TODO: chart */ }
    else if (activeTab === "sessions") { /* TODO: sessions list */ }
    else if (activeTab === "analytics") { /* TODO: analytics data */ }
    else if (activeTab === "map") { fetchMapData(); }
  }, [ activeTab, fetchCurrentShiftData, fetchRecentBookings, fetchMapData ]);

  // --- Обработчики событий ---
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); fetchCurrentShiftData(); fetchRecentBookings(); };
  const handleShiftStarted = useCallback(() => { console.log("Смена начата (из page.tsx), обновляем дашборд..."); fetchCurrentShiftData(); }, [fetchCurrentShiftData]);
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleMapComputerEdit = (computer: Computer) => { toast.info(`Клик по ${computer.name}`); };

  // --- Статистика ---
  const stats: StatCardData[] = [ /* ... как в прошлом ответе ... */ ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Заголовок и Кнопки */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          <div className="flex gap-2 flex-wrap">

             {/* --- КНОПКА "НАЧАТЬ СМЕНУ" ТЕПЕРЬ ОТОБРАЖАЕТСЯ ВСЕГДА (ДЛЯ ТЕСТА) --- */}
             {/* Условие {!loadingShiftData && !shiftInfo.shiftId && ( ... )} ВРЕМЕННО УБРАНО */}
             <Button onClick={() => setIsStartShiftDialogOpen(true)} variant="secondary">
                 <UserPlus className="mr-2 h-4 w-4"/> Начать смену (Тест)
             </Button>
             {/* TODO: Вернуть условие или добавить кнопку "Завершить смену", когда станет ясно, почему кнопка не показывалась */}
             {/* --- КОНЕЦ ИЗМЕНЕНИЯ --- */}

             <Button onClick={() => setIsCreateBookingDialogOpen(true)}>
               <Plus className="mr-2 h-4 w-4" /> Новое бронирование
             </Button>
          </div>
        </div>

        {/* Карточки Статистики СМЕНЫ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium truncate" title={stat.title}>{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground truncate" title={stat.description}>{stat.description}</p> </CardContent> </Card> ))} </div>

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>
            {/* ... Содержимое вкладок ... */}
             <TabsContent value="overview" className="space-y-6"> <div className="grid gap-6 lg:grid-cols-3"> <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка </CardTitle> </CardHeader> <CardContent className="pt-4"> <RevenueChart /> </CardContent> </Card> <Card className="lg:col-span-1 shadow-sm bg-card flex flex-col"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader> <CardContent className="flex flex-col flex-grow p-0"> <RecentBookings bookings={recentBookings} loading={loadingRecentBookings} /> <div className="p-4 pt-2 border-t mt-auto"> <Button variant="outline" size="sm" className="w-full" disabled> Все бронирования </Button> </div> </CardContent> </Card> </div> </TabsContent>
             <TabsContent value="sessions"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Tv2 className="h-5 w-5 text-primary"/>Активные сессии</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будет список активных сессий...</p> </CardContent> </Card> </TabsContent>
             <TabsContent value="analytics"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5 text-primary"/>Аналитика</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будут графики и отчеты...</p> </CardContent> </Card> </TabsContent>
             <TabsContent value="map"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary"/>Карта клуба</CardTitle></CardHeader> <CardContent> {loadingMap ? (<div className="text-center p-10 text-muted-foreground">Загрузка карты...</div>) : mapComputers.length > 0 ? (<ClubMap computers={mapComputers} onEdit={handleMapComputerEdit} />) : (<div className="text-center p-10 text-muted-foreground">Нет данных о компьютерах.</div>) } </CardContent> </Card> </TabsContent>
        </Tabs>
      </main>

      {/* Модальные окна */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      <StartShiftDialog open={isStartShiftDialogOpen} onOpenChange={setIsStartShiftDialogOpen} onShiftStarted={handleShiftStarted} />
      {/* <DeleteConfirmationDialog ... /> */}

    </div>
  )
}
