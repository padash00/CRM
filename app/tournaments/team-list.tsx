// app/tournaments/team-list.tsx
"use client"

import React, { FC } from 'react'; // Импортируем FC
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"; // Можно использовать Card для обертки
import { Edit, Trash2, Users } from 'lucide-react'; // Импортируем Users здесь

// Предполагаем, что интерфейс Team импортируется из другого файла
// import { Team } from '@/path/to/interfaces';
// Если нет, можно раскомментировать и использовать локальное определение:
 interface Team {
     id: string;
     name: string;
     logo_url: string | null;
     created_at: string;
     // Добавь другие поля, если они есть
 }

interface TeamListProps {
    teams: Team[];
    onEdit: (team: Team) => void;
    onDelete: (teamId: string) => void;
}

export const TeamList: FC<TeamListProps> = ({ teams, onEdit, onDelete }) => {

    if (!teams || teams.length === 0) {
        return (
            <Card className="mt-4">
                <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                        Команды не найдены. Вы можете создать новую команду.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="border rounded-md">
            <ul className="divide-y divide-border">
                {teams.map((team) => (
                    <li key={team.id} className="flex items-center justify-between p-3 pr-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden"> {/* Добавлен overflow-hidden */}
                            {/* Логотип */}
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border">
                                {team.logo_url ? (
                                    <ImageComponent src={team.logo_url} alt={team.name} />
                                ) : (
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            {/* Название */}
                            <span className="font-medium truncate">{team.name}</span> {/* Добавлен truncate */}
                        </div>
                        {/* Кнопки */}
                        <div className="flex gap-1 md:gap-2 flex-shrink-0 ml-2"> {/* Добавлен flex-shrink-0 и ml-2 */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(team)}
                                title={`Редактировать ${team.name}`}
                                className="h-8 w-8 md:h-9 md:w-9" // Адаптивный размер
                            >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Редактировать</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive/90 h-8 w-8 md:h-9 md:w-9" // Адаптивный размер
                                onClick={() => onDelete(team.id)}
                                title={`Удалить ${team.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Удалить</span>
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Небольшой вспомогательный компонент для Image с обработкой ошибок
const ImageComponent: FC<{ src: string; alt: string }> = ({ src, alt }) => {
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(false); // Сбрасываем ошибку при смене src
    }, [src]);

    if (error || !src) {
        return <Users className="h-5 w-5 text-muted-foreground" />; // Fallback иконка
    }

    return (
        <Image
            src={src}
            alt={`${alt} logo`}
            width={40}
            height={40}
            className="object-cover h-full w-full"
            onError={() => setError(true)} // Устанавливаем флаг ошибки
            unoptimized={src.endsWith('.gif')} // Отключаем оптимизацию для GIF, если нужно
        />
    );
};
