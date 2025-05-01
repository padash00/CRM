// app/tariffs/page.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import { Plus, Loader2, Edit, Trash, Filter, ChevronLeft, ChevronRight, DollarSign, Save } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Типизация тарифа
interface Tariff {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  created_at: string;
  zone_id: string;
}

// Типизация формы тарифа
interface TariffForm {
  name: string;
  type: string;
  price: string;
  description: string;
  zoneId: string;
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

// Типизация клиента
interface Customer {
  id: string;
  name: string;
}

// Типизация зоны
interface Zone {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// Типизация формы зоны
interface ZoneForm {
  name: string;
  description: string;
}

// Типизация компьютера
interface Computer {
  id: string;
  name: string;
  type: "PC" | "PlayStation";
  status: "free" | "occupied";
  zone_id: string;
  position_x: number;
  position_y: number;
  created_at: string;
}

// Типизация формы продажи
interface SaleForm {
  customerId: string;
  tariffId: string;
  computerId: string;
  duration: string; // В часах
}

export default function TariffsPage() {
  const [tariffForm, setTariffForm] = useState<TariffForm>({
    name: "",
    type: "",
    price: "",
    description: "",
    zoneId: "",
  });
  const [promotionForm, setPromotionForm] = useState<PromotionForm>({
    name: "",
    discount: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [zoneForm, setZoneForm] = useState<ZoneForm>({
    name: "",
    description: "",
  });
  const [saleForm, setSaleForm] = useState<SaleForm>({
    customerId: "",
    tariffId: "",
    computerId: "",
    duration: "1",
  });
  const [activeTab, setActiveTab] = useState<string>("tariffs");
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTariff, setIsCreatingTariff] = useState<boolean>(false);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState<boolean>(false);
  const [isCreatingZone, setIsCreatingZone] = useState<boolean>(false);
  const [createTariffDialogOpen, setCreateTariffDialogOpen] = useState<boolean>(false);
  const [createPromotionDialogOpen, setCreatePromotionDialogOpen] = useState<boolean>(false);
  const [createZoneDialogOpen, setCreateZoneDialogOpen] = useState<boolean>(false);
  const [editTariffDialogOpen, setEditTariffDialogOpen] = useState<boolean>(false);
  const [editPromotionDialogOpen, setEditPromotionDialogOpen] = useState<boolean>(false);
  const [editZoneDialogOpen, setEditZoneDialogOpen] = useState<boolean>(false);
  const [editComputerDialogOpen, setEditComputerDialogOpen] = useState<boolean>(false);
  const [deleteTariffDialogOpen, setDeleteTariffDialogOpen] = useState<boolean>(false);
  const [deletePromotionDialogOpen, setDeletePromotionDialogOpen] = useState<boolean>(false);
  const [deleteZoneDialogOpen, setDeleteZoneDialogOpen] = useState<boolean>(false);
  const [deleteComputerDialogOpen, setDeleteComputerDialogOpen] = useState<boolean>(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState<boolean>(false);
  const [editTariff, setEditTariff] = useState<Tariff | null>(null);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [editComputer, setEditComputer] = useState<Computer | null>(null);
  const [deleteTariffId, setDeleteTariffId] = useState<string | null>(null);
  const [deletePromotionId, setDeletePromotionId] = useState<string | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);
  const [deleteComputerId, setDeleteComputerId] = useState<string | null>(null);
  const [isDeletingTariff, setIsDeletingTariff] = useState<string | null>(null);
  const [isDeletingPromotion, setIsDeletingPromotion] = useState<string | null>(null);
  const [isDeletingZone, setIsDeletingZone] = useState<string | null>(null);
  const [isDeletingComputer, setIsDeletingComputer] = useState<string | null>(null);
  const [isSelling, setIsSelling] = useState<boolean>(false);

  // Состояния для фильтров, сортировки и пагинации
  const [tariffSort, setTariffSort] = useState<"asc" | "desc">("desc");
  const [promotionFilter, setPromotionFilter] = useState<"all" | "active" | "expired">("all");
  const [promotionSort, setPromotionSort] = useState<"asc" | "desc">("desc");
  const [tariffPage, setTariffPage] = useState<number>(1);
  const [promotionPage, setPromotionPage] = useState<number>(1);
  const itemsPerPage = 3;

  // Загрузка данных
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: tariffsData, error: tariffsError } = await supabase
        .from("tariffs")
        .select("*")
        .order("created_at", { ascending: tariffSort === "asc" });

      if (tariffsError) {
        throw new Error(`Ошибка загрузки тарифов: ${tariffsError.message}`);
      }
      setTariffs(tariffsData || []);

      let promotionsQuery = supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: promotionSort === "asc" });

