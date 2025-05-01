// app/tariffs/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Edit, Trash } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { TariffList } from "@/components/tariff-list";
import { LoyaltyProgram } from "@/components/loyalty-program";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";

// Типизация тарифа
interface Tariff {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  created_at: string;
}

// Типизация формы тарифа
interface TariffForm {
  name: string;
  type: string;
  price: string;
  description: string;
}

// Типизация акции
interface Promotion {
  id: string;
  name: string;
  discount: number;
  start_date: string;
  end_date: string;
  description: string;
  created_at: string;
}

// Типизация формы акции
interface PromotionForm {
  name: string;
  discount: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function TariffsPage() {
  const [tariffForm, setTariffForm] = useState<TariffForm>({
    name: "",
    type: "",
    price: "",
    description: "",
  });
  const [promotionForm, setPromotionForm] = useState<PromotionForm>({
    name: "",
    discount: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [activeTab, setActiveTab] = useState<string>("tariffs");
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTariff, setIsCreatingTariff] = useState<boolean>(false);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState<boolean>(false);
  const [editTariffDialogOpen, setEditTariffDialogOpen] = useState<boolean>(false);
  const [editPromotionDialogOpen, setEditPromotionDialogOpen] = useState<boolean>(false);
  const [editTariff, setEditTariff] = useState<Tariff | null>(null);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [isDeletingTariff, setIsDeletingTariff] = useState<string | null>(null);
  const [isDeletingPromotion, setIsDeletingPromotion] = useState<string | null>(null);

  // Загрузка данных
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Загружаем тарифы
      const { data: tariffsData, error: tariffsError } = await supabase
        .from("tariffs")
        .select("*");

      if (tariffsError) {
        throw new Error(`Ошибка загрузки тарифов: ${tariffsError.message}`);
      }
      setTariffs(tariffsData || []);

      // Загружаем акции
      const { data: promotionsData, error: promotionsError } = await supabase
        .from("promotions")
        .select("*");

      if (promotionsError) {
        throw new Error(`Ошибка загрузки акций: ${promotionsError.message}`);
      }
      setPromotions(promotionsData || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Ошибка загрузки данных",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Обработчик изменения формы тарифа
  const handleTariffChange = useCallback(
    (field: keyof TariffForm, value: string) => {
      setTariffForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Обработчик изменения формы акции
  const handlePromotionChange = useCallback(
    (field: keyof PromotionForm, value: string) => {
      setPromotionForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Обработчик создания тарифа
  const handleCreateTariff = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const { name, type, price, description } = tariffForm;

      if (!name || !type || !price || Number(price) <= 0) {
        toast({
          title: "Ошибка",
          description: "Заполните все обязательные поля корректно",
          variant: "destructive",
        });
        return;
      }

      setIsCreatingTariff(true);

      try {
        const { data, error } = await supabase
          .from("tariffs")
          .insert([
            {
              name,
              type,
              price: parseFloat(price),
              description: description || null,
            },
          ])
          .select()
          .single();

        if (error) {
          throw new Error(`Ошибка создания тарифа: ${error.message}`);
        }

        setTariffs((prev) => [...prev, data]);
        toast({
          title: "Тариф создан",
          description: `Тариф "${name}" успешно добавлен в систему.`,
        });
        setTariffForm({ name: "", type: "", price: "", description: "" });
      } catch (err: any) {
        toast({
          title: "Ошибка",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsCreatingTariff(false);
      }
    },
    [tariffForm]
  );

  // Обработчик редактирования тарифа
  const handleEditTariff = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editTariff) return;

      const { name, type, price, description } = tariffForm;

      if (!name || !type || !price || Number(price) <= 0) {
        toast({
          title: "Ошибка",
          description: "Заполните все обязательные поля корректно",
          variant: "destructive",
        });
        return;
      }

      setIsCreatingTariff(true);

      try {
        const { error } = await supabase
          .from("tariffs")
          .update({
            name,
            type,
            price: parseFloat(price),
            description: description || null,
          })
          .eq("id", editTariff.id);

        if (error) {
          throw new Error(`Ошибка редактирования тарифа: ${error.message}`);
        }

        setTariffs((prev) =>
          prev.map((tariff) =>
            tariff.id === editTariff.id
              ? { ...tariff, name, type, price: parseFloat(price), description: description || "" }
              : tariff
          )
        );
        toast({
          title: "Тариф обновлён",
          description: `Тариф "${name}" успешно обновлён.`,
        });
        setEditTariffDialogOpen(false);
      } catch (err: any) {
        toast({
          title: "Ошибка",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsCreatingTariff(false);
      }
    },
    [editTariff, tariffForm]
  );

  // Обработчик удаления тарифа
  const handleDeleteTariff = async (tariffId: string) => {
    setIsDeletingTariff(tariffId);

    try {
      const { error } = await supabase
        .from("tariffs")
        .delete()
        .eq("id", tariffId);

      if (error) {
        throw new Error(`Ошибка удаления тарифа: ${error.message}`);
      }

      setTariffs((prev) => prev.filter((tariff) => tariff.id !== tariffId));
      toast({
        title: "Тариф удалён",
        description: "Тариф успешно удалён из системы.",
      });
    } catch (err: any) {
      toast({
        title: "Ошибка удаления тарифа",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingTariff(null);
    }
  };

  // Обработчик создания акции
  const handleCreatePromotion = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const { name, discount, startDate, endDate, description } = promotionForm;

      if (!name || !discount || !startDate || !endDate || Number(discount) <= 0 || Number(discount) > 100) {
        toast({
          title: "Ошибка",
          description: "Заполните все обязательные поля корректно",
          variant: "destructive",
        });
        return;
      }

      if (new Date(endDate) < new Date(startDate)) {
        toast({
          title: "Ошибка",
          description: "Дата окончания не может быть раньше даты начала",
          variant: "destructive",
        });
        return;
      }

      setIsCreatingPromotion(true);

      try {
        const { data, error } = await supabase
          .from("promotions")
          .insert([
            {
              name,
              discount: parseFloat(discount),
              start_date: startDate,
              end_date: endDate,
              description: description || null,
            },
          ])
          .select()
          .single();

        if (error) {
          throw new Error(`Ошибка создания акции: ${error.message}`);
        }

        setPromotions((prev) => [...prev, data]);
        toast({
          title: "Акция создана",
          description: `Акция "${name}" успешно добавлена в систему.`,
        });
        setPromotionForm({ name: "", discount: "", startDate: "", endDate: "", description: "" });
      } catch (err: any) {
        toast({
          title: "Ошибка",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsCreatingPromotion(false);
      }
    },
    [promotionForm]
  );

  // Обработчик редактирования акции
  const handleEditPromotion = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editPromotion) return;

      const { name, discount, startDate, endDate, description } = promotionForm;

      if (!name || !discount || !startDate || !endDate || Number(discount) <= 0 || Number(discount) > 100) {
        toast({
          title: "Ошибка",
          description: "Заполните все обязательные поля корректно",
          variant: "destructive",
        });
        return;
      }

      if (new Date(endDate) < new Date(startDate)) {
        toast({
          title: "Ошибка",
          description: "Дата окончания не может быть раньше даты начала",
          variant: "destructive",
        });
        return;
      }

      setIsCreatingPromotion(true);

      try {
        const { error } = await supabase
          .from("promotions")
          .update({
            name,
            discount: parseFloat(discount),
            start_date: startDate,
            end_date: endDate,
            description: description || null,
          })
          .eq("id", editPromotion.id);

        if (error) {
          throw new Error(`Ошибка редактирования акции: ${error.message}`);
        }

        setPromotions((prev) =>
          prev.map((promo) =>
            promo.id === editPromotion.id
              ? { ...promo, name, discount: parseFloat(discount), start_date: startDate, end_date: endDate, description: description || "" }
              : promo
          )
        );
        toast({
          title: "Акция обновлена",
          description: `Акция "${name}" успешно обновлена.`,
        });
        setEditPromotionDialogOpen(false);
      } catch (err: any) {
        toast({
          title: "Ошибка",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsCreatingPromotion(false);
      }
    },
    [editPromotion, promotionForm]
  );

  // Обработчик удаления акции
  const handleDeletePromotion = async (promotionId: string) => {
    setIsDeletingPromotion(promotionId);

    try {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .eq("id", promotionId);

      if (error) {
        throw new Error(`Ошибка удаления акции: ${error.message}`);
      }

      setPromotions((prev) => prev.filter((promo) => promo.id !== promotionId));
      toast({
        title: "Акция удалена",
        description: "Акция успешно удалена из системы.",
      });
    } catch (err: any) {
      toast({
        title: "Ошибка удаления акции",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingPromotion(null);
    }
  };

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleEditTariffOpen = (tariff: Tariff) => {
    setEditTariff(tariff);
    setTariffForm({
      name: tariff.name,
      type: tariff.type,
      price: tariff.price.toString(),
      description: tariff.description || "",
    });
    setEditTariffDialogOpen(true);
  };

  const handleEditPromotionOpen = (promotion: Promotion) => {
    setEditPromotion(promotion);
    setPromotionForm({
      name: promotion.name,
      discount: promotion.discount.toString(),
      startDate: promotion.start_date,
      endDate: promotion.end_date,
      description: promotion.description || "",
    });
    setEditPromotionDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <MainNav />
        <main className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Загрузка данных...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <MainNav />
        <main className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Повторить попытку
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Управление тарифами</h2>
          <Button onClick={() => setTariffForm({ name: "", type: "", price: "", description: "" })}>
            <Plus className="mr-2 h-4 w-4" /> Новый тариф
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
            <TabsTrigger value="loyalty">Программа лояльности</TabsTrigger>
            <TabsTrigger value="promotions">Акции</TabsTrigger>
          </TabsList>

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
                        disabled={isCreatingTariff}
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
                        disabled={isCreatingTariff}
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
                        disabled={isCreatingTariff}
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
                        disabled={isCreatingTariff}
                      />
                    </div>
                    <Button className="w-full" type="submit" disabled={isCreatingTariff}>
                      {isCreatingTariff ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Создать тариф
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <TariffList
                tariffs={tariffs}
                onEdit={handleEditTariffOpen}
                onDelete={handleDeleteTariff}
                isDeleting={isDeletingTariff}
              />
            </div>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-4">
            <LoyaltyProgram />
          </TabsContent>

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
                        disabled={isCreatingPromotion}
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
                        disabled={isCreatingPromotion}
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
                          disabled={isCreatingPromotion}
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
                          disabled={isCreatingPromotion}
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
                        disabled={isCreatingPromotion}
                      />
                    </div>
                    <Button className="w-full" type="submit" disabled={isCreatingPromotion}>
                      {isCreatingPromotion ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Создать акцию
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {promotions.map((promotion) => (
                <Card key={promotion.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle>{promotion.name}</CardTitle>
                    <CardDescription>{promotion.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Скидка:</span>
                        <span>{promotion.discount}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Период:</span>
                        <span>{promotion.start_date} - {promotion.end_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Статус:</span>
                        <Badge
                          variant="outline"
                          className={
                            new Date(promotion.end_date) >= new Date()
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {new Date(promotion.end_date) >= new Date() ? "Активна" : "Завершена"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPromotionOpen(promotion)}
                      disabled={isDeletingPromotion === promotion.id}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePromotion(promotion.id)}
                      disabled={isDeletingPromotion === promotion.id}
                    >
                      {isDeletingPromotion === promotion.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash className="mr-2 h-4 w-4" />
                      )}
                      Удалить
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Диалог редактирования тарифа */}
      <Dialog open={editTariffDialogOpen} onOpenChange={setEditTariffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать тариф</DialogTitle>
            <DialogDescription>Измените данные тарифа {editTariff?.name}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditTariff}>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Название тарифа</Label>
              <Input
                id="edit-name"
                placeholder="Введите название"
                value={tariffForm.name}
                onChange={(e) => handleTariffChange("name", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingTariff}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Тип компьютера</Label>
              <Input
                id="edit-type"
                placeholder="Стандарт, VIP, Консоль и т.д."
                value={tariffForm.type}
                onChange={(e) => handleTariffChange("type", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingTariff}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Цена (₸/час)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                placeholder="Введите цену"
                value={tariffForm.price}
                onChange={(e) => handleTariffChange("price", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingTariff}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Input
                id="edit-description"
                placeholder="Описание тарифа"
                value={tariffForm.description}
                onChange={(e) => handleTariffChange("description", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingTariff}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTariffDialogOpen(false)} disabled={isCreatingTariff}>
                Отмена
              </Button>
              <Button type="submit" disabled={isCreatingTariff}>
                {isCreatingTariff ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования акции */}
      <Dialog open={editPromotionDialogOpen} onOpenChange={setEditPromotionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать акцию</DialogTitle>
            <DialogDescription>Измените данные акции {editPromotion?.name}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditPromotion}>
            <div className="space-y-2">
              <Label htmlFor="edit-promo-name">Название акции</Label>
              <Input
                id="edit-promo-name"
                placeholder="Введите название"
                value={promotionForm.name}
                onChange={(e) => handlePromotionChange("name", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingPromotion}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-discount">Скидка (%)</Label>
              <Input
                id="edit-discount"
                type="number"
                min="0"
                max="100"
                placeholder="Введите скидку"
                value={promotionForm.discount}
                onChange={(e) => handlePromotionChange("discount", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingPromotion}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Дата начала</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={promotionForm.startDate}
                  onChange={(e) => handlePromotionChange("startDate", e.target.value)}
                  className="shadow-sm"
                  disabled={isCreatingPromotion}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">Дата окончания</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={promotionForm.endDate}
                  onChange={(e) => handlePromotionChange("endDate", e.target.value)}
                  className="shadow-sm"
                  disabled={isCreatingPromotion}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-promo-description">Описание</Label>
              <Input
                id="edit-promo-description"
                placeholder="Описание акции"
                value={promotionForm.description}
                onChange={(e) => handlePromotionChange("description", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingPromotion}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditPromotionDialogOpen(false)} disabled={isCreatingPromotion}>
                Отмена
              </Button>
              <Button type="submit" disabled={isCreatingPromotion}>
                {isCreatingPromotion ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
