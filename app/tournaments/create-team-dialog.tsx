// create-team-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, // Импортируем DialogClose для кнопки Отмена
} from "@/components/ui/dialog" // Убедись, что пути корректны
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabaseClient" // Убедись, что путь корректен
import { toast } from "sonner" // Убедись, что sonner настроен

// Интерфейс для пропсов компонента
interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeamCreated?: () => void // Необязательный коллбэк после успешного создания
}

// Компонент диалога для создания команды
export function CreateTeamDialog({ open, onOpenChange, onTeamCreated }: CreateTeamDialogProps) {
  // Состояния для полей формы и загрузки
  const [teamName, setTeamName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null) // Для отображения ошибок в форме

  // Сброс формы при открытии/закрытии диалога
  useEffect(() => {
    if (!open) {
      // Задержка сброса, чтобы пользователь не видел очистку полей при закрытии
      const timer = setTimeout(() => {
          setTeamName("")
          setLogoUrl("")
          setLoading(false)
          setFormError(null)
      }, 150); // Небольшая задержка
      return () => clearTimeout(timer);
    } else {
        // Можно сбросить сразу при открытии, если нужно
        setTeamName("")
        setLogoUrl("")
        setLoading(false)
        setFormError(null)
    }
  }, [open])

  // Функция для валидации URL (простая проверка)
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true // Пустой URL разрешен (необязательное поле)
    try {
      // Проверяем, что это валидный URL
      const parsedUrl = new URL(url)
      // Дополнительно проверяем, что протокол http или https
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          return false;
      }
      // Простая проверка на наличие расширения картинки в пути
      const imagePattern = /\.(jpg|jpeg|png|gif|svg|webp)$/i
      return imagePattern.test(parsedUrl.pathname)
    } catch (_) {
      // Если new URL() выбросил исключение, URL невалиден
      return false
    }
  }

  // Обработчик создания команды
  const handleCreateTeam = async () => {
    setFormError(null) // Сброс предыдущих ошибок

    // Валидация полей
    const trimmedName = teamName.trim()
    const trimmedLogoUrl = logoUrl.trim()

    if (!trimmedName) {
      const errorMsg = "Название команды не может быть пустым."
      setFormError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (trimmedLogoUrl && !isValidUrl(trimmedLogoUrl)) {
      const errorMsg = "URL логотипа некорректен или не ведет на изображение (jpg, png, gif, svg, webp)."
      setFormError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setLoading(true)

    try {
      // Отправка данных в Supabase
      const { error } = await supabase
        .from("teams") // Указываем таблицу 'teams'
        .insert([
          {
            name: trimmedName,
            logo_url: trimmedLogoUrl || null, // Сохраняем null, если URL не указан
            // Добавь сюда другие поля команды, если они есть в таблице 'teams'
            // например, 'created_by': user_id, 'description': teamDescription, etc.
          },
        ])
        .select() // Можно добавить .select(), если нужно получить созданную запись

      if (error) {
        // Если Supabase вернул ошибку
        throw error
      }

      // Успешное создание
      toast.success(`Команда "${trimmedName}" успешно создана!`)
      onOpenChange(false) // Закрываем диалог
      if (onTeamCreated) {
        onTeamCreated() // Вызываем коллбэк
      }
    } catch (error: any) {
      console.error("Ошибка при создании команды:", error)
      // Пытаемся извлечь сообщение об ошибке
      const message = error.details || error.message || "Произошла неизвестная ошибка."
      const displayError = `Не удалось создать команду: ${message}`
      setFormError(displayError) // Показываем ошибку в форме
      toast.error(displayError) // Показываем ошибку в уведомлении
    } finally {
      setLoading(false) // В любом случае убираем индикатор загрузки
    }
  }

  // JSX разметка диалога
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать новую команду</DialogTitle>
          <DialogDescription>
            Введите информацию о новой команде. Название обязательно.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Поле для названия команды */}
          <div className="space-y-2">
            <Label htmlFor="teamName">Название команды <span className="text-red-500">*</span></Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Например, 'Крутые Бобры'"
              required
              disabled={loading}
              aria-describedby="teamNameError" // Для доступности
            />
            {formError && formError.includes("Название команды") && (
                 <p id="teamNameError" className="text-sm text-red-600">{formError}</p>
             )}
          </div>

          {/* Поле для URL логотипа */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL Логотипа (необязательно)</Label>
            <Input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={loading}
              aria-describedby="logoUrlError logoUrlHelp" // Для доступности
            />
            <p id="logoUrlHelp" className="text-xs text-muted-foreground">
                Прямая ссылка на изображение (jpg, png, gif, svg, webp).
            </p>
            {formError && formError.includes("URL логотипа") && (
                 <p id="logoUrlError" className="text-sm text-red-600">{formError}</p>
             )}
          </div>

          {/* Общая ошибка формы, если не связана с конкретным полем */}
           {formError && !formError.includes("Название команды") && !formError.includes("URL логотипа") &&(
             <p className="text-sm text-red-600">{formError}</p>
           )}

        </div>
        <DialogFooter>
          {/* Используем DialogClose для стандартной кнопки отмены */}
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Отмена
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleCreateTeam} disabled={loading}>
            {loading ? "Создание..." : "Создать команду"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
