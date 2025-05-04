// app/tournaments/page.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Trophy, Users, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Cog, Loader2 } from "lucide-react" // Добавлены Cog, Loader2
import { MainNav } from "@/components/main-nav"
import { TournamentList } from "./tournament-list"
import { TournamentCalendar } from "./tournament-calendar"
import { CreateTournamentDialog } from "./create-tournament-dialog"
import { CreateTeamDialog } from "./create-team-dialog"
import { TeamList } from "./team-list" // Раскомментировано
import { EditTournamentDialog } from "./edit-tournament-dialog" // Раскомментировано
import { EditTeamDialog } from "./edit-team-dialog" // Раскомментировано
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"; // Исправлен и раскомментирован путь

import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

// --- Интерфейсы ---
// (Оставляем как есть)
interface StatCard { title: string; value: string; description: string; icon: React.ComponentType<{ className?: string }> }
interface Tournament { id: string; name: string; start_date: string; end_date: string; prize: number | null; participants_count: number | null; status: "upcoming" | "ongoing" | "finished"; organizer: string | null; cover_url: string | null; bracket_url: string | null; description: string | null; created_at: string; }
interface Team { id: string; name: string; logo_url: string | null; created_at: string; }
// Интерфейс для матчей (добавляем)
interface Match { id: string; tournament_id: string; round_number: number; match_in_round: number; participant1_id: string | null; participant2_id: string | null; score1: number | null; score2: number | null; winner_id: string | null; status: 'PENDING_PARTICIPANTS' | 'READY' | 'ONGOING' | 'FINISHED' | 'BYE'; next_match_id: string | null; details?: any; }


