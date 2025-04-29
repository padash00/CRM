"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Gamepad2, Crown } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Типизация статуса компьютера
type ComputerStatus = "available" | "occupied" | "reserved" | "maintenance"

// Типизация данных компьютера
interface Computer {
  id: number
  name: string
  status: ComputerStatus
  zone: "standard" | "vip" | "console"
  timeLeft?: string
  customer?: string
}

export function ClubMap() {
  const [computers, setComputers] = useState<Computer[]>([
    { id: 1, name: "PC-01", status: "occupied", zone: "standard", timeLeft: "1:30", customer: "Алексей К." },
    { id: 2, name: "PC-02", status: "available", zone: "standard" },
    { id: 3, name: "PC-03", status: "reserved", zone: "standard", customer: "Михаил С." },
    { id: 4, name: "PC-04", status: "occupied", zone: "standard", timeLeft: "0:45", customer: "Дмитрий В." },
    { id: 5, name: "PC-05", status: "available", zone: "standard" },
    { id: 6, name: "PC-06", status: "maintenance", zone: "standard" },
    { id: 7, name: "PC-07", status: "occupied", zone: "standard", timeLeft: "2:15", customer: "Иван П." },
    { id: 8, name: "PC-08", status: "available", zone: "standard" },
    { id: 9, name: "VIP-01", status: "occupied", zone: "vip", timeLeft: "3:00", customer: "Сергей Л." },
    { id: 10, name: "VIP-02", status: "available", zone: "vip" },
    { id: 11, name: "VIP-03", status: "reserved", zone: "vip", customer: "Андрей К." },
    { id: 12, name: "PS5-01", status: "occupied", zone: "console", timeLeft: "1:15", customer: "Николай Р." },
    { id: 13, name: "PS5-02", status: "available", zone: "console" },
    { id: 14, name: "XBOX-01", status: "available", zone: "console" },
  ])

  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<ComputerStatus>("available")
  const [customer, setCustomer] = useState("")
  const [duration, setDuration] = useState("1")

  // Получение цвета статуса
  const getStatusColor = useCallback((status: ComputerStatus): string => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-gray-500"
      default:
        return "bg-gray-300"
    }
  }, [])

  // Получение иконки зоны
  const getZoneIcon = useCallback((zone: Computer["zone"]) => {
    switch (zone) {
      case "vip":
        return <Crown className="h-4 w-4" />
      case "console":
        return <Gamepad2 className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }, [])

  // Получение текстового описания статуса
  const getStatusText = useCallback((status: ComputerStatus): string => {
    switch (status) {
      case "available":
        return "бос"
      case "occupied":
        return "бос емес"
      case "reserved":
        return "брондалған"
      case "maintenance":
        return "қызмет көрсетуде"
      default:
        return ""
    }
  }, [])

  // Обработчик клика по компьютеру
  const handleComputerClick = useCallback((computer: Computer) => {
    setSelectedComputer(computer)
    setNewStatus(computer.status)
    setCustomer(computer.customer || "")
    setDuration(computer.timeLeft ? computer.timeLeft.split(":")[0] : "1")
    setDialogOpen(true)
  }, [])

  // Обновление статуса компьютера
  const updateComputerStatus = useCallback(() => {
    if (!selectedComputer) return

    if ((newStatus === "occupied" || newStatus === "reserved") && !customer.trim()) {
      toast({
        title: "Қате",
        description: "Клиенттің атын енгізіңіз",
        variant: "destructive",
      })
      return
    }

    if (newStatus === "occupied" && (!duration || Number(duration) <= 0)) {
      toast({
        title: "Қате",
        description: "Жарамды уақытты таңдаңыз",
        variant: "destructive",
      })
      return
    }

    setComputers((prevComputers) =>
      prevComputers.map((comp) => {
        if (comp.id !== selectedComputer.id) return comp

        const updatedComputer: Computer = { ...comp, status: newStatus }
        if (newStatus === "occupied" || newStatus === "reserved") {
          updatedComputer.customer = customer
          if (newStatus === "occupied") {
            updatedComputer.timeLeft = `${duration}:00`
          } else {
            delete updatedComputer.timeLeft
          }
        } else {
          delete updatedComputer.customer
          delete updatedComputer.timeLeft
        }
        return updatedComputer
      })
    )

    toast({
      title: "Күй жаңартылды",
      description: `${selectedComputer.name} компьютері енді ${getStatusText(newStatus)}`,
    })
    setDialogOpen(false)
  }, [selectedComputer, newStatus, customer, duration, getStatusText])

  // Обновление статуса (заглушка для API)
  const refreshStatus = useCallback(() => {
    toast({
      title: "Күйлер жаңартылды",
      description: "Компьютерлер туралы ақпарат жаңартылды",
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {(["available", "occupied", "reserved", "maintenance"] as ComputerStatus[]).map((status) => (
            <div key={status} className="flex items-center space-x-1">
              <div className={`h-3 w-3 rounded-full ${getStatusColor(status)}`}></div>
              <span className="text-xs">{getStatusText(status)}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={refreshStatus}>
          Күйді жаңарту
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Барлығы</TabsTrigger>
          <TabsTrigger value="standard">Стандартты</TabsTrigger>
          <TabsTrigger value="vip">VIP</TabsTrigger>
          <TabsTrigger value="console">Консольдер</TabsTrigger>
        </TabsList>

        {(["all", "standard", "vip", "console"] as const).map((zone) => (
          <TabsContent key={zone} value={zone} className="mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {computers
                .filter((computer) => zone === "all" || computer.zone === zone)
                .map((computer) => (
                  <Card
                    key={computer.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors shadow-sm"
                    onClick={() => handleComputerClick(computer)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getZoneIcon(computer.zone)}
                          <span className="font-medium">{computer.name}</span>
                        </div>
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(computer.status)}`}></div>
                      </div>
                      {computer.status !== "available" && computer.customer && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {computer.customer}
                          {computer.timeLeft && ` (${computer.timeLeft})`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Компьютер күйін өзгерту</DialogTitle>
            <DialogDescription>
              {selectedComputer && `Компьютер: ${selectedComputer.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Күйі
              </Label>
              <Select value={newStatus} onValueChange={(value: ComputerStatus) => setNewStatus(value)}>
                <SelectTrigger id="status" className="col-span-3 shadow-sm">
                  <SelectValue placeholder="Күйді таңдаңыз" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Бос</SelectItem>
                  <SelectItem value="occupied">Бос емес</SelectItem>
                  <SelectItem value="reserved">Брондалған</SelectItem>
                  <SelectItem value="maintenance">Қызмет көрсетуде</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(newStatus === "occupied" || newStatus === "reserved") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">
                  Клиент
                </Label>
                <Input
                  id="customer"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Клиенттің аты"
                  className="col-span-3 shadow-sm"
                />
              </div>
            )}

            {newStatus === "occupied" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Уақыт (сағ)
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration" className="col-span-3 shadow-sm">
                    <SelectValue placeholder="Уақытты таңдаңыз" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour} сағат
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Болдырмау
            </Button>
            <Button onClick={updateComputerStatus}>Сақтау</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

