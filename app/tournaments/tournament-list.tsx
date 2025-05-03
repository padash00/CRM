import { Tournament } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TournamentListProps {
  tournaments: Tournament[]
  searchQuery?: string
}

export function TournamentList({ tournaments, searchQuery = "" }: TournamentListProps) {
  const filtered = tournaments.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (filtered.length === 0) {
    return (
      <div className="text-muted-foreground text-center">
        {searchQuery ? `Ничего не найдено по "${searchQuery}"` : "Турниров нет, б*ять!"}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((tournament) => {
        const startDate = new Date(tournament.start_date)
        const endDate = new Date(tournament.end_date)
        const isValidDates = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())

        return (
          <Card key={tournament.id}>
            <CardHeader>
              <CardTitle>{tournament.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isValidDates
                  ? `${startDate.toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })} — ${endDate.toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}`
                  : "Даты не указаны, б*ять"}
              </p>
              <p className="text-sm mt-2">Призовой фонд: ₸{tournament.prize.toLocaleString()}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
