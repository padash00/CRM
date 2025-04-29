"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Coffee, DollarSign, Gamepad, Minus, Plus, Trash, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Типизация элемента корзины
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: "time" | "product" | "service"
}

// Типизация продукта или услуги
interface Item {
  id: string
  name: string
  price: number
  type: "time" | "product" | "service"
}

export function POSInterface() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<string>("")
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash")
  const [cashReceived, setCashReceived] = useState<string>("")

  const products: Item[] = [
    { id: "p1", name: "Энергетикалық сусын", price: 1500, type: "product" },
    { id: "p2", name: "Чипсы", price: 1200, type: "product" },
    { id: "p3", name: "Шоколад батончигі", price: 800, type: "product" },
    { id: "p4", name: "Кофе", price: 1000, type: "product" },
    { id: "p5", name: "Сэндвич", price: 2000, type: "product" },
    { id: "p6", name: "Су", price: 700, type: "product" },
    { id: "p7", name: "Печенье", price: 900, type: "product" },
    { id: "p8", name: "Жаңғақтар", price: 1100, type: "product" },
  ]

  const services: Item[] = [
    { id: "s1", name: "Ойын уақыты (1 сағат)", price: 2000, type: "time" },
    { id: "s2", name: "Ойын уақыты (2 сағат)", price: 3500, type: "time" },
    { id: "s3", name: "Ойын уақыты (3 сағат)", price: 5000, type: "time" },
    { id: "s4", name: "VIP аймағы (1 сағат)", price: 3000, type: "time" },
    { id: "s5", name: "Консоль (1 сағат)", price: 3500, type: "time" },
    { id: "s6", name: "Құжаттарды басып шығару", price: 150, type: "service" },
    { id: "s7", name: "Сканерлеу", price: 100, type: "service" },
    { id: "s8", name: "USB-ге жазу", price: 500, type: "service" },
  ]

  // Добавление в корзину
  const addToCart = useCallback((item: Item) => {
    setCart((prev) => {
      const existingItemIndex = prev.findIndex((cartItem) => cartItem.id === item.id)
      if (existingItemIndex !== -1) {
        const updatedCart = [...prev]
        updatedCart[existingItemIndex].quantity += 1
        return updatedCart
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    toast({
      title: "Тауар қосылды",
      description: `${item.name} себетке қосылды`,
      duration: 1500,
    })
  }, [])

  // Удаление из корзины
  const removeFromCart = useCallback((id: string) => {
    const itemToRemove = cart.find((item) => item.id === id)
    setCart((prev) => prev.filter((item) => item.id !== id))
    if (itemToRemove) {
      toast({
        title: "Тауар жойылды",
        description: `${itemToRemove.name} себеттен жойылды`,
        duration: 1500,
      })
    }
  }, [cart])

  // Обновление количества
  const updateQuantity = useCallback((id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    )
  }, [removeFromCart])

  // Расчет общей суммы
  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  // Очистка корзины
  const clearCart = useCallback(() => {
    setCart([])
    setCustomer("")
    toast({
      title: "Себет тазартылды",
      description: "Барлық тауарлар себеттен жойылды",
    })
  }, [])

  // Получение иконки элемента
  const getItemIcon = (type: CartItem["type"]) => {
    switch (type) {
      case "time":
        return <Clock className="h-4 w-4" />
      case "product":
        return <Coffee className="h-4 w-4" />
      case "service":
        return <Gamepad className="h-4 w-4" />
      default:
        return null
    }
  }

  // Открытие диалога оплаты
  const handlePayment = useCallback(() => {
    if (cart.length === 0) {
      toast({
        title: "Қате",
        description: "Себет бос, төлем мүмкін емес",
        variant: "destructive",
      })
      return
    }
    setPaymentDialogOpen(true)
  }, [cart.length])

  // Обработка оплаты
  const processPayment = useCallback(() => {
    const total = calculateTotal()
    let change = 0

    if (paymentMethod === "cash") {
      const received = Number.parseInt(cashReceived) || 0
      change = received - total

      if (received < total) {
        toast({
          title: "Қате",
          description: "Төлем үшін қаражат жеткіліксіз",
          variant: "destructive",
        })
        return
      }
    }

    toast({
      title: "Төлем сәтті",
      description: `₸${total} сомасына төлем сәтті орындалды${change > 0 ? `. Қайтарым: ₸${change}` : ""}`,
    })

    setPaymentDialogOpen(false)
    setCart([])
    setCustomer("")
    setCashReceived("")
    setPaymentMethod("cash")
  }, [calculateTotal, paymentMethod, cashReceived])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Секция товаров и услуг */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Тауарлар мен қызметтер</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="products">Тауарлар</TabsTrigger>
              <TabsTrigger value="services">Қызметтер</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {products.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto flex-col items-start p-4 text-left shadow-sm hover:bg-muted"
                    onClick={() => addToCart(product)}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">₸{product.price}</div>
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="services" className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {services.map((service) => (
                  <Button
                    key={service.id}
                    variant="outline"
                    className="h-auto flex-col items-start p-4 text-left shadow-sm hover:bg-muted"
                    onClick={() => addToCart(service)}
                  >
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">₸{service.price}</div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Корзина */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ағымдағы сату</CardTitle>
          <Button variant="ghost" size="icon" onClick={clearCart}>
            <X className="h-4 w-4" />
            <span className="sr-only">Себетті тазарту</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Клиент</label>
            <Select onValueChange={setCustomer} value={customer}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="Клиентті таңдаңыз" />
              </SelectTrigger>
              <SelectContent>
                {["Алексей К.", "Михаил С.", "Дмитрий В.", "Сергей Л.", "Андрей К."].map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border shadow-sm">
            <div className="p-4">
              <div className="space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Себет бос</div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between space-x-2 rounded-md border p-2 shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {getItemIcon(item.type)}
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">₸{item.price}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Азайту</span>
                        </Button>
                        <span className="w-4 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Көбейту</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash className="h-3 w-3" />
                          <span className="sr-only">Жою</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-lg font-semibold">Жиыны:</div>
            <div className="text-lg font-semibold">₸{calculateTotal()}</div>
          </div>
          <Button className="w-full" disabled={cart.length === 0} onClick={handlePayment}>
            <DollarSign className="mr-2 h-4 w-4" /> Төлем
          </Button>
        </CardFooter>
      </Card>

      {/* Диалог оплаты */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Төлем</DialogTitle>
            <DialogDescription>Төленетін сома: ₸{calculateTotal()}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right font-medium">Төлем әдісі</label>
              <div className="col-span-3">
                <Tabs
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "cash" | "card")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 shadow-sm">
                    <TabsTrigger value="cash">Қолма-қол</TabsTrigger>
                    <TabsTrigger value="card">Карта</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            {paymentMethod === "cash" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Алынған</label>
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="col-span-3 shadow-sm"
                  placeholder="Алынған соманы енгізіңіз"
                  min="0"
                />
              </div>
            )}
            {paymentMethod === "cash" && cashReceived && Number.parseInt(cashReceived) >= calculateTotal() && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Қайтарым</label>
                <div className="col-span-3 font-medium text-green-600">
                  ₸{Number.parseInt(cashReceived) - calculateTotal()}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Болдырмау
            </Button>
            <Button onClick={processPayment} disabled={paymentMethod === "cash" && !cashReceived}>
              Төлемді растау
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

