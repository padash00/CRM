// components/tournaments/edit-tournament-dialog.tsx (пример пути)
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Интерфейс Турнира (убедись, что совпадает с page.tsx)
interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  prize: number | null;
  participants_count: number | null;
  status: "upcoming" | "ongoing" | "finished";
  organizer: string | null;
  cover_url: string | null;
  bracket_url: string | null;
  description: string | null;
  created_at: string;
}

// Интерфейс Команды (для списка выбора)
interface Team {
  id: string;
  name: string;
}

// Интерфейс пропсов
interface EditTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament | null; // Турнир для редактирования
  onTournamentUpdated: () => void; // Коллбэк после обновления
}

// --- Утилита для форматирования даты ---
// Supabase возвращает ISO строку (2023-10-27T...), а Input type="date" ожидает YYYY-MM-DD
const formatDateForInput = (isoDateString: string | null | undefined): string => {
  if (!isoDateString) return "";
  try {
    // new Date(isoDateString) корректно парсит ISO строки
    const date = new Date(isoDateString);
    // Проверка на валидность даты
    if (isNaN(date.getTime())) return "";
    // toISOString() возвращает UTC, нам нужна локальная дата для инпута YYYY-MM-DD
    // Простой способ получить YYYY-MM-DD из объекта Date:
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Месяцы 0-11
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return "";
  }
};


