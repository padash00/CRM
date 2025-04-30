// game-catalog.tsx
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Game {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  size: string;
  lastUpdated: string;
  popularity: "Высокая" | "Средняя" | "Низкая";
  status: "installed" | "not-installed";
}

interface Category {
  id: string;
  name: string;
}

interface Filters {
  categoryId: string;
  popularity: "Высокая" | "Средняя" | "Низкая" | "";
  status: "installed" | "not-installed" | "";
}

interface GameCatalogProps {
  searchQuery: string;
  refresh: number;
  categories: Category[];
  filters: Filters;
}

const GameCard = ({
  game,
  onInstall,
  onUpdate,
  onDelete,
  onEdit,
}: {
  game: Game;
  onInstall: (id: string) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (game: Game) => void;
}) => {
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
              <DropdownMenuItem onClick={() => onEdit(game)}>
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

export function GameCatalog({ searchQuery, refresh, categories, filters }: GameCatalogProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<{ name: string; categoryId: string }>({
    name: "",
    categoryId: "",
  });

  useEffect(() => {
    const fetchGames = async () => {
      let query = supabase.from("games").select("*, categories(name)");

      // Фильтрация по поиску
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      // Фильтрация по категории
      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      // Пока popularity и status захардкодены, поэтому фильтруем на клиенте
      const { data: gamesData, error: gamesError } = await query;

      if (gamesError) {
        toast({
          title: "Ошибка загрузки игр",
          description: gamesError.message,
          variant: "destructive",
        });
      } else {
        const transformedGames = (gamesData || []).map((game) => ({
          id: game.id,
          name: game.name,
          category: game.categories?.name || "Без категории",
          categoryId: game.category_id,
          size: "N/A",
          lastUpdated: new Date(game.created_at).toLocaleDateString("ru-RU"),
          popularity: "Средняя" as "Высокая" | "Средняя" | "Низкая",
          status: "not-installed" as "installed" | "not-installed",
        }));

        // Фильтрация по popularity и status на клиенте (пока они захардкодены)
        const filteredGames = transformedGames.filter((game) => {
          const matchesPopularity = filters.popularity ? game.popularity === filters.popularity : true;
          const matchesStatus = filters.status ? game.status === filters.status : true;
          return matchesPopularity && matchesStatus;
        });

        setGames(filteredGames);
      }
    };

    fetchGames();
  }, [refresh, searchQuery, filters, categories]);

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

  const handleEdit = useCallback((game: Game) => {
    setEditGame(game);
    setEditFormData({ name: game.name, categoryId: game.categoryId });
    setOpenEditDialog(true);
  }, []);

  const handleEditSubmit = useCallback(async () => {
    if (!editFormData.name.trim() || !editFormData.categoryId) {
      toast({
        title: "Ошибка",
        description: "Укажите название и категорию игры",
        variant: "destructive",
      });
      return;
    }

    if (!editGame) return;

    const { data, error } = await supabase
      .from("games")
      .update({ name: editFormData.name, category_id: editFormData.categoryId })
      .eq("id", editGame.id)
      .select();

    if (error) {
      toast({
        title: "Ошибка редактирования игры",
        description: error.message,
        variant: "destructive",
      });
    } else if (data && data[0]) {
      setGames((prev) =>
        prev.map((game) =>
          game.id === editGame.id
            ? {
                ...game,
                name: data[0].name,
                categoryId: data[0].category_id,
                category: categories.find((cat) => cat.id === data[0].category_id)?.name || "Без категории",
              }
            : game
        )
      );
      setOpenEditDialog(false);
      setEditGame(null);
      setEditFormData({ name: "", categoryId: "" });
      toast({
        title: "Игра обновлена",
        description: `Игра "${data[0].name}" успешно обновлена.`,
      });
    }
  }, [editGame, editFormData, categories]);

  const handleEditInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditFormData((prev) => ({ ...prev, name: value }));
  }, []);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onInstall={handleInstall}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать игру</DialogTitle>
            <DialogDescription>Обновите данные игры ниже</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editGameName">Название игры</Label>
              <Input
                id="editGameName"
                value={editFormData.name}
                onChange={handleEditInputChange}
                placeholder="Например, Dota 2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editGameCategory">Категория</Label>
              <Select
                value={editFormData.categoryId}
                onValueChange={(value) =>
                  setEditFormData((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditSubmit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
