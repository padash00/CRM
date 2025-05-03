import { Tournament } from "@/types"

interface TournamentCalendarProps {
  tournaments: Tournament[]
}

export function TournamentCalendar({ tournaments }: TournamentCalendarProps) {
  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <h3 className="font-bold mb-2">Календарь турниров</h3>
      <ul className="space-y-2">
        {tournaments.map((t) => (
          <li key={t.id} className="border p-2 rounded-md">
            <strong>{t.name}</strong> <br />
            <span className="text-sm text-muted-foreground">
              {new Date(t.start_time).toLocaleDateString()} —{" "}
              {new Date(t.end_time).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
