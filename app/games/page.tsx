// GamesPage.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Plus, Search } from "lucide-react";
import Link from "next/link";
import { GameCatalog } from "./game-catalog";
import { GameCategories } from "./game-categories";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UpdateAction {
  title: string;
  description: string;
  buttonText: string;
  variant?: "outline" | "default";
  action: () => void;
}

interface Game {
  name: string;
  categoryId: string; // Теперь categoryId вместо category
}

interface Category {
  id: string;
  name: string;
}

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("catalog");
  const [openAddGameDialog, setOpenAddGameDialog] = useState(false);
  const [newGame, setNewGame] = useState<Game>({ name: "", categoryId: "" });
  const [refreshGames, setRefreshGames] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]); // Список категорий для выпадающего списка

  // Загружаем категории для выпадающего списка
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("id, name");
      if (error) {
        toast({
          title: "Ошибка загрузки категорий",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, []);

  const updateActions: UpdateAction[] = [
    {
      title: "Обновление игр",
      description: "Запустить обновление всех игр",
      buttonText: "Обновить все игры",
      variant: "default",
      action: () => {
        toast({
          title: "Обновление игр",
          description: "Обновление всех игр запущено...",
        });
      },
    },
    {
      title: "Обновление клиента",
      description: "Обновить игровой клиент",
      buttonText: "Обновить клиент",
      variant: "outline",
      action: () => {
        toast({
          title: "Обновление клиента",
          description: "Обновление игрового клиента запущено...",
        });
      },
    },
    {
      title: "Проверка целостности",
      description: "Проверить целостность файлов игр",
      buttonText: "Запустить проверку",
      variant: "outline",
      action: () => {
        toast({
          title: "Проверка целостности",
          description: "Проверка файлов игр запущена...",
        });
      },
    },
  ];

  const handleAddGame = useCallback(() => {
    setOpenAddGameDialog(true);
  }, []);

  const handleAddGameSubmit = async () => {
    if (!newGame.name || !newGame.categoryId) {
      toast({
        title: "Ошибка",
        description: "Укажите название и категорию игры",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("games").insert([
      {
        name: newGame.name,
        category_id: newGame.categoryId, // Используем category_id вместо category
      },
    ]);

    if (error) {
      toast({
        title: "Ошибка добавления игры",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Игра добавлена",
        description: `Игра ${newGame.name} успешно добавлена`,
      });
      setOpenAddGameDialog(false);
      setNewGame({ name: "", categoryId: "" });
      setRefreshGames((prev) => prev + 1);
    }
  };

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setSearchQuery("");
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="border-b bg-background shadow-sm">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-lg font-semibold">GameZone CRM</span>
          </div>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            {[
              { href: "/", label: "Панель" },
              { href: "/bookings", label: "Бронирования" },
              { href: "/customers", label: "Клиенты" },
              { href: "/staff", label: "Персонал" },
              { href: "/pos", label: "Касса" },
              { href: "/games", label: "Игры" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Управление игровым шеллом
          </h2>
          <Button onClick={handleAddGame}>
            <Plus className="mr-2 h-4 w-4" /> Добавить игру
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="catalog">Каталог игр</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="updates">Обновления</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск игр..."
                  className="pl-8 border shadow-sm"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" className="shadow-sm">
                Фильтры
              </Button>
            </div>
            <GameCatalog searchQuery={searchQuery} refresh={refreshGames} />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <GameCategories />
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {updateActions.map((action) => (
                <Card key={action.title} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant={action.variant || "default"}
                      className="w-full"
                      onClick={action.action}
                    >
                      {action.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={openAddGameDialog} onOpenChange={setOpenAddGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новую игру</DialogTitle>
            <DialogDescription>Введите данные игры ниже</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gameName">Название игры</Label>
              <Input
                id="gameName"
                value={newGame.name}
                onChange={(e) => setNewGame((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Например, Dota 2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameCategory">Категория</Label>
              <Select
                value={newGame.categoryId}
                onValueChange={(value) =>
                  setNewGame((prev) => ({ ...prev, categoryId: value }))
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
            <Button variant="outline" onClick={() => setOpenAddGameDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddGameSubmit}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
