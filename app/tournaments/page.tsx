// app/tournaments/page.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Trophy, Users, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Cog, Loader2 } from "lucide-react"
import { MainNav } from "@/components/main-nav" // Проверь путь
import { TournamentList } from "./tournament-list" // Проверь путь
import { TournamentCalendar } from "./tournament-calendar" // Проверь путь
import { CreateTournamentDialog } from "./create-tournament-dialog" // Проверь путь
import { CreateTeamDialog } from "./create-team-dialog" // Проверь путь
import { TeamList } from "./team-list" // Проверь путь
import { EditTournamentDialog } from "./edit-tournament-dialog" // Проверь путь
import { EditTeamDialog } from "./edit-team-dialog" // Проверь путь
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"; // Проверь путь

import { supabase } from "@/lib/supabaseClient" // Проверь путь
import { toast } from "sonner"

// --- Интерфейсы ---
interface StatCard { title: string; value: string; description: string; icon: React.ComponentType<{ className?: string }> }
interface Tournament { id: string; name: string; start_date: string; end_date: string; prize: number | null; participants_count: number | null; status: "upcoming" | "ongoing" | "finished"; organizer: string | null; cover_url: string | null; bracket_url: string | null; description: string | null; created_at: string; }
interface Team { id: string; name: string; logo_url: string | null; created_at: string; }
interface Match { id: string; tournament_id: string; round_number: number; match_in_round: number; participant1_id: string | null; participant2_id: string | null; score1: number | null; score2: number | null; winner_id: string | null; status: 'PENDING_PARTICIPANTS' | 'READY' | 'ONGOING' | 'FINISHED' | 'BYE'; next_match_id: string | null; details?: any; }


