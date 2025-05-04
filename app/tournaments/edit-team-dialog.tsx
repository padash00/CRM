// components/tournaments/edit-team-dialog.tsx (пример пути)
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, // Для кнопки "Отмена"
} from "@/components/ui/dialog"; // Путь к твоим UI компонентам
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient"; // Путь к supabase клиенту
import { toast } from "sonner"; // Для уведомлений

// Интерфейс Команды (должен совпадать с используемым в page.tsx и TeamList.tsx)
interface Team {
    id: string;
    name: string;
    logo_url: string | null;
    created_at: string;
    // Добавь другие поля при необходимости
}

// Интерфейс пропсов для диалога редактирования
interface EditTeamDialogProps {
  open: boolean; // Открыт ли диалог
  onOpenChange: (open: boolean) => void; // Функция для управления состоянием open
  team: Team | null; // Объект команды для редактирования (или null, если нет)
  onTeamUpdated: () => void; // Коллбэк, вызываемый после успешного обновления
}

export function EditTeamDialog({ open, onOpenChange, team, onTeamUpdated }: EditTeamDialogProps) {
  // Состояния для полей формы, загрузки и ошибок
  const [teamName, setTeamName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // useEffect для заполнения формы данными из пропса 'team'
  // Запускается, когда меняется 'team' или диалог открывается ('open' становится true)
  useEffect(() => {
    // Заполняем форму, только если есть данные команды и диалог открыт
    if (team && open) {
      setTeamName(team.name || ""); // Используем пустую строку, если имя null/undefined
      setLogoUrl(team.logo_url || ""); // Используем пустую строку, если URL null/undefined
      setFormError(null); // Сбрасываем ошибки при загрузке новых данных
    }
    // Если диалог закрывается, стейт сбрасывается через handleOpenChange
  }, [team, open]); // Зависимости эффекта

  // Функция валидации URL (такая же, как в CreateTeamDialog)
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Пустой URL валиден
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) return false;
      const imagePattern = /\.(jpg|jpeg|png|gif|svg|webp)$/i; // Паттерн для картинок
      return imagePattern.test(parsedUrl.pathname);
    } catch (_) {
      return false; // Ошибка парсинга URL
    }
  };

  // Обработчик сохранения изменений
  const handleUpdateTeam = async () => {
    // Проверяем, что объект команды существует и у него есть ID
    if (!team || !team.id) {
      toast.error("Ошибка: Невозможно определить команду для обновления.");
      setFormError("Ошибка: Отсутствуют данные команды.");
      return;
    }

    setFormError(null); // Сброс предыдущих ошибок
    const trimmedName = teamName.trim();
    const trimmedLogoUrl = logoUrl.trim();

    // Валидация введенных данных
    if (!trimmedName) {
      const errorMsg = "Название команды не может быть пустым.";
      setFormError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (trimmedLogoUrl && !isValidUrl(trimmedLogoUrl)) {
      const errorMsg = "URL логотипа некорректен или не ведет на изображение (jpg, png, gif, svg, webp).";
      setFormError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true); // Включаем индикатор загрузки

    try {
      // Данные для обновления
      const updateData = {
        name: trimmedName,
        logo_url: trimmedLogoUrl || null, // Сохраняем null, если поле пустое
        // Можно добавить поле updated_at: new Date().toISOString() для отслеживания обновлений
      };

      // Выполняем запрос на обновление в Supabase
      const { error } = await supabase
        .from("teams") // Указываем таблицу
        .update(updateData) // Передаем новые данные
        .match({ id: team.id }); // Указываем, какую запись обновлять по ID

      if (error) {
        // Если Supabase вернул ошибку, выбрасываем ее
        throw error;
      }

      // Успешное обновление
      toast.success(`Команда "${trimmedName}" успешно обновлена!`);
      onTeamUpdated(); // Вызываем коллбэк для обновления списка в page.tsx
      onOpenChange(false); // Закрываем диалоговое окно

    } catch (error: any) {
      // Обработка ошибок (валидации или от Supabase)
      console.error("Ошибка при обновлении команды:", error);
      const message = error.details || error.message || "Произошла неизвестная ошибка.";
      const displayError = `Не удалось обновить команду: ${message}`;
      setFormError(displayError); // Показываем ошибку в форме
      toast.error(displayError); // Показываем ошибку в уведомлении
    } finally {
      setLoading(false); // Выключаем индикатор загрузки в любом случае
    }
  };

   // Обработчик изменения состояния открытия/закрытия диалога
   const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        // При закрытии сбрасываем локальные ошибки и состояние загрузки
        // Поля формы сбросятся через useEffect при следующем открытии/смене team
         setFormError(null);
         setLoading(false);
    }
    onOpenChange(isOpen); // Вызываем внешний обработчик
  };

  // JSX разметка диалога
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактировать команду</DialogTitle>
          <DialogDescription>
            Измените данные команды '{team?.name || ''}'. Нажмите "Сохранить", чтобы применить изменения.
          </DialogDescription>
        </DialogHeader>

        {/* Отображаем форму только если есть данные команды */}
        {team ? (
          <div className="grid gap-4 py-4">
            {/* Поле: Название команды */}
            <div className="space-y-2">
              <Label htmlFor="editTeamName">Название команды <span className="text-red-500">*</span></Label>
              <Input
                id="editTeamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Введите название команды"
                required
                disabled={loading}
                aria-describedby="editTeamNameError"
              />
              {/* Отображение ошибки валидации для этого поля */}
              {formError && formError.toLowerCase().includes("название команды") && (
                 <p id="editTeamNameError" className="text-sm text-red-600">{formError}</p>
              )}
            </div>

            {/* Поле: URL Логотипа */}
            <div className="space-y-2">
              <Label htmlFor="editLogoUrl">URL Логотипа (необязательно)</Label>
              <Input
                id="editLogoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                disabled={loading}
                aria-describedby="editLogoUrlError editLogoUrlHelp"
              />
              <p id="editLogoUrlHelp" className="text-xs text-muted-foreground">
                  Прямая ссылка на изображение (jpg, png, gif, svg, webp).
              </p>
              {/* Отображение ошибки валидации для этого поля */}
              {formError && formError.toLowerCase().includes("url логотипа") && (
                 <p id="editLogoUrlError" className="text-sm text-red-600">{formError}</p>
              )}
            </div>

            {/* Отображение общих ошибок формы (например, от Supabase) */}
            {formError && !formError.toLowerCase().includes("название команды") && !formError.toLowerCase().includes("url логотипа") && (
               <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>
        ) : (
          // Если данных команды нет (например, при первой загрузке)
          <div className="py-6 text-center text-muted-foreground">
            Загрузка данных команды...
          </div>
        )}

        {/* Футер с кнопками */}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Отмена
            </Button>
          </DialogClose>
          {/* Кнопка сохранения активна только если есть данные команды */}
          <Button type="button" onClick={handleUpdateTeam} disabled={loading || !team}>
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
