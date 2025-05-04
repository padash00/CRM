// app/tournaments/tournament-calendar.tsx (Предполагаемый путь)
"use client";

import { Tournament } from "@/types"; // Убедись, что путь к типам верный
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Используем Card для структуры
import { CalendarDays, CalendarX2 } from "lucide-react"; // Иконки

// Интерфейс пропсов, добавляем необязательный loading
interface TournamentCalendarProps {
  tournaments: Tournament[];
  loading?: boolean;
}

// Вспомогательная функция для группировки турниров по месяцу и году
// Возвращает массив массивов: [[месяцГодСтрока, массивТурнировЭтогоМесяца], ...]
const groupTournamentsByMonth = (tournaments: Tournament[]): [string, Tournament[]][] => {
  // Словарь для временной группировки
  const groups: Record<string, Tournament[]> = {};

  // Сначала сортируем турниры по дате начала, чтобы месяцы шли по порядку
  const sortedTournaments = [...tournaments].sort((a, b) => {
        // Добавляем обработку возможных невалидных дат
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
        // Если одна из дат невалидна, помещаем ее в конец
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateA - dateB;
    });


  sortedTournaments.forEach((tournament) => {
    // Проверяем наличие и валидность даты начала
    if (!tournament.start_date) return;
    const startDate = new Date(tournament.start_date);
    if (isNaN(startDate.getTime())) return; // Пропускаем турниры с невалидной датой начала

    // Формируем ключ для группы: "Месяц Год" (напр., "Май 2025")
    const monthYearKey = startDate.toLocaleDateString("ru-RU", {
      month: "long", // полное название месяца
      year: "numeric",
    });

    // Добавляем турнир в соответствующую группу
    if (!groups[monthYearKey]) {
      groups[monthYearKey] = [];
    }
    groups[monthYearKey].push(tournament);
  });

  // Преобразуем объект групп в массив пар [ключ, значение]
  // Сортировка здесь уже не нужна, так как мы сортировали турниры в начале
  return Object.entries(groups);
};


export function TournamentCalendar({ tournaments, loading }: TournamentCalendarProps) {

  // Показываем заглушку во время загрузки
  if (loading) {
     return (
        <div className="text-center text-muted-foreground border rounded-md p-6 bg-card shadow-sm">
           <CalendarDays className="mx-auto h-10 w-10 mb-2 animate-pulse text-gray-400" />
           <p>Загрузка календаря...</p>
        </div>
     );
  }

  // Группируем турниры после загрузки
  const groupedTournaments = groupTournamentsByMonth(tournaments);

  // Сообщение, если турниров нет
  if (groupedTournaments.length === 0) {
    return (
       <div className="text-muted-foreground text-center border rounded-md p-6 bg-card shadow-sm">
           <CalendarX2 className="mx-auto h-10 w-10 mb-2 text-gray-400" />
           <p className="font-medium">Нет турниров для отображения в календаре.</p> {/* Убрана нецензурная лексика */}
           <p className="text-sm mt-1">Возможно, стоит добавить новый турнир?</p>
       </div>
    );
  }

  // Отображаем сгруппированный список
  return (
    <Card className="shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Календарь турниров
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Итерируем по группам [месяцГод, списокТурниров] */}
        {groupedTournaments.map(([monthYear, tournamentsInMonth]) => (
          <div key={monthYear}>
            {/* Заголовок месяца */}
            <h4 className="font-semibold text-md capitalize border-b pb-2 mb-4 text-primary"> {/* Стиль заголовка месяца */}
                {monthYear}
            </h4>
            {/* Список турниров этого месяца */}
            <ul className="space-y-3">
              {tournamentsInMonth.map((t) => {
                const startDate = t.start_date ? new Date(t.start_date) : null;
                const endDate = t.end_date ? new Date(t.end_date) : null;
                const isValidDates = startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());

                // Определение стиля статуса
                let statusText = '';
                let statusClass = '';
                switch (t.status) {
                  case 'ongoing': statusText = 'Идёт'; statusClass = 'bg-green-100 text-green-800 border border-green-200'; break;
                  case 'upcoming': statusText = 'Запланирован'; statusClass = 'bg-blue-100 text-blue-800 border border-blue-200'; break;
                  case 'finished': statusText = 'Завершён'; statusClass = 'bg-gray-100 text-gray-800 border border-gray-200'; break;
                  default: statusText = 'Неизвестен'; statusClass = 'bg-gray-100 text-gray-800 border border-gray-200';
                }

                return (
                  <li key={t.id} className="p-3 border rounded-lg bg-background shadow-sm hover:border-primary/50 transition-all duration-150 ease-in-out">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      {/* Левая часть: Название и Даты */}
                      <div className="flex-grow">
                        <strong className="font-medium text-base">{t.name}</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isValidDates
                            // Более детальный формат даты
                            ? `${startDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} - ${endDate.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}`
                            : "Даты не указаны"
                          }
                        </p>
                        {/* Дополнительная информация (Приз, Организатор) */}
                         {(t.prize ?? 0) > 0 && (
                           <p className="text-xs mt-1 text-muted-foreground">
                             Приз: ₸{t.prize?.toLocaleString() ?? 0}
                           </p>
                         )}
                         {t.organizer && (
                           <p className="text-xs mt-1 text-muted-foreground">
                             Организатор: {t.organizer}
                           </p>
                         )}
                      </div>
                      {/* Правая часть: Статус */}
                      <div className="mt-2 sm:mt-0 flex-shrink-0">
                         <span className={`text-[11px] font-medium capitalize py-0.5 px-2 rounded-full ${statusClass}`}>
                           {statusText}
                         </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