      if (promotionFilter === "active") {
        promotionsQuery = promotionsQuery.gte("end_date", new Date().toISOString().split("T")[0]);
      } else if (promotionFilter === "expired") {
        promotionsQuery = promotionsQuery.lt("end_date", new Date().toISOString().split("T")[0]);
      }

      const { data: promotionsData, error: promotionsError } = await promotionsQuery;

      if (promotionsError) {
        throw new Error(`Ошибка загрузки акций: ${promotionsError.message}`);
      }
      setPromotions(promotionsData || []);

      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("id, name");

      if (customersError) {
        throw new Error(`Ошибка загрузки клиентов: ${customersError.message}`);
      }
      setCustomers(customersData || []);

      const { data: zonesData, error: zonesError } = await supabase
        .from("zones")
        .select("*");

      if (zonesError) {
        throw new Error(`Ошибка загрузки зон: ${zonesError.message}`);
      }
      setZones(zonesData || []);

      const { data: computersData, error: computersError } = await supabase
        .from("computers")
        .select("*");

      if (computersError) {
        throw new Error(`Ошибка загрузки компьютеров: ${computersError.message}`);
      }
      setComputers(computersData || []);
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

    // Подписка на изменения в таблице tariffs
    const tariffSubscription = supabase
      .channel("tariffs-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tariffs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTariffs((prev) => [...prev, payload.new as Tariff]);
          } else if (payload.eventType === "UPDATE") {
            setTariffs((prev) =>
              prev.map((tariff) =>
                tariff.id === payload.new.id ? (payload.new as Tariff) : tariff
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTariffs((prev) => prev.filter((tariff) => tariff.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Подписка на изменения в таблице promotions
    const promotionSubscription = supabase
      .channel("promotions-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promotions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPromotions((prev) => [...prev, payload.new as Promotion]);
          } else if (payload.eventType === "UPDATE") {
            setPromotions((prev) =>
              prev.map((promo) =>
                promo.id === payload.new.id ? (payload.new as Promotion) : promo
              )
            );
          } else if (payload.eventType === "DELETE") {
            setPromotions((prev) => prev.filter((promo) => promo.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Подписка на изменения в таблице zones
    const zoneSubscription = supabase
      .channel("zones-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zones" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setZones((prev) => [...prev, payload.new as Zone]);
          } else if (payload.eventType === "UPDATE") {
            setZones((prev) =>
              prev.map((zone) =>
                zone.id === payload.new.id ? (payload.new as Zone) : zone
              )
            );
          } else if (payload.eventType === "DELETE") {
            setZones((prev) => prev.filter((zone) => zone.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Подписка на изменения в таблице computers
    const computerSubscription = supabase
      .channel("computers-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "computers" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setComputers((prev) => [...prev, payload.new as Computer]);
          } else if (payload.eventType === "UPDATE") {
            setComputers((prev) =>
              prev.map((comp) =>
                comp.id === payload.new.id ? (payload.new as Computer) : comp
              )
            );
          } else if (payload.eventType === "DELETE") {
            setComputers((prev) => prev.filter((comp) => comp.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tariffSubscription);
      supabase.removeChannel(promotionSubscription);
      supabase.removeChannel(zoneSubscription);
      supabase.removeChannel(computerSubscription);
    };
  }, [tariffSort, promotionFilter, promotionSort]);

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

  // Обработчик изменения формы зоны
  const handleZoneChange = useCallback(
    (field: keyof ZoneForm, value: string) => {
      setZoneForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Обработчик изменения формы продажи
  const handleSaleChange = useCallback(
    (field: keyof SaleForm, value: string) => {
      setSaleForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Обработчик создания тарифа
  const handleCreateTariff = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const { name, type, price, description, zoneId } = tariffForm;

      if (!name || !type || !price || !zoneId || Number(price) <= 0) {
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
          .insert([
            {
              name,
              type,
              price: parseFloat(price),
              description: description || null,
              zone_id: zoneId,
            },
          ]);

        if (error) {
          throw new Error(`Ошибка создания тарифа: ${error.message}`);
        }

        toast({
          title: "Тариф создан",
          description: `Тариф "${name}" успешно добавлен в систему.`,
        });
        setCreateTariffDialogOpen(false);
        setTariffForm({ name: "", type: "", price: "", description: "", zoneId: "" });
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

      const { name, type, price, description, zoneId } = tariffForm;

      if (!name || !type || !price || !zoneId || Number(price) <= 0) {
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
            zone_id: zoneId,
          })
          .eq("id", editTariff.id);

        if (error) {
          throw new Error(`Ошибка редактирования тарифа: ${error.message}`);
        }

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
  const handleDeleteTariff = async () => {
    if (!deleteTariffId) return;

    setIsDeletingTariff(deleteTariffId);

    try {
      const { error } = await supabase
        .from("tariffs")
        .delete()
        .eq("id", deleteTariffId);

      if (error) {
        throw new Error(`Ошибка удаления тарифа: ${error.message}`);
      }

      toast({
        title: "Тариф удалён",
        description: "Тариф успешно удалён из системы.",
      });
      setDeleteTariffDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Ошибка удаления тарифа",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingTariff(null);
      setDeleteTariffId(null);
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
        const { error } = await supabase
          .from("promotions")
          .insert([
            {
              name,
              discount: parseFloat(discount),
              start_date: startDate,
              end_date: endDate,
              description: description || null,
            },
          ]);

        if (error) {
          throw new Error(`Ошибка создания акции: ${error.message}`);
        }

        toast({
          title: "Акция создана",
          description: `Акция "${name}" успешно добавлена в систему.`,
        });
        setCreatePromotionDialogOpen(false);
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
  const handleDeletePromotion = async () => {
    if (!deletePromotionId) return;

    setIsDeletingPromotion(deletePromotionId);

    try {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .eq("id", deletePromotionId);

      if (error) {
        throw new Error(`Ошибка удаления акции: ${error.message}`);
      }

      toast({
        title: "Акция удалена",
        description: "Акция успешно удалена из системы.",
      });
      setDeletePromotionDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Ошибка удаления акции",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingPromotion(null);
      setDeletePromotionId(null);
    }
  };

  // Обработчик создания зоны
  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description } = zoneForm;

    if (!name) {
      toast({
        title: "Ошибка",
        description: "Введите название зоны",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingZone(true);

    try {
      const { error } = await supabase
        .from("zones")
        .insert([
          {
            name,
            description: description || null,
          },
        ]);

      if (error) {
        throw new Error(`Ошибка создания зоны: ${error.message}`);
      }

      toast({
        title: "Зона создана",
        description: `Зона "${name}" успешно добавлена.`,
      });
      setCreateZoneDialogOpen(false);
      setZoneForm({ name: "", description: "" });
    } catch (err: any) {
      toast({
        title: "Ошибка",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingZone(false);
    }
  };

  // Обработчик редактирования зоны
  const handleEditZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editZone) return;

    const { name, description } = zoneForm;

    if (!name) {
      toast({
        title: "Ошибка",
        description: "Введите название зоны",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingZone(true);

    try {
      const { error } = await supabase
        .from("zones")
        .update({
          name,
          description: description || null,
        })
        .eq("id", editZone.id);

      if (error) {
        throw new Error(`Ошибка редактирования зоны: ${error.message}`);
      }

      toast({
        title: "Зона обновлена",
        description: `Зона "${name}" успешно обновлена.`,
      });
      setEditZoneDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Ошибка",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingZone(false);
    }
  };

  // Обработчик удаления зоны
  const handleDeleteZone = async () => {
    if (!deleteZoneId) return;

    setIsDeletingZone(deleteZoneId);

    try {
      // Проверяем, есть ли компьютеры в этой зоне
      const { data: computersInZone } = await supabase
        .from("computers")
        .select("id")
        .eq("zone_id", deleteZoneId)
        .limit(1);

      if (computersInZone && computersInZone.length > 0) {
        throw new Error("Нельзя удалить зону, в которой есть компьютеры");
      }

      const { error } = await supabase
        .from("zones")
        .delete()
        .eq("id", deleteZoneId);

      if (error) {
        throw new Error(`Ошибка удаления зоны: ${error.message}`);
      }

      toast({
        title: "Зона удалена",
        description: "Зона успешно удалена.",
      });
      setDeleteZoneDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Ошибка удаления зоны",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingZone(null);
      setDeleteZoneId(null);
    }
  };

  // Обработчик редактирования компьютера
  const handleEditComputer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComputer) return;

    setIsCreatingZone(true);

    try {
      const { error } = await supabase
        .from("computers")
        .update({
          name: editComputer.name,
          type: editComputer.type,
          zone_id: editComputer.zone_id,
          position_x: editComputer.position_x,
          position_y: editComputer.position_y,
        })
        .eq("id", editComputer.id);

      if (error) {
        throw new Error(`Ошибка редактирования компьютера: ${error.message}`);
      }

      toast({
        title: "Компьютер обновлён",
        description: `Компьютер "${editComputer.name}" успешно обновлён.`,
      });
      setEditComputerDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Ошибка",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingZone(false);
    }
  };

  // Обработчик удаления компьютера
  const handleDeleteComputer = async () => {
    if (!deleteComputerId) return;

    setIsDeletingComputer(deleteComputerId);

    try {
      const { error } = await supabase
        .from("computers")
        .delete()
        .eq("id", deleteComputerId);

      if (error) {
        throw new Error(`Ошибка удаления компьютера: ${error.message}`);
      }

      toast({
        title: "Компьютер удалён",
        description: "Компьютер успешно удалён.",
      });
      setDeleteComputerDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Ошибка удаления компьютера",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeletingComputer(null);
      setDeleteComputerId(null);
    }
  };

  // Обработчик продажи тарифа
  const handleSellTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    const { customerId, tariffId, computerId, duration } = saleForm;

    if (!customerId || !tariffId || !computerId || !duration || Number(duration) <= 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно",
        variant: "destructive",
      });
      return;
    }

    setIsSelling(true);

    try {
      const tariff = tariffs.find((t) => t.id === tariffId);
      const computer = computers.find((c) => c.id === computerId);

      if (!tariff || !computer) {
        throw new Error("Тариф или компьютер не найдены");
      }

      if (computer.status === "occupied") {
        throw new Error("Этот компьютер уже занят");
      }

      // Проверяем, что компьютер принадлежит зоне тарифа
      if (computer.zone_id !== tariff.zone_id) {
        const zone = zones.find((z) => z.id === tariff.zone_id);
        throw new Error(`Этот тариф можно использовать только в зоне "${zone?.name}"`);
      }

      const durationHours = parseFloat(duration);
      let totalCost = tariff.price * durationHours;

      // Проверяем акции
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const currentHour = now.getHours();
      const applicablePromotion = promotions.find((promo) => {
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);
        return (
          currentDate >= promo.start_date &&
          currentDate <= promo.end_date &&
          ((promo.name === "Ночной тариф" && (currentHour >= 22 || currentHour < 8)) ||
           (promo.name === "Счастливые часы" && currentHour >= 14 && currentHour < 17))
        );
      });

      let appliedDiscount = 0;
      if (applicablePromotion) {
        appliedDiscount = applicablePromotion.discount;
        totalCost = totalCost * (1 - appliedDiscount / 100);
        toast({
          title: "Акция применена",
          description: `Скидка ${appliedDiscount}% по акции "${applicablePromotion.name}"`,
        });
      }

      // Проверяем программу лояльности
      const { data: loyaltyData } = await supabase
        .from("loyalty_programs")
        .select("discount")
        .limit(1)
        .single();

      if (loyaltyData) {
        totalCost = totalCost * (1 - loyaltyData.discount / 100);
        toast({
          title: "Программа лояльности",
          description: `Скидка ${loyaltyData.discount}% для постоянных клиентов`,
        });
      }

      // Создаём сессию
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

      const { error: sessionError } = await supabase
        .from("sessions")
        .insert([
          {
            customer_id: customerId,
            tariff_id: tariffId,
            computer_id: computerId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            cost: totalCost,
          },
        ]);

      if (sessionError) {
        throw new Error(`Ошибка создания сессии: ${sessionError.message}`);
      }

      // Обновляем статус компьютера
      const { error: computerError } = await supabase
        .from("computers")
        .update({ status: "occupied" })
        .eq("id", computerId);

      if (computerError) {
        throw new Error(`Ошибка обновления статуса компьютера: ${computerError.message}`);
      }

      setComputers((prev) =>
        prev.map((comp) =>
          comp.id === computerId ? { ...comp, status: "occupied" } : comp
        )
      );

      // Здесь можно добавить включение компьютера через твою систему
      // Например, отправить команду на включение питания или запуск сессии

      toast({
        title: "Сессия начата",
        description: `Клиент начал сессию на ${computer.name} по тарифу "${tariff.name}" на ${duration} ч. Стоимость: ₸${totalCost.toFixed(2)}`,
      });

      setSaleDialogOpen(false);
      setSaleForm({ customerId: "", tariffId: "", computerId: "", duration: "1" });
    } catch (err: any) {
      toast({
        title: "Ошибка продажи тарифа",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSelling(false);
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
      zoneId: tariff.zone_id,
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

  const handleEditZoneOpen = (zone: Zone) => {
    setEditZone(zone);
    setZoneForm({
      name: zone.name,
      description: zone.description || "",
    });
    setEditZoneDialogOpen(true);
  };

  const handleEditComputerOpen = (computer: Computer) => {
    setEditComputer(computer);
    setEditComputerDialogOpen(true);
  };

  const handleDeleteTariffOpen = (tariffId: string) => {
    setDeleteTariffId(tariffId);
    setDeleteTariffDialogOpen(true);
  };

  const handleDeletePromotionOpen = (promotionId: string) => {
    setDeletePromotionId(promotionId);
    setDeletePromotionDialogOpen(true);
  };

  const handleDeleteZoneOpen = (zoneId: string) => {
    setDeleteZoneId(zoneId);
    setDeleteZoneDialogOpen(true);
  };

  const handleDeleteComputerOpen = (computerId: string) => {
    setDeleteComputerId(computerId);
    setDeleteComputerDialogOpen(true);
  };

  const handleSellTariffOpen = () => {
    setSaleForm({ customerId: "", tariffId: "", computerId: "", duration: "1" });
    setSaleDialogOpen(true);
  };

  // Карта клуба
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Очищаем канвас
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем зоны
    zones.forEach((zone, index) => {
      const y = 50 + index * 120;
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(10, y - 30, 480, 100);
      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.fillText(zone.name, 20, y - 10);

      // Рисуем компьютеры в зоне
      const zoneComputers = computers.filter((comp) => comp.zone_id === zone.id);
      zoneComputers.forEach((comp) => {
        const x = comp.position_x;
        const yPos = y + comp.position_y - 30;
        ctx.fillStyle = comp.status === "free" ? "green" : "red";
        ctx.beginPath();
        ctx.arc(x, yPos, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(comp.name, x, yPos + 4);
      });
    });
  }, [zones, computers]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedComputer = computers.find((comp) => {
      const dx = x - comp.position_x;
      const dy = y - (50 + zones.findIndex((z) => z.id === comp.zone_id) * 120 + comp.position_y - 30);
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    if (clickedComputer) {
      handleEditComputerOpen(clickedComputer);
    }
  };

  const paginatedTariffs = tariffs.slice(
    (tariffPage - 1) * itemsPerPage,
    tariffPage * itemsPerPage
  );
  const totalTariffPages = Math.ceil(tariffs.length / itemsPerPage);

  const paginatedPromotions = promotions.slice(
    (promotionPage - 1) * itemsPerPage,
    promotionPage * itemsPerPage
  );
  const totalPromotionPages = Math.ceil(promotions.length / itemsPerPage);

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
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
            <TabsTrigger value="loyalty">Программа лояльности</TabsTrigger>
            <TabsTrigger value="promotions">Акции</TabsTrigger>
            <TabsTrigger value="zones">Зоны и компы</TabsTrigger>
          </TabsList>

          <TabsContent value="tariffs" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label>Сортировка:</Label>
                <Select value={tariffSort} onValueChange={(value: "asc" | "desc") => setTariffSort(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Новые первыми</SelectItem>
                    <SelectItem value="asc">Старые первыми</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSellTariffOpen}>
                  <DollarSign className="mr-2 h-4 w-4" /> Продать тариф
                </Button>
                <Button onClick={() => setCreateTariffDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Новый тариф
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <TariffList
                tariffs={paginatedTariffs}
                onEdit={handleEditTariffOpen}
                onDelete={handleDeleteTariffOpen}
                isDeleting={isDeletingTariff}
              />
            </div>
            {totalTariffPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setTariffPage((prev) => Math.max(prev - 1, 1))}
                  disabled={tariffPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Назад
                </Button>
                <span>Страница {tariffPage} из {totalTariffPages}</span>
                <Button
                  variant="outline"
                  onClick={() => setTariffPage((prev) => Math.min(prev + 1, totalTariffPages))}
                  disabled={tariffPage === totalTariffPages}
                >
                  Вперед <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-4">
            <LoyaltyProgram />
          </TabsContent>

          <TabsContent value="promotions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label>Фильтр:</Label>
                <Select value={promotionFilter} onValueChange={(value: "all" | "active" | "expired") => setPromotionFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Фильтр" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="active">Активные</SelectItem>
                    <SelectItem value="expired">Завершённые</SelectItem>
                  </SelectContent>
                </Select>
                <Label>Сортировка:</Label>
                <Select value={promotionSort} onValueChange={(value: "asc" | "desc") => setPromotionSort(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Новые первыми</SelectItem>
                    <SelectItem value="asc">Старые первыми</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setCreatePromotionDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Новая акция
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPromotions.map((promotion) => (
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
                      onClick={() => handleDeletePromotionOpen(promotion.id)}
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
            {totalPromotionPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPromotionPage((prev) => Math.max(prev - 1, 1))}
                  disabled={promotionPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Назад
                </Button>
                <span>Страница {promotionPage} из {totalPromotionPages}</span>
                <Button
                  variant="outline"
                  onClick={() => setPromotionPage((prev) => Math.min(prev + 1, totalPromotionPages))}
                  disabled={promotionPage === totalPromotionPages}
                >
                  Вперед <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="zones" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Зоны и компьютеры</h3>
              <Button onClick={() => setCreateZoneDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Новая зона
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Список зон</CardTitle>
                  <CardDescription>Управляйте зонами клуба</CardDescription>
                </CardHeader>
                <CardContent>
                  {zones.length === 0 ? (
                    <div className="text-center text-muted-foreground">Нет зон для отображения</div>
                  ) : (
                    <div className="space-y-2">
                      {zones.map((zone) => (
                        <div key={zone.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div>
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-muted-foreground">{zone.description || "Нет описания"}</div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditZoneOpen(zone)}
                              disabled={isDeletingZone === zone.id}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Редактировать
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteZoneOpen(zone.id)}
                              disabled={isDeletingZone === zone.id}
                            >
                              {isDeletingZone === zone.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Trash className="mr-2 h-4 w-4" />
                              )}
                              Удалить
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Карта клуба</CardTitle>
                  <CardDescription>Расположение компьютеров (кликните, чтобы редактировать)</CardDescription>
                </CardHeader>
                <CardContent>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={zones.length * 120 + 50}
                    className="border rounded-md"
                    onClick={handleCanvasClick}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Диалог создания тарифа */}
      <Dialog open={createTariffDialogOpen} onOpenChange={setCreateTariffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать тариф</DialogTitle>
            <DialogDescription>Добавьте новый тариф в систему</DialogDescription>
          </DialogHeader>
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
              <Label htmlFor="type">Тип</Label>
              <Select
                value={tariffForm.type}
                onValueChange={(value) => handleTariffChange("type", value)}
                disabled={isCreatingTariff}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PC">PC</SelectItem>
                  <SelectItem value="PlayStation">PlayStation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone">Зона</Label>
              <Select
                value={tariffForm.zoneId}
                onValueChange={(value) => handleTariffChange("zoneId", value)}
                disabled={isCreatingTariff}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите зону" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateTariffDialogOpen(false)} disabled={isCreatingTariff}>
                Отмена
              </Button>
              <Button type="submit" disabled={isCreatingTariff}>
                {isCreatingTariff ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Создать
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <Label htmlFor="edit-type">Тип</Label>
              <Select
                value={tariffForm.type}
                onValueChange={(value) => handleTariffChange("type", value)}
                disabled={isCreatingTariff}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PC">PC</SelectItem>
                  <SelectItem value="PlayStation">PlayStation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-zone">Зона</Label>
              <Select
                value={tariffForm.zoneId}
                onValueChange={(value) => handleTariffChange("zoneId", value)}
                disabled={isCreatingTariff}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите зону" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Диалог удаления тарифа */}
      <Dialog open={deleteTariffDialogOpen} onOpenChange={setDeleteTariffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот тариф? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTariffDialogOpen(false)} disabled={isDeletingTariff !== null}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteTariff} disabled={isDeletingTariff !== null}>
              {isDeletingTariff ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог создания акции */}
      <Dialog open={createPromotionDialogOpen} onOpenChange={setCreatePromotionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать акцию</DialogTitle>
            <DialogDescription>Добавьте новую акцию в систему</DialogDescription>
          </DialogHeader>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreatePromotionDialogOpen(false)} disabled={isCreatingPromotion}>
                Отмена
              </Button>
              <Button type="submit" disabled={isCreatingPromotion}>
                {isCreatingPromotion ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Создать
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

      {/* Диалог удаления акции */}
      <Dialog open={deletePromotionDialogOpen} onOpenChange={setDeletePromotionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить эту акцию? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePromotionDialogOpen(false)} disabled={isDeletingPromotion !== null}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeletePromotion} disabled={isDeletingPromotion !== null}>
              {isDeletingPromotion ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог создания зоны */}
      <Dialog open={createZoneDialogOpen} onOpenChange={setCreateZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать зону</DialogTitle>
            <DialogDescription>Добавьте новую зону в клуб</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateZone}>
            <div className="space-y-2">
              <Label htmlFor="zone-name">Название зоны</Label>
              <Input
                id="zone-name"
                placeholder="Введите название"
                value={zoneForm.name}
                onChange={(e) => handleZoneChange("name", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingZone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-description">Описание</Label>
              <Input
                id="zone-description"
                placeholder="Описание зоны"
                value={zoneForm.description}
                onChange={(e) => handleZoneChange("description", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingZone}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateZoneDialogOpen(false)} disabled={isCreatingZone}>
                Отмена
              </Button>
              <Button type="submit" disabled={isCreatingZone}>
                {isCreatingZone ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Создать
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования зоны */}
      <Dialog open={editZoneDialogOpen} onOpenChange={setEditZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать зону</DialogTitle>
            <DialogDescription>Измените данные зоны {editZone?.name}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditZone}>
            <div className="space-y-2">
              <Label htmlFor="edit-zone-name">Название зоны</Label>
              <Input
                id="edit-zone-name"
                placeholder="Введите название"
                value={zoneForm.name}
                onChange={(e) => handleZoneChange("name", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingZone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-zone-description">Описание</Label>
              <Input
                id="edit-zone-description"
                placeholder="Описание зоны"
                value={zoneForm.description}
                onChange={(e) => handleZoneChange("description", e.target.value)}
                className="shadow-sm"
                disabled={isCreatingZone}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditZoneDialogOpen(false)} disabled={isCreatingZone}>
                Отмена
              </Button>
              <Button type="submit" disabled={isCreatingZone}>
                {isCreatingZone ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления зоны */}
      <Dialog open={deleteZoneDialogOpen} onOpenChange={setDeleteZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить эту зону? Убедитесь, что в зоне нет компьютеров.
            </DialogDescription>
