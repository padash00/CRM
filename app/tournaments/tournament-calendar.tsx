import { Tournament } from "@/types"

interface TournamentCalendarProps {
  tournaments: Tournament[]
}

export function TournamentCalendar({ tournaments }: TournamentCalendarProps) {
  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <h3 className="font-bold mb-2">Календарь турниров</h3>
      {tournaments.length === 0 ? (
        <div className="text-muted-foreground text-center">
          Турниров нет, б*ять, как воды в кране!
        </div>
      ) : (
        <ul className="space-y-2">
          {tournaments.map((t) => (
            <li key={t.id} className="border p-2 rounded-md">
              <strong>{t.name}</strong> <br />
              <span className="text-sm text-muted-foreground">
                {new Date(t.start_date).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}{" "}
                —{" "}
                {new Date(t.end_date).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
