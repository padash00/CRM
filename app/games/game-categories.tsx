"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Plus, Trash } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Типизация категории
interface Category {
  id: string
  name: string
  description: string
  gamesCount: number
}

// Типизация данных формы
interface CategoryForm {
  name: string
  description: string
}

// Компонент карточки категории
const CategoryCard = ({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: (id: string) => void
  onDelete: (id: string) => void
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
      <Button variant="outline" size="icon" onClick={() => onEdit(category.id)}>
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
)

export function GameCategories() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "C001",
      name: "Шутер",
      description: "Шутеры от первого и третьего лица",
      gamesCount: 5,
    },
    {
      id: "C002",
      name: "MOBA",
      description: "Многопользовательские онлайн боевые арены",
      gamesCount: 2,
    },
    {
      id: "C003",
      name: "MMORPG",
      description: "Массовые многопользовательские ролевые онлайн-игры",
      gamesCount: 1,
    },
    {
      id: "C004",
      name: "Песочница",
      description: "Игры с открытым миром и свободой действий",
      gamesCount: 1,
    },
    {
      id: "C005",
      name: "Спорт",
      description: "Спортивные симуляторы",
      gamesCount: 1,
    },
    {
      id: "C006",
      name: "RPG",
      description: "Ролевые игры",
      gamesCount: 1,
    },
  ])

  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    description: "",
  })

  // Обработчик изменения формы
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }, [])

  // Обработчик добавления категории
  const handleAddCategory = useCallback(() => {
    if (!formData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Название категории не может быть пустым",
        variant: "destructive",
      })
      return
    }

    const newCategory: Category = {
      id: `C${(categories.length + 1).toString().padStart(3, "0")}`,
      name: formData.name,
      description: formData.description,
      gamesCount: 0,
    }

    setCategories((prev) => [...prev, newCategory])
    setFormData({ name: "", description: "" })
    toast({
      title: "Категория добавлена",
      description: `Категория "${newCategory.name}" успешно создана.`,
    })
  }, [formData, categories.length])

  // Обработчик редактирования (заглушка)
  const handleEdit = useCallback((id: string) => {
    const category = categories.find((c) => c.id === id)
    if (category) {
      toast({
        title: "Редактирование",
        description: `Редактирование категории "${category.name}" будет доступно в следующей версии.`,
      })
    }
  }, [categories])

  // Обработчик удаления
  const handleDelete = useCallback((id: string) => {
    const category = categories.find((c) => c.id === id)
    if (category) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast({
        title: "Категория удалена",
        description: `Категория "${category.name}" удалена.`,
      })
    }
  }, [categories])

  return (
    <div className="space-y-6">
      {/* Форма добавления категории */}
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

      {/* Список категорий */}
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
    </div>
  )
}

