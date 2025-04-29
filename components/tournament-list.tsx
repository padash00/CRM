"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Pencil, Trash, Users, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export function TournamentList() {
  const [tournaments, setTournaments] = useState([
    {
      id: "T001",
      name: "CS2 Weekly Cup",
      game: "Counter-Strike 2",
      date: "05.04.2025",
      time: "18:00",
      participants: "16/16",
      prize: "₸50,000",
      status: "active",
    },
    {
      id: "T002",
      name: "Dota 2 Championship",
      game: "Dota 2",
      date: "10.04.2025",
      time: "16:00",
      participants: "8/10",
      prize: "₸75,000",
      status: "registration",
    },
    {
      id: "T003",
      name: "Fortnite Solo Tournament",
      game: "Fortnite",
      date: "15.04.2025",
      time: "19:00",
      participants: "12/24",
      prize: "₸25,000",
      status: "registration",
    },
    {
      id: "T004",
      name: "FIFA 25 Cup",
      game: "FIFA 25",
      date: "20.04.2025",
      time: "17:00",
      participants: "4/8",
      prize: "₸15,000",
      status: "registration",
    },
    {
      id: "T005",
      name: "Valorant Team Battle",
      game: "Valorant",
      date: "02.04.2025",
      time: "20:00",
      participants: "10/10",
      prize: "₸40,000",
      status: "active",
    },
    {
      id: "T006",
      name: "League of Legends Cup",
      game: "League of Legends",
      date: "25.03.2025",
      time: "18:00",
      participants: "8/8",
      prize: "₸35,000",
      status: "completed",
    },
    {
      id: "T007",
      name: "CS2 Pro League",
      game: "Counter-Strike 2",
      date: "20.03.2025",
      time: "19:00",
      participants: "16/16",
      prize: "₸100,000",
      status: "completed",
    },
  ])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge>Активен</Badge>
      case "registration":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Регистрация
          </Badge>
        )
      case "completed":
        return <Badge variant="secondary">Завершен</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const handleDelete = (id: string) => {
    setTournaments(tournaments.filter((tournament) => tournament.id !== id))
    toast({
      title: "Турнир удален",
      description: "Турнир был успешно удален из системы",
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox />
            </TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Игра</TableHead>
            <TableHead>Дата/Время</TableHead>
            <TableHead>Участники</TableHead>
            <TableHead>Призовой фонд</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tournaments.map((tournament) => (
            <TableRow key={tournament.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell className="font-medium">{tournament.name}</TableCell>
              <TableCell>{tournament.game}</TableCell>
              <TableCell>
                {tournament.date}
                <br />
                <span className="text-muted-foreground">{tournament.time}</span>
              </TableCell>
              <TableCell>{tournament.participants}</TableCell>
              <TableCell>{tournament.prize}</TableCell>
              <TableCell>{getStatusBadge(tournament.status)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Открыть меню</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" /> Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" /> Участники
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trophy className="mr-2 h-4 w-4" /> Результаты
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(tournament.id)}>
                      <Trash className="mr-2 h-4 w-4" /> Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

