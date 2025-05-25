// pos/POSInterface.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Coffee, DollarSign, Gamepad, Minus, Plus, Trash, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

interface CartItem {
  id: string;
  name: string;
  price: number; // Теперь это sale_price для товаров
  quantity: number;
  type: "time" | "product" | "service";
}

interface Item {
  id: string;
  name: string;
  price: number;
  sale_price?: number; // sale_price есть только у товаров
  quantity: number;
  type: "time" | "product" | "service";
}

interface Customer {
  id: string;
  name: string;
}

export function POSInterface() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<string>("none"); // Начальное значение "none"
  const [guestName, setGuestName] = useState<string>(""); // Для покупок без аккаунта
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [products, setProducts] = useState<Item[]>([]);
  const [services, setServices] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: productsData, error: productsError } = await supabase
        .from("items")
        .select("*")
        .eq("type", "product");

      if (productsError) {
        toast({
          title: "Ошибка загрузки товаров",
          description: productsError.message,
          variant: "destructive",
        });
      } else {
        setProducts(productsData || []);
      }

      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("id, name, price, quantity, type");

      if (servicesError) {
        toast({
          title: "Ошибка загрузки услуг",
          description: servicesError.message,
          variant: "destructive",
        });
      } else {
        setServices(servicesData || []);
      }

      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("id, name");

      if (customersError) {
        toast({
          title: "Ошибка загрузки клиентов",
          description: customersError.message,
          variant: "destructive",
        });
      } else {
        setCustomers(customersData || []);
      }
    };

    fetchData();
  }, []);

  const addToCart = useCallback((item: Item) => {
    if (item.quantity <= 0) {
      toast({
        title: "Ошибка",
        description: `Товар "${item.name}" отсутствует на складе`,
        variant: "destructive",
      });
      return;
    }

    setCart((prev) => {
      const existingItemIndex = prev.findIndex((cartItem) => cartItem.id === item.id);
      if (existingItemIndex !== -1) {
        const updatedCart = [...prev];
        const newQuantity = updatedCart[existingItemIndex].quantity + 1;
        if (newQuantity > item.quantity) {
          toast({
            title: "Ошибка",
            description: `Недостаточно товара "${item.name}" на складе (осталось: ${item.quantity})`,
            variant: "destructive",
          });
          return prev;
        }
        updatedCart[existingItemIndex].quantity = newQuantity;
        return updatedCart;
      }
      return [...prev, { id: item.id, name: item.name, price: item.type === "product" ? item.sale_price || item.price : item.price, quantity: 1, type: item.type }];
    });
    toast({
      title: "Товар добавлен",
      description: `${item.name} добавлен в корзину`,
      duration: 1500,
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const itemToRemove = cart.find((item) => item.id === id);
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (itemToRemove) {
      toast({
        title: "Товар удалён",
        description: `${itemToRemove.name} удалён из корзины`,
        duration: 1500,
      });
    }
  }, [cart]);

  const updateQuantity = useCallback((id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const itemInCart = cart.find((item) => item.id === id);
    const itemInStock = products.find((p) => p.id === id) || services.find((s) => s.id === id);
    if (!itemInCart || !itemInStock) return;

    if (newQuantity > itemInStock.quantity) {
      toast({
        title: "Ошибка",
        description: `Недостаточно товара "${itemInCart.name}" на складе (осталось: ${itemInStock.quantity})`,
        variant: "destructive",
      });
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  }, [cart, products, services, removeFromCart]);

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomerId("none");
    setGuestName("");
    toast({
      title: "Корзина очищена",
      description: "Все товары удалены из корзины",
    });
  }, []);

  const getItemIcon = (type: CartItem["type"]) => {
    switch (type) {
      case "time":
        return <Clock className="h-4 w-4" />;
      case "product":
        return <Coffee className="h-4 w-4" />;
      case "service":
        return <Gamepad className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handlePayment = useCallback(() => {
    if (cart.length === 0) {
      toast({
        title: "Ошибка",
        description: "Корзина пуста, оплата невозможна",
        variant: "destructive",
      });
      return;
    }
    setPaymentDialogOpen(true);
  }, [cart.length]);

  const processPayment = useCallback(async () => {
    const total = calculateTotal();
    let change = 0;

    if (paymentMethod === "CASH") {
      const received = Number.parseInt(cashReceived) || 0;
      change = received - total;

      if (received < total) {
        toast({
          title: "Ошибка",
          description: "Недостаточно средств для оплаты",
          variant: "destructive",
        });
        return;
      }
    }

const handleAddCashOperation = async () => {
  const { data: activeShiftId, error: shiftError } = await supabase.rpc("get_active_shift_id");

  if (shiftError || !activeShiftId) {
    console.error("Не удалось получить активную смену:", shiftError);
    return;
  }

  const { error } = await supabase.from("cash_operations").insert({
    amount: Number(amount),
    type,
    note,
    shift_id: activeShiftId, // ← вот тут shift_id подставляется
  });

  if (error) {
    console.error("Ошибка при добавлении операции:", error);
  } else {
    console.log("Операция успешно добавлена");
    // Очистка формы, обновление списка и т.д.
  }
};

    
    const { data: activeShiftId } = await supabase.rpc("get_active_shift_id");
    // Создаём транзакцию
    const transactionDataToInsert = {
      customer_id: customerId === "none" ? null : customerId,
      amount: total,
      transaction_date: new Date().toISOString().replace("Z", ""), // Убираем Z
      payment_type: paymentMethod,
      guest_name: customerId === "none" ? (guestName || "Гость") : null,
      transaction_type: 'PAYMENT',
      shift_id: currentShift?.id,
    };

    console.log("Данные для вставки в transactions:", transactionDataToInsert); // Для отладки
    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .insert([transactionDataToInsert])
      .select()
      .single();

    if (transactionError) {
      console.error("Ошибка Supabase:", transactionError); // Для отладки
      toast({
        title: "Ошибка создания транзакции",
        description: transactionError.message || "Не удалось создать транзакцию",
        variant: "destructive",
      });
      return;
    }

    const transactionId = transactionData.id;

    // Сохраняем товары/услуги из корзины в transaction_items
    const transactionItems = cart.map((item) => ({
      transaction_id: transactionId,
      item_id: item.id,
      item_type: item.type,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("transaction_items").insert(transactionItems);

    if (itemsError) {
      toast({
        title: "Ошибка сохранения товаров",
        description: itemsError.message,
        variant: "destructive",
      });
      return;
    }

    // Уменьшаем количество на складе
    for (const item of cart) {
      const tableName = item.type === "product" ? "items" : "services";
      const { data: currentItem, error: fetchError } = await supabase
        .from(tableName)
        .select("quantity")
        .eq("id", item.id)
        .single();

      if (fetchError) {
        toast({
          title: "Ошибка получения текущего количества",
          description: fetchError.message,
          variant: "destructive",
        });
        return;
      }

      const newQuantity = currentItem.quantity - item.quantity;
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ quantity: newQuantity })
        .eq("id", item.id);

      if (updateError) {
        toast({
          title: "Ошибка обновления склада",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Оплата успешна",
      description: `Оплата на сумму ₸${total} успешно выполнена${change > 0 ? `. Сдача: ₸${change}` : ""}`,
    });

    setPaymentDialogOpen(false);
    setCart([]);
    setCustomerId("none");
    setGuestName("");
    setCashReceived("");
    setPaymentMethod("CASH");

    // Обновляем данные о товарах и услугах
    const { data: updatedProducts } = await supabase.from("items").select("*").eq("type", "product");
    const { data: updatedServices } = await supabase.from("services").select("id, name, price, quantity, type");
    setProducts(updatedProducts || []);
    setServices(updatedServices || []);
  }, [calculateTotal, paymentMethod, cashReceived, customerId, guestName, cart]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Товары и услуги</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="services">Услуги</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {products.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto flex-col items-start p-4 text-left shadow-sm hover:bg-muted"
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">₸{product.sale_price}</div>
                    <div className="text-xs text-muted-foreground">Остаток: {product.quantity}</div>
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
                    disabled={service.quantity <= 0}
                  >
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">₸{service.price}</div>
                    <div className="text-xs text-muted-foreground">Остаток: {service.quantity}</div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Текущая продажа</CardTitle>
          <Button variant="ghost" size="icon" onClick={clearCart}>
            <X className="h-4 w-4" />
            <span className="sr-only">Очистить корзину</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Клиент</Label>
            <Select onValueChange={setCustomerId} value={customerId}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="Выберите клиента (или оставьте пустым)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без клиента</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {customerId === "none" && (
            <div className="space-y-2">
              <Label htmlFor="guestName">Имя гостя (если без аккаунта)</Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Введите имя (например, Гость)"
              />
            </div>
          )}
          <div className="rounded-md border shadow-sm">
            <div className="p-4">
              <div className="space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Корзина пуста</div>
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
                          <span className="sr-only">Уменьшить</span>
                        </Button>
                        <span className="w-4 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Увеличить</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash className="h-3 w-3" />
                          <span className="sr-only">Удалить</span>
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
            <div className="text-lg font-semibold">Итого:</div>
            <div className="text-lg font-semibold">₸{calculateTotal()}</div>
          </div>
          <Button className="w-full" disabled={cart.length === 0} onClick={handlePayment}>
            <DollarSign className="mr-2 h-4 w-4" /> Оплатить
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Оплата</DialogTitle>
            <DialogDescription>Сумма к оплате: ₸{calculateTotal()}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Способ оплаты</Label>
              <div className="col-span-3">
                <Tabs
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "CASH" | "CARD")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 shadow-sm">
                    <TabsTrigger value="CASH">Наличные</TabsTrigger>
                    <TabsTrigger value="CARD">Карта</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            {paymentMethod === "CASH" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Получено</Label>
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="col-span-3 shadow-sm"
                  placeholder="Введите сумму"
                  min="0"
                />
              </div>
            )}
            {paymentMethod === "CASH" && cashReceived && Number.parseInt(cashReceived) >= calculateTotal() && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Сдача</Label>
                <div className="col-span-3 font-medium text-green-600">
                  ₸{Number.parseInt(cashReceived) - calculateTotal()}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={processPayment} disabled={paymentMethod === "CASH" && !cashReceived}>
              Подтвердить оплату
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
