"use client"

import { useState } from "react"
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

export function CreateTournamentDialog({ open, onOpenChange, onTournamentCreated }: CreateTournamentDialogProps) {
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [prizePool, setPrizePool] = useState("")
  const [participants, setParticipants] = useState("")
  const [status, setStatus] = useState<"active" | "past" | "upcoming">("upcoming")
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name || !date || !prizePool || !participants || !status) return

    setLoading(true)
    const { error } = await supabase.from("tournaments").insert([
      {
        name,
        date,
        prize_pool: Number(prizePool),
        participants: Number(participants),
        status,
      },
    ])

    setLoading(false)

    if (!error) {
      onOpenChange(false)
      onTournamentCreated()
      setName("")
      setDate("")
      setPrizePool("")
      setParticipants("")
      setStatus("upcoming")
    } else {
      alert("Ошибка при создании турнира: " + error.message)
    }
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
