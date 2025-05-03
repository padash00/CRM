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
    return <div className="text-muted-foreground text-center">Нет турниров</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((tournament) => (
        <Card key={tournament.id}>
          <CardHeader>
            <CardTitle>{tournament.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {new Date(tournament.start_time).toLocaleDateString()} —{" "}
              {new Date(tournament.end_time).toLocaleDateString()}
            </p>
            <p className="text-sm mt-2">Призовой фонд: ₸{tournament.prize_pool}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