// --- Компонент страницы ---
export default function TournamentsPage() {
  // --- Состояния ---
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
  const [itemToDelete, setItemToDelete] = useState<{id: string; type: 'tournament' | 'team', name?: string} | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [generatingBracket, setGeneratingBracket] = useState(false);

  const ITEMS_PER_PAGE = 15;

  // --- Функции загрузки данных (с console.log для отладки) ---
  const fetchTournaments = useCallback(async (page: number, search: string) => {
    console.log(`WorkspaceTournaments вызван: page=${page}, search="${search}"`); // DEBUG
    setLoadingTournaments(true);
    const start = (page - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE - 1
    try {
        let query = supabase.from("tournaments").select("*", { count: "exact" }).order("start_date", { ascending: false }).range(start, end)
        if (search.trim()) { query = query.ilike("name", `%${search.trim()}%`) }
        const { data, error, count } = await query
        console.log("fetchTournaments данные получены:", data); // DEBUG
        if (error) throw error
        setTournaments(data || [])
        setTournamentsTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error: any) {
        console.error("fetchTournaments Ошибка:", error.message) // DEBUG
        toast.error(`Не удалось загрузить турниры: ${error.message}`)
        setTournaments([])
        setTournamentsTotalPages(1)
    } finally {
        setLoadingTournaments(false);
    }
  }, [ITEMS_PER_PAGE]); // Убрали search из зависимостей, т.к. он передается аргументом

  const fetchTeams = useCallback(async (page: number, search: string) => {
    console.log(`WorkspaceTeams вызван: page=${page}, search="${search}"`); // DEBUG
    setLoadingTeams(true);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;
    try {
        let query = supabase.from("teams").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(start, end);
        if (search.trim()) { query = query.ilike("name", `%${search.trim()}%`); }
        const { data, error, count } = await query;
        console.log("fetchTeams данные получены:", data); // DEBUG
        if (error) throw error;
        setTeams(data || []);
        setTeamsTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error: any) {
        console.error("fetchTeams Ошибка:", error.message); // DEBUG
        toast.error(`Не удалось загрузить команды: ${error.message}`);
        setTeams([]);
        setTeamsTotalPages(1);
    } finally {
        setLoadingTeams(false);
    }
  }, [ITEMS_PER_PAGE]); // Убрали search из зависимостей


  // --- useEffect для загрузки данных (с console.log) ---
  useEffect(() => {
    console.log(
        `useEffect [activeTab, pages, searches]: ` +
        `tab=${activeTab}, tPage=${tournamentsCurrentPage}, tSearch=${tournamentSearchQuery}, ` +
        `tmPage=${teamsCurrentPage}, tmSearch=${teamSearchQuery}`
    ); // DEBUG

    if (activeTab === "list") {
      fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery);
    } else if (activeTab === "calendar") {
      fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); // Календарь пока использует те же данные
    } else if (activeTab === "teams") {
      fetchTeams(teamsCurrentPage, teamSearchQuery);
    }
  }, [ activeTab, tournamentsCurrentPage, tournamentSearchQuery, fetchTournaments, teamsCurrentPage, teamSearchQuery, fetchTeams ]);


  // --- Обработчики событий (с console.log) ---
  // Используем вариант, где обновляется только стейт, а useEffect вызывает fetch
   const handleTournamentCreated = () => {
      console.log("handleTournamentCreated: Обновляем состояние..."); // DEBUG
      setTournamentSearchQuery("");
      setTournamentsCurrentPage(1);
      if (activeTab !== 'list') { setActiveTab('list'); }
  }

  const handleTeamCreated = () => {
      console.log("handleTeamCreated: Обновляем состояние..."); // DEBUG
      setTeamSearchQuery("");
      setTeamsCurrentPage(1);
      if (activeTab !== 'teams') { setActiveTab('teams'); }
  }

  const handleTournamentPreviousPage = () => { if (tournamentsCurrentPage > 1) setTournamentsCurrentPage((prev) => prev - 1); }
  const handleTournamentNextPage = () => { if (tournamentsCurrentPage < tournamentsTotalPages) setTournamentsCurrentPage((prev) => prev + 1); }
  const handleTeamPreviousPage = () => { if (teamsCurrentPage > 1) setTeamsCurrentPage((prev) => prev - 1); }
  const handleTeamNextPage = () => { if (teamsCurrentPage < teamsTotalPages) setTeamsCurrentPage((prev) => prev + 1); }
  const handleTournamentSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setTournamentSearchQuery(e.target.value); setTournamentsCurrentPage(1); }, [])
  const handleTeamSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setTeamSearchQuery(e.target.value); setTeamsCurrentPage(1); }, [])
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, [])

  // Обработчики Edit/Delete
  const handleEditTournamentClick = (tournament: Tournament) => { setEditingTournament(tournament); setIsEditTournamentDialogOpen(true); };
  const handleDeleteTournamentClick = (tournamentId: string, tournamentName?: string) => { setItemToDelete({ id: tournamentId, type: 'tournament', name: tournamentName || 'без имени' }); setIsDeleteConfirmationOpen(true); };
  const handleEditTeamClick = (team: Team) => { setEditingTeam(team); setIsEditTeamDialogOpen(true); };
  const handleDeleteTeamClick = (teamId: string, teamName?: string) => { setItemToDelete({ id: teamId, type: 'team', name: teamName || 'без имени' }); setIsDeleteConfirmationOpen(true); };

  // Функция подтверждения удаления
  const confirmDeletion = async () => {
      if (!itemToDelete) return;
      const { id, type } = itemToDelete;
      setDeleteLoading(true);
      try {
          const tableName = type === 'tournament' ? 'tournaments' : 'teams';
          if (type === 'tournament') {
              const { error: relationError } = await supabase.from('tournament_teams').delete().match({ tournament_id: id });
              if (relationError) console.warn(`Не удалось удалить связи для турнира ${id}:`, relationError.message);
              const { error: matchesError } = await supabase.from('matches').delete().match({ tournament_id: id }); // Удаляем и матчи
              if (matchesError) console.warn(`Не удалось удалить матчи для турнира ${id}:`, matchesError.message);
          }
          const { error } = await supabase.from(tableName).delete().match({ id });
          if (error) throw error;
          toast.success(`${type === 'tournament' ? 'Турнир' : 'Команда'} успешно удален(а).`);
          if (type === 'tournament') { fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }
          else { fetchTeams(teamsCurrentPage, teamSearchQuery); }
      } catch (error: any) { toast.error(`Не удалось удалить: ${error.message}`); }
      finally { setIsDeleteConfirmationOpen(false); setItemToDelete(null); setDeleteLoading(false); }
  };


  // --- Функция Генерации Сетки (с исправленной ошибкой) ---
  const handleGenerateBracket = async (tournamentId: string | null) => {
    if (!tournamentId) { toast.error("Не выбран турнир для генерации сетки."); return; }
    setGeneratingBracket(true);
    toast.info("Начинаем генерацию сетки...");
    console.log(`Генерация сетки для турнира ${tournamentId}`); // DEBUG

    try {
      // Шаг 1: Получаем команды
      const { data: registrations, error: regError } = await supabase.from('tournament_teams').select('team_id').eq('tournament_id', tournamentId);
      if (regError) throw new Error(`Ошибка получения регистраций: ${regError.message}`);
      if (!registrations || registrations.length < 2) throw new Error("Недостаточно команд (минимум 2).");
      const teamIds = registrations.map(r => r.team_id);
      const { data: teamsData, error: teamsError } = await supabase.from('teams').select('id, name').in('id', teamIds);
      if (teamsError) throw new Error(`Ошибка получения данных команд: ${teamsError.message}`);
      if (!teamsData) throw new Error("Не найдены данные команд.");
      let participants: (Team | null)[] = teamsData as Team[];
      console.log("Участники:", participants); // DEBUG

      // Шаг 2: Размер сетки и byes
      const numParticipants = participants.length;
      let bracketSize = 2; let numRounds = 1;
      while (bracketSize < numParticipants) { bracketSize *= 2; numRounds++; }
      const numByes = bracketSize - numParticipants;
      console.log(`Размер сетки: ${bracketSize}, Раундов: ${numRounds}, Byes: ${numByes}`); // DEBUG

      // Шаг 3: Добавляем byes и перемешиваем
      for (let i = 0; i < numByes; i++) { participants.push(null); }
      for (let i = participants.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [participants[i], participants[j]] = [participants[j], participants[i]]; }
      console.log("Участники после перемешивания и byes:", participants); // DEBUG

      // Шаг 4: Удаляем старую сетку
      console.log("Удаление старой сетки..."); // DEBUG
      const { error: deleteError } = await supabase.from('matches').delete().eq('tournament_id', tournamentId);
      if (deleteError) console.warn(`Предупреждение при удалении старой сетки: ${deleteError.message}`);

      // Шаг 5: Генерируем структуру матчей
      const matchesToInsert: Omit<Match, 'id' | 'created_at' | 'details' | 'next_match_id'>[] = [];
      // Раунд 1
      let matchInRoundCounter = 1;
      for (let i = 0; i < bracketSize; i += 2) {
        const p1 = participants[i]; const p2 = participants[i + 1];
        const isBye = p1 === null || p2 === null; const winner = p1 === null ? p2 : p1;
        matchesToInsert.push({ tournament_id: tournamentId, round_number: 1, match_in_round: matchInRoundCounter, participant1_id: p1?.id ?? null, participant2_id: p2?.id ?? null, status: isBye ? 'BYE' : 'READY', score1: null, score2: null, winner_id: isBye ? winner?.id ?? null : null });
        matchInRoundCounter++;
      }
      // Последующие раунды
      let matchesInPreviousRound = bracketSize / 2;
      for (let round = 2; round <= numRounds; round++) {
        const matchesInCurrentRound = matchesInPreviousRound / 2; matchInRoundCounter = 1;
        for (let i = 0; i < matchesInCurrentRound; i++) {
            matchesToInsert.push({ tournament_id: tournamentId, round_number: round, match_in_round: matchInRoundCounter, participant1_id: null, participant2_id: null, status: 'PENDING_PARTICIPANTS', score1: null, score2: null, winner_id: null });
            matchInRoundCounter++;
        }
        matchesInPreviousRound = matchesInCurrentRound;
      }
      console.log("Структура матчей для вставки:", matchesToInsert); // DEBUG

      // Шаг 6: Вставляем матчи
      console.log("Вставка матчей в базу данных..."); // DEBUG
      const { data: insertedMatches, error: insertError } = await supabase.from('matches').insert(matchesToInsert).select();
      if (insertError) throw new Error(`Ошибка вставки матчей: ${insertError.message}`);
      if (!insertedMatches) throw new Error("Не удалось вставить матчи.");
      console.log("Матчи вставлены:", insertedMatches); // DEBUG

      // Шаг 7: Обновляем next_match_id и продвигаем победителей BYE
      console.log("Обновление связей next_match_id и обработка BYE..."); // DEBUG
      const matchIdMap: Record<string, string> = {};
      insertedMatches.forEach((match: Match) => { matchIdMap[`${match.round_number}-${match.match_in_round}`] = match.id; });
      const updates: Promise<any>[] = [];

      for (const match of insertedMatches as Match[]) { // Приводим тип для доступа к свойствам
          if (match.round_number < numRounds) {
              const nextMatchInRound = Math.ceil(match.match_in_round / 2);
              const nextMatchKey = `${match.round_number + 1}-${nextMatchInRound}`;
              const nextMatchId = matchIdMap[nextMatchKey] ?? null; // Используем правильный ключ
              // Обновляем только если ID отличается от текущего (для оптимизации)
              if (match.next_match_id !== nextMatchId) {
                 updates.push(supabase.from('matches').update({ next_match_id: nextMatchId }).eq('id', match.id));
              }
          }
          if (match.round_number === 1 && match.status === 'BYE' && match.winner_id) {
              const nextMatchInRound = Math.ceil(match.match_in_round / 2);
              const nextMatchKey = `${match.round_number + 1}-${nextMatchInRound}`;
              const nextMatchId = matchIdMap[nextMatchKey] ?? null; // Используем правильный ключ
              if (nextMatchId) {
                  const participantSlot = match.match_in_round % 2 !== 0 ? 'participant1_id' : 'participant2_id';
                  updates.push(supabase.from('matches').update({ [participantSlot]: match.winner_id }).eq('id', nextMatchId));
                  // TODO: Проверить и обновить статус следующего матча на READY, если оба участника известны
              }
          }
      }
      const updateResults = await Promise.allSettled(updates);
      let updateErrors = 0;
      updateResults.forEach(result => { if (result.status === 'rejected') { console.warn("Ошибка при обновлении матча:", result.reason); updateErrors++; } });
      if (updateErrors > 0) { toast.warn(`При обновлении связей матчей возникло ${updateErrors} ошибок.`);}
      console.log("Обновление связей завершено."); // DEBUG

      toast.success(`Сетка для турнира успешно сгенерирована!`);
      // TODO: Обновить UI, чтобы показать сетку

    } catch (error: any) {
        console.error("Ошибка генерации сетки:", error);
        toast.error(`Ошибка генерации сетки: ${error.message}`);
    } finally {
        setGeneratingBracket(false);
    }
  };


  // --- Статистика ---
  const stats: StatCard[] = [ /* ... как было ... */ ];

  // --- JSX Рендеринг ---
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* --- Заголовок и Кнопки --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Управление турнирами</h2>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => handleGenerateBracket(tournaments[0]?.id)} disabled={generatingBracket || tournaments.length === 0} title="Сгенерировать сетку для первого турнира в списке (перезапишет существующую!)"> {generatingBracket ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cog className="mr-2 h-4 w-4" />} Ген. сетки (Тест) </Button>
            <Button variant="outline" onClick={() => setCreateTeamDialogOpen(true)}> <Users className="mr-2 h-4 w-4" /> Создать команду </Button>
            <Button onClick={() => setCreateTournamentDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новый турнир </Button>
          </div>
        </div>

        {/* --- Статистика --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {stats.map((stat) => ( <Card key={stat.title} className="shadow-sm"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-muted-foreground" /> </CardHeader> <CardContent> <div className="text-2xl font-bold">{stat.value}</div> <p className="text-xs text-muted-foreground">{stat.description}</p> </CardContent> </Card> ))} </div>

        {/* --- Вкладки --- */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
           <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-md shadow-sm max-w-lg"> <TabsTrigger value="list">Список турниров</TabsTrigger> <TabsTrigger value="calendar">Календарь</TabsTrigger> <TabsTrigger value="teams">Команды</TabsTrigger> </TabsList>

           {/* Содержимое вкладок */}
           <TabsContent value="list" className="space-y-4">
               <div className="flex items-center gap-2"> <div className="relative flex-1"> <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> <Input type="search" placeholder="Поиск турниров по названию..." className="pl-8 border shadow-sm" value={tournamentSearchQuery} onChange={handleTournamentSearch} disabled={loadingTournaments} /> </div> </div>
               {loadingTournaments ? <div className="text-center p-4">Загрузка турниров...</div> : ( <TournamentList tournaments={tournaments} onEdit={handleEditTournamentClick} onDelete={handleDeleteTournamentClick}/> )}
               {!loadingTournaments && tournamentsTotalPages > 1 && ( <div className="flex justify-center items-center gap-4 mt-4"> <Button variant="outline" size="sm" onClick={handleTournamentPreviousPage} disabled={tournamentsCurrentPage === 1}> <ChevronLeft className="h-4 w-4 mr-1" /> Назад </Button> <span className="text-sm text-muted-foreground">Страница {tournamentsCurrentPage} из {tournamentsTotalPages}</span> <Button variant="outline" size="sm" onClick={handleTournamentNextPage} disabled={tournamentsCurrentPage === tournamentsTotalPages}> Вперёд <ChevronRight className="h-4 w-4 ml-1" /> </Button> </div> )}
           </TabsContent>
           <TabsContent value="calendar" className="space-y-4"> {/* Calendar Content */} </TabsContent>
           <TabsContent value="teams" className="space-y-4">
               <div className="flex items-center gap-2"> <div className="relative flex-1"> <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> <Input type="search" placeholder="Поиск команд по названию..." className="pl-8 border shadow-sm" value={teamSearchQuery} onChange={handleTeamSearch} disabled={loadingTeams} /> </div> </div>
               {loadingTeams ? <div className="text-center p-4">Загрузка команд...</div> : ( <TeamList teams={teams} onEdit={handleEditTeamClick} onDelete={handleDeleteTeamClick} /> )}
               {!loadingTeams && teamsTotalPages > 1 && ( <div className="flex justify-center items-center gap-4 mt-4"> <Button variant="outline" size="sm" onClick={handleTeamPreviousPage} disabled={teamsCurrentPage === 1}> <ChevronLeft className="h-4 w-4 mr-1" /> Назад </Button> <span className="text-sm text-muted-foreground">Страница {teamsCurrentPage} из {teamsTotalPages}</span> <Button variant="outline" size="sm" onClick={handleTeamNextPage} disabled={teamsCurrentPage === teamsTotalPages}> Вперёд <ChevronRight className="h-4 w-4 ml-1" /> </Button> </div> )}
           </TabsContent>
        </Tabs>
      </main>

      {/* --- Модальные окна --- */}
      <CreateTournamentDialog open={createTournamentDialogOpen} onOpenChange={setCreateTournamentDialogOpen} onTournamentCreated={handleTournamentCreated} />
      <CreateTeamDialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen} onTeamCreated={handleTeamCreated} />
      <EditTournamentDialog open={isEditTournamentDialogOpen} onOpenChange={setIsEditTournamentDialogOpen} tournament={editingTournament} onTournamentUpdated={() => { setIsEditTournamentDialogOpen(false); fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }} />
      <EditTeamDialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen} team={editingTeam} onTeamUpdated={() => { setIsEditTeamDialogOpen(false); fetchTeams(teamsCurrentPage, teamSearchQuery); }} />
      <DeleteConfirmationDialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={confirmDeletion} itemName={itemToDelete?.name} itemType={itemToDelete?.type === 'tournament' ? 'турнир' : 'команду'} loading={deleteLoading} />

    </div>
  )
}
