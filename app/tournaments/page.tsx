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
import { Plus, Search, Trophy, Users, Calendar, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react" // Добавлены иконки Edit, Trash2
import { MainNav } from "@/components/main-nav"
import { TournamentList } from "./tournament-list"
import { TournamentCalendar } from "./tournament-calendar"
import { CreateTournamentDialog } from "./create-tournament-dialog"
import { CreateTeamDialog } from "./create-team-dialog"
// Импорты для будущих компонентов (сейчас будут ошибками, пока файлы не созданы)
// import { TeamList } from "./team-list"
// import { EditTournamentDialog } from "./edit-tournament-dialog"
// import { EditTeamDialog } from "./edit-team-dialog"
// import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog" // Пример компонента подтверждения

import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

// --- Интерфейсы ---
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
  prize: number | null // Разрешим null
  participants_count: number | null // Разрешим null
  status: "upcoming" | "ongoing" | "finished"
  organizer: string | null
  cover_url: string | null
  bracket_url: string | null
  description: string | null
  created_at: string
}

// Добавляем интерфейс для Команды
interface Team {
    id: string;
    name: string;
    logo_url: string | null;
    created_at: string;
    // Добавь другие поля, если они есть в таблице teams
}

// --- Компонент страницы ---
export default function TournamentsPage() {
  // --- Состояния ---
  const [activeTab, setActiveTab] = useState<string>("list") // 'list', 'calendar', 'teams'

  // Состояния для турниров
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [tournamentSearchQuery, setTournamentSearchQuery] = useState<string>("")
  const [tournamentsCurrentPage, setTournamentsCurrentPage] = useState(1)
  const [tournamentsTotalPages, setTournamentsTotalPages] = useState(1)
  const [loadingTournaments, setLoadingTournaments] = useState(false);

  // Состояния для команд (НОВОЕ)
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>("");
  const [teamsCurrentPage, setTeamsCurrentPage] = useState(1);
  const [teamsTotalPages, setTeamsTotalPages] = useState(1);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Состояния для модальных окон
  const [createTournamentDialogOpen, setCreateTournamentDialogOpen] = useState(false)
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false)

  // Состояния для редактирования/удаления (ЗАГОТОВКИ)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [isEditTournamentDialogOpen, setIsEditTournamentDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string; type: 'tournament' | 'team'} | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);


  const ITEMS_PER_PAGE = 15; // Вынесем в константу

  // --- Функции загрузки данных ---

  // Загрузка ТУРНИРОВ
  const fetchTournaments = useCallback(async (page: number, search: string) => {
    setLoadingTournaments(true);
    const start = (page - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE - 1

    try {
        let query = supabase
          .from("tournaments")
          .select("*", { count: "exact" })
          .order("start_date", { ascending: false }) // Сортировка по убыванию даты начала
          .range(start, end)

        if (search.trim()) {
          query = query.ilike("name", `%${search.trim()}%`)
        }

        const { data, error, count } = await query
        if (error) throw error

        setTournaments(data || [])
        setTournamentsTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error: any) {
        console.error("Ошибка загрузки турниров:", error.message)
        toast.error(`Не удалось загрузить турниры: ${error.message}`) // Убрана обсценная лексика
        setTournaments([])
        setTournamentsTotalPages(1)
        // Не сбрасываем страницу здесь, чтобы пользователь не терял контекст
    } finally {
        setLoadingTournaments(false);
    }
  }, []) // Зависимости не нужны, если search передается как аргумент

  // Загрузка КОМАНД (НОВОЕ)
  const fetchTeams = useCallback(async (page: number, search: string) => {
    setLoadingTeams(true);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    try {
        let query = supabase
            .from("teams") // Запрашиваем из таблицы 'teams'
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false }) // Сортируем по дате создания
            .range(start, end);

        if (search.trim()) {
            query = query.ilike("name", `%${search.trim()}%`);
        }

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


  // --- useEffect для загрузки данных при смене вкладок или пагинации/поиске ---
  useEffect(() => {
    if (activeTab === "list") {
      fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery);
    } else if (activeTab === "calendar") {
      // Календарю нужны все турниры или за диапазон? Пока грузим как для списка.
      // Возможно, понадобится отдельная логика fetch для календаря без пагинации.
      fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery);
    } else if (activeTab === "teams") {
      fetchTeams(teamsCurrentPage, teamSearchQuery);
    }
  }, [
      activeTab,
      tournamentsCurrentPage, tournamentSearchQuery, fetchTournaments,
      teamsCurrentPage, teamSearchQuery, fetchTeams
  ]);


  // --- Обработчики событий ---

  // После создания турнира
  const handleTournamentCreated = () => {
      setTournamentsCurrentPage(1); // Переходим на первую страницу
      setTournamentSearchQuery(""); // Сбрасываем поиск
      fetchTournaments(1, ""); // Загружаем первую страницу
      if (activeTab !== 'list') setActiveTab('list'); // Переключаемся на вкладку списка
  }

  // После создания команды (НОВОЕ)
  const handleTeamCreated = () => {
      setTeamsCurrentPage(1);
      setTeamSearchQuery("");
      fetchTeams(1, "");
      if (activeTab !== 'teams') setActiveTab('teams');
  }

  // Пагинация Турниров
  const handleTournamentPreviousPage = () => {
    if (tournamentsCurrentPage > 1) setTournamentsCurrentPage((prev) => prev - 1);
  }
  const handleTournamentNextPage = () => {
    if (tournamentsCurrentPage < tournamentsTotalPages) setTournamentsCurrentPage((prev) => prev + 1);
  }

  // Пагинация Команд (НОВОЕ)
  const handleTeamPreviousPage = () => {
    if (teamsCurrentPage > 1) setTeamsCurrentPage((prev) => prev - 1);
  }
  const handleTeamNextPage = () => {
    if (teamsCurrentPage < teamsTotalPages) setTeamsCurrentPage((prev) => prev + 1);
  }

  // Поиск Турниров
  const handleTournamentSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setTournamentSearchQuery(newSearch);
    setTournamentsCurrentPage(1);
    // Загрузка запустится через useEffect
  }, [])

  // Поиск Команд (НОВОЕ)
  const handleTeamSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setTeamSearchQuery(newSearch);
    setTeamsCurrentPage(1);
     // Загрузка запустится через useEffect
  }, [])

  // Смена вкладок
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    // Сбрасываем пагинацию и поиск для неактивных вкладок при переключении
    if (value !== 'list') {
        // setTournamentsCurrentPage(1);
        // setTournamentSearchQuery("");
    }
    if (value !== 'teams') {
        // setTeamsCurrentPage(1);
        // setTeamSearchQuery("");
    }
    // Загрузка данных для новой вкладки произойдет через useEffect
  }, [])

  // --- Обработчики для Редактирования/Удаления (ЗАГЛУШКИ) ---

  const handleEditTournamentClick = (tournament: Tournament) => {
      console.log("Редактировать турнир:", tournament);
      setEditingTournament(tournament);
      setIsEditTournamentDialogOpen(true);
      // Откроется EditTournamentDialog (когда он будет создан)
  };

  const handleDeleteTournamentClick = (tournamentId: string) => {
      console.log("Удалить турнир ID:", tournamentId);
      setItemToDelete({ id: tournamentId, type: 'tournament' });
      setIsDeleteConfirmationOpen(true);
      // Откроется DeleteConfirmationDialog (когда он будет создан)
  };

  const handleEditTeamClick = (team: Team) => {
      console.log("Редактировать команду:", team);
      setEditingTeam(team);
      setIsEditTeamDialogOpen(true);
      // Откроется EditTeamDialog (когда он будет создан)
  };

  const handleDeleteTeamClick = (teamId: string) => {
      console.log("Удалить команду ID:", teamId);
      setItemToDelete({ id: teamId, type: 'team' });
      setIsDeleteConfirmationOpen(true);
      // Откроется DeleteConfirmationDialog (когда он будет создан)
  };

  // Функция, вызываемая после подтверждения удаления
  const confirmDeletion = async () => {
      if (!itemToDelete) return;
      const { id, type } = itemToDelete;
      setLoadingTournaments(type === 'tournament'); // Показываем загрузку в соответствующей вкладке
      setLoadingTeams(type === 'team');

      try {
          const tableName = type === 'tournament' ? 'tournaments' : 'teams';
          const { error } = await supabase.from(tableName).delete().match({ id });
          if (error) throw error;

          toast.success(`${type === 'tournament' ? 'Турнир' : 'Команда'} успешно удален(а).`);
          // Обновляем соответствующий список
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
          setLoadingTournaments(false);
          setLoadingTeams(false);
      }
  };


  // --- Статистика (остается как есть, но зависит от загруженных турниров) ---
  const stats: StatCard[] = [
    // ... определения карточек статистики (можно добавить индикацию загрузки) ...
    // Пример с индикацией:
     {
      title: "Идёт турниров",
      value: `${loadingTournaments ? '...' : tournaments.filter((t) => t.status === "ongoing").length}`,
      description: "На текущей странице", // Уточнено
      icon: Trophy,
    },
    // ... остальные карточки аналогично ...
  ]

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* --- Заголовок и Кнопки --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Управление турнирами</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateTeamDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" /> Создать команду
            </Button>
            <Button onClick={() => setCreateTournamentDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Новый турнир
            </Button>
          </div>
        </div>

        {/* --- Статистика --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-sm">
              {/* ... содержимое карточки ... */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- Вкладки --- */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          {/* Список вкладок */}
          <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-md shadow-sm max-w-lg"> {/* Изменено на grid-cols-3 и max-w-lg */}
            <TabsTrigger value="list">Список турниров</TabsTrigger>
            <TabsTrigger value="calendar">Календарь</TabsTrigger>
            <TabsTrigger value="teams">Команды</TabsTrigger> {/* НОВАЯ ВКЛАДКА */}
          </TabsList>

          {/* --- Содержимое вкладок --- */}

          {/* Вкладка: Список турниров */}
          <TabsContent value="list" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск турниров по названию..."
                  className="pl-8 border shadow-sm"
                  value={tournamentSearchQuery}
                  onChange={handleTournamentSearch}
                  disabled={loadingTournaments}
                />
              </div>
              {/* <Button variant="outline" className="shadow-sm" disabled>Фильтры</Button> */}
            </div>
            {/* Список турниров */}
            {loadingTournaments ? <div className="text-center p-4">Загрузка турниров...</div> : (
                <TournamentList
                    tournaments={tournaments}
                    // Передаем обработчики (когда TournamentList будет их принимать)
                    // onEdit={handleEditTournamentClick}
                    // onDelete={handleDeleteTournamentClick}
                />
            )}
            {/* Пагинация турниров */}
            {!loadingTournaments && tournamentsTotalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <Button variant="outline" size="sm" onClick={handleTournamentPreviousPage} disabled={tournamentsCurrentPage === 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Назад
                </Button>
                <span className="text-sm text-muted-foreground">Страница {tournamentsCurrentPage} из {tournamentsTotalPages}</span>
                <Button variant="outline" size="sm" onClick={handleTournamentNextPage} disabled={tournamentsCurrentPage === tournamentsTotalPages}>
                    Вперёд <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Вкладка: Календарь */}
          <TabsContent value="calendar" className="space-y-4">
            {loadingTournaments ? <div className="text-center p-4">Загрузка данных...</div> : (
                <TournamentCalendar tournaments={tournaments} /> // Передаем турниры, загруженные для списка
            )}
          </TabsContent>

          {/* Вкладка: Команды (НОВАЯ) */}
          <TabsContent value="teams" className="space-y-4">
             <div className="flex items-center gap-2">
                 <div className="relative flex-1">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input
                         type="search"
                         placeholder="Поиск команд по названию..."
                         className="pl-8 border shadow-sm"
                         value={teamSearchQuery}
                         onChange={handleTeamSearch}
                         disabled={loadingTeams}
                     />
                 </div>
                 {/* <Button variant="outline" className="shadow-sm" disabled>Фильтры</Button> */}
             </div>
             {/* Список команд (ЗАГЛУШКА) */}
             {loadingTeams ? <div className="text-center p-4">Загрузка команд...</div> : (
                 <div className="border rounded-md p-4 min-h-[200px]">
                     <h3 className="font-semibold mb-2">Список Команд (TeamList Placeholder)</h3>
                     {teams.length > 0 ? (
                         <ul>
                             {teams.map(team => (
                                 <li key={team.id} className="flex justify-between items-center p-2 border-b">
                                     <div>
                                        {team.logo_url && <img src={team.logo_url} alt={team.name} className="h-6 w-6 inline mr-2 rounded-full object-cover" />}
                                        {team.name}
                                     </div>
                                     <div className="flex gap-2">
                                        {/* Заглушки кнопок */}
                                        <Button variant="ghost" size="icon" onClick={() => handleEditTeamClick(team)} title="Редактировать">
                                           <Edit className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteTeamClick(team.id)} title="Удалить">
                                           <Trash2 className="h-4 w-4" />
                                        </Button>
                                     </div>
                                 </li>
                             ))}
                         </ul>
                     ) : (
                         <p className="text-muted-foreground">Команды не найдены.</p>
                     )}
                     {/* Здесь нужно будет вставить реальный компонент <TeamList teams={teams} onEdit={handleEditTeamClick} onDelete={handleDeleteTeamClick} /> */}
                 </div>
             )}
             {/* Пагинация команд */}
             {!loadingTeams && teamsTotalPages > 1 && (
                 <div className="flex justify-center items-center gap-4 mt-4">
                     <Button variant="outline" size="sm" onClick={handleTeamPreviousPage} disabled={teamsCurrentPage === 1}>
                         <ChevronLeft className="h-4 w-4 mr-1" /> Назад
                     </Button>
                     <span className="text-sm text-muted-foreground">Страница {teamsCurrentPage} из {teamsTotalPages}</span>
                     <Button variant="outline" size="sm" onClick={handleTeamNextPage} disabled={teamsCurrentPage === teamsTotalPages}>
                         Вперёд <ChevronRight className="h-4 w-4 ml-1" />
                     </Button>
                 </div>
             )}
          </TabsContent>

        </Tabs>
      </main>

      {/* --- Модальные окна --- */}
      <CreateTournamentDialog
        open={createTournamentDialogOpen}
        onOpenChange={setCreateTournamentDialogOpen}
        onTournamentCreated={handleTournamentCreated}
      />
      <CreateTeamDialog
        open={createTeamDialogOpen}
        onOpenChange={setCreateTeamDialogOpen}
        onTeamCreated={handleTeamCreated}
      />

      {/* Диалоги для редактирования (ЗАГЛУШКИ) */}
      {/* Нужно будет создать эти компоненты */}
      {/*
      <EditTournamentDialog
          open={isEditTournamentDialogOpen}
          onOpenChange={setIsEditTournamentDialogOpen}
          tournament={editingTournament}
          onTournamentUpdated={() => {
              setIsEditTournamentDialogOpen(false);
              fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); // Обновляем список
          }}
      />

      <EditTeamDialog
          open={isEditTeamDialogOpen}
          onOpenChange={setIsEditTeamDialogOpen}
          team={editingTeam}
          onTeamUpdated={() => {
              setIsEditTeamDialogOpen(false);
              fetchTeams(teamsCurrentPage, teamSearchQuery); // Обновляем список
          }}
      />
      */}

      {/* Диалог подтверждения удаления (ЗАГЛУШКА) */}
      {/* Нужно будет создать компонент DeleteConfirmationDialog */}
      {/*
       <DeleteConfirmationDialog
           open={isDeleteConfirmationOpen}
           onOpenChange={setIsDeleteConfirmationOpen}
           onConfirm={confirmDeletion}
           itemType={itemToDelete?.type} // 'tournament' или 'team'
       />
      */}


    </div> // Закрывающий div для <div className="flex min-h-screen...">
  )
}
