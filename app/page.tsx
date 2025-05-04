// app/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Trophy, Users, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Cog, Loader2, BarChart, Clock, List, Tv, LineChart, Map } from "lucide-react"; // Иконки
import { MainNav } from "@/components/main-nav";
import { TournamentList } from "./tournament-list";
import { TournamentCalendar } from "./tournament-calendar";
import { CreateTournamentDialog } from "./create-tournament-dialog";
import { CreateTeamDialog } from "./create-team-dialog";
import { TeamList } from "./team-list";
import { EditTournamentDialog } from "./edit-tournament-dialog";
import { EditTeamDialog } from "./edit-team-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // Пример пути
// --- ДОБАВЛЯЕМ ИМПОРТ ClubMap ---
import { ClubMap } from "@/components/dashboard/club-map"; // <-- ИЗМЕНИ ПУТЬ, если он другой!

import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- Интерфейсы ---
interface StatCard { /* ... */ }
interface Tournament { /* ... */ }
interface Team { /* ... */ }
interface Match { /* ... */ }

// --- ИНТЕРФЕЙС ДЛЯ КОМПЬЮТЕРА (как ожидает ClubMap.tsx) ---
interface Computer {
  id: string;
  name: string;
  type: "PC" | "PlayStation"; // Типы из БД
  status: "available" | "occupied"; // Статусы, ожидаемые компонентом
  zone: string; // Название зоны (ожидается компонентом)
  position_x: number;
  position_y: number;
  timeLeft?: string; // Для будущих улучшений
  customer?: string; // Для будущих улучшений
  created_at: string;
}


