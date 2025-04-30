// game-categories.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash } from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  description: string;
  gamesCount: number;
}

interface CategoryForm {
  name: string;
  description: string;
}

interface GameCategoriesProps {
  onCategoryAdded?: () => void; // Callback для обновления списка категорий в GamesPage
}

const CategoryCard = ({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle>{category.name}</CardTitle>
      <CardDescription>{category.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-sm">
        Количество игр: <span className="font-medium">{category.gamesCount}</span>
      </div>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant="outline" size="icon" onClick={() => onEdit(category)}>
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Редактировать</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="text-destructive"
        onClick={() => onDelete(category.id)}
      >
        <Trash className="h-4 w-4" />
        <span className="sr-only">Удалить</span>
      </Button>
    </CardFooter>
  </Card>
);

export function GameCategories({ onCategoryAdded }: GameCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CategoryForm>({ name: "", description: "" });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*");

      if (categoriesError) {
        toast({
          title: "Ошибка загрузки категорий",
          description: categoriesError.message,
          variant: "destructive",
        });
        return;
      }

      const categoriesWithGamesCount = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count, error } = await supabase
            .from("games")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id);

          if (error) {
            toast({
              title: "Ошибка подсчёта игр",
              description: error.message,
              variant: "destructive",
            });
            return { ...category, gamesCount: 0 };
          }

          return {
            ...category,
            gamesCount: count || 0,
          };
        })
      );

      setCategories(categoriesWithGamesCount);
    };

    fetchCategories();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleAddCategory = useCallback(async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Название категории не может быть пустым",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: formData.name, description: formData.description }])
      .select();

    if (error) {
      toast({
        title: "Ошибка добавления категории",
        description: error.message,
        variant: "destructive",
      });
    } else if (data && data[0]) {
      setCategories((prev) => [...prev, { ...data[0], gamesCount: 0 }]);
      setFormData({ name: "", description: "" });
      toast({
        title: "Категория добавлена",
        description: `Категория "${data[0].name}" успешно создана.`,
      });
      if (onCategoryAdded) {
        onCategoryAdded(); // Вызываем callback, чтобы обновить список категорий в GamesPage
      }
    }
  }, [formData, onCategoryAdded]);

  const handleEdit = useCallback((category: Category) => {
    setEditCategory(category);
    setFormData({ name: category.name, description: category.description });
    setOpenEditDialog(true);
  }, []);

  const handleEditSubmit = useCallback(async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Название категории не может быть пустым",
        variant: "destructive",
      });
      return;
    }

    if (!editCategory) return;

    const { data, error } = await supabase
      .from("categories")
      .update({ name: formData.name, description: formData.description })
      .eq("id", editCategory.id)
      .select();

    if (error) {
      toast({
        title: "Ошибка редактирования категории",
        description: error.message,
        variant: "destructive",
      });
    } else if (data && data[0]) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editCategory.id ? { ...cat, name: data[0].name, description: data[0].description } : cat
        )
      );
      setOpenEditDialog(false);
      setEditCategory(null);
      setFormData({ name: "", description: "" });
      toast({
        title: "Категория обновлена",
        description: `Категория "${data[0].name}" успешно обновлена.`,
      });
      if (onCategoryAdded) {
        onCategoryAdded(); // Обновляем список категорий в GamesPage
      }
    }
  }, [editCategory, formData, onCategoryAdded]);

  const handleDelete = useCallback(async (id: string) => {
    const { count, error: countError } = await supabase
      .from("games")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      toast({
        title: "Ошибка проверки игр",
        description: countError.message,
        variant: "destructive",
      });
      return;
    }

    if (count && count > 0) {
      toast({
        title: "Ошибка удаления",
        description: "Нельзя удалить категорию, в которой есть игры.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({
        title: "Ошибка удаления категории",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      const category = categories.find((c) => c.id === id);
      if (category) {
        toast({
          title: "Категория удалена",
          description: `Категория "${category.name}" удалена.`,
        });
      }
      if (onCategoryAdded) {
        onCategoryAdded(); // Обновляем список категорий в GamesPage
      }
    }
  }, [categories, onCategoryAdded]);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Добавить категорию</CardTitle>
          <CardDescription>Создайте новую категорию для игр</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название категории</Label>
              <Input
                id="name"
                placeholder="Введите название категории"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                placeholder="Введите описание категории"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto" onClick={handleAddCategory}>
            <Plus className="mr-2 h-4 w-4" /> Добавить категорию
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать категорию</DialogTitle>
            <DialogDescription>Обновите данные категории ниже</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название категории</Label>
              <Input
                id="name"
                placeholder="Введите название категории"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                placeholder="Введите описание категории"
                value={formData.description}
                onChange={handleInputChange}
              />
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
    </div>
  );
}
