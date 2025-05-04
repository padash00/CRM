// components/main-nav.tsx (Предполагаемый путь)
"use client"

import { useState, useCallback, useEffect } from "react"; // Добавили useEffect
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Импортировали useRouter
import { Bell, LayoutDashboard, Settings, LogOut } from "lucide-react"; // Добавили LogOut для иконки
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle"; // Убедись, что путь верный
import { LanguageToggle } from "@/components/language-toggle"; // Убедись, что путь верный
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Используем импортированный useToast, как было в твоем коде
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/language-context"; // Убедись, что путь верный
import { supabase } from "@/lib/supabaseClient"; // --- ДОБАВЛЕН ИМПОРТ SUPABASE ---

// Типизация уведомления (оставляем)
interface Notification { id: number; title: string; description: string; time: string; read: boolean; }

export function MainNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter(); // --- ПОЛУЧАЕМ ЭКЗЕМПЛЯР РОУТЕРА ---
  const { toast } = useToast(); // --- ИСПОЛЬЗУЕМ useToast ---

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // TODO: Заменить на динамическую загрузку уведомлений
  const [notifications, setNotifications] = useState<Notification[]>([
     { id: 1, title: "Уақыт аяқталуда", description: "Алексей К. (PC-01) клиентінде 15 минут қалды", time: "5 минут бұрын", read: false, },
     { id: 2, title: "Жаңа брондау", description: "18:00-ге жаңа брондау жасалды", time: "15 минут бұрын", read: false, },
     { id: 3, title: "Қорлар аз", description: "Энергетикалық сусындар азайып барады (5 дана қалды)", time: "30 минут бұрын", read: true, },
     { id: 4, title: "Техникалық мәселе", description: "PC-06 техникалық қызмет көрсетуді қажет етеді", time: "1 сағат бұрын", read: true, },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // TODO: Обновить логику для работы с БД
  const markAllAsRead = useCallback(() => { setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); toast({ title: t("markAllAsRead"), description: t("allNotificationsMarked"), }); }, [t, toast]);
  const markAsRead = useCallback( (id: number) => { setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))); toast({ title: t("notificationRead"), description: t("notificationMarkedAsRead"), }); }, [t, toast] );

  // --- ОБНОВЛЕННАЯ ФУНКЦИЯ ВЫХОДА ---
  const handleLogout = useCallback(async () => {
    console.log("Выполнение выхода..."); // DEBUG
    try {
      // Вызываем метод signOut из Supabase Auth
      const { error } = await supabase.auth.signOut();

      if (error) {
        // Показываем ошибку, если выход не удался
        console.error("Ошибка выхода:", error);
        toast({
          variant: "destructive", // Используем вариант destructive для ошибок
          title: t("logoutError") || "Ошибка выхода",
          description: error.message,
        });
      } else {
        // Успешный выход
        toast({
          title: t("logout") || "Выход",
          description: t("loggedOutSuccessfully") || "Вы успешно вышли из системы.",
        });
        // Перенаправляем на страницу входа
        // replace: true заменяет текущую страницу в истории, чтобы нельзя было вернуться назад кнопкой браузера
        router.replace('/login');
        // Или router.push('/login'), если хочешь оставить возможность вернуться
        console.log("Перенаправление на /login"); // DEBUG
      }
    } catch (err) {
       // Обработка непредвиденных ошибок
       console.error("Непредвиденная ошибка при выходе:", err);
       toast({
          variant: "destructive",
          title: t("logoutError") || "Ошибка выхода",
          description: err instanceof Error ? err.message : String(err),
       });
    }
  }, [t, router, toast]); // Добавили router и toast в зависимости useCallback
  // --- КОНЕЦ ОБНОВЛЕННОЙ ФУНКЦИИ ВЫХОДА ---


  // Элементы навигации (оставляем как есть)
  const navItems = [ { href: "/", label: t("dashboard") }, { href: "/bookings", label: t("bookings") }, /* ... остальные ... */ { href: "/tournaments", label: t("tournaments") }, { href: "/tariffs", label: t("tariffs") }, ];

  return (
    <div className="border-b shadow-sm bg-card"> {/* Добавил bg-card для фона */}
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Логотип/Название */}
        <div className="flex items-center gap-2 mr-6"> {/* Добавил отступ справа */}
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold whitespace-nowrap">F16 Arena CRM</span> {/* Добавил whitespace-nowrap */}
        </div>
        {/* Навигация */}
        <nav className="flex-grow items-center gap-4 sm:gap-6 hidden md:flex"> {/* Скрываем на маленьких экранах */}
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`text-sm font-medium transition-colors hover:text-primary ${ pathname === item.href ? "text-primary" : "text-muted-foreground" }`} >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Правая часть: Иконки */}
        <div className="ml-auto flex items-center gap-2">
            {/* ... Уведомления, Язык, Тема ... */}
             <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => setNotificationsOpen(true)}> <Bell className="h-5 w-5" /> {unreadCount > 0 && ( <Badge className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center p-0 bg-red-500 text-white">{unreadCount}</Badge> )} </Button>
             <LanguageToggle />
             <ThemeToggle />
             {/* Меню Настроек */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full"> <Settings className="h-5 w-5" /> </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="shadow-lg w-48"> {/* Увеличил ширину */}
                <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* TODO: Сделать эти пункты ссылками или вызывать действия */}
                <DropdownMenuItem className="cursor-pointer">{t("profile")}</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">{t("settings")}</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">{t("tariffs")}</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">{t("integrations")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                 {/* --- Используем ОБНОВЛЕННЫЙ handleLogout --- */}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-100 focus:text-red-700">
                  <LogOut className="mr-2 h-4 w-4"/> {/* Добавили иконку */}
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Диалог уведомлений (остается без изменений логики, только стили) */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-md"> {/* Уменьшил макс. ширину */}
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{t("notifications")}</span>
              {notifications.length > 0 && ( <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}> {t("markAllAsRead")} </Button> )}
            </DialogTitle>
            <DialogDescription>{t("latestNotifications")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1 pr-3"> {/* Добавил padding */}
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">{t("noNotifications")}</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border relative transition-opacity ${ notification.read ? "opacity-60 border-transparent" : "bg-muted/50" }`} >
                  {/* Кнопка для пометки как прочитанное */}
                  {!notification.read && (
                       <button onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }} className="absolute top-1 right-1 p-1 rounded hover:bg-background" title="Пометить как прочитанное">
                           <span className="text-xs">✓</span>
                       </button>
                  )}
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
