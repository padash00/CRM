// components/main-nav.tsx (Полностью на русском, без смены языка, все ссылки видимы)
"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle"; // Убедись, что путь верный
// import { LanguageToggle } from "@/components/language-toggle"; // --- УДАЛЕН ИМПОРТ ЯЗЫКА ---
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast"; // Используем этот toast
// import { useLanguage } from "@/contexts/language-context"; // --- УДАЛЕН ИМПОРТ КОНТЕКСТА ЯЗЫКА ---
import { supabase } from "@/lib/supabaseClient"; // --- Убедись, что путь верный ---

// Типизация уведомления
interface Notification {
    // TODO: Заменить на структуру из БД, когда будет готова таблица notifications
    id: number; title: string; description: string; time: string; read: boolean;
    // Примерно: id: string; user_id: string; title: string; description: string; read: boolean; created_at: string; link?: string; type?: string;
}

export function MainNav() {
  // const { t } = useLanguage(); // --- УДАЛЕНО ---
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // --- УДАЛЕНЫ СТАТИЧЕСКИЕ УВЕДОМЛЕНИЯ ---
  // Начинаем с пустого массива, позже будем загружать из БД
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length; // Будет работать с реальными данными

  // TODO: Реализовать загрузку уведомлений в useEffect

  // TODO: Обновить логику для работы с БД
  const markAllAsRead = useCallback(() => {
    // Здесь будет логика обновления ВСЕХ уведомлений в БД как прочитанных для текущего user_id
    console.log("Отмечаем все как прочитанные (заглушка)...");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); // Оптимистичное обновление UI
    toast({ title: "Уведомления прочитаны", description: "Все уведомления отмечены как прочитанные." });
  }, [toast]);

  const markAsRead = useCallback( (id: number | string) => { // ID может быть string из БД
    // Здесь будет логика обновления ОДНОГО уведомления в БД как прочитанного (match по id и user_id)
    console.log(`Отмечаем ${id} как прочитанное (заглушка)...`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))); // Оптимистичное обновление UI
    toast({ title: "Уведомление прочитано", description: "Уведомление отмечено как прочитанное." });
  }, [toast] );

  // Функция выхода
  const handleLogout = useCallback(async () => {
    console.log("Выполнение выхода...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({ variant: "destructive", title: "Ошибка выхода", description: error.message });
      } else {
        toast({ title: "Выход", description: "Вы успешно вышли из системы." });
        router.replace('/login'); // Перенаправляем на страницу входа
      }
    } catch (err) {
       toast({ variant: "destructive", title: "Ошибка выхода", description: err instanceof Error ? err.message : String(err) });
    }
  }, [router, toast]); // Убрали t


  // Элементы навигации с русским текстом
  const navItems = [
    { href: "/", label: "Панель управления" },
    { href: "/bookings", label: "Бронирования" },
    { href: "/customers", label: "Клиенты" },
    { href: "/staff", label: "Персонал" },
    { href: "/pos", label: "Касса" },
    { href: "/games", label: "Игры" },
    { href: "/tournaments", label: "Турниры" },
    { href: "/tariffs", label: "Тарифы" },
  ];

  return (
    <div className="border-b shadow-sm bg-card">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Лого/Название */}
        <div className="flex items-center gap-2 mr-4 md:mr-6"> {/* Уменьшил отступ на md */}
           <Link href="/" className="flex items-center gap-2">
               <LayoutDashboard className="h-6 w-6 text-primary" />
               <span className="text-lg font-semibold whitespace-nowrap">F16 Arena CRM</span>
           </Link>
        </div>

        {/* --- НАВИГАЦИЯ (без hidden md:flex, с flex-wrap) --- */}
        {/* Добавлен overflow-x-auto для случаев, когда даже с переносом не влезает */}
        <nav className="flex-grow items-center gap-2 sm:gap-4 flex flex-nowrap overflow-x-auto scrollbar-hide h-16 mr-2 md:mr-4">
          {navItems.map((item) => (
            <Link
                key={item.href}
                href={item.href}
                // Добавил padding для лучшего вида на мобильных
                className={`px-2 py-1 text-sm font-medium transition-colors hover:text-primary whitespace-nowrap rounded-md ${
                    pathname === item.href
                     ? "text-primary bg-muted" // Выделение активной ссылки фоном
                     : "text-muted-foreground hover:bg-muted/50"
                }`}
             >
              {item.label} {/* Используем статичный русский текст */}
            </Link>
          ))}
        </nav>
        {/* --- КОНЕЦ НАВИГАЦИИ --- */}

        {/* Правая часть: Иконки */}
        <div className="ml-auto flex items-center flex-shrink-0 gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="relative rounded-full w-8 h-8" onClick={() => setNotificationsOpen(true)} aria-label="Уведомления">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && ( <Badge className="absolute -top-1 -right-1 h-4 w-4 text-[9px] flex items-center justify-center p-0">{unreadCount}</Badge> )}
            </Button>
            {/* --- УДАЛЕН LanguageToggle --- */}
            <ThemeToggle />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" aria-label="Настройки">
                        <Settings className="h-4 w-4" />
                    </Button>
                 </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="shadow-lg w-48">
                    {/* Используем статичный русский текст */}
                    <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* TODO: Сделать ссылками или привязать действия */}
                    <DropdownMenuItem className="cursor-pointer" onSelect={()=> router.push('/profile')}>Профиль</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onSelect={()=> router.push('/settings')}>Настройки</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onSelect={()=> router.push('/tariffs')}>Тарифы</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" disabled>Интеграции</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-100 focus:text-red-700">
                        <LogOut className="mr-2 h-4 w-4"/>
                        <span>Выход</span>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Диалог уведомлений */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
         <DialogContent className="sm:max-w-md">
             <DialogHeader>
                 <DialogTitle className="flex justify-between items-center">
                     <span>Уведомления</span>
                     {notifications.length > 0 && ( <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}> Отметить все как прочитанные </Button> )}
                 </DialogTitle>
                 <DialogDescription>Последние уведомления</DialogDescription>
             </DialogHeader>
             {/* Отображение списка или заглушки */}
             <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1 pr-3 -mr-2"> {/* Добавил отрицательный margin для компенсации padding родителя */}
                 {notifications.length === 0 ? (
                     <p className="text-center text-muted-foreground py-6">Новых уведомлений нет.</p>
                 ) : (
                     notifications.map((notification) => (
                         <div key={notification.id} className={`p-3 rounded-lg border relative transition-opacity ${ notification.read ? "opacity-60 border-transparent" : "bg-muted/50" }`} >
                             {!notification.read && ( <button onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }} className="absolute top-1 right-1 p-1 rounded hover:bg-background" title="Пометить как прочитанное"> <span className="text-xs">✓</span> </button> )}
                             <div className="font-medium text-sm">{notification.title}</div>
                             <div className="text-sm text-muted-foreground mt-1">{notification.description}</div>
                             <div className="text-xs text-muted-foreground mt-2">{notification.time}</div>
                         </div>
                     ))
                 )}
             </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}
