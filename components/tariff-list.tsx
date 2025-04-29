"use client"

import { useState, useCallback } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

// Типизация тарифа
interface Tariff {
  id: number
  name: string
  type: "Стандарт" | "VIP" | "Консоль" // Ограничение типов
  price: number
  description: string
  active: boolean
}

export function TariffList() {
  const { t } = useLanguage()
  const [tariffs, setTariffs] = useState<Tariff[]>([
    {
      id: 1,
      name: "Стандартный",
      type: "Стандарт",
      price: 2000,
      description: "Базовый тариф для обычных компьютеров",
      active: true,
    },
    {
      id: 2,
      name: "VIP",
      type: "VIP",
      price: 3000,
      description: "Тариф для VIP-зоны с улучшенными компьютерами",
      active: true,
    },
    {
      id: 3,
      name: "Консоль",
      type: "Консоль",
      price: 3500,
      description: "Тариф для игровых консолей PS5 и Xbox",
      active: true,
    },
    {
      id: 4,
      name: "Турнирный",
      type: "Стандарт",
      price: 1800,
      description: "Специальный тариф для участников турниров",
      active: false,
    },
  ])

  // Переключение статуса тарифа
  const toggleTariffStatus = useCallback(
    (id: number) => {
      setTariffs((prevTariffs) =>
        prevTariffs.map((tariff) =>
          tariff.id === id ? { ...tariff, active: !tariff.active } : tariff
        )
      )

      const tariff = tariffs.find((t) => t.id === id)
      if (tariff) {
        toast({
          title: t(tariff.active ? "tariffDeactivated" : "tariffActivated"),
          description: `${t("tariff")} "${tariff.name}" ${
            tariff.active ? t("deactivated") : t("activated")
          }`,
        })
      }
    },
    [tariffs, t]
  )

  return (
    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-150">
      {tariffs.map((tariff) => (
       
       <Card
  key={tariff.id}
  // Добавляем свои классы:
  className="shadow-md hover:shadow-lg transition-shadow text-lg p-0"
>
  <CardHeader className="p-2">
    <div className="flex items-center justify-between">
      {/* Уменьшаем заголовок: */}
      <CardTitle className="text-base leading-tight tracking-normal">
        {tariff.name}
      </CardTitle>
      <Badge variant={tariff.active ? "default" : "secondary"}>
        {tariff.active ? t("active") : t("inactive")}
      </Badge>
    </div>
    {/* Описание пусть будет чуть мелкое и с переносами: */}
    <CardDescription className="text-xs whitespace-normal break-words">
      {tariff.description}
    </CardDescription>
  </CardHeader>

  <CardContent className="p-2">
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">{t("type")}:</span>
        <span className="text-xs">{tariff.type}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">{t("price")}:</span>
        <span className="text-xs">
          ₸{tariff.price.toLocaleString()}/{t("hour")}
        </span>
      </div>
    </div>
  </CardContent>

  <CardFooter className="p-4">
  {/* Обернём обе кнопки в контейнер с вертикальными отступами */}
  <div className="flex flex-col gap-2">
    <Button variant="outline" size="lg">
      {t("edit")}
    </Button>
    <Button
      variant={tariff.active ? "destructive" : "default"}
      size="sm"
      onClick={() => toggleTariffStatus(tariff.id)}
    >
      {tariff.active ? t("deactivate") : t("activate")}
    </Button>
  </div>
</CardFooter>

</Card>

        
      ))}
    </div>
  )
}

