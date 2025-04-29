"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Monitor, Crown, Play, Pause, Plus, MessageSquare, Coffee, ShoppingCart } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Типизация сессии
interface Session {
  id: number
  computerName: string
  computerType: "standard" | "vip" | "console"
  customer: string
  startTime: string
  endTime: string
  timeLeft: string
  status: "active" | "paused" | "ending"
  games: string[]
  currentGame?: string
  tariff: string
  price: number
}

export function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      computerName: "PC-01",
      computerType: "standard",
      customer: "Алексей К.",
      startTime: "14:30",
      endTime: "17:30",
      timeLeft: "1:30",
      status: "active",
      games: ["Counter-Strike 2", "Dota 2"],
      currentGame: "Counter-Strike 2",
      tariff: "Стандартты",
      price: 2000,
    },
    {
      id: 2,
      computerName: "PC-04",
      computerType: "standard",
      customer: "Дмитрий В.",
      startTime: "13:45",
      endTime: "14:30",
      timeLeft: "0:45",
      status: "ending",
      games: ["Fortnite"],
      currentGame: "Fortnite",
      tariff: "Стандартты",
      price: 2000,
    },
    {
      id: 3,
      computerName: "VIP-01",
      computerType: "vip",
      customer: "Сергей Л.",
      startTime: "12:00",
      endTime: "15:00",
      timeLeft: "3:00",
      status: "active",
      games: ["Apex Legends", "Call of Duty: Warzone"],
      currentGame: "Apex Legends",
      tariff: "VIP",
      price: 3000,
    },
    {
      id: 4,
      computerName: "PS5-01",
      computerType: "console",
      customer: "Николай Р.",
      startTime: "16:00",
      endTime: "18:00",
      timeLeft: "1:15",
      status: "paused",
      games: ["FIFA 25"],
      currentGame: "FIFA 25",
      tariff: "Консоль",
      price: 3500,
    },
  ])

  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [customTime, setCustomTime] = useState("15")

  // Таймер для сессий
  useEffect(() => {
    const timer = setInterval(() => {
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.status !== "active") return session

          const [hours, minutes] = session.timeLeft.split(":").map(Number)
          let totalMinutes = hours * 60 + minutes - 1

          if (totalMinutes <= 0) {
            return { ...session, timeLeft: "0:00", status: "ending" }
          }

          const newHours = Math.floor(totalMinutes / 60)
          const newMinutes = totalMinutes % 60
          return {
            ...session,
            timeLeft: `${newHours}:${newMinutes.toString().padStart(2, "0")}`,
          }
        })
      )
    }, 60000) // Каждую минуту

    return () => clearInterval(timer)
  }, [])

  // Утилита для добавления времени
  const addTimeToSession = useCallback((session: Session, minutesToAdd: number): Session => {
    const [hours, minutes] = session.timeLeft.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes + minutesToAdd
    const newHours = Math.floor(totalMinutes / 60)
    const newMinutes = totalMinutes % 60
    return {
      ...session,
      timeLeft: `${newHours}:${newMinutes.toString().padStart(2, "0")}`,
    }
  }, [])

  // Получение иконки компьютера
  const getComputerIcon = useCallback((type: Session["computerType"]) => {
    switch (type) {
      case "vip":
        return <Crown className="h-5 w-5" />
      case "console":
        return <Gamepad2 className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }, [])

  // Получение бейджа статуса
  const getStatusBadge = useCallback((status: Session["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Белсенді</Badge>
      case "paused":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Кідіртілген
          </Badge>
        )
      case "ending":
        return <Badge variant="destructive">Аяқталуда</Badge>
      default:
        return null
    }
  }, [])

  // Обработчик действий с сессией
  const handleSessionAction = useCallback(
    (action: "pause" | "resume" | "add15" | "add30" | "add60" | "addCustom" | "end") => {
      if (!selectedSession) return

      setSessions((prevSessions) => {
        const sessionIndex = prevSessions.findIndex((s) => s.id === selectedSession.id)
        if (sessionIndex === -1) return prevSessions

        const updatedSessions = [...prevSessions]
        let updatedSession = { ...updatedSessions[sessionIndex] }

        switch (action) {
          case "pause":
            updatedSession.status = "paused"
            toast({
              title: "Сеанс кідіртілді",
              description: `${updatedSession.computerName} сеансы кідіртілді`,
            })
            break
          case "resume":
            updatedSession.status = "active"
            toast({
              title: "Сеанс жалғастырылды",
              description: `${updatedSession.computerName} сеансы жалғастырылды`,
            })
            break
          case "add15":
            updatedSession = addTimeToSession(updatedSession, 15)
            toast({
              title: "Уақыт қосылды",
              description: `${updatedSession.computerName} сеансына 15 минут қосылды`,
            })
            break
          case "add30":
            updatedSession = addTimeToSession(updatedSession, 30)
            toast({
              title: "Уақыт қосылды",
              description: `${updatedSession.computerName} сеансына 30 минут қосылды`,
            })
            break
          case "add60":
            updatedSession = addTimeToSession(updatedSession, 60)
            toast({
              title: "Уақыт қосылды",
              description: `${updatedSession.computerName} сеансына 1 сағат қосылды`,
            })
            break
          case "addCustom":
            const customMinutes = Number(customTime)
            if (!customTime || isNaN(customMinutes) || customMinutes <= 0) {
              toast({
                title: "Қате",
                description: "Жарамды минут санын енгізіңіз",
                variant: "destructive",
              })
              return prevSessions
            }
            updatedSession = addTimeToSession(updatedSession, customMinutes)
            toast({
              title: "Уақыт қосылды",
              description: `${updatedSession.computerName} сеансына ${customTime} минут қосылды`,
            })
            break
          case "end":
            toast({
              title: "Сеанс аяқталды",
              description: `${updatedSession.computerName} сеансы аяқталды`,
            })
            return prevSessions.filter((s) => s.id !== updatedSession.id)
        }

        updatedSessions[sessionIndex] = updatedSession
        setSelectedSession(updatedSession)
        return updatedSessions
      })

      if (action === "end") setSessionDialogOpen(false)
    },
    [selectedSession, customTime, addTimeToSession]
  )

  // Быстрые действия
  const handleQuickAction = useCallback(
    (session: Session, action: "pause" | "resume" | "add15") => {
      setSessions((prevSessions) => {
        const sessionIndex = prevSessions.findIndex((s) => s.id === session.id)
        if (sessionIndex === -1) return prevSessions

        const updatedSessions = [...prevSessions]
        let updatedSession = { ...updatedSessions[sessionIndex] }

        switch (action) {
          case "pause":
            updatedSession.status = "paused"
            toast({
              title: "Сеанс кідіртілді",
              description: `${session.computerName} сеансы кідіртілді`,
            })
            break
          case "resume":
            updatedSession.status = "active"
            toast({
              title: "Сеанс жалғастырылды",
              description: `${session.computerName} сеансы жалғастырылды`,
            })
            break
          case "add15":
            updatedSession = addTimeToSession(updatedSession, 15)
            toast({
              title: "Уақыт қосылды",
              description: `${session.computerName} сеансына 15 минут қосылды`,
            })
            break
        }

        updatedSessions[sessionIndex] = updatedSession
        return updatedSessions
      })
    },
    [addTimeToSession]
  )

  // Отправка сообщения
  const sendMessage = useCallback(() => {
    if (!selectedSession || !message.trim()) {
      toast({
        title: "Қате",
        description: "Хабарлама жазылмады",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Хабарлама жіберілді",
      description: `${selectedSession.computerName} компьютеріне хабарлама жіберілді`,
    })
    setMessage("")
    setMessageDialogOpen(false)
  }, [selectedSession, message])

  // Отправка заказа
  const sendOrder = useCallback(() => {
    if (!selectedSession || selectedProducts.length === 0) {
      toast({
        title: "Қате",
        description: "Тауарлар таңдалмады",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Тапсырыс жіберілді",
      description: `${selectedSession.customer} үшін тапсырыс жіберілді`,
    })
    setSelectedProducts([])
    setOrderDialogOpen(false)
  }, [selectedSession, selectedProducts])

  // Переключение продукта в заказе
  const toggleProduct = useCallback((product: string) => {
    setSelectedProducts((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product]
    )
  }, [])

  const products = [
    "Энергетикалық сусын",
    "Чипсы",
    "Шоколад батончигі",
    "Кофе",
    "Сэндвич",
    "Су",
    "Печенье",
    "Жаңғақтар",
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className={`cursor-pointer hover:bg-muted/50 transition-colors ${
              session.status === "ending" ? "border-red-500" : ""
            }`}
            onClick={() => {
              setSelectedSession(session)
              setSessionDialogOpen(true)
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getComputerIcon(session.computerType)}
                  <CardTitle className="text-lg">{session.computerName}</CardTitle>
                </div>
                {getStatusBadge(session.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">{session.customer}</div>
                <div className="text-sm text-muted-foreground">
                  {session.startTime} - {session.endTime}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Қалған уақыт:</div>
                <div className={`font-medium ${session.timeLeft.startsWith("0:") ? "text-red-500" : ""}`}>
                  {session.timeLeft}
                </div>
              </div>
              {session.currentGame && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Ойын:</div>
                  <div className="text-sm">{session.currentGame}</div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Тариф:</div>
                <div className="text-sm">
                  {session.tariff} (₸{session.price}/сағ)
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                {session.status === "active" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction(session, "pause")
                    }}
                  >
                    <Pause className="h-4 w-4 mr-1" /> Кідірту
                  </Button>
                ) : session.status === "paused" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickAction(session, "resume")
                    }}
                  >
                    <Play className="h-4 w-4 mr-1" /> Жалғастыру
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleQuickAction(session, "add15")
                  }}
                >
                  <Plus className="h-4 w-4" /> 15 мин
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getComputerIcon(selectedSession.computerType)}
                  {selectedSession.computerName} - {selectedSession.customer}
                </DialogTitle>
                <DialogDescription>Ойын сеансын басқару</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Сеанс туралы ақпарат</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Басталуы:</div>
                    <div>{selectedSession.startTime}</div>
                    <div className="text-muted-foreground">Аяқталуы:</div>
                    <div>{selectedSession.endTime}</div>
                    <div className="text-muted-foreground">Қалған уақыт:</div>
                    <div className={selectedSession.timeLeft.startsWith("0:") ? "text-red-500 font-medium" : ""}>
                      {selectedSession.timeLeft}
                    </div>
                    <div className="text-muted-foreground">Тариф:</div>
                    <div>{selectedSession.tariff}</div>
                    <div className="text-muted-foreground">Құны:</div>
                    <div>₸{selectedSession.price}/сағ</div>
                    <div className="text-muted-foreground">Күйі:</div>
                    <div>{getStatusBadge(selectedSession.status)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Іске қосылған ойындар</div>
                  <div className="space-y-1">
                    {selectedSession.games.map((game) => (
                      <div
                        key={game}
                        className={`text-sm p-1 rounded ${
                          game === selectedSession.currentGame ? "bg-muted font-medium" : ""
                        }`}
                      >
                        {game}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="actions" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="actions">Әрекеттер</TabsTrigger>
                  <TabsTrigger value="time">Уақыт</TabsTrigger>
                  <TabsTrigger value="services">Қызметтер</TabsTrigger>
                </TabsList>

                <TabsContent value="actions" className="space-y-2 py-2">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedSession.status === "active" ? (
                      <Button onClick={() => handleSessionAction("pause")}>
                        <Pause className="h-4 w-4 mr-2" /> Кідірту
                      </Button>
                    ) : selectedSession.status === "paused" ? (
                      <Button onClick={() => handleSessionAction("resume")}>
                        <Play className="h-4 w-4 mr-2" /> Жалғастыру
                      </Button>
                    ) : null}
                    <Button variant="destructive" onClick={() => handleSessionAction("end")}>
                      Сеансты аяқтау
                    </Button>
                    <Button variant="outline" onClick={() => setMessageDialogOpen(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Хабарлама жіберу
                    </Button>
                    <Button variant="outline" onClick={() => setOrderDialogOpen(true)}>
                      <Coffee className="h-4 w-4 mr-2" /> Тамақ/сусын тапсырысы
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="time" className="space-y-2 py-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={() => handleSessionAction("add15")}>+15 минут</Button>
                    <Button onClick={() => handleSessionAction("add30")}>+30 минут</Button>
                    <Button onClick={() => handleSessionAction("add60")}>+1 сағат</Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      placeholder="Минуттар"
                      min="1"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="shadow-sm"
                    />
                    <Button onClick={() => handleSessionAction("addCustom")}>Уақыт қосу</Button>
                  </div>
                </TabsContent>

                <TabsContent value="services" className="space-y-2 py-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => setOrderDialogOpen(true)}>
                      <ShoppingCart className="h-4 w-4 mr-2" /> Тауарлар қосу
                    </Button>
                    <Button variant="outline">
                      <span>Тарифті өзгерту</span>
                    </Button>
                    <Button variant="outline">
                      <span>Компьютерді өзгерту</span>
                    </Button>
                    <Button variant="outline">
                      <span>Чек басып шығару</span>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Хабарлама жіберу</DialogTitle>
            <DialogDescription>
              {selectedSession && `${selectedSession.computerName} компьютеріне хабарлама жіберу`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Хабарлама</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Хабарламаны енгізіңіз"
                className="shadow-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Болдырмау
            </Button>
            <Button onClick={sendMessage}>Жіберу</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Тамақ және сусын тапсырысы</DialogTitle>
            <DialogDescription>
              {selectedSession && `${selectedSession.customer} үшін тапсырыс`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Тауарларды таңдаңыз</Label>
              <div className="grid grid-cols-2 gap-2">
                {products.map((product) => (
                  <Button
                    key={product}
                    variant={selectedProducts.includes(product) ? "default" : "outline"}
                    onClick={() => toggleProduct(product)}
                    className="justify-start shadow-sm"
                  >
                    {product}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              Болдырмау
            </Button>
            <Button onClick={sendOrder} disabled={selectedProducts.length === 0}>
              Тапсырысты жіберу
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

