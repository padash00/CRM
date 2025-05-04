// app/page.tsx (Добавлена загрузка последних бронирований)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Trophy, Users, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Cog, Loader2, BarChart, Clock, List, Tv, LineChart, Map } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { TournamentList } from "./tournaments/tournament-list";
import { TournamentCalendar } from "./tournaments/tournament-calendar";
import { CreateTournamentDialog } from "./tournaments/create-tournament-dialog";
import { CreateTeamDialog } from "./tournaments/create-team-dialog";
import { TeamList } from "./tournaments/team-list";
import { EditTournamentDialog } from "./tournaments/edit-tournament-dialog";
import { EditTeamDialog } from "./tournaments/edit-team-dialog";
import { DeleteConfirmationDialog } from "./tournaments/delete-confirmation-dialog";
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // Проверь путь
import { ClubMap } from "@/components/dashboard/club-map"; // Проверь путь
// --- ДОБАВИТЬ ИМПОРТ ДЛЯ СПИСКА БРОНИРОВАНИЙ (КОГДА ОН БУДЕТ) ---
// import { RecentBookings } from "@/components/dashboard/recent-bookings";

import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- Интерфейсы ---
interface StatCardData { title: string; value: string; icon: React.ComponentType<{ className?: string }>; description: string; }
interface Tournament { /* ... */ id: string; name: string; start_date: string; end_date: string; prize: number | null; participants_count: number | null; status: "upcoming" | "ongoing" | "finished"; organizer: string | null; cover_url: string | null; bracket_url: string | null; description: string | null; created_at: string; }
interface Team { /* ... */ id: string; name: string; logo_url: string | null; created_at: string; }
interface Match { /* ... */ id: string; tournament_id: string; round_number: number; match_in_round: number; participant1_id: string | null; participant2_id: string | null; score1: number | null; score2: number | null; winner_id: string | null; status: 'PENDING_PARTICIPANTS' | 'READY' | 'ONGOING' | 'FINISHED' | 'BYE'; next_match_id: string | null; details?: any; }
interface Computer { /* ... */ id: string; name: string; type: "PC" | "PlayStation"; status: "available" | "occupied"; zone: string; position_x: number; position_y: number; timeLeft?: string; customer?: string; created_at: string; }

// --- ДОБАВЛЕН ИНТЕРФЕЙС ДЛЯ БРОНИРОВАНИЯ ---
// Основан на твоей УЛУЧШЕННОЙ схеме таблицы bookings
interface Booking {
  id: string;
  created_at: string;
  customer_name: string | null;
  station_name: string | null;
  start_time: string; // ISO string (timestamptz)
  end_time: string;   // ISO string (timestamptz)
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'; // Из ENUM booking_status
}
// -----------------------------------------