// --- Компонент страницы ---
export default function DashboardPage() {
  // --- Состояния ---
  const [activeTab, setActiveTab] = useState<string>("overview"); // Начинаем с Обзора
  // ... состояния для турниров, команд, диалогов ...
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [tournamentSearchQuery, setTournamentSearchQuery] = useState<string>("")
  const [tournamentsCurrentPage, setTournamentsCurrentPage] = useState(1)
  const [tournamentsTotalPages, setTournamentsTotalPages] = useState(1)
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>("");
  const [teamsCurrentPage, setTeamsCurrentPage] = useState(1);
  const [teamsTotalPages, setTeamsTotalPages] = useState(1);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [createTournamentDialogOpen, setCreateTournamentDialogOpen] = useState(false)
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [isEditTournamentDialogOpen, setIsEditTournamentDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string; type: 'tournament' | 'team', name?: string} | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [generatingBracket, setGeneratingBracket] = useState(false);
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);

  // --- ДОБАВЛЕНО: Состояния для карты клуба ---
  const [mapComputers, setMapComputers] = useState<Computer[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  // -------------------------------------------

  const ITEMS_PER_PAGE = 15;

  // --- Функции загрузки данных ---
  const fetchTournaments = useCallback(async (page: number, search: string) => { /* ... */ }, [ITEMS_PER_PAGE]);
  const fetchTeams = useCallback(async (page: number, search: string) => { /* ... */ }, [ITEMS_PER_PAGE]);

  // --- ДОБАВЛЕНО: Функция загрузки данных для карты ---
  const fetchMapData = useCallback(async () => {
    console.log("Загрузка данных для карты клуба..."); // DEBUG
    setLoadingMap(true);
    try {
      // Запрос к Supabase: выбираем компьютеры и ПОДГРУЖАЕМ связанное имя зоны
      // Важно: Наличие связи Foreign Key между computers.zone_id и zones.id обязательно!
      const { data, error } = await supabase
        .from('computers')
        .select(`
          id,
          name,
          type,
          status,
          position_x,
          position_y,
          created_at,
          zones ( name )
        `); // Предполагается, что таблица зон называется 'zones' и колонка с именем 'name'

      if (error) throw error;

      // Обработка полученных данных
      const processedData: Computer[] = (data || []).map((comp: any) => ({
        ...comp,
        // Извлекаем имя зоны. Приводим к нижнему регистру для надежности сравнения.
        // Если связи нет или имя null, ставим 'unknown'
        zone: comp.zones?.name?.toLowerCase() ?? 'unknown',
        // Преобразуем статус из БД ('free') в ожидаемый компонентом ('available')
        status: comp.status === 'free' ? 'available' : 'occupied',
        // Пока не добавляем timeLeft и customer
      }));

      console.log("Данные для карты обработаны:", processedData.length); // DEBUG
      setMapComputers(processedData);

    } catch (error: any) {
        console.error("Ошибка загрузки данных карты:", error.message);
        toast.error(`Не удалось загрузить данные карты: ${error.message}`);
        setMapComputers([]); // Очищаем в случае ошибки
    } finally {
        setLoadingMap(false);
    }
  }, []);
  // ---------------------------------------------

  // --- useEffect для загрузки данных ---
  useEffect(() => {
    console.log(`useEffect сработал: tab=${activeTab}`); // Упрощенный лог

    // Загружаем данные в зависимости от активной вкладки
    if (activeTab === "list") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
    else if (activeTab === "calendar") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
    else if (activeTab === "teams") { fetchTeams(teamsCurrentPage, teamSearchQuery); }
    // --- ДОБАВЛЕНО: Загрузка данных для карты ---
    else if (activeTab === "map") { fetchMapData(); }
    // ------------------------------------------

  }, [
      activeTab,
      tournamentsCurrentPage, tournamentSearchQuery, fetchTournaments,
      teamsCurrentPage, teamSearchQuery, fetchTeams,
      fetchMapData // Добавляем fetchMapData в зависимости
  ]);

  // --- Обработчики событий ---
  const handleTournamentCreated = () => { /* ... */ };
  const handleTeamCreated = () => { /* ... */ };
  const handleBookingCreated = () => { /* ... */ }; // Добавлен ранее
  // ... остальные обработчики ...
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleEditTournamentClick = (tournament: Tournament) => { /* ... */ };
  const handleDeleteTournamentClick = (tournamentId: string, tournamentName?: string) => { /* ... */ };
  const handleEditTeamClick = (team: Team) => { /* ... */ };
  const handleDeleteTeamClick = (teamId: string, teamName?: string) => { /* ... */ };
  const confirmDeletion = async () => { /* ... */ };
  const handleGenerateBracket = async (tournamentId: string | null) => { /* ... */ };

  // --- ДОБАВЛЕНО: Обработчик для клика по компьютеру на карте (если нужен) ---
  const handleMapComputerEdit = (computer: Computer) => {
      console.log("Клик по компьютеру на карте:", computer);
      // TODO: Открыть диалог редактирования компьютера или показать информацию о нем
      toast.info(`Кликнули на ${computer.name}`);
  }
  // ----------------------------------------------------------------------

  // --- Статистика ---
  const stats: StatCard[] = [ /* ... */ ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* ... Заголовок и Кнопки ... */}
         <div className="flex flex-wrap items-center justify-between gap-4"> <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2> <div className="flex gap-2 flex-wrap"> <Button variant="secondary" onClick={() => handleGenerateBracket(tournaments[0]?.id)} disabled={generatingBracket || tournaments.length === 0 || loadingTournaments} title="Сгенерировать сетку для первого турнира в списке (перезапишет существующую!)"> {generatingBracket ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cog className="mr-2 h-4 w-4" />} Ген. сетки (Тест) </Button> <Button variant="outline" onClick={() => setCreateTeamDialogOpen(true)}> <Users className="mr-2 h-4 w-4" /> Создать команду </Button> <Button onClick={() => setCreateTournamentDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новый турнир </Button> <Button onClick={() => setIsCreateBookingDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новое бронирование </Button> </div> </div>
        {/* ... Статистика ... */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm bg-card"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground">{stat.description}</p> </CardContent> </Card> ))} </div>

        {/* --- Вкладки --- */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="bg-card p-1 rounded-lg shadow-sm inline-flex flex-wrap h-auto"> <TabsTrigger value="overview">Обзор</TabsTrigger> <TabsTrigger value="sessions">Активные сессии</TabsTrigger> <TabsTrigger value="analytics">Аналитика</TabsTrigger> <TabsTrigger value="map">Карта клуба</TabsTrigger> </TabsList>

           {/* ... Содержимое вкладок Обзор, Сессии, Аналитика ... */}
           <TabsContent value="overview" className="space-y-6"> {/* ... */} </TabsContent>
           <TabsContent value="sessions"> {/* ... */} </TabsContent>
           <TabsContent value="analytics"> {/* ... */} </TabsContent>

           {/* === ДОБАВЛЕНО: Содержимое вкладки "Карта клуба" === */}
           <TabsContent value="map">
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary"/>
                    Карта клуба
                </CardTitle>
              </CardHeader>
              <CardContent>
                 {/* Отображаем сам компонент карты */}
                 {loadingMap ? (
                     <div className="text-center p-10 text-muted-foreground">Загрузка карты...</div>
                 ) : (
                     <ClubMap
                         computers={mapComputers}
                         // setComputers={setMapComputers} // Передаем, если нужна интерактивность на карте
                         onEdit={handleMapComputerEdit} // Передаем обработчик клика/редактирования
                     />
                 )}
              </CardContent>
            </Card>
           </TabsContent>
           {/* === КОНЕЦ ВКЛАДКИ "Карта клуба" === */}

        </Tabs>
      </main>

      {/* Модальные окна */}
      <CreateTournamentDialog open={createTournamentDialogOpen} onOpenChange={setCreateTournamentDialogOpen} onTournamentCreated={handleTournamentCreated} />
      <CreateTeamDialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen} onTeamCreated={handleTeamCreated} />
      <EditTournamentDialog open={isEditTournamentDialogOpen} onOpenChange={setIsEditTournamentDialogOpen} tournament={editingTournament} onTournamentUpdated={() => { setIsEditTournamentDialogOpen(false); fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }} />
      <EditTeamDialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen} team={editingTeam} onTeamUpdated={() => { setIsEditTeamDialogOpen(false); fetchTeams(teamsCurrentPage, teamSearchQuery); }} />
      <DeleteConfirmationDialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={confirmDeletion} itemName={itemToDelete?.name} itemType={itemToDelete?.type === 'tournament' ? 'турнир' : 'команду'} loading={deleteLoading} />
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />

    </div>
  )
}