export function EditTournamentDialog({
  open,
  onOpenChange,
  tournament,
  onTournamentUpdated,
}: EditTournamentDialogProps) {
  // --- Состояния ---
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [prize, setPrize] = useState("");
  const [participantsCount, setParticipantsCount] = useState("");
  const [status, setStatus] = useState<"upcoming" | "ongoing" | "finished">("upcoming");
  const [organizer, setOrganizer] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [bracketUrl, setBracketUrl] = useState("");
  const [description, setDescription] = useState("");
  const [allTeams, setAllTeams] = useState<Team[]>([]); // Список ВСЕХ команд для выбора
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]); // ID команд, связанных с ТЕКУЩИМ турниром
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); // Общие ошибки формы
  const [coverUrlError, setCoverUrlError] = useState<string | null>(null); // Ошибка URL обложки


  const MAX_DESCRIPTION_LENGTH = 1000;

  // --- Функция сброса формы ---
  const resetForm = useCallback(() => {
        setName("");
        setStartDate("");
        setEndDate("");
        setPrize("");
        setParticipantsCount("");
        setStatus("upcoming");
        setOrganizer("");
        setCoverUrl("");
        setBracketUrl("");
        setDescription("");
        setSelectedTeamIds([]);
        setCoverUrlError(null);
        setFormError(null);
        setLoading(false);
  }, []);

  // --- useEffect для заполнения формы и загрузки данных при открытии/смене турнира ---
  useEffect(() => {
    if (open && tournament) {
      // 1. Заполняем основные поля формы
      setName(tournament.name || "");
      setStartDate(formatDateForInput(tournament.start_date));
      setEndDate(formatDateForInput(tournament.end_date));
      setPrize(tournament.prize?.toString() || ""); // Преобразуем число в строку
      setParticipantsCount(tournament.participants_count?.toString() || "");
      setStatus(tournament.status || "upcoming");
      setOrganizer(tournament.organizer || "");
      setCoverUrl(tournament.cover_url || "");
      setBracketUrl(tournament.bracket_url || "");
      setDescription(tournament.description || "");
      setCoverUrlError(null); // Сбрасываем ошибки
      setFormError(null);

      // 2. Асинхронно загружаем ВСЕ команды и связанные команды для ЭТОГО турнира
      const loadInitialData = async () => {
        setLoading(true); // Показываем общую загрузку на время запросов
        try {
          // Запрос всех команд
          const { data: allTeamsData, error: allTeamsError } = await supabase
            .from("teams")
            .select("id, name");
          if (allTeamsError) throw allTeamsError;
          setAllTeams(allTeamsData || []);

          // Запрос ID команд, связанных с этим турниром
          const { data: tournamentTeamsData, error: tournamentTeamsError } = await supabase
            .from("tournament_teams")
            .select("team_id")
            .eq("tournament_id", tournament.id); // Фильтр по ID турнира
          if (tournamentTeamsError) throw tournamentTeamsError;

          // Устанавливаем ID выбранных команд
          setSelectedTeamIds((tournamentTeamsData || []).map(item => item.team_id));

        } catch (error: any) {
            toast.error(`Ошибка загрузки данных для редактирования: ${error.message}`);
            // Возможно, стоит закрыть диалог или показать сообщение об ошибке
            onOpenChange(false); // Закрываем диалог при ошибке загрузки данных
        } finally {
            setLoading(false);
        }
      };

      loadInitialData();

    } else if (!open) {
        // Сбрасываем форму при закрытии диалога (на всякий случай)
        // resetForm(); // Можно и здесь, но handleOpenChange уже должен это делать
    }
  }, [open, tournament, onOpenChange]); // Зависимости: открытие и сам объект турнира

  // --- Валидация URL ---
  const isValidUrl = (url: string, isImage: boolean = false): boolean => {
     if (!url.trim()) return true
     try {
       const parsedUrl = new URL(url)
       if (!['http:', 'https:'].includes(parsedUrl.protocol)) return false;
       if (isImage) {
         const imagePattern = /\.(jpg|jpeg|png|gif|svg|webp)$/i
         return imagePattern.test(parsedUrl.pathname)
       }
       return true
     } catch (_) {
       return false
     }
   }

  // --- Обработчик изменения URL обложки ---
   const handleCoverUrlChange = (value: string) => {
     setCoverUrl(value)
     if (value.trim() && !isValidUrl(value, true)) {
       setCoverUrlError("URL должен вести на изображение (jpg, jpeg, png, gif, svg, webp)")
     } else {
       setCoverUrlError(null)
     }
   }

  // --- Обработчик сохранения изменений ---
  const handleUpdateTournament = async () => {
    if (!tournament) {
      toast.error("Ошибка: Нет данных турнира для обновления.");
      return;
    }

    // --- Валидация ---
    const trimmedName = name.trim();
    const trimmedOrganizer = organizer.trim();
    const trimmedDescription = description.trim();
    const trimmedCoverUrl = coverUrl.trim();
    const trimmedBracketUrl = bracketUrl.trim();
    setFormError(null); // Сброс предыдущих общих ошибок

    if (!trimmedName) { toast.error("Пожалуйста, введите название турнира."); return; }
    if (!startDate || !endDate) { toast.error("Пожалуйста, укажите даты начала и окончания."); return; }
    if (new Date(endDate) <= new Date(startDate)) { toast.error("Дата окончания должна быть позже даты начала."); return; }

    const prizeNumber = Number(prize);
    const participantsNumber = Number(participantsCount);
    if (prize && (isNaN(prizeNumber) || prizeNumber < 0)) { toast.error("Призовой фонд должен быть неотрицательным числом."); return; }
    if (participantsCount && (isNaN(participantsNumber) || participantsNumber < 0 || !Number.isInteger(participantsNumber))) { toast.error("Количество участников должно быть целым неотрицательным числом."); return; }
    if (trimmedOrganizer && trimmedOrganizer.length > 50) { toast.error("Имя организатора не должно превышать 50 символов."); return; }
    if (trimmedDescription && trimmedDescription.length > MAX_DESCRIPTION_LENGTH) { toast.error(`Описание не должно превышать ${MAX_DESCRIPTION_LENGTH} символов.`); return; }
    if (trimmedCoverUrl && !isValidUrl(trimmedCoverUrl, true)) { setCoverUrlError("URL обложки некорректен."); toast.error("URL обложки некорректен."); return; }
    else if (coverUrlError) { setCoverUrlError(null); } // Сбросить ошибку, если URL стал валидным/пустым
    if (trimmedBracketUrl && !isValidUrl(trimmedBracketUrl)) { toast.error("URL турнирной сетки некорректен."); return; }
    // --- Конец валидации ---

    setLoading(true);

    try {
        // 1. Обновляем основную информацию о турнире
        const updateTournamentData = {
            name: trimmedName,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            prize: prizeNumber || null,
            participants_count: participantsNumber || null,
            status,
            organizer: trimmedOrganizer || null,
            cover_url: trimmedCoverUrl || null,
            bracket_url: trimmedBracketUrl || null,
            description: trimmedDescription || null,
        };

        const { error: updateError } = await supabase
            .from("tournaments")
            .update(updateTournamentData)
            .match({ id: tournament.id });

        if (updateError) throw new Error(`Ошибка обновления турнира: ${updateError.message}`);

        // 2. Обновляем связи команд (простой способ: удалить старые, вставить новые)
        // Сначала удаляем все текущие связи для этого турнира
        const { error: deleteError } = await supabase
            .from("tournament_teams")
            .delete()
            .match({ tournament_id: tournament.id });

        if (deleteError) throw new Error(`Ошибка удаления старых связей команд: ${deleteError.message}`);

        // Затем вставляем новые связи, если выбраны команды
        if (selectedTeamIds.length > 0) {
            const insertData = selectedTeamIds.map((teamId) => ({
                tournament_id: tournament.id,
                team_id: teamId,
            }));
            const { error: insertError } = await supabase
                .from("tournament_teams")
                .insert(insertData);

            if (insertError) throw new Error(`Ошибка добавления новых связей команд: ${insertError.message}`);
        }

        // Все успешно
        toast.success(`Турнир "${trimmedName}" успешно обновлен!`);
        onTournamentUpdated(); // Вызываем коллбэк
        onOpenChange(false); // Закрываем диалог

    } catch (error: any) {
        console.error("Ошибка при обновлении турнира:", error);
        const message = error.message || "Произошла неизвестная ошибка.";
        setFormError(`Не удалось обновить турнир: ${message}`); // Показываем ошибку в форме
        toast.error(`Не удалось обновить турнир: ${message}`);
    } finally {
        setLoading(false);
    }
  };

  // --- Обработчик выбора/снятия выбора команды ---
  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

   // --- Обработчик закрытия ---
   const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        // Можно добавить небольшую задержку для сброса, если нужно
        // setTimeout(resetForm, 150);
        resetForm(); // Сбрасываем форму при закрытии
    }
    onOpenChange(isOpen);
  };


  // --- JSX Рендеринг ---
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        {/* Устанавливаем ширину и предотвращаем закрытие кликом снаружи, если идет загрузка */}
        <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => { if (loading) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>Редактировать турнир</DialogTitle>
          <DialogDescription>
            Измените данные турнира '{tournament?.name || ''}'. Нажмите "Сохранить", чтобы применить.
          </DialogDescription>
        </DialogHeader>

        {/* Показываем форму или индикатор загрузки начальных данных */}
        {loading && !name ? ( // Показываем заглушку, если идет первичная загрузка данных
            <div className="py-10 text-center">Загрузка данных турнира...</div>
        ) : (
            // Контейнер формы со скроллом
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6 pl-1">
                {/* Поля формы... (аналогично CreateTournamentDialog, но с value={state} и id) */}
                {/* Название */}
                 <div className="space-y-2">
                   <Label htmlFor="editTournamentName">Название турнира <span className="text-red-500">*</span></Label>
                   <Input id="editTournamentName" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
                 </div>
                 {/* Даты */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="editStartDate">Дата начала <span className="text-red-500">*</span></Label>
                        <Input id="editStartDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="editEndDate">Дата окончания <span className="text-red-500">*</span></Label>
                        <Input id="editEndDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required disabled={loading} />
                    </div>
                 </div>
                 {/* Приз и Участники */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                         <Label htmlFor="editPrize">Призовой фонд (₸)</Label>
                         <Input id="editPrize" type="number" value={prize} onChange={(e) => setPrize(e.target.value)} min="0" placeholder="0" disabled={loading} />
                     </div>
                     <div className="space-y-2">
                         <Label htmlFor="editParticipantsCount">Количество участников</Label>
                         <Input id="editParticipantsCount" type="number" value={participantsCount} onChange={(e) => setParticipantsCount(e.target.value)} min="0" step="1" placeholder="0" disabled={loading} />
                     </div>
                 </div>
                 {/* Статус */}
                 <div className="space-y-2">
                     <Label htmlFor="editStatus">Статус</Label>
                     <select id="editStatus" className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={status} onChange={(e) => setStatus(e.target.value as "upcoming" | "ongoing" | "finished")} disabled={loading}>
                         <option value="upcoming">Запланирован</option>
                         <option value="ongoing">Идёт</option>
                         <option value="finished">Завершён</option>
                     </select>
                 </div>
                 {/* Организатор */}
                 <div className="space-y-2">
                     <Label htmlFor="editOrganizer">Организатор</Label>
                     <Input id="editOrganizer" value={organizer} onChange={(e) => setOrganizer(e.target.value)} placeholder="(Не указан)" maxLength={50} disabled={loading} />
                 </div>
                 {/* Обложка */}
                 <div className="space-y-2">
                    <Label htmlFor="editCoverUrl">Ссылка на обложку</Label>
                    <Input id="editCoverUrl" type="url" value={coverUrl} onChange={(e) => handleCoverUrlChange(e.target.value)} placeholder="(Нет обложки)" className={coverUrlError ? "border-red-500" : ""} disabled={loading} aria-describedby="editCoverUrlError" />
                    {coverUrlError && <p id="editCoverUrlError" className="text-sm text-red-500">{coverUrlError}</p>}
                 </div>
                 {/* Сетка */}
                 <div className="space-y-2">
                    <Label htmlFor="editBracketUrl">Ссылка на турнирную сетку</Label>
                    <Input id="editBracketUrl" type="url" value={bracketUrl} onChange={(e) => setBracketUrl(e.target.value)} placeholder="(Нет сетки)" disabled={loading} />
                 </div>
                 {/* Описание */}
                 <div className="space-y-2">
                     <Label htmlFor="editDescription">Описание</Label>
                     <Textarea id="editDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="(Нет описания)" className={description.length > MAX_DESCRIPTION_LENGTH ? "border-red-500" : ""} rows={4} disabled={loading} aria-describedby="editDescriptionCounter" />
                     <p id="editDescriptionCounter" className={`text-sm ${description.length > MAX_DESCRIPTION_LENGTH ? "text-red-500" : "text-muted-foreground"}`}>{description.length}/{MAX_DESCRIPTION_LENGTH} символов</p>
                 </div>
                 {/* Выбор команд */}
                 <div className="space-y-2">
                    <Label>Команды участники</Label>
                    <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto bg-muted/30">
                       {allTeams.length > 0 ? (
                           <div className="flex flex-wrap gap-2">
                               {allTeams.map((team) => (
                                   <button key={team.id} type="button" className={`px-3 py-1 text-sm rounded border transition-colors duration-150 ${selectedTeamIds.includes(team.id) ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" : "bg-background hover:bg-accent border-transparent"}`} onClick={() => toggleTeamSelection(team.id)} disabled={loading}>
                                       {team.name}
                                   </button>
                               ))}
                           </div>
                       ) : ( <p className="text-sm text-muted-foreground">Нет доступных команд для выбора.</p> )}
                    </div>
                 </div>

                 {/* Отображение общих ошибок формы */}
                 {formError && <p className="text-sm text-red-600 pt-2">{formError}</p>}

            </div>
         )} {/* Конец условного рендеринга формы */}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Отмена
            </Button>
          </DialogClose>
          {/* Кнопка сохранения активна только если есть данные турнира */}
          <Button type="button" onClick={handleUpdateTournament} disabled={loading || !tournament}>
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
