// app/page.tsx (С интегрированным списком RecentBookings)
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
// --- ДОБАВЛЕН ИМПОРТ RecentBookings ---
import { RecentBookings } from "@/components/dashboard/recent-bookings"; // <--- ПРОВЕРЬ ПУТЬ!

import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- Интерфейсы ---
interface StatCardData { title: string; value: string; icon: React.ComponentType<{ className?: string }>; description: string; }
interface Tournament { /* ... */ }
interface Team { /* ... */ }
interface Match { /* ... */ }
interface Computer { /* ... */ }
// Интерфейс Booking (убедись, что он совпадает с RecentBookings.tsx и БД)
interface Booking { id: string; created_at: string; customer_name: string | null; station_name: string | null; start_time: string; end_time: string; status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'; }

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
  // Последние бронирования
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loadingRecentBookings, setLoadingRecentBookings] = useState(false);
  // Остальные состояния
  const [tournaments, setTournaments] = useState<Tournament[]>([]); const [loadingTournaments, setLoadingTournaments] = useState(false); const [tournamentSearchQuery, setTournamentSearchQuery] = useState<string>(""); const [tournamentsCurrentPage, setTournamentsCurrentPage] = useState(1); const [tournamentsTotalPages, setTournamentsTotalPages] = useState(1);
  const [teams, setTeams] = useState<Team[]>([]); const [loadingTeams, setLoadingTeams] = useState(false); const [teamSearchQuery, setTeamSearchQuery] = useState<string>(""); const [teamsCurrentPage, setTeamsCurrentPage] = useState(1); const [teamsTotalPages, setTeamsTotalPages] = useState(1);
  const [mapComputers, setMapComputers] = useState<Computer[]>([]); const [loadingMap, setLoadingMap] = useState(false);
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
  const fetchDashboardStats = useCallback(async () => { /* ... код загрузки статистики ... */ }, []);
  const fetchRecentBookings = useCallback(async (limit = 5) => { setLoadingRecentBookings(true); try { const { data, error } = await supabase .from('bookings') .select('id, created_at, customer_name, station_name, start_time, end_time, status') .order('created_at', { ascending: false }) .limit(limit); if (error) throw error; setRecentBookings(data as Booking[] || []); } catch (error: any) { console.error("Ошибка загрузки последних бронирований:", error.message); toast.error(`Не удалось загрузить последние бронирования: ${error.message}`); setRecentBookings([]); } finally { setLoadingRecentBookings(false); } }, []);

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    if (activeTab === "overview") { fetchDashboardStats(); fetchRecentBookings(); }
    else if (activeTab === "list") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
    else if (activeTab === "calendar") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
    else if (activeTab === "teams") { fetchTeams(teamsCurrentPage, teamSearchQuery); }
    else if (activeTab === "map") { fetchMapData(); }
  }, [ activeTab, tournamentsCurrentPage, tournamentSearchQuery, fetchTournaments, teamsCurrentPage, teamSearchQuery, fetchTeams, fetchMapData, fetchDashboardStats, fetchRecentBookings ]);

  // --- Обработчики событий ---
  const handleTournamentCreated = () => { /* ... */ };
  const handleTeamCreated = () => { /* ... */ };
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); fetchDashboardStats(); fetchRecentBookings(); };
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>

           {/* Вкладка: Обзор */}
           <TabsContent value="overview" className="space-y-6">
               {/* Карточки статистики */}
               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground">{stat.description}</p> </CardContent> </Card> ))} </div>
               {/* График и Список Бронирований */}
               <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка </CardTitle> </CardHeader> <CardContent className="min-h-[300px] flex items-center justify-center text-muted-foreground"> (Компонент графика выручки) </CardContent> </Card>
                  {/* === ИЗМЕНЕНО: Список Бронирований === */}
                  <Card className="lg:col-span-1 shadow-sm bg-card flex flex-col">
                     <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader>
                     {/* Убрали min-h, убрали p-4 отсюда, добавили flex-grow */}
                     <CardContent className="flex flex-col flex-grow p-0">
                        {/* Вставляем компонент RecentBookings */}
                        <RecentBookings
                            bookings={recentBookings}
                            loading={loadingRecentBookings}
                        />
                        {/* Обертка для кнопки */}
                        <div className="p-4 pt-2 border-t mt-auto">
                            <Button variant="outline" size="sm" className="w-full" disabled> Все бронирования </Button>
                        </div>
                     </CardContent>
                  </Card>
                  {/* === КОНЕЦ ИЗМЕНЕНИЙ === */}
               </div>
           </TabsContent>

           {/* ... Другие вкладки (Sessions, Analytics, Map) ... */}
            <TabsContent value="sessions"> <Card> {/* ... */} </Card> </TabsContent>
            <TabsContent value="analytics"> <Card> {/* ... */} </Card> </TabsContent>
            <TabsContent value="map"> <Card> {/* ... */} </Card> </TabsContent>

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
