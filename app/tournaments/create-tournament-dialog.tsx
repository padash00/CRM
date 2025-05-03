"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase.from("teams").select("*")
      if (error) {
        toast.error(`Пиздец, не загрузили команды: ${error.message}`)
      } else {
        setTeams(data || [])
      }
    }
    if (open) fetchTeams()
  }, [open])

  const isValidUrl = (url: string, isImage: boolean = false) => {
    if (!url.trim()) return true // Пустой URL ок, станет null
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i
    if (!urlPattern.test(url)) return false
    if (isImage) {
      const imagePattern = /\.(jpg|jpeg|png|gif)$/i
      return imagePattern.test(url)
    }
    return true
  }

  const handleCoverUrlChange = (value: string) => {
    setCoverUrl(value)
    if (value && !isValidUrl(value, true)) {
      setCoverUrlError("URL должен вести на картинку (.jpg, .jpeg, .png, .gif)")
    } else {
      setCoverUrlError(null)
    }
  }

  const handleCreate = async () => {
    // Валидация
    if (!name.trim()) {
      toast.error("Назови турнир нормально, б*ять!")
      return
    }
    if (!startDate || !endDate) {
      toast.error("Даты начала и конца нужны, не трынди!")
      return
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Конец турнира должен быть позже начала, б*ять!")
      return
    }
    if (Number(prize) < 0) {
      toast.error("Призовой фонд не может быть отрицательным, дебил!")
      return
    }
    if (Number(participantsCount) < 0) {
      toast.error("Участников не может быть меньше нуля, что за херня?")
      return
    }
    if (organizer.trim() && organizer.length > 50) {
      toast.error("Организатор слишком длинный, до 50 символов, б*ять!")
      return
    }
    if (description.trim() && description.length > MAX_DESCRIPTION_LENGTH) {
      toast.error(`Описание слишком длинное, до ${MAX_DESCRIPTION_LENGTH} символов, б*ять!`)
      return
    }
    if (coverUrl && !isValidUrl(coverUrl, true)) {
      toast.error("Ссылка на обложку должна вести на картинку (.jpg, .jpeg, .png, .gif), б*ять!")
      return
    }
    if (bracketUrl && !isValidUrl(bracketUrl)) {
      toast.error("Ссылка на сетку говно, введи нормальный URL!")
      return
    }

    setLoading(true)
    const { data, error } = await supabase.from("tournaments").insert([
      {
        name: name.trim(),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        prize: Number(prize) || 0,
        participants_count: Number(participantsCount) || 0,
        status,
        organizer: organizer.trim() || null,
        cover_url: coverUrl.trim() || null,
        bracket_url: bracketUrl.trim() || null,
        description: description.trim() || null,
      },
    ]).select()

    if (error || !data || data.length === 0) {
      toast.error(`Пиздец, не создали турнир: ${error?.message || "Херня какая-то"}`)
      setLoading(false)
      return
    }

    const tournamentId = data[0].id
    if (selectedTeamIds.length > 0) {
      const insertData = selectedTeamIds.map((teamId) => ({ tournament_id: tournamentId, team_id: teamId }))
      const { error: teamError } = await supabase.from("tournament_teams").insert(insertData)
      if (teamError) {
        toast.error(`Команды не добавились, пиздец: ${teamError.message}`)
      }
    }

    setLoading(false)
    onOpenChange(false)
    onTournamentCreated()
    toast.success("Турнир создан, как труба новая!")
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
  }

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый турнир</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название турнира"
            />
          </div>
          <div className="space-y-2">
            <Label>Дата начала</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Дата окончания</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Призовой фонд (₸)</Label>
            <Input
              type="number"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Количество участников</Label>
            <Input
              type="number"
              value={participantsCount}
              onChange={(e) => setParticipantsCount(e.target.value)}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Статус</Label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as "upcoming" | "ongoing" | "finished")}
            >
              <option value="upcoming">Запланирован</option>
              <option value="ongoing">Идёт</option>
              <option value="finished">Завершён</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Организатор</Label>
            <Input
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Имя или никнейм организатора"
            />
          </div>
          <div className="space-y-2">
            <Label>Ссылка на обложку</Label>
            <Input
              value={coverUrl}
              onChange={(e) => handleCoverUrlChange(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className={coverUrlError ? "border-red-500" : ""}
            />
            {coverUrlError && <p className="text-sm text-red-500">{coverUrlError}</p>}
          </div>
          <div className="space-y-2">
            <Label>Ссылка на турнирную сетку</Label>
            <Input
              value={bracketUrl}
              onChange={(e) => setBracketUrl(e.target.value)}
              placeholder="https://challonge.com/tournament"
            />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите турнир"
              className={description.length > MAX_DESCRIPTION_LENGTH ? "border-red-500" : ""}
            />
            <p className={`text-sm ${description.length > MAX_DESCRIPTION_LENGTH ? "text-red-500" : "text-muted-foreground"}`}>
              {description.length}/{MAX_DESCRIPTION_LENGTH} символов
            </p>
          </div>
          <div className="space-y-2">
            <Label>Команды</Label>
            <div className="flex flex-wrap gap-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className={`px-3 py-1 text-sm rounded border ${
                    selectedTeamIds.includes(team.id) ? "bg-primary text-white" : "bg-muted"
                  }`}
                  onClick={() => toggleTeamSelection(team.id)}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Создаём, б*ять..." : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
