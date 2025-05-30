// app/page.tsx (Финальная версия дашборда на текущий момент)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Plus, UserCheck, Tv2, Landmark, CreditCard, List, Map, 
    LineChart, BarChart, Loader2, UserPlus, LogOut as EndShiftIcon 
} from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog";
import { StartShiftDialog } from "@/app/components/dialogs/start-shift-dialog"; // ПУТЬ ИЗ ТВОЕГО ПОДТВЕРЖДЕНИЯ
import { EndShiftDialog } from "@/app/components/dialogs/end-shift-dialog";     // ПУТЬ ИЗ ТВОЕГО ПОДТВЕРЖДЕНИЯ
import { ClubMap } from "@/components/club-map";                                 // ПУТЬ ИЗ ТВОЕГО ПОДТВЕРЖДЕНИЯ
import { RecentBookings } from "@/app/components/dashboard/recent-bookings";   // ПУТЬ ИЗ ТВОЕГО ПОДТВЕРЖДЕНИЯ (хотя мы его убрали из JSX)
import { RevenueChart } from "@/components/revenue-chart";                       // ПУТЬ ИЗ ТВОЕГО ПОДТВЕРЖДЕНИЯ

import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { format, subDays, formatISO, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

// --- Интерфейсы ---
interface StatCardData { title: string; value: string; icon: React.ComponentType<{ className?: string }>; description: string; }
interface Booking { id: string; created_at: string; customer_name: string | null; customer_id?: string | null; station_name: string | null; computer_id?: string | null; start_time: string; end_time: string; status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'; guest_name?: string | null; customers?: { id: string; name: string | null; } | null; computers?: { id: string; name: string | null; } | null; }
interface Computer { id: string; name: string; type: "PC" | "PlayStation"; status: "available" | "occupied"; zone: string; position_x: number; position_y: number; timeLeft?: string; customer?: string; created_at: string; }
interface CurrentShiftInfo { shiftId: string | null; operatorName: string; activeSessionsCount: number | null; cashRevenue: number | null; cardRevenue: number | null; totalRevenue: number | null; }
interface RevenueDataPoint { day: string; total_revenue: number; }

// --- Компонент страницы ---
export default function DashboardPage() {
  // --- Состояния ---
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [shiftInfo, setShiftInfo] = useState<CurrentShiftInfo>({ shiftId: null, operatorName: "...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null });
  const [loadingShiftData, setLoadingShiftData] = useState(true);
  // const [recentBookings, setRecentBookings] = useState<Booking[]>([]); // Убрали, так как блок удален
  // const [loadingRecentBookings, setLoadingRecentBookings] = useState(false); // Убрали
  const [mapComputers, setMapComputers] = useState<Computer[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [loadingRevenueChart, setLoadingRevenueChart] = useState(false);
  // Диалоги
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [isStartShiftDialogOpen, setIsStartShiftDialogOpen] = useState(false);
  const [isEndShiftDialogOpen, setIsEndShiftDialogOpen] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        const { data: customerData } = await supabase.from('customers').select('id, name');
        const { data: stationData } = await supabase.from('stations').select('id, name');

        if (customerData) setCustomers(customerData);
        if (stationData) setStations(stationData);
    };

  fetchData();
}, []);

    
    
  // --- Функции загрузки данных ---
  const fetchCurrentShiftData = useCallback(async () => {
    console.log("Загрузка данных текущей смены (RPC)...");
    setLoadingShiftData(true);
    setShiftInfo(prev => ({ ...prev, operatorName: "Загрузка...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null }));
    let currentShiftId: string | null = null;
    try {
        const { data: activeShiftId, error: shiftError } = await supabase.rpc("get_active_shift_id");
        if (rpcError) throw new Error(`Ошибка RPC get_active_shift_id: ${rpcError.message}`);
        currentShiftId = activeShiftIdResult;
        
        if (!currentShiftId) {
            console.log("Активная смена не найдена (RPC).");
            setShiftInfo({ shiftId: null, operatorName: "Нет", activeSessionsCount: 0, cashRevenue: 0, cardRevenue: 0, totalRevenue: 0 });
            return;
        }
        console.log("Найдена активная смена ID (RPC):", currentShiftId);

        const { data: shiftTransactions, error: transactionsError } = await supabase
          .from("transactions")
          .select("amount, transaction_date")
          .eq("shift_id", activeShiftId);
        
        const groupedByHour = {};

            shiftTransactions?.forEach((txn) => {
              const date = new Date(txn.transaction_date);
              const hour = date.getHours();

              if (!groupedByHour[hour]) groupedByHour[hour] = 0;
              groupedByHour[hour] += txn.amount;
            });

            const chartData = Object.entries(groupedByHour).map(([hour, amount]) => ({
              hour: `${hour}:00`,
              amount,
            }));

            <LineChart data={chartData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>

        
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
        setShiftInfo({ shiftId: currentShiftId, operatorName: operatorName, activeSessionsCount: activeSessions, cashRevenue: cashSum, cardRevenue: cardSum, totalRevenue: cashSum + cardSum + otherSum });
    } catch (error: any) { console.error("Общая ошибка загрузки данных смены:", error.message); toast.error(`Не удалось загрузить данные по смене: ${error.message}`); setShiftInfo({ shiftId: null, operatorName: "Ошибка", activeSessionsCount: 0, cashRevenue: 0, cardRevenue: 0, totalRevenue: 0 }); }
    finally { setLoadingShiftData(false); }
  }, []);

  const fetchRevenueChartData = useCallback(async (days = 7) => {
      console.log(`Загрузка данных выручки за ${days} дней...`);
      setLoadingRevenueChart(true); setRevenueData([]);
      try {
          const endDate = new Date(); const startDate = subDays(endDate, days - 1);
          const startDateIso = startDate.toISOString().split('T')[0]; const endDateIso = endDate.toISOString().split('T')[0];
          const { data, error } = await supabase.rpc('get_daily_revenue', { start_date: startDateIso, end_date: endDateIso });
          if (error) throw error;
          const formattedData: RevenueDataPoint[] = (data || []).map((item: { day: string; total_revenue: number | null }) => { let formattedDay = item.day; try { const parsedDate = parseISO(item.day); if(isValid(parsedDate)) { formattedDay = format(parsedDate, 'dd.MM', { locale: ru }); }} catch (e) { console.warn("Ошибка форматирования даты для графика:", item.day, e); } return { day: formattedDay, total_revenue: item.total_revenue ?? 0 }; });
          console.log("Данные для графика получены и отформатированы:", formattedData);
          setRevenueData(formattedData);
      } catch (error: any) { console.error("Ошибка загрузки данных графика:", error.message); toast.error(`Не удалось загрузить данные для графика: ${error.message}`); setRevenueData([]); }
      finally { setLoadingRevenueChart(false); }
  }, []);
  
  const fetchMapData = useCallback(async () => { setLoadingMap(true); setMapComputers([]); try { const { data, error } = await supabase .from('computers') .select(`id, name, type, status, position_x, position_y, created_at, zones ( name )`); if (error) throw error; const processedData: Computer[] = (data || []).map((comp: any) => ({ ...comp, zone: comp.zones?.name?.toLowerCase() ?? 'unknown', status: comp.status === 'free' ? 'available' : 'occupied', })); setMapComputers(processedData); } catch (error: any) { console.error("Ошибка загрузки данных карты:", error.message); toast.error(`Не удалось загрузить данные карты: ${error.message}`); setMapComputers([]); } finally { setLoadingMap(false); } }, []);

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    fetchCurrentShiftData();
    if (activeTab === "overview") { fetchRevenueChartData(); /* fetchRecentBookings(); - Убрано */ }
    else if (activeTab === "sessions") { /* TODO: fetch active sessions list */ }
    else if (activeTab === "analytics") { /* TODO: fetch analytics data */ }
    else if (activeTab === "map") { fetchMapData(); }
  }, [ activeTab, fetchCurrentShiftData, fetchRevenueChartData, fetchMapData ]); // Убрали fetchRecentBookings

  // --- Обработчики событий ---
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); fetchCurrentShiftData(); fetchRevenueChartData(); }; // Обновляем и график
  const handleShiftStarted = useCallback(() => { fetchCurrentShiftData(); }, [fetchCurrentShiftData]);
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleMapComputerEdit = (computer: Computer) => { toast.info(`Клик по ${computer.name}`); };
  const handleEndShiftClick = () => { if (!shiftInfo.shiftId) { toast.error("Нет активной смены!"); return; } setIsEndShiftDialogOpen(true); };

  // --- Статистика ---
  const stats: StatCardData[] = [
      { title: "Оператор на смене", value: loadingShiftData ? "..." : shiftInfo.operatorName, icon: UserCheck, description: shiftInfo.shiftId ? `Смена активна` : "Смена не активна" },
      { title: "Активные сессии", value: loadingShiftData || shiftInfo.activeSessionsCount === null ? "..." : shiftInfo.activeSessionsCount.toString(), icon: Tv2, description: "Текущие игровые сессии" },
      { title: "Наличные за смену", value: loadingShiftData || shiftInfo.cashRevenue === null ? "..." : `₸${shiftInfo.cashRevenue.toLocaleString('ru-RU')}`, icon: Landmark, description: "Принято наличными" },
      { title: "Картой за смену", value: loadingShiftData || shiftInfo.cardRevenue === null ? "..." : `₸${shiftInfo.cardRevenue.toLocaleString('ru-RU')}`, icon: CreditCard, description: "Принято картами" },
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
            {!loadingShiftData && !shiftInfo.shiftId && ( <Button onClick={() => setIsStartShiftDialogOpen(true)} variant="secondary"> <UserPlus className="mr-2 h-4 w-4"/> Начать смену </Button> )}
            {!loadingShiftData && shiftInfo.shiftId && ( <Button onClick={handleEndShiftClick} variant="destructive"> <EndShiftIcon className="mr-2 h-4 w-4"/> Завершить смену </Button> )}
          </div>
        </div>

        {/* Карточки Статистики СМЕНЫ */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium truncate" title={stat.title}>{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground truncate" title={stat.description}>{stat.description}</p> </CardContent> </Card> ))} </div>

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>

           {/* Вкладка: Обзор */}
           <TabsContent value="overview" className="space-y-6">
               <div className="grid grid-cols-1 gap-6"> {/* График теперь занимает всю ширину */}
                  <Card className="bg-muted border border-border rounded-xl shadow-md">
  <CardHeader>
    <CardTitle className="text-lg font-semibold flex items-center gap-2">
      <BarChart className="h-5 w-5 text-primary" />
      Выручка (за смену)
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-4">
    <RevenueChart data={revenueData} loading={loadingRevenueChart} className="bg-transparent" />
  </CardContent>
</Card>
                   
                  {/* Блок "Последние бронирования" УДАЛЕН */}
               </div>
           </TabsContent>

           {/* Заглушки для других вкладок */}
            <TabsContent value="sessions"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Tv2 className="h-5 w-5 text-primary"/>Активные сессии</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будет список активных сессий...</p> </CardContent> </Card> </TabsContent>
            <TabsContent value="analytics"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5 text-primary"/>Аналитика</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будут графики и отчеты...</p> </CardContent> </Card> </TabsContent>
            <TabsContent value="map"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary"/>Карта клуба</CardTitle></CardHeader> <CardContent> {loadingMap ? (<div className="text-center p-10 text-muted-foreground">Загрузка карты...</div>) : mapComputers.length > 0 ? (<ClubMap computers={mapComputers} onEdit={handleMapComputerEdit} />) : (<div className="text-center p-10 text-muted-foreground">Нет данных о компьютерах.</div>) } </CardContent> </Card> </TabsContent>
        </Tabs>
      </main>

      {/* Модальные окна */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      <StartShiftDialog open={isStartShiftDialogOpen} onOpenChange={setIsStartShiftDialogOpen} onShiftStarted={handleShiftStarted} />
      <EndShiftDialog open={isEndShiftDialogOpen} onOpenChange={setIsEndShiftDialogOpen} shiftInfo={shiftInfo} onShiftEnded={fetchCurrentShiftData} />

    </div>
  )
}
