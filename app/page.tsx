// app/page.tsx (СИЛЬНО УПРОЩЕННАЯ ВЕРСИЯ ДЛЯ ТЕСТА КНОПКИ)
"use client";

// Оставляем только самые необходимые импорты для этого теста
import { useState } from "react";
import { Button } from "@/components/ui/button"; // Убедись, что Button импортируется правильно
import { MainNav } from "@/components/main-nav"; // Убедись, что MainNav импортируется правильно
import { Plus, UserPlus } from "lucide-react"; // Иконки для кнопок
// Диалоги нужны, чтобы кнопки было куда нажимать
import { StartShiftDialog } from "@/app/components/dialogs/start-shift-dialog"; // ПРОВЕРЬ ПУТЬ!
import { CreateBookingDialog } from "@/components/dialogs/create-booking-dialog"; // ПРОВЕРЬ ПУТЬ!

// Убираем все сложные интерфейсы и состояния, не нужные для теста кнопок
export default function DashboardPageMinimalTest() {

  // Оставляем только состояния для открытия диалогов
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [isStartShiftDialogOpen, setIsStartShiftDialogOpen] = useState(false);

  // Убираем все fetch функции и useEffect для чистоты теста
  const handleBookingCreated = () => { console.log("Booking created callback"); };
  const handleShiftStarted = () => { console.log("Shift started callback"); };

  console.log("Рендеринг УПРОЩЕННОЙ страницы page.tsx"); // Лог для проверки рендеринга

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Заголовок и Кнопки */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-4"> {/* Добавил разделитель для наглядности */}
          <h2 className="text-3xl font-bold tracking-tight">Панель управления (Тест Кнопок)</h2>
          {/* Блок с кнопками */}
          <div className="flex gap-2 flex-wrap border border-dashed border-red-500 p-2"> {/* Добавил красную рамку для визуальной отладки */}
            <p className="w-full text-xs text-red-500">Отладочная рамка вокруг кнопок:</p>
            {/* Кнопка "Начать смену" - без всяких условий! */}
            <Button onClick={() => setIsStartShiftDialogOpen(true)} variant="secondary">
                <UserPlus className="mr-2 h-4 w-4"/> Начать смену (Тест)
            </Button>

            {/* Кнопка "Новое бронирование" - для сравнения */}
            <Button onClick={() => setIsCreateBookingDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Новое бронирование
            </Button>
          </div>
        </div>

        {/* ВСЕ ОСТАЛЬНОЕ УБРАНО ДЛЯ ТЕСТА (Статистика, Вкладки, График, Списки, Карта) */}
        <div className="p-10 border rounded-md bg-card text-center text-muted-foreground">
            Содержимое дашборда (статистика, вкладки и т.д.) временно убрано для теста кнопок.
            <br />
            Сейчас должны быть видны только шапка, заголовок и две кнопки выше.
        </div>

      </main>

      {/* Модальные окна (оставляем, чтобы кнопки работали) */}
      <CreateBookingDialog open={isCreateBookingDialogOpen} onOpenChange={setIsCreateBookingDialogOpen} onBookingCreated={handleBookingCreated} />
      <StartShiftDialog open={isStartShiftDialogOpen} onOpenChange={setIsStartShiftDialogOpen} onShiftStarted={handleShiftStarted} />

    </div>
  );
}
