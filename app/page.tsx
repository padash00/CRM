// app/page.tsx (Интегрирован ActiveSessionsList)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Добавил CardDescription
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UserCheck, Tv2, Landmark, CreditCard, List, Map, LineChart, BarChart, Loader2, UserPlus, LogOut as EndShiftIcon } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog";
import { StartShiftDialog } from "@/app/components/dialogs/start-shift-dialog";
import { EndShiftDialog } from "@/app/components/dialogs/end-shift-dialog";
import { ClubMap } from "@/components/club-map";
import { RecentBookings } from "@/app/components/dashboard/recent-bookings";
import { RevenueChart } from "@/components/revenue-chart";
// --- ДОБАВЛЕН ИМПОРТ СПИСКА АКТИВНЫХ СЕССИЙ ---
import { ActiveSessionsList, SessionData } from "@/app/components/dashboard/active-sessions-list"; // <-- ПРОВЕРЬ ПУТЬ!

import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { format, subDays, formatISO, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

// --- Интерфейсы ---
interface StatCardData { title: string; value: string; icon: React.ComponentType<{ className?: string }>; description: string; }
interface Booking { /* ... как было ... */ }
interface Computer { /* ... как было ... */ }
interface CurrentShiftInfo { /* ... как было ... */ }
interface RevenueDataPoint { /* ... как было ... */ }
// SessionData интерфейс импортируется из active-sessions-list

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
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [loadingRevenueChart, setLoadingRevenueChart] = useState(false);
  // --- ДОБАВЛЕНО: Состояния для списка активных сессий ---
  const [activeSessionsList, setActiveSessionsList] = useState<SessionData[]>([]);
  const [loadingActiveSessions, setLoadingActiveSessions] = useState(false);
  // ----------------------------------------------------
  // Диалоги
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [isStartShiftDialogOpen, setIsStartShiftDialogOpen] = useState(false);
  const [isEndShiftDialogOpen, setIsEndShiftDialogOpen] = useState(false);


  // --- Функции загрузки данных ---
  const fetchCurrentShiftData = useCallback(async () => { /* ... код ... */ }, []);
  const fetchRevenueChartData = useCallback(async (days = 7) => { /* ... код ... */ }, []);
  const fetchRecentBookings = useCallback(async (limit = 5) => { /* ... код ... */ }, []);
  const fetchMapData = useCallback(async () => { /* ... код ... */ }, []);

  // --- ДОБАВЛЕНО: Функция загрузки активных сессий ---
  const fetchActiveSessions = useCallback(async () => {
    console.log("Загрузка списка активных сессий...");
    setLoadingActiveSessions(true);
    setActiveSessionsList([]);
    try {
        // ВАЖНО: RLS для sessions, customers, computers, tariffs должен разрешать чтение
        const { data, error } = await supabase
            .from('sessions')
            .select(`
                id,
                start_time,
                end_time,
                cost,
                status,
                guest_name,
                customer_id,
                computer_id,
                customers ( name ), 
                computers ( name ),
                tariffs ( name ) 
            `)
            .eq('status', 'ACTIVE') // Только активные сессии
            .order('start_time', { ascending: true }); // Сначала самые ранние

        if (error) throw error;

        // Преобразуем данные к интерфейсу SessionData, который ожидает ActiveSessionsList
        const processedData: SessionData[] = (data || []).map((s: any) => ({
            id: s.id,
            customer_name: s.customers?.name ?? null,
            guest_name: s.guest_name,
            computer_name: s.computers?.name ?? 'N/A',
            start_time: s.start_time,
            end_time: s.end_time,
            cost: s.cost,
            status: s.status, // Убедись, что тип статуса из БД соответствует SessionData
            tariff_name: s.tariffs?.name ?? null,
            // Передаем вложенные объекты для большей гибкости в компоненте, если нужно
            customers: s.customers,
            computers: s.computers,
            tariffs: s.tariffs,
        }));
        
        console.log(`Получено ${processedData.length} активных сессий`);
        setActiveSessionsList(processedData);

    } catch (error: any) {
        console.error("Ошибка загрузки активных сессий:", error.message);
        toast.error(`Не удалось загрузить активные сессии: ${error.message}`);
        setActiveSessionsList([]);
    } finally {
        setLoadingActiveSessions(false);
    }
  }, []);
  // --------------------------------------------------

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    fetchCurrentShiftData();
    if (activeTab === "overview") { fetchRevenueChartData(); fetchRecentBookings(); }
    else if (activeTab === "sessions") { fetchActiveSessions(); } // <-- ВЫЗЫВАЕМ ЗДЕСЬ
    else if (activeTab === "analytics") { /* TODO */ }
    else if (activeTab === "map") { fetchMapData(); }
  }, [ activeTab, fetchCurrentShiftData, fetchRevenueChartData, fetchRecentBookings, fetchMapData, fetchActiveSessions ]); // <-- ДОБАВЛЕНО В ЗАВИСИМОСТИ


  // --- Обработчики событий ---
  const handleBookingCreated = () => { /* ... */ };
  const handleShiftStarted = useCallback(() => { /* ... */ }, [fetchCurrentShiftData]);
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleMapComputerEdit = (computer: Computer) => { /* ... */ };
  const handleEndShiftClick = () => { /* ... */ };

  // --- ДОБАВЛЕНО: Функция завершения сессии ---
  const handleEndSession = useCallback(async (sessionId: string) => {
    console.log("Завершение сессии ID из page.tsx:", sessionId);
    // ВАЖНО: RLS для UPDATE таблицы sessions должен разрешать это
    try {
        const { error } = await supabase
            .from('sessions')
            .update({
                end_time: new Date().toISOString(),
                status: 'COMPLETED', // Используем ENUM
                // TODO: Здесь нужно будет пересчитать/записать финальную стоимость 'cost',
                // если она зависит от фактической длительности. Пока оставляем как есть.
            })
            .eq('id', sessionId)
            .eq('status', 'ACTIVE'); // Завершаем только активную

        if (error) {
             if (error.code === 'PGRST116') throw new Error("Сессия уже была завершена или не найдена.");
            throw error;
        }
        toast.success(`Сессия успешно завершена!`);
        fetchActiveSessions();      // Обновляем список активных сессий
        fetchCurrentShiftData();    // Обновляем статистику смены (кол-во сессий, возможно выручку)
        fetchRevenueChartData();    // Обновляем график выручки (если сессия платная и транзакция создается)
    } catch (error: any) {
        console.error("Ошибка завершения сессии:", error);
        toast.error(`Не удалось завершить сессию: ${error.message}`);
    }
  }, [fetchActiveSessions, fetchCurrentShiftData, fetchRevenueChartData]); // Добавили зависимости
  // -------------------------------------------

  // --- Статистика ---
  const stats: StatCardData[] = [ /* ... как было ... */ ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* ... Заголовок и Кнопки ... */}
        {/* ... Карточки Статистики ... */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>
           
           {/* ... Вкладка "Обзор" ... */}
           <TabsContent value="overview" className="space-y-6"> {/* ... */} </TabsContent>

           {/* === ИЗМЕНЕНО: Вкладка "Активные сессии" === */}
           <TabsContent value="sessions">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Tv2 className="h-5 w-5 text-primary"/>Активные сессии</CardTitle>
                 <CardDescription>Список текущих игровых сессий в клубе.</CardDescription>
               </CardHeader>
               <CardContent>
                 <ActiveSessionsList
                   sessions={activeSessionsList}
                   loading={loadingActiveSessions}
                   onEndSession={handleEndSession} // Передаем обработчик
                 />
               </CardContent>
             </Card>
           </TabsContent>
           {/* === КОНЕЦ ИЗМЕНЕНИЙ === */}

           {/* ... Вкладки "Аналитика", "Карта клуба" ... */}
           <TabsContent value="analytics"> <Card> {/* ... */} </Card> </TabsContent>
           <TabsContent value="map"> <Card> {/* ... */} </Card> </TabsContent>
        </Tabs>
      </main>

      {/* Модальные окна */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      <StartShiftDialog open={isStartShiftDialogOpen} onOpenChange={setIsStartShiftDialogOpen} onShiftStarted={handleShiftStarted} />
      <EndShiftDialog open={isEndShiftDialogOpen} onOpenChange={setIsEndShiftDialogOpen} shiftInfo={shiftInfo} onShiftEnded={fetchCurrentShiftData} />
    </div>
  )
}
