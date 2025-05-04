// create-tournament-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription, // <-- Импортировано
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, // <-- Импортировано для кнопки Отмена
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

interface CreateTournamentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTournamentCreated: () => void
}

interface Team {
  id: string
  name: string
}

export function CreateTournamentDialog({ open, onOpenChange, onTournamentCreated }: CreateTournamentDialogProps) {
  // Состояния компонента
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [prize, setPrize] = useState("")
  const [participantsCount, setParticipantsCount] = useState("")
  const [status, setStatus] = useState<"upcoming" | "ongoing" | "finished">("upcoming")
  const [organizer, setOrganizer] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [bracketUrl, setBracketUrl] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [coverUrlError, setCoverUrlError] = useState<string | null>(null)

  const MAX_DESCRIPTION_LENGTH = 1000

  // Функция сброса состояния формы
  const resetForm = () => {
    setName("")
    setStartDate("")
    setEndDate("")
    setPrize("")
    setParticipantsCount("")
    setStatus("upcoming")
    setOrganizer("")
    setCoverUrl("")
    setBracketUrl("")
    setDescription("")
    setSelectedTeamIds([])
    setCoverUrlError(null)
    setLoading(false)
  }

  // Сброс формы при закрытии диалога
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(resetForm, 150);
      return () => clearTimeout(timer);
    }
  }, [open])


  // Загрузка команд при открытии диалога
  useEffect(() => {
    const fetchTeams = async () => {
      // Не будем блокировать всю форму ради команд, покажем загрузку у блока команд
      // setLoading(true);
      const { data, error } = await supabase.from("teams").select("id, name")
      if (error) {
        toast.error(`Не удалось загрузить команды: ${error.message}`) // Убрана обсценная лексика
      } else {
        setTeams(data || [])
      }
      // setLoading(false);
    }

    if (open) {
        resetForm(); // Сброс перед загрузкой
        fetchTeams();
    }
  }, [open])

  // Валидация URL
  const isValidUrl = (url: string, isImage: boolean = false): boolean => {
    if (!url.trim()) return true
    try {
      const parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) return false;
      if (isImage) {
        // Обновленный паттерн для изображений
        const imagePattern = /\.(jpg|jpeg|png|gif|svg|webp)$/i
        return imagePattern.test(parsedUrl.pathname)
      }
      return true
    } catch (_) {
      return false
    }
  }

  // Обработчик изменения URL обложки с валидацией
  const handleCoverUrlChange = (value: string) => {
    setCoverUrl(value)
    if (value.trim() && !isValidUrl(value, true)) {
       // Обновленное сообщение
      setCoverUrlError("URL должен вести на изображение (jpg, jpeg, png, gif, svg, webp)")
    } else {
      setCoverUrlError(null)
    }
  }

  // Обработчик создания турнира
  const handleCreate = async () => {
    // Валидация полей
    const trimmedName = name.trim();
    const trimmedOrganizer = organizer.trim();
    const trimmedDescription = description.trim();
    const trimmedCoverUrl = coverUrl.trim();
    const trimmedBracketUrl = bracketUrl.trim();

    // Улучшенные сообщения об ошибках (без обсценной лексики)
    if (!trimmedName) {
      toast.error("Пожалуйста, введите название турнира.")
      return
    }
    if (!startDate || !endDate) {
      toast.error("Пожалуйста, укажите даты начала и окончания турнира.")
      return
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Дата окончания турнира должна быть позже даты начала.")
      return
    }
    const prizeNumber = Number(prize);
    const participantsNumber = Number(participantsCount);

    if (prize && (isNaN(prizeNumber) || prizeNumber < 0)) {
       toast.error("Призовой фонд должен быть неотрицательным числом.")
       return
    }
    if (participantsCount && (isNaN(participantsNumber) || participantsNumber < 0 || !Number.isInteger(participantsNumber))) {
       toast.error("Количество участников должно быть целым неотрицательным числом.")
       return
    }
    if (trimmedOrganizer && trimmedOrganizer.length > 50) {
      toast.error("Имя организатора не должно превышать 50 символов.")
      return
    }
    if (trimmedDescription && trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      toast.error(`Описание не должно превышать ${MAX_DESCRIPTION_LENGTH} символов.`)
      return
    }
    if (trimmedCoverUrl && !isValidUrl(trimmedCoverUrl, true)) {
      setCoverUrlError("URL обложки должен вести на изображение (jpg, jpeg, png, gif, svg, webp)")
      toast.error("URL обложки некорректен.")
      return
    } else if (coverUrlError) {
        // Сбрасываем ошибку, если URL стал валидным или пустым
        setCoverUrlError(null);
    }
    if (trimmedBracketUrl && !isValidUrl(trimmedBracketUrl)) {
      toast.error("URL турнирной сетки некорректен.")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.from("tournaments").insert([
        {
          name: trimmedName,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          prize: prizeNumber || null, // Сохраняем null если 0 или пусто
          participants_count: participantsNumber || null, // Сохраняем null если 0 или пусто
          status,
          organizer: trimmedOrganizer || null,
          cover_url: trimmedCoverUrl || null,
          bracket_url: trimmedBracketUrl || null,
          description: trimmedDescription || null,
        },
      ]).select().single();

      if (error) throw error;

      const tournamentId = data.id;

      if (selectedTeamIds.length > 0) {
        const insertData = selectedTeamIds.map((teamId) => ({ tournament_id: tournamentId, team_id: teamId }))
        const { error: teamError } = await supabase.from("tournament_teams").insert(insertData)
        if (teamError) {
          toast.error(`Турнир создан, но не удалось добавить команды: ${teamError.message}`)
        } else {
           toast.success(`Турнир "${trimmedName}" успешно создан и команды добавлены!`)
        }
      } else {
         toast.success(`Турнир "${trimmedName}" успешно создан!`) // Сообщение без обсценной лексики
      }

      onOpenChange(false)
      onTournamentCreated()

    } catch (error: any) {
       console.error("Ошибка при создании турнира:", error);
       const message = error.details || error.message || "Произошла неизвестная ошибка.";
       toast.error(`Не удалось создать турнир: ${message}`) // Сообщение без обсценной лексики
    } finally {
      setLoading(false)
    }
  }

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Создание нового турнира</DialogTitle>
          {/* ----- ДОБАВЛЕНО ОПИСАНИЕ ----- */}
          <DialogDescription>
            Заполните информацию ниже для регистрации нового турнира в системе.
          </DialogDescription>
          {/* ----------------------------- */}
        </DialogHeader>

        {/* ----- КОНТЕЙНЕР ФОРМЫ СО СКРОЛЛОМ ----- */}
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6 pl-1">
        {/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */}
        {/* ВОТ КЛЮЧЕВЫЕ КЛАССЫ ДЛЯ ИСПРАВЛЕНИЯ ОБРЕЗАНИЯ ДИАЛОГА */}

          {/* Поля формы с Label htmlFor и Input id */}
          <div className="space-y-2">
            <Label htmlFor="tournamentName">Название турнира <span className="text-red-500">*</span></Label>
            <Input id="tournamentName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Введите название турнира" required disabled={loading} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="startDate">Дата начала <span className="text-red-500">*</span></Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="endDate">Дата окончания <span className="text-red-500">*</span></Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required disabled={loading} />
            </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="prize">Призовой фонд (₸)</Label>
                  <Input id="prize" type="number" value={prize} onChange={(e) => setPrize(e.target.value)} min="0" placeholder="Например, 100000" disabled={loading} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="participantsCount">Количество участников</Label>
                  <Input id="participantsCount" type="number" value={participantsCount} onChange={(e) => setParticipantsCount(e.target.value)} min="0" step="1" placeholder="Например, 16" disabled={loading} />
              </div>
           </div>
          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <select id="status" className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={status} onChange={(e) => setStatus(e.target.value as "upcoming" | "ongoing" | "finished")} disabled={loading}>
              <option value="upcoming">Запланирован</option>
              <option value="ongoing">Идёт</option>
              <option value="finished">Завершён</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizer">Организатор</Label>
            <Input id="organizer" value={organizer} onChange={(e) => setOrganizer(e.target.value)} placeholder="Имя или никнейм организатора (до 50 симв.)" maxLength={50} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverUrl">Ссылка на обложку</Label>
            <Input id="coverUrl" type="url" value={coverUrl} onChange={(e) => handleCoverUrlChange(e.target.value)} placeholder="https://example.com/cover.jpg" className={coverUrlError ? "border-red-500" : ""} disabled={loading} aria-describedby="coverUrlError" />
            {coverUrlError && <p id="coverUrlError" className="text-sm text-red-500">{coverUrlError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bracketUrl">Ссылка на турнирную сетку</Label>
            <Input id="bracketUrl" type="url" value={bracketUrl} onChange={(e) => setBracketUrl(e.target.value)} placeholder="https://challonge.com/my_tournament" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Добавьте описание турнира, правила и т.д." className={description.length > MAX_DESCRIPTION_LENGTH ? "border-red-500" : ""} rows={4} disabled={loading} aria-describedby="descriptionCounter" />
            <p id="descriptionCounter" className={`text-sm ${description.length > MAX_DESCRIPTION_LENGTH ? "text-red-500" : "text-muted-foreground"}`}>{description.length}/{MAX_DESCRIPTION_LENGTH} символов</p>
          </div>
          <div className="space-y-2">
            <Label>Команды участники (необязательно)</Label>
            <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
               { teams.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                       {teams.map((team) => (
                           <button key={team.id} type="button" className={`px-3 py-1 text-sm rounded border transition-colors duration-150 ${selectedTeamIds.includes(team.id) ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" : "bg-muted hover:bg-accent border-transparent"}`} onClick={() => toggleTeamSelection(team.id)} disabled={loading}>
                               {team.name}
                           </button>
                       ))}
                   </div>
               ) : ( <p className="text-sm text-muted-foreground">Нет доступных команд для добавления.</p> )}
            </div>
            <p className="text-xs text-muted-foreground">Выберите команды, которые будут участвовать в турнире.</p>
          </div>

        </div>
        {/* ----- КОНЕЦ КОНТЕЙНЕРА ФОРМЫ ----- */}

        <DialogFooter>
          {/* Кнопка Отмена */}
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Отмена
            </Button>
          </DialogClose>
          {/* Кнопка Создать */}
          <Button type="button" onClick={handleCreate} disabled={loading}>
             {/* Убрана нецензурная лексика */}
            {loading ? "Создание..." : "Создать турнир"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
