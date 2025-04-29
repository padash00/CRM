"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Типизация уровня лояльности
interface LoyaltyLevel {
  id: number
  name: string
  hoursRequired: number
  discount: number
  active: boolean
}

// Типизация данных клиента
interface Customer {
  id: string
  name: string
  hours: number
  level: string
  discount: string
  points: number
}

// Типизация настроек программы лояльности
interface LoyaltySettings {
  pointsPerHour: number
  pointsPerTenge: number
  pointsToTenge: number
  expirationDays: number
}

export function LoyaltyProgram() {
  const [levels, setLevels] = useState<LoyaltyLevel[]>([
    { id: 1, name: "Бронзовый", hoursRequired: 20, discount: 5, active: true },
    { id: 2, name: "Серебряный", hoursRequired: 50, discount: 10, active: true },
    { id: 3, name: "Золотой", hoursRequired: 100, discount: 15, active: true },
    { id: 4, name: "Платиновый", hoursRequired: 200, discount: 20, active: true },
  ])

  const [topCustomers, setTopCustomers] = useState<Customer[]>([
    { id: "C001", name: "Алексей Кузнецов", hours: 156, level: "Золотой", discount: "15%", points: 1560 },
    { id: "C004", name: "Сергей Лебедев", hours: 132, level: "Золотой", discount: "15%", points: 1320 },
    { id: "C007", name: "Иван Петров", hours: 87, level: "Серебряный", discount: "10%", points: 870 },
    { id: "C002", name: "Михаил Смирнов", hours: 64, level: "Серебряный", discount: "10%", points: 640 },
    { id: "C003", name: "Дмитрий Волков", hours: 42, level: "Бронзовый", discount: "5%", points: 420 },
  ])

  const [newLevel, setNewLevel] = useState<Partial<LoyaltyLevel>>({
    name: "",
    hoursRequired: 0,
    discount: 0,
    active: true,
  })

  const [settings, setSettings] = useState<LoyaltySettings>({
    pointsPerHour: 10,
    pointsPerTenge: 1,
    pointsToTenge: 5,
    expirationDays: 365,
  })

  // Переключение статуса уровня
  const toggleLevelStatus = useCallback((id: number) => {
    setLevels((prevLevels) =>
      prevLevels.map((level) =>
        level.id === id ? { ...level, active: !level.active } : level
      )
    )
    const level = levels.find((l) => l.id === id)
    if (level) {
      toast({
        title: `Уровень ${level.active ? "деактивирован" : "активирован"}`,
        description: `Уровень "${level.name}" ${level.active ? "деактивирован" : "активирован"}`,
      })
    }
  }, [levels])

  // Создание нового уровня
  const handleCreateLevel = useCallback(() => {
    if (!newLevel.name || newLevel.hoursRequired! <= 0 || newLevel.discount! <= 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно",
        variant: "destructive",
      })
      return
    }

    const newId = Math.max(...levels.map((l) => l.id), 0) + 1
    setLevels((prev) => [
      ...prev,
      { id: newId, name: newLevel.name!, hoursRequired: newLevel.hoursRequired!, discount: newLevel.discount!, active: true },
    ])
    setNewLevel({ name: "", hoursRequired: 0, discount: 0, active: true })
    toast({
      title: "Уровень создан",
      description: `Уровень "${newLevel.name}" успешно добавлен`,
    })
  }, [newLevel, levels])

  // Обновление настроек
  const handleSaveSettings = useCallback(() => {
    toast({
      title: "Настройки сохранены",
      description: "Параметры программы лояльности обновлены",
    })
  }, [])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="levels" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="levels">Уровни лояльности</TabsTrigger>
          <TabsTrigger value="customers">Топ клиентов</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Создать уровень</CardTitle>
                <CardDescription>Добавьте новый уровень лояльности</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="level-name">Название уровня</Label>
                    <Input
                      id="level-name"
                      placeholder="Введите название"
                      value={newLevel.name || ""}
                      onChange={(e) => setNewLevel((prev) => ({ ...prev, name: e.target.value }))}
                      className="shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Необходимые часы</Label>
                    <Input
                      id="hours"
                      type="number"
                      placeholder="Введите количество часов"
                      value={newLevel.hoursRequired || ""}
                      onChange={(e) => setNewLevel((prev) => ({ ...prev, hoursRequired: Number(e.target.value) }))}
                      min="0"
                      className="shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Скидка (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      placeholder="Введите скидку"
                      value={newLevel.discount || ""}
                      onChange={(e) => setNewLevel((prev) => ({ ...prev, discount: Number(e.target.value) }))}
                      min="0"
                      max="100"
                      className="shadow-sm"
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleCreateLevel}>
                  Создать уровень
                </Button>
              </CardFooter>
            </Card>

            {levels.map((level) => (
              <Card key={level.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{level.name}</CardTitle>
                    <Badge variant={level.active ? "default" : "secondary"}>
                      {level.active ? "Активен" : "Неактивен"}
                    </Badge>
                  </div>
                  <CardDescription>Уровень лояльности</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Необходимые часы:</span>
                      <span>{level.hoursRequired} ч</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Скидка:</span>
                      <span>{level.discount}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                  <Button
                    variant={level.active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleLevelStatus(level.id)}
                  >
                    {level.active ? "Деактивировать" : "Активировать"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Топ клиентов по лояльности</CardTitle>
              <CardDescription>Клиенты с наибольшим количеством часов</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead>Часы</TableHead>
                    <TableHead>Уровень</TableHead>
                    <TableHead>Скидка</TableHead>
                    <TableHead>Баллы</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.id}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.hours}</TableCell>
                      <TableCell>{customer.level}</TableCell>
                      <TableCell>{customer.discount}</TableCell>
                      <TableCell>{customer.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Настройки программы лояльности</CardTitle>
              <CardDescription>Настройте параметры программы лояльности</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="points-per-hour">Баллы за час игры</Label>
                  <Input
                    id="points-per-hour"
                    type="number"
                    value={settings.pointsPerHour}
                    onChange={(e) => setSettings((prev) => ({ ...prev, pointsPerHour: Number(e.target.value) }))}
                    min="1"
                    className="shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground">Количество баллов, начисляемых за каждый час игры</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points-per-tenge">Баллы за потраченные тенге</Label>
                  <Input
                    id="points-per-tenge"
                    type="number"
                    value={settings.pointsPerTenge}
                    onChange={(e) => setSettings((prev) => ({ ...prev, pointsPerTenge: Number(e.target.value) }))}
                    min="1"
                    className="shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground">Количество баллов за каждые 100 тенге</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points-to-tenge">Стоимость баллов</Label>
                  <Input
                    id="points-to-tenge"
                    type="number"
                    value={settings.pointsToTenge}
                    onChange={(e) => setSettings((prev) => ({ ...prev, pointsToTenge: Number(e.target.value) }))}
                    min="1"
                    className="shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground">Сколько тенге стоит 1 балл при обмене</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiration">Срок действия баллов (дни)</Label>
                  <Input
                    id="expiration"
                    type="number"
                    value={settings.expirationDays}
                    onChange={(e) => setSettings((prev) => ({ ...prev, expirationDays: Number(e.target.value) }))}
                    min="1"
                    className="shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground">Через сколько дней сгорают неиспользованные баллы</p>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSaveSettings}>
                Сохранить настройки
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

