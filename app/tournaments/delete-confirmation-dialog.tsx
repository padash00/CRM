// components/shared/delete-confirmation-dialog.tsx (пример пути)
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // Хотя триггер обычно находится снаружи, импорт оставляем
} from "@/components/ui/alert-dialog"; // Убедись, что импорт идет из alert-dialog
import { Button } from "@/components/ui/button"; // Button может понадобиться для стилизации AlertDialogAction

// Интерфейс пропсов для диалога подтверждения
interface DeleteConfirmationDialogProps {
  open: boolean; // Открыт ли диалог
  onOpenChange: (open: boolean) => void; // Функция для управления состоянием open
  onConfirm: () => void; // Функция, которая вызывается при нажатии "Да, удалить"
  itemName?: string | null; // Необязательное имя элемента для сообщения
  itemType?: string | null; // Необязательный тип элемента (напр., "турнир", "команду")
  loading?: boolean; // Необязательное состояние загрузки (для кнопки подтверждения)
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName = "выбранный элемент", // Имя по умолчанию
  itemType = "", // Тип по умолчанию (пустая строка)
  loading = false, // Загрузка по умолчанию false
}: DeleteConfirmationDialogProps) {

  // Формируем сообщение для пользователя
  const itemTypeDisplay = itemType ? `${itemType} ` : "этот элемент "; // Добавляем тип и пробел, если есть
  // Сообщение будет разным в зависимости от того, передано ли имя
  const confirmationMessage = `Вы уверены, что хотите удалить ${itemTypeDisplay}"${itemName}"? Это действие необратимо.`;
  const defaultMessage = "Вы уверены, что хотите удалить этот элемент? Это действие необратимо.";

  return (
    // Используем AlertDialog для подтверждения деструктивных действий
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
          <AlertDialogDescription>
            {/* Показываем более конкретное сообщение, если itemName передано */}
            {itemName !== "выбранный элемент" ? confirmationMessage : defaultMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Стандартная кнопка отмены из AlertDialog */}
          <AlertDialogCancel disabled={loading}>
              Отмена
          </AlertDialogCancel>
          {/* Стандартная кнопка подтверждения действия из AlertDialog */}
          {/* Мы можем применить к ней стили кнопки с вариантом "destructive" */}
          <AlertDialogAction
            onClick={(e) => {
              // Предотвращаем закрытие окна по умолчанию, если идет загрузка (хотя disabled должен это делать)
              if (loading) {
                  e.preventDefault();
                  return;
              }
              onConfirm(); // Вызываем переданную функцию подтверждения
            }}
            disabled={loading}
            // Применяем стили для "разрушительной" кнопки
            // Если у тебя настроены варианты в buttonVariants: className={buttonVariants({ variant: "destructive" })}
            // Или вручную через классы Tailwind:
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
          >
            {loading ? "Удаление..." : "Да, удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
