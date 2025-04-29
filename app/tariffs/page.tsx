"use client"

import { useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { TariffList } from "@/components/tariff-list"
import { LoyaltyProgram } from "@/components/loyalty-program"
import { toast } from "@/components/ui/use-toast"

// Типизация данных тарифа
interface TariffForm {
  name: string
  type: string
  price: string
  description: string
}

// Типизация данных акции
interface PromotionForm {
  name: string
  discount: string
  startDate: string
  endDate: string
  description: string
}

export default function TariffsPage() {
  const [tariffForm, setTariffForm] = useState<TariffForm>({
    name: "",
    type: "",
    price: "",
    description: "",
  })
  const [promotionForm, setPromotionForm] = useState<PromotionForm>({
    name: "",
    discount: "",
    startDate: "",
    endDate: "",
    description: "",
  })
  const [activeTab, setActiveTab] = useState<string>("tariffs")

  // Обработчик изменения формы тарифа
  const handleTariffChange = useCallback(
    (field: keyof TariffForm, value: string) => {
      setTariffForm((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // Обработчик изменения формы акции
  const handlePromotionChange = useCallback(
    (field: keyof PromotionForm, value: string) => {
      setPromotionForm((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // Обработчик создания тарифа
  const handleCreateTariff = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const { name, type, price } = tariffForm

      if (!name || !type || !price || Number(price) <= 0) {
        toast({
          title: "Ошибка",
          description: "Заполните все обязательные поля корректно",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Тариф создан",
        description: `Тариф "${name}" успешно добавлен в систему.`,
      })
      setTariffForm({ name: "", type: "", price: "", description: "" })
    },
    [tariffForm]
  )

  // Обработчик создания акции
  const handleCreatePromotion = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const { name, discount, startDate, endDate } = promotionForm

      if (!name || !discount || !startDate || !endDate || Number(discount) <= 0) {
        toast({
          title: "Ошибка",
          description: "Заполните все обязательные поля корректно",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Акция создана",
        description: `Акция "${name}" успешно добавлена в систему.`,
      })
      setPromotionForm({ name: "", discount: "", startDate: "", endDate: "", description: "" })
    },
    [promotionForm]
  )

  // Обработчик изменения вкладки
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Управление тарифами</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Новый тариф
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
            <TabsTrigger value="loyalty">Программа лояльности</TabsTrigger>
            <TabsTrigger value="promotions">Акции</TabsTrigger>
          </TabsList>

          {/* Вкладка "Тарифы" */}
          <TabsContent value="tariffs" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Создать тариф</CardTitle>
                  <CardDescription>Добавьте новый тариф в систему</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleCreateTariff}>
                    <div className="space-y-2">
                      <Label htmlFor="name">Название тарифа</Label>
                      <Input
                        id="name"
                        placeholder="Введите название"
                        value={tariffForm.name}
                        onChange={(e) => handleTariffChange("name", e.target.value)}
                        className="shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Тип компьютера</Label>
                      <Input
                        id="type"
                        placeholder="Стандарт, VIP, Консоль и т.д."
                        value={tariffForm.type}
                        onChange={(e) => handleTariffChange("type", e.target.value)}
                        className="shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Цена (₸/час)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        placeholder="Введите цену"
                        value={tariffForm.price}
                        onChange={(e) => handleTariffChange("price", e.target.value)}
                        className="shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Input
                        id="description"
                        placeholder="Описание тарифа"
                        value={tariffForm.description}
                        onChange={(e) => handleTariffChange("description", e.target.value)}
                        className="shadow-sm"
                      />
                    </div>
                    <Button className="w-full" type="submit">
                      Создать тариф
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <TariffList />
            </div>
          </TabsContent>

          {/* Вкладка "Программа лояльности" */}
          <TabsContent value="loyalty" className="space-y-4">
            <LoyaltyProgram />
          </TabsContent>

          {/* Вкладка "Акции" */}
          <TabsContent value="promotions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Создать акцию</CardTitle>
                  <CardDescription>Добавьте новую акцию в систему</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleCreatePromotion}>
                    <div className="space-y-2">
                      <Label htmlFor="promo-name">Название акции</Label>
                      <Input
                        id="promo-name"
                        placeholder="Введите название"
                        value={promotionForm.name}
                        onChange={(e) => handlePromotionChange("name", e.target.value)}
                        className="shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">Скидка (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Введите скидку"
                        value={promotionForm.discount}
                        onChange={(e) => handlePromotionChange("discount", e.target.value)}
                        className="shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Дата начала</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={promotionForm.startDate}
                          onChange={(e) => handlePromotionChange("startDate", e.target.value)}
                          className="shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-date">Дата окончания</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={promotionForm.endDate}
                          onChange={(e) => handlePromotionChange("endDate", e.target.value)}
                          className="shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promo-description">Описание</Label>
                      <Input
                        id="promo-description"
                        placeholder="Описание акции"
                        value={promotionForm.description}
                        onChange={(e) => handlePromotionChange("description", e.target.value)}
                        className="shadow-sm"
                      />
                    </div>
                    <Button className="w-full" type="submit">
                      Создать акцию
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Ночной тариф</CardTitle>
                  <CardDescription>Скидка 30% с 22:00 до 8:00</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Скидка:</span>
                      <span>30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Период:</span>
                      <span>22:00 - 8:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Статус:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Активна
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                  <Button variant="destructive" size="sm">
                    Удалить
                  </Button>
                </CardFooter>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Счастливые часы</CardTitle>
                  <CardDescription>Скидка 20% с 14:00 до 17:00</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Скидка:</span>
                      <span>20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Период:</span>
                      <span>14:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Статус:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Активна
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Редактировать
                  </Button>
                  <Button variant="destructive" size="sm">
                    Удалить
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

