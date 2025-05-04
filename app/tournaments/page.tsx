// app/tournaments/page.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Trophy, Users, Calendar, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { MainNav } from "@/components/main-nav" // Проверь путь
import { TournamentList } from "./tournament-list" // Проверь путь
import { TournamentCalendar } from "./tournament-calendar" // Проверь путь
import { CreateTournamentDialog } from "./create-tournament-dialog" // Проверь путь
import { CreateTeamDialog } from "./create-team-dialog" // Проверь путь

// --- Раскомментированные импорты ---
import { TeamList } from "./team-list" // Убедись, что путь './team-list' верный
import { EditTournamentDialog } from "./edit-tournament-dialog" // Убедись, что путь './edit-tournament-dialog' верный
import { EditTeamDialog } from "./edit-team-dialog" // Убедись, что путь './edit-team-dialog' верный
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog" // Пример пути, исправь при необходимости
// --- Конец раскомментированных импортов ---


import { supabase } from "@/lib/supabaseClient" // Проверь путь
import { toast } from "sonner"

// --- Интерфейсы (оставляем как есть) ---
interface StatCard {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface Tournament {
  id: string
  name: string
  start_date: string
  end_date: string
  prize: number | null
  participants_count: number | null
  status: "upcoming" | "ongoing" | "finished"
  organizer: string | null
  cover_url: string | null
  bracket_url: string | null
  description: string | null
  created_at: string
}

interface Team {
    id: string;
    name: string;
    logo_url: string | null;
    created_at: string;
}

// --- Компонент страницы ---
export default function TournamentsPage() {
  // --- Состояния (оставляем как есть) ---
  const [activeTab, setActiveTab] = useState<string>("list")
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
  const [itemToDelete, setItemToDelete] = useState<{id: string; type: 'tournament' | 'team', name?: string} | null>(null); // Добавил опциональное имя для диалога
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false); // Отдельное состояние загрузки для удаления


  const ITEMS_PER_PAGE = 15;

  // --- Функции загрузки данных (оставляем как есть) ---
  const fetchTournaments = useCallback(async (page: number, search: string) => {
     setLoadingTournaments(true);
     const start = (page - 1) * ITEMS_PER_PAGE
     const end = start + ITEMS_PER_PAGE - 1
     try {
         let query = supabase.from("tournaments").select("*", { count: "exact" }).order("start_date", { ascending: false }).range(start, end)
         if (search.trim()) { query = query.ilike("name", `%${search.trim()}%`) }
         const { data, error, count } = await query
         if (error) throw error
         setTournaments(data || [])
         setTournamentsTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
     } catch (error: any) {
         console.error("Ошибка загрузки турниров:", error.message)
         toast.error(`Не удалось загрузить турниры: ${error.message}`)
         setTournaments([])
         setTournamentsTotalPages(1)
     } finally {
         setLoadingTournaments(false);
     }
  }, [])

  const fetchTeams = useCallback(async (page: number, search: string) => {
     setLoadingTeams(true);
     const start = (page - 1) * ITEMS_PER_PAGE;
     const end = start + ITEMS_PER_PAGE - 1;
     try {
         let query = supabase.from("teams").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(start, end);
         if (search.trim()) { query = query.ilike("name", `%${search.trim()}%`); }
         const { data, error, count } = await query;
         if (error) throw error;
         setTeams(data || []);
         setTeamsTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
     } catch (error: any) {
         console.error("Ошибка загрузки команд:", error.message);
         toast.error(`Не удалось загрузить команды: ${error.message}`);
         setTeams([]);
         setTeamsTotalPages(1);
     } finally {
         setLoadingTeams(false);
     }
  }, []);

