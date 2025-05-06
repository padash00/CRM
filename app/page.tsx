// app/page.tsx (Финальная версия дашборда с данными смены и графиком)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input"; // Input больше не используется здесь
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UserCheck, Tv2, Landmark, CreditCard, List, Map, LineChart, BarChart, Loader2, UserPlus, LogOut as EndShiftIcon } from "lucide-react";
import { MainNav } from "@/components/main-nav"; // Проверь путь
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // Проверь путь
import { StartShiftDialog } from "@/app/components/dialogs/start-shift-dialog"; // Проверь путь
import { EndShiftDialog } from "@/app/components/dialogs/end-shift-dialog"; // Проверь путь
import { ClubMap } from "@/components/club-map"; // Проверь путь
import { RevenueChart } from "@/components/revenue-chart"; // Проверь путь

import { supabase } from "@/lib/supabaseClient"; // Проверь путь
import { toast } from "sonner";
// Нужны для работы с датами для графика и диалогов
import { format, subDays, formatISO, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

// --- Интерфейсы ---
interface StatCardData { title: string; value: string; icon: React.ComponentType<{ className?: string }>; description: string; }
interface Booking { id: string; created_at: string; customer_name: string | null; customer_id?: string | null; station_name: string | null; computer_id?: string | null; start_time: string; end_time: string; status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'; guest_name?: string | null; customers?: { id: string; name: string | null; } | null; computers?: { id: string; name: string | null; } | null; } // Интерфейс для RecentBookings (уже не используется)
interface Computer { id: string; name: string; type: "PC" | "PlayStation"; status: "available" | "occupied"; zone: string; position_x: number; position_y: number; timeLeft?: string; customer?: string; created_at: string; }
interface CurrentShiftInfo { shiftId: string | null; operatorName: string; activeSessionsCount: number | null; cashRevenue: number | null; cardRevenue: number | null; totalRevenue: number | null; }
// Интерфейс для данных графика (соответствует возврату SQL функции)
interface RevenueDataPoint {
  day: string; // Отформатированная дата (напр., "06.05" или YYYY-MM-DD)
  total_revenue: number;
}

// --- Компонент страницы ---
export default function DashboardPage() {
  // --- Состояния ---
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [shiftInfo, setShiftInfo] = useState<CurrentShiftInfo>({ shiftId: null, operatorName: "...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null });
  const [loadingShiftData, setLoadingShiftData] = useState(true);
  // Убрали состояния для RecentBookings
  const [mapComputers, setMapComputers] = useState<Computer[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  // Состояния для графика
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [loadingRevenueChart, setLoadingRevenueChart] = useState(false);
  // Диалоги
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [isStartShiftDialogOpen, setIsStartShiftDialogOpen] = useState(false);
  const [isEndShiftDialogOpen, setIsEndShiftDialogOpen] = useState(false);

  // --- Функции загрузки данных ---

  // Загрузка данных ТЕКУЩЕЙ СМЕНЫ (исправленная)
  const fetchCurrentShiftData = useCallback(async () => {
      console.log("Загрузка данных текущей смены...");
      setLoadingShiftData(true);
      setShiftInfo(prev => ({ ...prev, operatorName: "Загрузка...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null }));
      let currentShiftId: string | null = null;
      try {
          // Ищем активную смену (без .single())
          const { data: activeShifts, error: shiftError } = await supabase .from('shifts') .select('id') .eq('status', 'ACTIVE') .limit(1);
          if (shiftError) throw new Error(`Ошибка поиска активной смены: ${shiftError.message}`);

          if (!activeShifts || activeShifts.length === 0) {
              console.log("Активная смена не найдена (0 строк).");
              setShiftInfo({ shiftId: null, operatorName: "Нет", activeSessionsCount: 0, cashRevenue: 0, cardRevenue: 0, totalRevenue: 0 });
              return; // Выходим, если нет активной смены
          }
          currentShiftId = activeShifts[0].id;
          console.log("Найдена активная смена ID:", currentShiftId);

          // Параллельные запросы
          const results = await Promise.allSettled([
              supabase.from('shift_operators').select('operators ( name )').eq('shift_id', currentShiftId),
              supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('shift_id', currentShiftId).eq('status', 'ACTIVE'),
              supabase.from('transactions').select('amount, payment_method').eq('shift_id', currentShiftId)
          ]);
          const [operatorsResult, sessionsResult, transactionsResult] = results;

          // Обработка результатов
          let operatorName = "Не назначен"; let activeSessions = 0; let cashSum = 0; let cardSum = 0; let otherSum = 0;
          if (operatorsResult.status === 'fulfilled' && operatorsResult.value.data && operatorsResult.value.data.length > 0) { /* @ts-ignore */ operatorName = operatorsResult.value.data.map(op => op.operators?.name).filter(Boolean).join(', ') || "Имя не указано"; } else if (operatorsResult.status === 'rejected') { console.error("Ошибка оператора:", operatorsResult.reason); operatorName = "Ошибка"; }
          if (sessionsResult.status === 'fulfilled') { activeSessions = sessionsResult.value.count ?? 0; } else { console.error("Ошибка сессий:", sessionsResult.reason); }
          if (transactionsResult.status === 'fulfilled' && transactionsResult.value.data) { transactionsResult.value.data.forEach((tr: { amount: number | null, payment_method: string | null }) => { const amount = tr.amount ?? 0; if (tr.payment_method === 'CASH') { cashSum += amount; } else if (tr.payment_method === 'CARD') { cardSum += amount; } else { otherSum += amount; } }); } else if (transactionsResult.status === 'rejected') { console.error("Ошибка транзакций:", transactionsResult.reason); }

          setShiftInfo({ shiftId: currentShiftId, operatorName: operatorName, activeSessionsCount: activeSessions, cashRevenue: cashSum, cardRevenue: cardSum, totalRevenue: cashSum + cardSum + otherSum });
      } catch (error: any) { console.error("Общая ошибка загрузки данных смены:", error.message); toast.error(`Не удалось загрузить данные по смене: ${error.message}`); setShiftInfo({ shiftId: null, operatorName: "Ошибка", activeSessionsCount: 0, cashRevenue: 0, cardRevenue: 0, totalRevenue: 0 }); }
      finally { setLoadingShiftData(false); }
  }, []);

  // Загрузка данных для графика выручки (вызывает RPC)
   const fetchRevenueChartData = useCallback(async (days = 7) => {
      console.log(`Загрузка данных выручки за ${days} дней...`);
      setLoadingRevenueChart(true);
      setRevenueData([]);
      try {
          const endDate = new Date();
          const startDate = subDays(endDate, days - 1);
          const startDateIso = startDate.toISOString().split('T')[0];
          const endDateIso = endDate.toISOString().split('T')[0];
          console.log(`Вызов RPC get_daily_revenue с ${startDateIso} по ${endDateIso}`);

          // Вызов SQL функции
          const { data, error } = await supabase.rpc('get_daily_revenue', {
              start_date: startDateIso,
              end_date: endDateIso
          });
          if (error) throw error;

          // Форматирование данных для recharts
          const formattedData: RevenueDataPoint[] = (data || []).map((item: { day: string; total_revenue: number | null }) => {
              let formattedDay = item.day; // Оставляем YYYY-MM-DD по умолчанию
              try {
                  const parsedDate = parseISO(item.day); // Преобразуем строку YYYY-MM-DD в Date
                  if(isValid(parsedDate)) { // Проверяем, валидна ли дата
                     formattedDay = format(parsedDate, 'dd.MM', { locale: ru }); // Форматируем как DD.MM
                  }
              } catch (e) { console.error("Ошибка форматирования даты графика:", item.day, e);}

              return {
                  day: formattedDay,
                  total_revenue: item.total_revenue ?? 0
              };
          });

          console.log("Данные для графика получены и отформатированы:", formattedData);
          setRevenueData(formattedData);
      } catch (error: any) {
          console.error("Ошибка загрузки данных графика выручки:", error.message);
          toast.error(`Не удалось загрузить данные для графика: ${error.message}`);
          setRevenueData([]);
      } finally { setLoadingRevenueChart(false); }
  }, []); // Зависимости useCallback

  // Загрузка карты клуба
  const fetchMapData = useCallback(async () => { setLoadingMap(true); try { const { data, error } = await supabase .from('computers') .select(`id, name, type, status, position_x, position_y, created_at, zones ( name )`); if (error) throw error; const processedData: Computer[] = (data || []).map((comp: any) => ({ ...comp, zone: comp.zones?.name?.toLowerCase() ?? 'unknown', status: comp.status === 'free' ? 'available' : 'occupied', })); setMapComputers(processedData); } catch (error: any) { console.error("Ошибка загрузки данных карты:", error.message); toast.error(`Не удалось загрузить данные карты: ${error.message}`); setMapComputers([]); } finally { setLoadingMap(false); } }, []);

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    fetchCurrentShiftData(); // Всегда грузим данные смены
    if (activeTab === "overview") { fetchRevenueChartData(); /* Убрали fetchRecentBookings */ }
    else if (activeTab === "sessions") { /* TODO: fetch active sessions list */ }
    else if (activeTab === "analytics") { /* TODO: fetch analytics data */ }
    else if (activeTab === "map") { fetchMapData(); }
    // Убрали fetchRecentBookings из зависимостей
  }, [ activeTab, fetchCurrentShiftData, fetchMapData, fetchRevenueChartData ]);


  // --- Обработчики событий ---
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); fetchCurrentShiftData(); fetchRevenueChartData(); /* Обновляем и график */ };
  const handleShiftStarted = useCallback(() => { fetchCurrentShiftData(); }, [fetchCurrentShiftData]);
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleMapComputerEdit = (computer: Computer) => { toast.info(`Клик по ${computer.name}`); };
  const handleEndShiftClick = () => { if (!shiftInfo.shiftId) { toast.error("Нет активной смены!"); return; } setIsEndShiftDialogOpen(true); };

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
         <div className="flex flex-wrap items-center justify-between gap-4"> <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2> <div className="flex gap-2 flex-wrap"> {!loadingShiftData && !shiftInfo.shiftId && ( <Button onClick={() => setIsStartShiftDialogOpen(true)} variant="secondary"> <UserPlus className="mr-2 h-4 w-4"/> Начать смену </Button> )} {!loadingShiftData && shiftInfo.shiftId && ( <Button onClick={handleEndShiftClick} variant="destructive"> <EndShiftIcon className="mr-2 h-4 w-4"/> Завершить смену </Button> )} <Button onClick={() => setIsCreateBookingDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новое бронирование </Button> </div> </div>
        {/* Карточки Статистики */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium truncate" title={stat.title}>{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground truncate" title={stat.description}>{stat.description}</p> </CardContent> </Card> ))} </div>
        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>

           {/* Вкладка: Обзор */}
           <TabsContent value="overview" className="space-y-6">
               {/* ИЗМЕНЕННАЯ СЕТКА: Только график */}
               <div className="grid grid-cols-1 gap-6">
                  <Card className="shadow-sm bg-card">
                    <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка (7 дней)</CardTitle> </CardHeader>
                    <CardContent className="pt-4">
                      {/* Передаем данные и загрузку в компонент графика */}
                      <RevenueChart data={revenueData} loading={loadingRevenueChart} />
                    </CardContent>
                  </Card>
                  {/* БЛОК ПОСЛЕДНИХ БРОНИРОВАНИЙ УДАЛЕН */}
               </div>
           </TabsContent>

           {/* Другие вкладки */}
           <TabsContent value="sessions"> <Card> <CardHeader><CardTitle>Активные сессии</CardTitle></CardHeader><CardContent><p>...</p></CardContent></Card> </TabsContent>
           <TabsContent value="analytics"> <Card> <CardHeader><CardTitle>Аналитика</CardTitle></CardHeader><CardContent><p>...</p></CardContent></Card> </TabsContent>
           <TabsContent value="map"> <Card> <CardHeader><CardTitle>Карта клуба</CardTitle></CardHeader><CardContent>{loadingMap ? '...' : <ClubMap computers={mapComputers} onEdit={handleMapComputerEdit} />}</CardContent> </Card> </TabsContent>
        </Tabs>
      </main>

      {/* Модальные окна */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      <StartShiftDialog open={isStartShiftDialogOpen} onOpenChange={setIsStartShiftDialogOpen} onShiftStarted={handleShiftStarted} />
      <EndShiftDialog open={isEndShiftDialogOpen} onOpenChange={setIsEndShiftDialogOpen} shiftInfo={shiftInfo} onShiftEnded={fetchCurrentShiftData} />

    </div>
  )
}
