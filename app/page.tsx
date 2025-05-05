// app/page.tsx (Дашборд с ДАННЫМИ ПО ТЕКУЩЕЙ СМЕНЕ)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav"; // Проверь путь
// Иконки для новых карточек и старых элементов
import { Plus, UserCheck, Tv2, Landmark, CreditCard, List, Map, LineChart, BarChart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // Проверь путь
import { ClubMap } from "@/components/club-map"; // Проверь путь
import { RecentBookings } from "@/app/components/dashboard/recent-bookings"; // Проверь путь
import { RevenueChart } from "@/components/revenue-chart"; // Проверь путь

// Убрали импорты, не нужные на этой странице (для турниров/команд)
// import { CreateTournamentDialog } from "./tournaments/create-tournament-dialog";
// import { CreateTeamDialog } from "./tournaments/create-team-dialog";
// ... и другие ...

import { supabase } from "@/lib/supabaseClient"; // Проверь путь
import { addMinutes, formatISO } from 'date-fns'; // Для CreateBookingDialog (если он использует)

// --- Интерфейсы ---
interface StatCardData { title: string; value: string; icon: React.ComponentType<{ className?: string }>; description: string; }
interface Booking { id: string; created_at: string; customer_name: string | null; customer_id?: string | null; station_name: string | null; computer_id?: string | null; start_time: string; end_time: string; status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'; }
interface Computer { id: string; name: string; type: "PC" | "PlayStation"; status: "available" | "occupied"; zone: string; position_x: number; position_y: number; timeLeft?: string; customer?: string; created_at: string; }
// Интерфейс для хранения данных о смене
interface CurrentShiftInfo {
    shiftId: string | null;
    operatorName: string;
    activeSessionsCount: number | null;
    cashRevenue: number | null;
    cardRevenue: number | null;
    totalRevenue: number | null; // Общая выручка за смену
}

// --- Компонент страницы ---
export default function DashboardPage() {
  // --- Состояния ---
  const [activeTab, setActiveTab] = useState<string>("overview");
  // Состояние для данных текущей смены
  const [shiftInfo, setShiftInfo] = useState<CurrentShiftInfo>({ shiftId: null, operatorName: "...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null });
  const [loadingShiftData, setLoadingShiftData] = useState(true); // Начинаем с загрузки
  // Состояния для других компонентов дашборда
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingRecentBookings, setLoadingRecentBookings] = useState(false);
  const [mapComputers, setMapComputers] = useState<Computer[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  // Диалог создания бронирования
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  // Убрали состояния для диалогов турниров/команд

  // --- Функции загрузки данных ---

  // Загрузка данных ТЕКУЩЕЙ СМЕНЫ
  const fetchCurrentShiftData = useCallback(async () => {
    console.log("Загрузка данных текущей смены..."); // DEBUG
    setLoadingShiftData(true);
    // Сброс перед загрузкой с индикацией
    setShiftInfo({ shiftId: null, operatorName: "Загрузка...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null });
    let currentShiftId: string | null = null;

    try {
        // 1. Найти активную смену
        // ВАЖНО: Запрос сработает, если есть таблица shifts с колонкой status типа shift_status и значением ENUM 'ACTIVE'
        const { data: activeShift, error: shiftError } = await supabase
            .from('shifts')
            .select('id') // Нам нужен только ID
            .eq('status', 'ACTIVE') // Ищем по статусу 'ACTIVE'
            .limit(1)
            .single(); // Ожидаем не более одной активной смены

        // Код PGRST116 означает "ноль строк найдено", это не ошибка в данном случае
        if (shiftError && shiftError.code !== 'PGRST116') {
             throw new Error(`Ошибка поиска активной смены: ${shiftError.message}`);
        }

        if (!activeShift) {
            // Если активная смена не найдена
            console.log("Активная смена не найдена.");
            setShiftInfo({ shiftId: null, operatorName: "Нет", activeSessionsCount: 0, cashRevenue: 0, cardRevenue: 0, totalRevenue: 0 });
            toast.info("Нет активной смены для отображения статистики.");
            setLoadingShiftData(false); // Завершаем загрузку
            return; // Выходим из функции
        }

        currentShiftId = activeShift.id;
        console.log("Активная смена ID:", currentShiftId); // DEBUG

        // --- Загружаем связанные данные параллельно ---
        const results = await Promise.allSettled([
            // 2. Запрос имени(имен) оператора(ов) на смене
            supabase.from('shift_operators')
                    .select('operators ( name )') // Запрашиваем имя из связанной таблицы operators
                    .eq('shift_id', currentShiftId),

            // 3. Запрос количества активных сессий для этой смены
            supabase.from('sessions')
                    .select('*', { count: 'exact', head: true }) // Считаем строки, не загружая их
                    .eq('shift_id', currentShiftId)
                    .eq('status', 'ACTIVE'), // Используем ENUM статус 'ACTIVE'

            // 4. Запрос транзакций для этой смены для подсчета выручки
            supabase.from('transactions')
                    .select('amount, payment_method') // Нужны сумма и тип оплаты
                    .eq('shift_id', currentShiftId)
                    // Возможно, стоит фильтровать по transaction_type, например, только 'PAYMENT'?
        ]);

        const [operatorsResult, sessionsResult, transactionsResult] = results;

        // --- Обработка результатов ---
        let operatorName = "Не назначен";
        if (operatorsResult.status === 'fulfilled' && operatorsResult.value.data && operatorsResult.value.data.length > 0) {
            // @ts-ignore - Упрощенный доступ к вложенным данным
            operatorName = operatorsResult.value.data.map(op => op.operators?.name).filter(Boolean).join(', ') || "Имя не указано";
        } else if (operatorsResult.status === 'rejected') { console.error("Ошибка получения оператора:", operatorsResult.reason); operatorName = "Ошибка"; }

        let activeSessions = 0;
        if (sessionsResult.status === 'fulfilled') { activeSessions = sessionsResult.value.count ?? 0; }
        else { console.error("Ошибка получения сессий:", sessionsResult.reason); }

        let cashSum = 0; let cardSum = 0; let otherSum = 0;
        if (transactionsResult.status === 'fulfilled' && transactionsResult.value.data) {
            transactionsResult.value.data.forEach((tr: { amount: number | null, payment_method: string | null }) => {
                const amount = tr.amount ?? 0;
                // Суммируем по типам оплаты (учитывая возможные возвраты с отрицательной суммой)
                if (tr.payment_method === 'CASH') { cashSum += amount; }
                else if (tr.payment_method === 'CARD') { cardSum += amount; }
                else { otherSum += amount; }
            });
        } else if (transactionsResult.status === 'rejected') { console.error("Ошибка получения транзакций:", transactionsResult.reason); }

        console.log(`Статистика смены: Оператор='${operatorName}', Сессии=${activeSessions}, Нал=₸${cashSum}, Карта=₸${cardSum}`); // DEBUG

        // Обновляем состояние со всеми данными смены
        setShiftInfo({
             shiftId: currentShiftId,
             operatorName: operatorName,
             activeSessionsCount: activeSessions,
             cashRevenue: cashSum,
             cardRevenue: cardSum,
             totalRevenue: cashSum + cardSum + otherSum // Считаем общую выручку
        });

    } catch (error: any) {
        console.error("Общая ошибка загрузки данных смены:", error.message);
        toast.error(`Не удалось загрузить данные по смене: ${error.message}`);
         setShiftInfo({ shiftId: null, operatorName: "Ошибка", activeSessionsCount: 0, cashRevenue: 0, cardRevenue: 0, totalRevenue: 0 });
    } finally {
        setLoadingShiftData(false); // Завершаем загрузку
    }
  }, []); // Пустой массив зависимостей, чтобы функция не пересоздавалась без нужды

  // Загрузка последних бронирований
  const fetchRecentBookings = useCallback(async (limit = 5) => {
      setLoadingRecentBookings(true);
      try { /* ... код ... */ } catch (e) { /* ... */ } finally { setLoadingRecentBookings(false); }
  }, []);

  // Загрузка карты клуба
  const fetchMapData = useCallback(async () => {
      setLoadingMap(true);
      try { /* ... код ... */ } catch (e) { /* ... */ } finally { setLoadingMap(false); }
   }, []);

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    // Всегда при загрузке или смене вкладки пытаемся загрузить данные смены
    fetchCurrentShiftData();

    // Загружаем данные для активной вкладки
    if (activeTab === "overview") { fetchRecentBookings(); /* TODO: fetch chart data */ }
    else if (activeTab === "sessions") { /* TODO: fetch active sessions list */ }
    else if (activeTab === "analytics") { /* TODO: fetch analytics data */ }
    else if (activeTab === "map") { fetchMapData(); }

  }, [ activeTab, fetchCurrentShiftData, fetchRecentBookings, fetchMapData ]); // Основные зависимости


  // --- Обработчики событий ---
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); fetchCurrentShiftData(); fetchRecentBookings(); }; // Обновляем данные после создания брони
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleMapComputerEdit = (computer: Computer) => { toast.info(`Клик по ${computer.name}`); };
  // Убрали обработчики для турниров/команд

  // --- Статистика (теперь использует shiftInfo) ---
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
        {/* Заголовок и Кнопка Бронирования */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
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
                  <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка (Заглушка)</CardTitle> </CardHeader> <CardContent className="pt-4"> <RevenueChart /> </CardContent> </Card>
                  <Card className="lg:col-span-1 shadow-sm bg-card flex flex-col"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader> <CardContent className="flex flex-col flex-grow p-0"> <RecentBookings bookings={recentBookings} loading={loadingRecentBookings} /> <div className="p-4 pt-2 border-t mt-auto"> <Button variant="outline" size="sm" className="w-full" disabled> Все бронирования </Button> </div> </CardContent> </Card>
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
      {/* Убрал ненужные здесь диалоги турниров/команд */}

    </div>
  )
}
