// app/tournaments/tournament-list.tsx (Предполагаемый путь)
"use client"; // Добавляем, так как используем onClick

import { Tournament } from "@/types"; // Убедись, что путь к типам верный
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Добавлен CardFooter
import { Button } from "@/components/ui/button"; // Импортируем Button
import { Edit, Trash2, CalendarX } from "lucide-react"; // Импортируем иконки

// Определяем интерфейс для пропсов, добавляем onEdit и onDelete
interface TournamentListProps {
  tournaments: Tournament[];
  searchQuery?: string;
  onEdit: (tournament: Tournament) => void; // Функция для обработки клика по "Редактировать"
  onDelete: (tournamentId: string, tournamentName: string) => void; // Функция для обработки клика по "Удалить"
}

export function TournamentList({
  tournaments,
  searchQuery = "",
  onEdit, // Получаем новые пропсы
  onDelete,
}: TournamentListProps) {

  // Логика фильтрации (остается)
  const filteredTournaments = tournaments.filter((t) =>
    // Добавим проверку на null/undefined на всякий случай
    t.name?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
  );

  // Сообщение, если список пуст
  if (filteredTournaments.length === 0) {
    return (
      <div className="text-muted-foreground text-center border rounded-md p-6 bg-card shadow-sm">
         <CalendarX className="mx-auto h-10 w-10 mb-2 text-gray-400" />
         <p className="font-medium">
             {searchQuery
               ? `Турниры по запросу "${searchQuery}" не найдены.`
               : "Пока нет ни одного турнира." // Заменена нецензурная лексика
             }
         </p>
          {!searchQuery && <p className="text-sm mt-1 text-muted-foreground">Нажмите "Новый турнир", чтобы добавить первый.</p>}
      </div>
    );
  }

  // Отображение списка турниров
  return (
    // Добавлена еще одна колонка для больших экранов (xl)
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredTournaments.map((tournament) => {
        // Форматирование дат (остается)
        const startDate = tournament.start_date ? new Date(tournament.start_date) : null;
        const endDate = tournament.end_date ? new Date(tournament.end_date) : null;
        const isValidDates = startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
        const formattedStartDate = isValidDates ? startDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) : null;
        const formattedEndDate = isValidDates ? endDate.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) : null;

        // Форматирование статуса для отображения
        let statusText = 'Неизвестен';
        let statusBgColor = 'bg-gray-100';
        let statusTextColor = 'text-gray-800';
        switch (tournament.status) {
            case 'ongoing':
                statusText = 'Идёт';
                statusBgColor = 'bg-green-100';
                statusTextColor = 'text-green-800';
                break;
            case 'upcoming':
                statusText = 'Запланирован';
                statusBgColor = 'bg-blue-100';
                statusTextColor = 'text-blue-800';
                break;
            case 'finished':
                statusText = 'Завершён';
                statusBgColor = 'bg-gray-100';
                statusTextColor = 'text-gray-800';
                break;
        }


        return (
          <Card key={tournament.id} className="flex flex-col justify-between shadow-sm hover:shadow-lg transition-shadow duration-200 ease-in-out bg-card">
            {/* Основная часть карточки */}
            <div>
              <CardHeader>
                <CardTitle className="text-base font-semibold truncate" title={tournament.name}> {/* Уменьшил шрифт заголовка */}
                    {tournament.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground pt-1"> {/* Уменьшил шрифт даты */}
                  {isValidDates
                    ? `${formattedStartDate} — ${formattedEndDate}`
                    : "Даты не указаны" // Заменена нецензурная лексика
                  }
                </p>
              </CardHeader>
              <CardContent className="text-sm"> {/* Уменьшил шрифт контента */}
                 {/* Статус турнира */}
                 <p className={`text-xs capitalize p-1 px-2 rounded inline-block ${statusBgColor} ${statusTextColor} mb-2`}>
                    {statusText}
                 </p>
                 {/* Призовой фонд (показываем, только если он > 0) */}
                 {(tournament.prize ?? 0) > 0 && (
                      <p className="mt-1">
                         Призовой фонд: <span className="font-medium">₸{tournament.prize?.toLocaleString() ?? 0}</span>
                      </p>
                 )}
                 {/* Количество участников (показываем, если > 0) */}
                 {(tournament.participants_count ?? 0) > 0 && (
                     <p className="mt-1 text-xs text-muted-foreground">
                         Участников: {tournament.participants_count}
                     </p>
                 )}
                 {/* Дополнительно можно вывести организатора, если он есть */}
                 {tournament.organizer && (
                     <p className="mt-1 text-xs text-muted-foreground">
                         Организатор: {tournament.organizer}
                     </p>
                 )}
              </CardContent>
            </div>

            {/* Футер с кнопками действий */}
            <CardFooter className="border-t border-border pt-3 pb-3 flex justify-end gap-2 bg-muted/20"> {/* Добавлен фон и padding */}
              <Button
                variant="ghost" // Сделаем кнопки менее навязчивыми
                size="sm"
                onClick={() => onEdit(tournament)} // Вызываем onEdit, передавая весь объект турнира
                title="Редактировать турнир"
                aria-label={`Редактировать турнир ${tournament.name}`}
                className="text-primary hover:bg-muted"
              >
                <Edit className="h-4 w-4" />
                {/*<span className="ml-1 hidden sm:inline">Редактировать</span>*/} {/* Можно добавить текст на больших экранах */}
              </Button>
              <Button
                variant="ghost" // Сделаем кнопки менее навязчивыми
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(tournament.id, tournament.name)} // Вызываем onDelete, передавая ID и имя
                title="Удалить турнир"
                aria-label={`Удалить турнир ${tournament.name}`}
              >
                 <Trash2 className="h-4 w-4" />
                 {/*<span className="ml-1 hidden sm:inline">Удалить</span>*/} {/* Можно добавить текст на больших экранах */}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