// --- Компонент страницы ---
export default function TournamentsPage() {
  // --- Состояния ---
  // (Большинство состояний оставляем как есть)
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
  const [generatingBracket, setGeneratingBracket] = useState(false); // НОВОЕ состояние для загрузки генерации

  const ITEMS_PER_PAGE = 15;

  // --- Функции загрузки данных ---
  // (fetchTournaments и fetchTeams оставляем как есть)
  const fetchTournaments = useCallback(async (page: number, search: string) => { /* ... код fetchTournaments ... */ }, []);
  const fetchTeams = useCallback(async (page: number, search: string) => { /* ... код fetchTeams ... */ }, []);

  // --- useEffect для загрузки данных ---
  // (Оставляем как есть)
  useEffect(() => { /* ... код useEffect ... */ }, [ /* ... зависимости ... */ ]);

  // --- Обработчики событий ---
  // (Большинство обработчиков оставляем как есть)
  const handleTournamentCreated = () => { /* ... */ };
  const handleTeamCreated = () => { /* ... */ };
  const handleTournamentPreviousPage = () => { /* ... */ };
  const handleTournamentNextPage = () => { /* ... */ };
  const handleTeamPreviousPage = () => { /* ... */ };
  const handleTeamNextPage = () => { /* ... */ };
  const handleTournamentSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ }, []);
  const handleTeamSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ }, []);
  const handleTabChange = useCallback((value: string) => { setActiveTab(value) }, []);
  const handleEditTournamentClick = (tournament: Tournament) => { /* ... */ };
  const handleDeleteTournamentClick = (tournamentId: string, tournamentName?: string) => { /* ... */ };
  const handleEditTeamClick = (team: Team) => { /* ... */ };
  const handleDeleteTeamClick = (teamId: string, teamName?: string) => { /* ... */ };
  const confirmDeletion = async () => { /* ... код confirmDeletion ... */ };

  // --- НОВАЯ ФУНКЦИЯ: Генерация сетки Single Elimination ---
  const handleGenerateBracket = async (tournamentId: string | null) => {
    if (!tournamentId) {
        toast.error("Не выбран турнир для генерации сетки.");
        return;
    }
    setGeneratingBracket(true);
    toast.info("Начинаем генерацию сетки...");

    try {
      // --- Шаг 1: Получаем команды ---
      const { data: registrations, error: regError } = await supabase
        .from('tournament_teams')
        .select('team_id')
        .eq('tournament_id', tournamentId);

      if (regError) throw new Error(`Ошибка получения регистраций: ${regError.message}`);
      if (!registrations || registrations.length < 2) {
        throw new Error("Недостаточно команд для генерации сетки (минимум 2).");
      }
      const teamIds = registrations.map(r => r.team_id);

      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds);

      if (teamsError) throw new Error(`Ошибка получения данных команд: ${teamsError.message}`);
      if (!teamsData) throw new Error("Не найдены данные для зарегистрированных команд.");

      let participants: (Team | null)[] = teamsData as Team[];

      // --- Шаг 2: Определяем размер сетки и byes ---
      const numParticipants = participants.length;
      let bracketSize = 2;
      let numRounds = 1;
      while (bracketSize < numParticipants) { bracketSize *= 2; numRounds++; }
      const numByes = bracketSize - numParticipants;

      // --- Шаг 3: Добавляем byes и перемешиваем ---
      for (let i = 0; i < numByes; i++) { participants.push(null); }
      for (let i = participants.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [participants[i], participants[j]] = [participants[j], participants[i]]; }

      // --- Шаг 4: Удаляем старую сетку (если есть) ---
      // ВНИМАНИЕ: Требует настроенных прав RLS!
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('tournament_id', tournamentId);
      if (deleteError) console.warn(`Предупреждение при удалении старой сетки: ${deleteError.message}`);

      // --- Шаг 5: Генерируем структуру матчей ---
      const matchesToInsert: Omit<Match, 'id' | 'created_at' | 'details' | 'next_match_id'>[] = []; // Используем Omit для данных на вставку
      const generatedMatchesStructure: { round: number; matchInRound: number; data: any }[] = []; // Временное хранение

      // Раунд 1
      let matchInRoundCounter = 1;
      for (let i = 0; i < bracketSize; i += 2) {
        const p1 = participants[i];
        const p2 = participants[i + 1];
        const isBye = p1 === null || p2 === null;
        const winner = p1 === null ? p2 : p1;
        const matchData = {
            tournament_id: tournamentId, round_number: 1, match_in_round: matchInRoundCounter,
            participant1_id: p1?.id ?? null, participant2_id: p2?.id ?? null,
            status: isBye ? 'BYE' : 'READY', score1: null, score2: null,
            winner_id: isBye ? winner?.id ?? null : null,
        };
        matchesToInsert.push(matchData);
        generatedMatchesStructure.push({ round: 1, matchInRound: matchInRoundCounter, data: matchData });
        matchInRoundCounter++;
      }

      // Последующие раунды (только структура)
      let matchesInPreviousRound = bracketSize / 2;
      for (let round = 2; round <= numRounds; round++) {
        const matchesInCurrentRound = matchesInPreviousRound / 2;
        matchInRoundCounter = 1;
        for (let i = 0; i < matchesInCurrentRound; i++) {
            const matchData = {
                tournament_id: tournamentId, round_number: round, match_in_round: matchInRoundCounter,
                participant1_id: null, participant2_id: null, status: 'PENDING_PARTICIPANTS',
                score1: null, score2: null, winner_id: null,
            };
            matchesToInsert.push(matchData);
            generatedMatchesStructure.push({ round: round, matchInRound: matchInRoundCounter, data: matchData });
            matchInRoundCounter++;
        }
        matchesInPreviousRound = matchesInCurrentRound;
      }

      // --- Шаг 6: Вставляем матчи в базу ---
      // ВНИМАНИЕ: Требует настроенных прав RLS!
      const { data: insertedMatches, error: insertError } = await supabase
        .from('matches')
        .insert(matchesToInsert)
        .select(); // Важно получить ID вставленных матчей

      if (insertError) throw new Error(`Ошибка вставки матчей: ${insertError.message}`);
      if (!insertedMatches) throw new Error("Не удалось вставить матчи.");

      // --- Шаг 7: Обновляем next_match_id и продвигаем победителей BYE ---
      const matchIdMap: Record<string, string> = {}; // "round-matchInRound" -> "matchId"
      insertedMatches.forEach((match: Match) => { matchIdMap[`${match.round_number}-${match.match_in_round}`] = match.id; });

      const updates: Promise<any>[] = []; // Массив для промисов обновления

      for (const match of insertedMatches) {
          // Обновляем next_match_id для всех, кроме последнего раунда
          if (match.round_number < numRounds) {
              const nextMatchInRound = Math.ceil(match.match_in_round / 2);
              const nextMatchKey = `${match.round_number + 1}-${nextMatchInRound}`;
              const nextMatchId = matchIdMap[nextMatchKey] ?? null;
              if (match.next_match_id !== nextMatchId) { // Обновляем только если нужно
                   updates.push(supabase.from('matches').update({ next_match_id: nextMatchId }).eq('id', match.id));
              }
          }

          // Продвигаем победителей BYE из первого раунда
          if (match.round_number === 1 && match.status === 'BYE' && match.winner_id) {
              const nextMatchInRound = Math.ceil(match.match_in_round / 2);
              const nextMatchKey = `${match.round_number + 1}-${nextMatchInRound}`;
              const nextMatchId = matchIdMap[nextKey];

              if (nextMatchId) {
                  // Определяем, какой это участник в следующем матче (1й или 2й)
                  const participantSlot = match.match_in_round % 2 !== 0 ? 'participant1_id' : 'participant2_id';
                  updates.push(
                      supabase.from('matches').update({ [participantSlot]: match.winner_id }).eq('id', nextMatchId)
                  );
                   // TODO: Проверить, стал ли следующий матч READY (если второй участник тоже BYE или уже определен)
                   // Это усложнение, пока пропустим авто-обновление статуса READY здесь
              }
          }
      }

      // Выполняем все обновления
      const updateResults = await Promise.allSettled(updates);
      updateResults.forEach(result => {
          if (result.status === 'rejected') console.warn("Ошибка при обновлении матча:", result.reason);
      });


      toast.success(`Сетка для турнира успешно сгенерирована!`);
      // TODO: Возможно, нужно обновить состояние, чтобы отобразить сетку, если она видна

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
            {/* --- ВРЕМЕННАЯ КНОПКА ГЕНЕРАЦИИ --- */}
            <Button
                variant="secondary"
                onClick={() => handleGenerateBracket(tournaments[0]?.id)} // Генерируем для ПЕРВОГО турнира в списке (для теста)
                disabled={generatingBracket || tournaments.length === 0}
                title="Сгенерировать сетку для первого турнира в списке (перезапишет существующую!)"
            >
                {generatingBracket ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cog className="mr-2 h-4 w-4" />}
                Ген. сетки (Тест)
            </Button>
            {/* --- КОНЕЦ ВРЕМЕННОЙ КНОПКИ --- */}
            <Button variant="outline" onClick={() => setCreateTeamDialogOpen(true)}> <Users className="mr-2 h-4 w-4" /> Создать команду </Button>
            <Button onClick={() => setCreateTournamentDialogOpen(true)}> <Plus className="mr-2 h-4 w-4" /> Новый турнир </Button>
          </div>
        </div>

        {/* --- Статистика --- */}
        {/* ... как было ... */}

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
                {/* ... Поиск и список ... */}
                {/* Убедись, что TournamentList принимает onEdit/onDelete */}
                {loadingTournaments ? <div className="text-center p-4">Загрузка турниров...</div> : (
                    <TournamentList
                        tournaments={tournaments}
                        onEdit={handleEditTournamentClick}
                        onDelete={handleDeleteTournamentClick}
                    />
                )}
                {/* ... Пагинация ... */}
           </TabsContent>

           {/* Вкладка: Календарь */}
           <TabsContent value="calendar" className="space-y-4">
                {/* ... Календарь ... */}
           </TabsContent>

           {/* Вкладка: Команды */}
           <TabsContent value="teams" className="space-y-4">
                {/* ... Поиск команд ... */}
                {loadingTeams ? <div className="text-center p-4">Загрузка команд...</div> : (
                    <TeamList
                        teams={teams}
                        onEdit={handleEditTeamClick}
                        onDelete={handleDeleteTeamClick}
                        // loading={loadingTeams} // loading можно убрать из TeamList, если есть общая заглушка
                    />
                )}
                {/* ... Пагинация команд ... */}
           </TabsContent>
        </Tabs>
      </main>

      {/* --- Модальные окна --- */}
      {/* (Оставляем как есть, все раскомментировано) */}
      <CreateTournamentDialog open={createTournamentDialogOpen} onOpenChange={setCreateTournamentDialogOpen} onTournamentCreated={handleTournamentCreated} />
      <CreateTeamDialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen} onTeamCreated={handleTeamCreated} />
      <EditTournamentDialog open={isEditTournamentDialogOpen} onOpenChange={setIsEditTournamentDialogOpen} tournament={editingTournament} onTournamentUpdated={() => { setIsEditTournamentDialogOpen(false); fetchTournaments(tournamentsCurrentPage, tournamentSearchQuery); }} />
      <EditTeamDialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen} team={editingTeam} onTeamUpdated={() => { setIsEditTeamDialogOpen(false); fetchTeams(teamsCurrentPage, teamSearchQuery); }} />
      <DeleteConfirmationDialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={confirmDeletion} itemName={itemToDelete?.name} itemType={itemToDelete?.type === 'tournament' ? 'турнир' : 'команду'} loading={deleteLoading} />

    </div>
  )
}
