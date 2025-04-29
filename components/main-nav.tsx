"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, LayoutDashboard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"

// Типизация уведомления
interface Notification {
  id: number
  title: string
  description: string
  time: string
  read: boolean
}

export function MainNav() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Уақыт аяқталуда",
      description: "Алексей К. (PC-01) клиентінде 15 минут қалды",
      time: "5 минут бұрын",
      read: false,
    },
    {
      id: 2,
      title: "Жаңа брондау",
      description: "18:00-ге жаңа брондау жасалды",
      time: "15 минут бұрын",
      read: false,
    },
    {
      id: 3,
      title: "Қорлар аз",
      description: "Энергетикалық сусындар азайып барады (5 дана қалды)",
      time: "30 минут бұрын",
      read: true,
    },
    {
      id: 4,
      title: "Техникалық мәселе",
      description: "PC-06 техникалық қызмет көрсетуді қажет етеді",
      time: "1 сағат бұрын",
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  // Отметить все уведомления как прочитанные
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast({
      title: t("markAllAsRead"),
      description: t("allNotificationsMarked"),
    })
  }, [t])

  // Отметить одно уведомление как прочитанное
  const markAsRead = useCallback(
    (id: number) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      toast({
        title: t("notificationRead"),
        description: t("notificationMarkedAsRead"),
      })
    },
    [t]
  )

  // Обработчик выхода
  const handleLogout = useCallback(() => {
    toast({
      title: t("logout"),
      description: t("loggedOutSuccessfully"),
    })
    // Здесь можно добавить логику выхода, например, очистку токена или редирект
  }, [t])

  // Элементы навигации
  const navItems = [
    { href: "/", label: t("dashboard") },
    { href: "/bookings", label: t("bookings") },
    { href: "/customers", label: t("customers") },
    { href: "/staff", label: t("staff") },
    { href: "/pos", label: t("pos") },
    { href: "/games", label: t("games") },
    { href: "/tournaments", label: t("tournaments") },
    { href: "/tariffs", label: t("tariffs") },
  ]

  return (
    <div className="border-b shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">F16 Arena CRM</span>
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium underline-offset-4 hover:underline transition-colors ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted/50 transition-colors"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <LanguageToggle />
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/50 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{t("settings")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="shadow-md">
                <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => toast({ title: t("profile"), description: t("goToProfile") })}
                  className="cursor-pointer hover:bg-muted/20"
                >
                  {t("profile")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ title: t("settings"), description: t("goToSettings") })}
                  className="cursor-pointer hover:bg-muted/20"
                >
                  {t("settings")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ title: t("tariffs"), description: t("goToTariffs") })}
                  className="cursor-pointer hover:bg-muted/20"
                >
                  {t("tariffs")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast({ title: t("integrations"), description: t("goToIntegrations") })}
                  className="cursor-pointer hover:bg-muted/20"
                >
                  {t("integrations")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-muted/20 text-red-500"
                >
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>

      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{t("notifications")}</span>
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                {t("markAllAsRead")}
              </Button>
            </DialogTitle>
            <DialogDescription>{t("latestNotifications")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto py-4">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground">{t("noNotifications")}</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? "bg-background" : "bg-muted"
                  } cursor-pointer hover:bg-muted/50 transition-colors`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="font-medium">{notification.title}</div>
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

