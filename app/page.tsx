// app/page.tsx (Дашборд с ДАННЫМИ ПО ТЕКУЩЕЙ СМЕНЕ)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav"; // Проверь путь
// Иконки для новых карточек и старых элементов
import { Plus, UserCheck, Tv2, Landmark, CreditCard, List, Map, LineChart, BarChart } from "lucide-react";
import { toast } from "sonner";
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // Проверь путь
// --- ПРАВИЛЬНЫЕ ПУТИ ---
import { ClubMap } from "@/components/club-map";
import { RecentBookings } from "@/app/components/dashboard/recent-bookings"; // Внутри app!
import { RevenueChart } from "@/components/revenue-chart";
// --- ---
import { supabase } from "@/lib/supabaseClient"; // Проверь путь

// --- Интерфейсы ---
// Интерфейс для данных, отображаемых на карточках статистики
interface StatCardData { title: string; value: string; icon: React.ComponentType<{ className?: string }>; description: string; }
// Интерфейс для бронирования (для RecentBookings)
interface Booking { id: string; created_at: string; customer_name: string | null; customer_id?: string | null; station_name: string | null; computer_id?: string | null; start_time: string; end_time: string; status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'; }
// Интерфейс для компьютера (для ClubMap)
interface Computer { id: string; name: string; type: "PC" | "PlayStation"; status: "available" | "occupied"; zone: string; position_x: number; position_y: number; timeLeft?: string; customer?: string; created_at: string; }
// Интерфейс для информации о текущей смене
interface CurrentShiftInfo {
    shiftId: string | null;
    operatorName: string;
    activeSessionsCount: number | null;
    cashRevenue: number | null;
    cardRevenue: number | null;
    totalRevenue: number | null; // Добавим общую выручку
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
  // Состояния для диалогов
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  // Убраны состояния для диалогов турниров/команд, т.к. кнопки управления ими лучше разместить на соответствующих страницах

  // --- Функции загрузки данных ---

