"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

// Типизация игры
interface Game {
  id: string;
  name: string;
  category: string;
  size: string;
  lastUpdated: string;
  popularity: "Высокая" | "Средняя" | "Низкая";
  status: "installed" | "not-installed";
}

interface GameCatalogProps {
  searchQuery: string;
  refresh: number;
}

// Компонент карточки игры
const GameCard = ({
  game,
  onInstall,
  onUpdate,
  onDelete,
}: {
  game: Game;
  onInstall: (id: string) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const handleEdit = useCallback(() => {
    toast({
      title: "Редактирование игры",
      description: `Редактирование игры ${game.name} будет доступно в следующей версии.`,
    });
  }, [game.name]);

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{game.name}</CardTitle>
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
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(game.id)}
              >
                <Trash className="mr-2 h-4 w-4" /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Категория:</span>
            <Badge variant="outline">{game.category}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Размер:</span>
            <span>{game.size}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Обновлено:</span>
            <span>{game.lastUpdated}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Популярность:</span>
            <Badge
              variant="secondary"
              className={
                game.popularity === "Высокая"
                  ? "bg-green-100 text-green-800"
                  : game.popularity === "Средняя"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {game.popularity}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {game.status === "installed" ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onUpdate(game.id)}
          >
            Обновить
          </Button>
        ) : (
          <Button className="w-full" onClick={() => onInstall(game.id)}>
            <Download className="mr-2 h-4 w-4" /> Установить
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export function GameCatalog({ searchQuery, refresh }: GameCatalogProps) {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase.from("games").select("*");
      if (error) {
        toast({
          title: "Ошибка загрузки игр",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Преобразуем данные из Supabase в формат Game
        const transformedGames = (data || []).map((game) => ({
          id: game.id,
          name: game.name,
          category: game.category,
          size: "N/A", // Пока не храним размер в базе, можно добавить колонку
          lastUpdated: new Date(game.created_at).toLocaleDateString("ru-RU"),
          popularity: "Средняя" as "Высокая" | "Средняя" | "Низкая", // Пока захардкодим, можно добавить логику
          status: "not-installed" as "installed" | "not-installed", // Пока захардкодим
        }));
        setGames(transformedGames);
      }
    };

    fetchGames();
  }, [refresh]);

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstall = useCallback((id: string) => {
    setGames((prev) =>
      prev.map((game) =>
        game.id === id ? { ...game, status: "installed" } : game
      )
    );
    const game = games.find((g) => g.id === id);
    if (game) {
      toast({
        title: "Установка начата",
        description: `Игра ${game.name} устанавливается...`,
      });
    }
  }, [games]);

  const handleUpdate = useCallback((id: string) => {
    const game = games.find((g) => g.id === id);
    if (game) {
      toast({
        title: "Обновление начато",
        description: `Игра ${game.name} обновляется...`,
      });
    }
  }, [games]);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("games").delete().eq("id", id);
    if (error) {
      toast({
        title: "Ошибка удаления игры",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setGames((prev) => prev.filter((game) => game.id !== id));
      const game = games.find((g) => g.id === id);
      if (game) {
        toast({
          title: "Игра удалена",
          description: `Игра ${game.name} удалена из каталога`,
        });
      }
    }
  }, [games]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredGames.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onInstall={handleInstall}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
