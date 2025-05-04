// app/page.tsx (С ИСПРАВЛЕННЫМИ ПУТЯМИ ИМПОРТА)
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Trophy, Users, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Cog, Loader2, BarChart, Clock, List, Tv, LineChart, Map } from "lucide-react";

// --- ИСПРАВЛЕННЫЕ И НЕИЗМЕНЕННЫЕ ИМПОРТЫ ---
import { MainNav } from "@/components/main-nav"; // Путь с @/ оставляем, если он настроен
import { TournamentList } from "./tournaments/tournament-list"; // Исправлен путь (если используется здесь)
import { TournamentCalendar } from "./tournaments/tournament-calendar"; // Исправлен путь (если используется здесь)
import { CreateTournamentDialog } from "./tournaments/create-tournament-dialog"; // Исправлен путь
import { CreateTeamDialog } from "./tournaments/create-team-dialog"; // Исправлен путь
import { TeamList } from "./tournaments/team-list"; // Исправлен путь
import { EditTournamentDialog } from "./tournaments/edit-tournament-dialog"; // Исправлен путь
import { EditTeamDialog } from "./tournaments/edit-team-dialog"; // Исправлен путь
import { DeleteConfirmationDialog } from "./tournaments/delete-confirmation-dialog"; // Исправлен путь
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // ПРОВЕРЬ ЭТОТ ПУТЬ!
import { ClubMap } from "@/components/club-map"; // 

import { supabase } from "@/lib/supabaseClient"; // Проверь путь
import { toast } from "sonner";

// --- Интерфейсы ---
interface StatCard { title: string; value: string; description: string; icon: React.ComponentType<{ className?: string }> }
interface Tournament { id: string; name: string; start_date: string; end_date: string; prize: number | null; participants_count: number | null; status: "upcoming" | "ongoing" | "finished"; organizer: string | null; cover_url: string | null; bracket_url: string | null; description: string | null; created_at: string; }
interface Team { id: string; name: string; logo_url: string | null; created_at: string; }
interface Match { id: string; tournament_id: string; round_number: number; match_in_round: number; participant1_id: string | null; participant2_id: string | null; score1: number | null; score2: number | null; winner_id: string | null; status: 'PENDING_PARTICIPANTS' | 'READY' | 'ONGOING' | 'FINISHED' | 'BYE'; next_match_id: string | null; details?: any; }
// Интерфейс Computer (если ClubMap используется здесь)
interface Computer { id: string; name: string; type: "PC" | "PlayStation"; status: "available" | "occupied"; zone: string; position_x: number; position_y: number; timeLeft?: string; customer?: string; created_at: string; }