// --- Компонент страницы ---
export default function DashboardPage() {
  // --- Состояния ---
  const [activeTab, setActiveTab] = useState<string>("overview");
  // Статистика
  const [activeBookingsCount, setActiveBookingsCount] = useState<number | null>(null);
  const [activeClientsCount, setActiveClientsCount] = useState<number | null>(null);
  const [todayRevenue, setTodayRevenue] = useState<number | null>(null);
  const [avgSessionTime, setAvgSessionTime] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  // Последние бронирования (НОВОЕ)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingRecentBookings, setLoadingRecentBookings] = useState(false);
  // Остальные состояния (турниры, команды, карта, диалоги...)
  const [tournaments, setTournaments] = useState<Tournament[]>([]); /* ... */ setLoadingTournaments] = useState(false); const [tournamentSearchQuery, setTournamentSearchQuery] = useState<string>(""); const [tournamentsCurrentPage, setTournamentsCurrentPage] = useState(1); const [tournamentsTotalPages, setTournamentsTotalPages] = useState(1);
  const [teams, setTeams] = useState<Team[]>([]); /* ... */ setLoadingTeams] = useState(false); const [teamSearchQuery, setTeamSearchQuery] = useState<string>(""); const [teamsCurrentPage, setTeamsCurrentPage] = useState(1); const [teamsTotalPages, setTeamsTotalPages] = useState(1);
  const [mapComputers, setMapComputers] = useState<Computer[]>([]); /* ... */ setLoadingMap] = useState(false);
  const [createTournamentDialogOpen, setCreateTournamentDialogOpen] = useState(false); const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false); const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null); const [isEditTournamentDialogOpen, setIsEditTournamentDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null); const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string; type: 'tournament' | 'team', name?: string} | null>(null); const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false); const [deleteLoading, setDeleteLoading] = useState(false);
  const [generatingBracket, setGeneratingBracket] = useState(false);

  const ITEMS_PER_PAGE = 15;

  // --- Функции загрузки данных ---
  const fetchTournaments = useCallback(async (page: number, search: string) => { /* ... код ... */ }, [ITEMS_PER_PAGE]);
  const fetchTeams = useCallback(async (page: number, search: string) => { /* ... код ... */ }, [ITEMS_PER_PAGE]);
  const fetchMapData = useCallback(async () => { /* ... код ... */ }, []);
  const fetchDashboardStats = useCallback(async () => { /* ... код загрузки статистики (пока только activeBookingsCount) ... */ }, []);

  // --- ДОБАВЛЕНО: Функция загрузки последних бронирований ---
  const fetchRecentBookings = useCallback(async (limit = 5) => {
      console.log(`Загрузка ${limit} последних бронирований...`); // DEBUG
      setLoadingRecentBookings(true);
      try {
          const { data, error } = await supabase
              .from('bookings')
              // Выбираем поля, нужные для отображения в списке
              .select('id, created_at, customer_name, station_name, start_time, end_time, status')
              .order('created_at', { ascending: false }) // Сортируем по дате создания (самые новые сначала)
              .limit(limit); // Ограничиваем количество

          if (error) throw error;

          console.log(`Получено ${data?.length ?? 0} последних бронирований`); // DEBUG
          setRecentBookings(data as Booking[] || []); // Устанавливаем состояние

      } catch (error: any) {
          console.error("Ошибка загрузки последних бронирований:", error.message);
          toast.error(`Не удалось загрузить последние бронирования: ${error.message}`);
          setRecentBookings([]); // Очищаем при ошибке
      } finally {
          setLoadingRecentBookings(false);
      }
  }, []); // Зависимостей нет, вызывается по условию
  // ----------------------------------------------------

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    // Загружаем данные для активной вкладки
    if (activeTab === "overview") {
        fetchDashboardStats();
        fetchRecentBookings(); // <-- ВЫЗЫВАЕМ ЗДЕСЬ
    }
    else if (activeTab === "list") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
    else if (activeTab === "calendar") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
    else if (activeTab === "teams") { fetchTeams(teamsCurrentPage, teamSearchQuery); }
    else if (activeTab === "map") { fetchMapData(); }

  }, [
      activeTab, // Основная зависимость
      // Зависимости для пагинации/поиска
      tournamentsCurrentPage, tournamentSearchQuery,
      teamsCurrentPage, teamSearchQuery,
      // Зависимости самих функций fetch
      fetchTournaments, fetchTeams, fetchMapData, fetchDashboardStats,
      fetchRecentBookings // <-- ДОБАВЛЕНО В ЗАВИСИМОСТИ
  ]);

  // --- Обработчики событий ---
  const handleTournamentCreated = () => { /* ... */ };
  const handleTeamCreated = () => { /* ... */ };
  const handleBookingCreated = () => {
      toast.success("Бронирование успешно создано!");
      // --- ДОБАВЛЕНО: Обновляем статистику и список бронирований ---
      fetchDashboardStats();
      fetchRecentBookings();
      // --------------------------------------------------------
  };
  // ... остальные обработчики ...
  const handleTournamentPreviousPage = () => { /* ... */ }; const handleTournamentNextPage = () => { /* ... */ };
  const handleTeamPreviousPage = () => { /* ... */ }; const handleTeamNextPage = () => { /* ... */ };
  const handleTournamentSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ }, []); const handleTeamSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ }, []);
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleEditTournamentClick = (tournament: Tournament) => { /* ... */ }; const handleDeleteTournamentClick = (tournamentId: string, tournamentName?: string) => { /* ... */ };
  const handleEditTeamClick = (team: Team) => { /* ... */ }; const handleDeleteTeamClick = (teamId: string, teamName?: string) => { /* ... */ };
  const handleMapComputerEdit = (computer: Computer) => { /* ... */ };
  const confirmDeletion = async () => { /* ... */ }; const handleGenerateBracket = async (tournamentId: string | null) => { /* ... */ };


  // --- Статистика (использует activeBookingsCount) ---
  const stats: StatCardData[] = [
      { title: "Активные бронирования", value: loadingStats || activeBookingsCount === null ? "..." : activeBookingsCount.toString(), icon: Clock, description: activeBookingsCount !== null ? "Сейчас в клубе" : "Загрузка..." },
      { title: "Активные клиенты", value: loadingStats || activeClientsCount === null ? "..." : activeClientsCount.toString(), icon: Users, description: activeClientsCount !== null ? "Сейчас в клубе" : "Загрузка..." },
      { title: "Выручка сегодня", value: loadingStats || todayRevenue === null ? "..." : `₸${todayRevenue.toLocaleString()}`, icon: BarChart, description: todayRevenue !== null ? "За текущий день" : "Загрузка..." },
      { title: "Среднее время сессии", value: loadingStats || avgSessionTime === null ? "..." : avgSessionTime, icon: Clock, description: avgSessionTime !== null ? "За сегодня" : "Нет данных" },
    ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* ... Заголовок и Кнопки ... */}
        {/* ... Статистика ... */}
        {/* ... Вкладки ... */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>

           {/* Вкладка: Обзор */}
           <TabsContent value="overview" className="space-y-6">
               {/* ... Карточки статистики ... */}
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground">{stat.description}</p> </CardContent> </Card> ))} </div>

               {/* График и Список Бронирований */}
               <div className="grid gap-6 lg:grid-cols-3">
                  {/* График */}
                  <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка </CardTitle> </CardHeader> <CardContent className="min-h-[300px] flex items-center justify-center text-muted-foreground"> (Компонент графика выручки) </CardContent> </Card>

                  {/* Список Бронирований */}
                  <Card className="lg:col-span-1 shadow-sm bg-card">
                     <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader>
                     <CardContent className="min-h-[300px] flex flex-col text-sm p-0"> {/* Убрал p-4 */}
                        {/* --- ЗАМЕНА ЗАГЛУШКИ НА КОМПОНЕНТ (ПОКА ЗАКОММЕНТИРОВАН) --- */}
                        {/*
                        <RecentBookings
                            bookings={recentBookings}
                            loading={loadingRecentBookings}
                        />
                        */}
                        {/* Пока оставим заглушку, пока нет компонента RecentBookings */}
                         <div className="flex-grow flex items-center justify-center text-muted-foreground text-center text-xs p-4">
                             (Компонент <br/> последних бронирований)
                         </div>
                        <div className="p-4 border-t"> {/* Вынес кнопку в обертку с padding */}
                            <Button variant="outline" size="sm" className="w-full" disabled> Все бронирования </Button>
                        </div>
                        {/* --- КОНЕЦ ЗАМЕНЫ --- */}
                     </CardContent>
                  </Card>
               </div>
           </TabsContent>

           {/* ... Другие вкладки ... */}
            <TabsContent value="sessions"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Tv className="h-5 w-5 text-primary"/>Активные сессии</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будет отображаться информация о текущих активных сессиях клиентов.</p> </CardContent> </Card> </TabsContent>
            <TabsContent value="analytics"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5 text-primary"/>Аналитика</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будут отображаться различные аналитические отчеты и графики.</p> </CardContent> </Card> </TabsContent>
            <TabsContent value="map"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary"/>Карта клуба</CardTitle></CardHeader> <CardContent> {loadingMap ? (<div className="text-center p-10 text-muted-foreground">Загрузка карты...</div>) : mapComputers.length > 0 ? (<ClubMap computers={mapComputers} onEdit={handleMapComputerEdit} />) : (<div className="text-center p-10 text-muted-foreground">Нет данных о компьютерах для отображения карты.</div>) } </CardContent> </Card> </TabsContent>

        </Tabs>
      </main>

      {/* Модальные окна */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      {/* ... остальные диалоги ... */}
       <CreateTournamentDialog open={createTournamentDialogOpen} onOpenChange={setCreateTournamentDialogOpen} onTournamentCreated={handleTournamentCreated} />
       <CreateTeamDialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen} onTeamCreated={handleTeamCreated} />
       <EditTournamentDialog open={isEditTournamentDialogOpen} onOpenChange={setIsEditTournamentDialogOpen} tournament={editingTournament} onTournamentUpdated={() => { setIsEditTournamentDialogOpen(false); fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }} />
       <EditTeamDialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen} team={editingTeam} onTeamUpdated={() => { setIsEditTeamDialogOpen(false); fetchTeams(teamsCurrentPage, teamSearchQuery); }} />
       <DeleteConfirmationDialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={confirmDeletion} itemName={itemToDelete?.name} itemType={itemToDelete?.type === 'tournament' ? 'турнир' : 'команду'} loading={deleteLoading} />

    </div>
  )
}