  // Загрузка данных ТЕКУЩЕЙ СМЕНЫ
  const fetchCurrentShiftData = useCallback(async () => {
    console.log("Загрузка данных текущей смены...");
    setLoadingShiftData(true);
    setShiftInfo({ shiftId: null, operatorName: "Загрузка...", activeSessionsCount: null, cashRevenue: null, cardRevenue: null, totalRevenue: null }); // Сброс с индикацией

    let currentShiftId: string | null = null;

    try {
        // 1. Найти активную смену
        // ВАЖНО: Запрос сработает, если таблица shifts обновлена и есть смена со статусом 'ACTIVE'
        const { data: activeShift, error: shiftError } = await supabase
            .from('shifts')
            .select('id, start_time') // ID нужен для других запросов
            .eq('status', 'ACTIVE') // Ищем по ENUM статусу 'ACTIVE'
            .limit(1)
            .single();

        // Обработка случая, если активная смена не найдена (PGRST116 - это не ошибка, а просто 0 строк)
        if (shiftError && shiftError.code !== 'PGRST116') {
             throw new Error(`Ошибка поиска активной смены: ${shiftError.message}`);
        }

        if (!activeShift) {
            console.log("Активная смена не найдена.");
            setShiftInfo({ shiftId: null, operatorName: "Нет", activeSessionsCount: 0, cashRevenue: 0, cardRevenue: 0, totalRevenue: 0 });
            toast.info("Нет активной смены для отображения статистики.");
            setLoadingShiftData(false);
            return; // Выходим
        }

        currentShiftId = activeShift.id;
        console.log("Активная смена ID:", currentShiftId);

        // --- Параллельно загружаем связанные данные для найденной смены ---
        const results = await Promise.allSettled([
            // 2. Оператор(ы) на смене
            supabase.from('shift_operators')
                    .select('operators ( name )') // Используем связь для получения имени
                    .eq('shift_id', currentShiftId),

            // 3. Активные сессии смены (status = ACTIVE)
            supabase.from('sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('shift_id', currentShiftId)
                    .eq('status', 'ACTIVE'),

            // 4. Транзакции за смену (для подсчета выручки)
            supabase.from('transactions')
                    .select('amount, payment_method')
                    .eq('shift_id', currentShiftId)
                    // Возможно, нужно фильтровать по transaction_type ('PAYMENT')?
        ]);

        const [operatorsResult, sessionsResult, transactionsResult] = results;

        // --- Обработка результатов ---
        let operatorName = "Не найден";
        if (operatorsResult.status === 'fulfilled' && operatorsResult.value.data && operatorsResult.value.data.length > 0) {
             // @ts-ignore // Упрощаем доступ к вложенному имени, предполагая структуру
            operatorName = operatorsResult.value.data.map(op => op.operators?.name).filter(Boolean).join(', ') || "Имя не указано";
        } else if (operatorsResult.status === 'rejected') { console.error("Ошибка получения оператора:", operatorsResult.reason); operatorName = "Ошибка"; }

        let activeSessions = 0;
        if (sessionsResult.status === 'fulfilled') { activeSessions = sessionsResult.value.count ?? 0; }
        else { console.error("Ошибка получения сессий:", sessionsResult.reason); }

        let cashSum = 0;
        let cardSum = 0;
        let otherSum = 0; // На случай других типов оплаты
        if (transactionsResult.status === 'fulfilled' && transactionsResult.value.data) {
            transactionsResult.value.data.forEach((tr: { amount: number | null, payment_method: string | null }) => {
                const amount = tr.amount ?? 0;
                // Учитываем как поступления, так и возвраты (если amount отрицательный)
                if (tr.payment_method === 'CASH') { cashSum += amount; }
                else if (tr.payment_method === 'CARD') { cardSum += amount; }
                else { otherSum += amount; } // Собираем прочие типы оплаты
            });
        } else if (transactionsResult.status === 'rejected') { console.error("Ошибка получения транзакций:", transactionsResult.reason); }

        console.log(`Статистика: Оператор='${operatorName}', Сессии=${activeSessions}, Нал=${cashSum}, Карта=${cardSum}`);

        // Обновляем состояние всей информации о смене
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
        setLoadingShiftData(false);
    }
  }, []);

  // Функция загрузки последних бронирований (оставляем)
  const fetchRecentBookings = useCallback(async (limit = 5) => { /* ... код fetchRecentBookings ... */ }, []);
  // Функция загрузки карты (оставляем)
  const fetchMapData = useCallback(async () => { /* ... код fetchMapData ... */ }, []);


  // --- useEffect для загрузки данных ---
  useEffect(() => {
    // Всегда загружаем данные текущей смены, т.к. они нужны для шапки/статистики
    fetchCurrentShiftData();

    // Загружаем данные для активной вкладки
    if (activeTab === "overview") { fetchRecentBookings(); /* График позже */ }
    else if (activeTab === "sessions") { /* TODO: fetch активных сессий */ }
    else if (activeTab === "analytics") { /* TODO: fetch данных аналитики */ }
    else if (activeTab === "map") { fetchMapData(); }

    // Убираем загрузку турниров/команд, так как они на другой странице
  }, [ activeTab, fetchCurrentShiftData, fetchRecentBookings, fetchMapData ]); // Убрали зависимости турниров/команд


  // --- Обработчики событий ---
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); fetchCurrentShiftData(); fetchRecentBookings(); }; // Обновляем данные смены и брони
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleMapComputerEdit = (computer: Computer) => { toast.info(`Клик по ${computer.name}`); };


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
      {/* Передаем имя оператора в MainNav, если нужно */}
      <MainNav /* operatorName={shiftInfo.operatorName} */ />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Заголовок и Кнопка Бронирования */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          <Button onClick={() => setIsCreateBookingDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новое бронирование </Button>
        </div>

        {/* Карточки Статистики СМЕНЫ */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                 <Card key={stat.title} className="shadow-sm bg-card">
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium truncate" title={stat.title}>{stat.title}</CardTitle> {/* Добавлен truncate */}
                     <stat.icon className="h-4 w-4 text-muted-foreground" />
                   </CardHeader>
                   <CardContent>
                     <div className="text-2xl font-bold">{stat.value}</div>
                     <p className="text-xs text-muted-foreground truncate" title={stat.description}>{stat.description}</p> {/* Добавлен truncate */}
                   </CardContent>
                 </Card>
             ))}
         </div>

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto">
               <TabsTrigger value="overview">Обзор</TabsTrigger>
               <TabsTrigger value="sessions">Активные сессии</TabsTrigger>
               <TabsTrigger value="analytics">Аналитика</TabsTrigger>
               <TabsTrigger value="map">Карта клуба</TabsTrigger>
           </TabsList>

           {/* Вкладка: Обзор */}
           <TabsContent value="overview" className="space-y-6">
               {/* График и Список Бронирований */}
               <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="lg:col-span-2 shadow-sm bg-card">
                      <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка (Заглушка)</CardTitle> </CardHeader>
                      <CardContent className="pt-4"> <RevenueChart /> </CardContent> {/* Используем компонент-заглушку */}
                  </Card>
                  <Card className="lg:col-span-1 shadow-sm bg-card flex flex-col">
                      <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader>
                      <CardContent className="flex flex-col flex-grow p-0">
                          <RecentBookings bookings={recentBookings} loading={loadingRecentBookings} />
                          <div className="p-4 pt-2 border-t mt-auto"> <Button variant="outline" size="sm" className="w-full" disabled> Все бронирования </Button> </div>
                      </CardContent>
                   </Card>
               </div>
           </TabsContent>

           {/* Заглушки для других вкладок */}
            <TabsContent value="sessions"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Tv className="h-5 w-5 text-primary"/>Активные сессии</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будет список активных сессий...</p> </CardContent> </Card> </TabsContent>
            <TabsContent value="analytics"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5 text-primary"/>Аналитика</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будут графики и отчеты...</p> </CardContent> </Card> </TabsContent>
            <TabsContent value="map"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary"/>Карта клуба</CardTitle></CardHeader> <CardContent> {loadingMap ? (<div className="text-center p-10 text-muted-foreground">Загрузка карты...</div>) : mapComputers.length > 0 ? (<ClubMap computers={mapComputers} onEdit={handleMapComputerEdit} />) : (<div className="text-center p-10 text-muted-foreground">Нет данных о компьютерах.</div>) } </CardContent> </Card> </TabsContent>
        </Tabs>
      </main>

      {/* Диалог для БРОНИРОВАНИЯ */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      {/* Диалоги для турниров/команд больше не нужны на этой странице */}

    </div>
  )
}
