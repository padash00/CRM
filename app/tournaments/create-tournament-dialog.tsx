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
import { supabase } from "@/lib/supabaseClient"

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
  const [date, setDate] = useState("")
  const [prizePool, setPrizePool] = useState("")
  const [participants, setParticipants] = useState("")
  const [status, setStatus] = useState<"active" | "past" | "upcoming">("upcoming")
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await supabase.from("teams").select("*")
      if (!error) setTeams(data || [])
    }
    if (open) fetchTeams()
  }, [open])

  const handleCreate = async () => {
    if (!name || !date || !prizePool || !participants || !status) return

    setLoading(true)
    const { data, error } = await supabase.from("tournaments").insert([
      {
        name,
        date,
        prize_pool: Number(prizePool),
        participants: Number(participants),
        status,
      },
    ]).select()

    if (error || !data || data.length === 0) {
      alert("Ошибка при создании турнира: " + (error?.message || ""))
      setLoading(false)
      return
    }

    const tournamentId = data[0].id

    if (selectedTeamIds.length > 0) {
      const insertData = selectedTeamIds.map((teamId) => ({ tournament_id: tournamentId, team_id: teamId }))
      await supabase.from("tournament_teams").insert(insertData)
    }

    setLoading(false)
    onOpenChange(false)
    onTournamentCreated()
    setName("")
    setDate("")
    setPrizePool("")
    setParticipants("")
    setStatus("upcoming")
    setSelectedTeamIds([])
  }

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeamIds(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
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
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Введите название турнира" />
          </div>
          <div className="space-y-2">
            <Label>Дата</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Призовой фонд (₸)</Label>
            <Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Участники</Label>
            <Input type="number" value={participants} onChange={(e) => setParticipants(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Статус</Label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="active">Активный</option>
              <option value="upcoming">Запланирован</option>
              <option value="past">Прошедший</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Команды</Label>
            <div className="flex flex-wrap gap-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className={`px-3 py-1 text-sm rounded border ${selectedTeamIds.includes(team.id) ? "bg-primary text-white" : "bg-muted"}`}
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
            {loading ? "Создание..." : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