// --- Компонент страницы ---
export default function DashboardPage() { // Переименовал для ясности
  // --- Состояния ---
  const [activeTab, setActiveTab] = useState<string>("overview"); // Начинаем с Обзора
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentSearchQuery, setTournamentSearchQuery] = useState<string>("");
  const [tournamentsCurrentPage, setTournamentsCurrentPage] = useState(1);
  const [tournamentsTotalPages, setTournamentsTotalPages] = useState(1);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>("");
  const [teamsCurrentPage, setTeamsCurrentPage] = useState(1);
  const [teamsTotalPages, setTeamsTotalPages] = useState(1);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [mapComputers, setMapComputers] = useState<Computer[]>([]); // Состояние для карты
  const [loadingMap, setLoadingMap] = useState(false); // Загрузка для карты
  const [createTournamentDialogOpen, setCreateTournamentDialogOpen] = useState(false);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [isEditTournamentDialogOpen, setIsEditTournamentDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string; type: 'tournament' | 'team', name?: string} | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [generatingBracket, setGeneratingBracket] = useState(false);

  const ITEMS_PER_PAGE = 15;

  // --- Функции загрузки данных ---
  const fetchTournaments = useCallback(async (page: number, search: string) => { setLoadingTournaments(true); const start = (page - 1) * ITEMS_PER_PAGE; const end = start + ITEMS_PER_PAGE - 1; try { let query = supabase.from("tournaments").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(start, end); if (search.trim()) { query = query.ilike("name", `%${search.trim()}%`) } const { data, error, count } = await query; if (error) throw error; setTournaments(data || []); setTournamentsTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE)); } catch (error: any) { console.error("fetchTournaments Ошибка:", error.message); toast.error(`Не удалось загрузить турниры: ${error.message}`); setTournaments([]); setTournamentsTotalPages(1); } finally { setLoadingTournaments(false); } }, [ITEMS_PER_PAGE]);
  const fetchTeams = useCallback(async (page: number, search: string) => { setLoadingTeams(true); const start = (page - 1) * ITEMS_PER_PAGE; const end = start + ITEMS_PER_PAGE - 1; try { let query = supabase.from("teams").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(start, end); if (search.trim()) { query = query.ilike("name", `%${search.trim()}%`); } const { data, error, count } = await query; if (error) throw error; setTeams(data || []); setTeamsTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE)); } catch (error: any) { console.error("fetchTeams Ошибка:", error.message); toast.error(`Не удалось загрузить команды: ${error.message}`); setTeams([]); setTeamsTotalPages(1); } finally { setLoadingTeams(false); } }, [ITEMS_PER_PAGE]);
  const fetchMapData = useCallback(async () => { setLoadingMap(true); try { const { data, error } = await supabase .from('computers') .select(`id, name, type, status, position_x, position_y, created_at, zones ( name )`); if (error) throw error; const processedData: Computer[] = (data || []).map((comp: any) => ({ ...comp, zone: comp.zones?.name?.toLowerCase() ?? 'unknown', status: comp.status === 'free' ? 'available' : 'occupied', })); setMapComputers(processedData); } catch (error: any) { console.error("Ошибка загрузки данных карты:", error.message); toast.error(`Не удалось загрузить данные карты: ${error.message}`); setMapComputers([]); } finally { setLoadingMap(false); } }, []);

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    // Загружаем данные для активной вкладки
    if (activeTab === "list") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
    else if (activeTab === "calendar") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); } // Календарь использует данные турниров
    else if (activeTab === "teams") { fetchTeams(teamsCurrentPage, teamSearchQuery); }
    else if (activeTab === "map") { fetchMapData(); }
  }, [ activeTab, tournamentsCurrentPage, tournamentSearchQuery, fetchTournaments, teamsCurrentPage, teamSearchQuery, fetchTeams, fetchMapData ]); // Добавлены все зависимости

  // --- Обработчики событий ---
  const handleTournamentCreated = () => { setTournamentSearchQuery(""); setTournamentsCurrentPage(1); if (activeTab !== 'list') { setActiveTab('list'); } else { if (tournamentsCurrentPage === 1 && tournamentSearchQuery === "") { fetchTournaments(1, ""); } } }
  const handleTeamCreated = () => { setTeamSearchQuery(""); setTeamsCurrentPage(1); if (activeTab !== 'teams') { setActiveTab('teams'); } else { if (teamsCurrentPage === 1 && teamSearchQuery === "") { fetchTeams(1, ""); } } }
  const handleBookingCreated = () => { toast.success("Бронирование успешно создано!"); /* TODO: Обновить статистику/список */ };
  const handleTournamentPreviousPage = () => { if (tournamentsCurrentPage > 1) setTournamentsCurrentPage((prev) => prev - 1); }
  const handleTournamentNextPage = () => { if (tournamentsCurrentPage < tournamentsTotalPages) setTournamentsCurrentPage((prev) => prev + 1); }
  const handleTeamPreviousPage = () => { if (teamsCurrentPage > 1) setTeamsCurrentPage((prev) => prev - 1); }
  const handleTeamNextPage = () => { if (teamsCurrentPage < teamsTotalPages) setTeamsCurrentPage((prev) => prev + 1); }
  const handleTournamentSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setTournamentSearchQuery(e.target.value); setTournamentsCurrentPage(1); }, [])
  const handleTeamSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setTeamSearchQuery(e.target.value); setTeamsCurrentPage(1); }, [])
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, [])
  const handleEditTournamentClick = (tournament: Tournament) => { setEditingTournament(tournament); setIsEditTournamentDialogOpen(true); };
  const handleDeleteTournamentClick = (tournamentId: string, tournamentName?: string) => { setItemToDelete({ id: tournamentId, type: 'tournament', name: tournamentName || 'без имени' }); setIsDeleteConfirmationOpen(true); };
  const handleEditTeamClick = (team: Team) => { setEditingTeam(team); setIsEditTeamDialogOpen(true); };
  const handleDeleteTeamClick = (teamId: string, teamName?: string) => { setItemToDelete({ id: teamId, type: 'team', name: teamName || 'без имени' }); setIsDeleteConfirmationOpen(true); };
  const handleMapComputerEdit = (computer: Computer) => { toast.info(`Клик по ${computer.name}`); /* TODO: Открыть инфо/редактирование */ };
  const confirmDeletion = async () => { /* ... код confirmDeletion ... */ };
  const handleGenerateBracket = async (tournamentId: string | null) => { /* ... код handleGenerateBracket ... */ };

  // --- Статистика (пока статичная) ---
  const stats: StatCard[] = [ { title: "Активные бронирования", value: "0", icon: Clock, description: "Загрузка..." }, { title: "Активные клиенты", value: "0", icon: Users, description: "Загрузка..." }, { title: "Выручка сегодня", value: "₸0", icon: BarChart, description: "Загрузка..." }, { title: "Среднее время сессии", value: "- ч", icon: Clock, description: "Нет данных" }, ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Заголовок и Кнопки */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
          <div className="flex gap-2 flex-wrap">
            {/* Убрал кнопку генерации сетки с дашборда, лучше ее разместить на странице турниров */}
            {/* <Button variant="secondary" onClick={() => handleGenerateBracket(tournaments[0]?.id)} ... >Ген. сетки (Тест)</Button> */}
            <Button variant="outline" onClick={() => setCreateTeamDialogOpen(true)}> <Users className="mr-2 h-4 w-4" /> Создать команду </Button>
            <Button onClick={() => setCreateTournamentDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новый турнир </Button>
            <Button onClick={() => setIsCreateBookingDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новое бронирование </Button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground">{stat.description}</p> </CardContent> </Card> ))} </div>

        {/* Вкладки */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>

           {/* Вкладка: Обзор */}
           <TabsContent value="overview" className="space-y-6">
               <div className="grid gap-6 lg:grid-cols-3"> <Card className="lg:col-span-2 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <BarChart className="h-5 w-5 text-primary" /> Выручка </CardTitle> </CardHeader> <CardContent className="min-h-[300px] flex items-center justify-center text-muted-foreground"> (Компонент графика выручки) </CardContent> </Card> <Card className="lg:col-span-1 shadow-sm bg-card"> <CardHeader> <CardTitle className="text-lg font-semibold flex items-center gap-2"> <List className="h-5 w-5 text-primary" /> Последние бронирования </CardTitle> </CardHeader> <CardContent className="min-h-[300px] flex flex-col text-sm p-4"> <div className="flex-grow flex items-center justify-center text-muted-foreground text-center text-xs"> (Компонент <br/> последних бронирований) </div> <Button variant="outline" size="sm" className="w-full mt-4" disabled> Все бронирования </Button> </CardContent> </Card> </div>
           </TabsContent>

           {/* Вкладка: Активные сессии */}
           <TabsContent value="sessions"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><Tv className="h-5 w-5 text-primary"/>Активные сессии</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будет отображаться информация о текущих активных сессиях клиентов.</p> </CardContent> </Card> </TabsContent>

           {/* Вкладка: Аналитика */}
           <TabsContent value="analytics"> <Card> <CardHeader><CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5 text-primary"/>Аналитика</CardTitle></CardHeader> <CardContent> <p className="text-muted-foreground">Здесь будут отображаться различные аналитические отчеты и графики.</p> </CardContent> </Card> </TabsContent>

           {/* Вкладка: Карта клуба */}
           <TabsContent value="map">
             <Card>
               <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary"/>Карта клуба</CardTitle></CardHeader>
               <CardContent>
                 {loadingMap ? (<div className="text-center p-10 text-muted-foreground">Загрузка карты...</div>)
                  : mapComputers.length > 0 ? (<ClubMap computers={mapComputers} onEdit={handleMapComputerEdit} />)
                  : (<div className="text-center p-10 text-muted-foreground">Нет данных о компьютерах для отображения карты.</div>)
                 }
               </CardContent>
             </Card>
           </TabsContent>
        </Tabs>
      </main>

      {/* Модальные окна */}
      {/* Диалоги для ТУРНИРОВ/КОМАНД - возможно, их лучше вызывать со страницы /tournaments ? */}
      <CreateTournamentDialog open={createTournamentDialogOpen} onOpenChange={setCreateTournamentDialogOpen} onTournamentCreated={()=>{/* Refresh logic needed if lists were here */}} />
      <CreateTeamDialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen} onTeamCreated={()=>{/* Refresh logic needed if lists were here */}} />
      <EditTournamentDialog open={isEditTournamentDialogOpen} onOpenChange={setIsEditTournamentDialogOpen} tournament={editingTournament} onTournamentUpdated={() => { setIsEditTournamentDialogOpen(false); /* Refresh... */ }} />
      <EditTeamDialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen} team={editingTeam} onTeamUpdated={() => { setIsEditTeamDialogOpen(false); /* Refresh... */ }} />
      <DeleteConfirmationDialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={confirmDeletion} itemName={itemToDelete?.name} itemType={itemToDelete?.type} loading={deleteLoading} />
      {/* Диалог для БРОНИРОВАНИЯ */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />

    </div>
  )
}