  // --- useEffect для загрузки данных (оставляем как есть) ---
  useEffect(() => {
     if (activeTab === "list") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
     else if (activeTab === "calendar") { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
     else if (activeTab === "teams") { fetchTeams(teamsCurrentPage, teamSearchQuery); }
  }, [ activeTab, tournamentsCurrentPage, tournamentSearchQuery, fetchTournaments, teamsCurrentPage, teamSearchQuery, fetchTeams ]);

  // --- Обработчики событий (оставляем как есть) ---
  const handleTournamentCreated = () => {
      setTournamentsCurrentPage(1); setTournamentSearchQuery(""); fetchTournaments(1, ""); if (activeTab !== 'list') setActiveTab('list');
  }
  const handleTeamCreated = () => {
      setTeamsCurrentPage(1); setTeamSearchQuery(""); fetchTeams(1, ""); if (activeTab !== 'teams') setActiveTab('teams');
  }
  const handleTournamentPreviousPage = () => { if (tournamentsCurrentPage > 1) setTournamentsCurrentPage((prev) => prev - 1); }
  const handleTournamentNextPage = () => { if (tournamentsCurrentPage < tournamentsTotalPages) setTournamentsCurrentPage((prev) => prev + 1); }
  const handleTeamPreviousPage = () => { if (teamsCurrentPage > 1) setTeamsCurrentPage((prev) => prev - 1); }
  const handleTeamNextPage = () => { if (teamsCurrentPage < teamsTotalPages) setTeamsCurrentPage((prev) => prev + 1); }
  const handleTournamentSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const newSearch = e.target.value; setTournamentSearchQuery(newSearch); setTournamentsCurrentPage(1); }, [])
  const handleTeamSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const newSearch = e.target.value; setTeamSearchQuery(newSearch); setTeamsCurrentPage(1); }, [])
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, [])

  // --- Обработчики для Редактирования/Удаления ---
  const handleEditTournamentClick = (tournament: Tournament) => {
      setEditingTournament(tournament);
      setIsEditTournamentDialogOpen(true);
  };
  // В эту функцию передаем и имя, чтобы показать в диалоге подтверждения
  const handleDeleteTournamentClick = (tournamentId: string, tournamentName?: string) => {
      setItemToDelete({ id: tournamentId, type: 'tournament', name: tournamentName || 'без имени' });
      setIsDeleteConfirmationOpen(true);
  };
  const handleEditTeamClick = (team: Team) => {
      setEditingTeam(team);
      setIsEditTeamDialogOpen(true);
  };
   // В эту функцию передаем и имя, чтобы показать в диалоге подтверждения
  const handleDeleteTeamClick = (teamId: string, teamName?: string) => {
      setItemToDelete({ id: teamId, type: 'team', name: teamName || 'без имени' });
      setIsDeleteConfirmationOpen(true);
  };

  // Функция подтверждения удаления
  const confirmDeletion = async () => {
      if (!itemToDelete) return;
      const { id, type } = itemToDelete;
      setDeleteLoading(true); // Используем отдельный лоадер для удаления

      try {
          const tableName = type === 'tournament' ? 'tournaments' : 'teams';
          // Дополнительно: перед удалением турнира можно удалить связанные записи (например, из tournament_teams)
          if (type === 'tournament') {
              const { error: relationError } = await supabase.from('tournament_teams').delete().match({ tournament_id: id });
              if (relationError) console.warn(`Не удалось удалить связи для турнира ${id}:`, relationError.message); // Не блокируем удаление основного, но логируем
          }
          // Удаляем основную запись
          const { error } = await supabase.from(tableName).delete().match({ id });
          if (error) throw error;

          toast.success(`${type === 'tournament' ? 'Турнир' : 'Команда'} успешно удален(а).`);
          // Обновляем список той вкладки, на которой находимся (или обоих)
          if (type === 'tournament') {
              fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery);
          } else {
              fetchTeams(teamsCurrentPage, teamSearchQuery);
          }
      } catch (error: any) {
           toast.error(`Не удалось удалить: ${error.message}`);
      } finally {
          setIsDeleteConfirmationOpen(false);
          setItemToDelete(null);
          setDeleteLoading(false); // Убираем лоадер удаления
      }
  };


  // --- Статистика (оставляем как есть) ---
  const stats: StatCard[] = [ { title: "Идёт турниров", value: `${loadingTournaments ? '...' : tournaments.filter((t) => t.status === "ongoing").length}`, description: "На текущей странице", icon: Trophy, }, /* ... остальные ... */ ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* --- Заголовок и Кнопки --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Управление турнирами</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateTeamDialogOpen(true)}> <Users className="mr-2 h-4 w-4" /> Создать команду </Button>
            <Button onClick={() => setCreateTournamentDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новый турнир </Button>
          </div>
        </div>

        {/* --- Статистика --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground">{stat.description}</p> </CardContent> </Card> ))} </div>

        {/* --- Вкладки --- */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-md shadow-sm max-w-lg">
            <TabsTrigger value="list">Список турниров</TabsTrigger>
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
            <TabsTrigger value="teams">Команды</TabsTrigger>
          </TabsList>

          {/* --- Содержимое вкладок --- */}

          {/* Вкладка: Список турниров */}
          <TabsContent value="list" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1"> <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> <Input type="search" placeholder="Поиск турниров по названию..." className="pl-8 border shadow-sm" value={tournamentSearchQuery} onChange={handleTournamentSearch} disabled={loadingTournaments} /> </div>
            </div>
            {loadingTournaments ? <div className="text-center p-4">Загрузка турниров...</div> : (
                <TournamentList
                    tournaments={tournaments}
                    // --- Раскомментированные пропсы для TournamentList ---
                    onEdit={handleEditTournamentClick}
                    onDelete={handleDeleteTournamentClick} // Передаем обработчик удаления
                    // --- Убедись, что TournamentList их принимает и использует! ---
                />
            )}
            {!loadingTournaments && tournamentsTotalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4"> <Button variant="outline" size="sm" onClick={handleTournamentPreviousPage} disabled={tournamentsCurrentPage === 1}> <ChevronLeft className="h-4 w-4 mr-1" /> Назад </Button> <span className="text-sm text-muted-foreground">Страница {tournamentsCurrentPage} из {tournamentsTotalPages}</span> <Button variant="outline" size="sm" onClick={handleTournamentNextPage} disabled={tournamentsCurrentPage === tournamentsTotalPages}> Вперёд <ChevronRight className="h-4 w-4 ml-1" /> </Button> </div>
            )}
          </TabsContent>

          {/* Вкладка: Календарь */}
          <TabsContent value="calendar" className="space-y-4">
            {loadingTournaments ? <div className="text-center p-4">Загрузка данных...</div> : ( <TournamentCalendar tournaments={tournaments} /> )}
          </TabsContent>

          {/* Вкладка: Команды */}
          <TabsContent value="teams" className="space-y-4">
             <div className="flex items-center gap-2">
                 <div className="relative flex-1"> <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> <Input type="search" placeholder="Поиск команд по названию..." className="pl-8 border shadow-sm" value={teamSearchQuery} onChange={handleTeamSearch} disabled={loadingTeams} /> </div>
             </div>
             {loadingTeams ? <div className="text-center p-4">Загрузка команд...</div> : (
                 // --- Раскомментированный вызов TeamList ---
                 <TeamList
                     teams={teams}
                     onEdit={handleEditTeamClick} // Передаем обработчик редактирования
                     onDelete={handleDeleteTeamClick} // Передаем обработчик удаления
                     loading={loadingTeams} // Можно передать лоадер, если он есть в TeamList
                 />
                 // --- Конец TeamList ---
             )}
             {!loadingTeams && teamsTotalPages > 1 && (
                 <div className="flex justify-center items-center gap-4 mt-4"> <Button variant="outline" size="sm" onClick={handleTeamPreviousPage} disabled={teamsCurrentPage === 1}> <ChevronLeft className="h-4 w-4 mr-1" /> Назад </Button> <span className="text-sm text-muted-foreground">Страница {teamsCurrentPage} из {teamsTotalPages}</span> <Button variant="outline" size="sm" onClick={handleTeamNextPage} disabled={teamsCurrentPage === teamsTotalPages}> Вперёд <ChevronRight className="h-4 w-4 ml-1" /> </Button> </div>
             )}
          </TabsContent>
        </Tabs>
      </main>

      {/* --- Модальные окна --- */}
      <CreateTournamentDialog open={createTournamentDialogOpen} onOpenChange={setCreateTournamentDialogOpen} onTournamentCreated={handleTournamentCreated} />
      <CreateTeamDialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen} onTeamCreated={handleTeamCreated} />

      {/* --- Раскомментированные Диалоги Редактирования/Удаления --- */}
      <EditTournamentDialog
          open={isEditTournamentDialogOpen}
          onOpenChange={setIsEditTournamentDialogOpen}
          tournament={editingTournament}
          onTournamentUpdated={() => {
              setIsEditTournamentDialogOpen(false);
              fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); // Обновляем список турниров
          }}
      />
      <EditTeamDialog
          open={isEditTeamDialogOpen}
          onOpenChange={setIsEditTeamDialogOpen}
          team={editingTeam}
          onTeamUpdated={() => {
              setIsEditTeamDialogOpen(false);
              fetchTeams(teamsCurrentPage, teamSearchQuery); // Обновляем список команд
          }}
      />
      <DeleteConfirmationDialog
          open={isDeleteConfirmationOpen}
          onOpenChange={setIsDeleteConfirmationOpen}
          onConfirm={confirmDeletion}
          itemName={itemToDelete?.name} // Передаем имя элемента
          itemType={itemToDelete?.type === 'tournament' ? 'турнир' : 'команду'} // Передаем тип элемента
          loading={deleteLoading} // Передаем состояние загрузки удаления
      />
      {/* --- Конец раскомментированных диалогов --- */}

    </div>
  )
}
