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

interface Tariff {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  created_at: string;
  zone_id: string;
}

interface TariffForm {
  name: string;
  type: string;
  price: string;
  description: string;
  zoneId: string;
}

interface Promotion {
  id: string;
  name: string;
  discount: number;
  start_date: string;
  end_date: string;
  description: string;
  created_at: string;
}

interface PromotionForm {
  name: string;
  discount: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Customer {
  id: string;
  name: string;
}

interface Zone {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface ZoneForm {
  name: string;
  description: string;
}

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

interface Session {
  id: string;
  customer_id: string;
  tariff_id: string;
  computer_id: string;
  start_time: string;
  end_time: string;
  cost: number;
  created_at: string;
  customers: Customer;
  tariffs: Tariff;
  computers: Computer;
}

interface SaleForm {
  customerId: string;
  tariffId: string;
  computerId: string;
  duration: string;
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
  const [sessions, setSessions] = useState<Session[]>([]);
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
  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState<boolean>(false);
  const [editTariff, setEditTariff] = useState<Tariff | null>(null);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [editComputer, setEditComputer] = useState<Computer | null>(null);
  const [deleteTariffId, setDeleteTariffId] = useState<string | null>(null);
  const [deletePromotionId, setDeletePromotionId] = useState<string | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);
  const [deleteComputerId, setDeleteComputerId] = useState<string | null>(null);
  const [endSessionId, setEndSessionId] = useState<string | null>(null);
  const [isDeletingTariff, setIsDeletingTariff] = useState<string | null>(null);
  const [isDeletingPromotion, setIsDeletingPromotion] = useState<string | null>(null);
  const [isDeletingZone, setIsDeletingZone] = useState<string | null>(null);
  const [isDeletingComputer, setIsDeletingComputer] = useState<string | null>(null);
  const [isSelling, setIsSelling] = useState<boolean>(false);
  const [isEndingSession, setIsEndingSession] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const [tariffSort, setTariffSort] = useState<"asc" | "desc">("desc");
  const [promotionFilter, setPromotionFilter] = useState<"all" | "active" | "expired">("all");
  const [promotionSort, setPromotionSort] = useState<"asc" | "desc">("desc");
  const [tariffPage, setTariffPage] = useState<number>(1);
  const [promotionPage, setPromotionPage] = useState<number>(1);
  const itemsPerPage = 3;

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

      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("*, customers(name), tariffs(name), computers(name)")
        .gt("end_time", new Date().toISOString());

      if (sessionsError) {
        throw new Error(`Ошибка загрузки сессий: ${sessionsError.message}`);
      }
      setSessions(sessionsData || []);
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

    const tariffSubscription = supabase
      .channel("tariffs-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tariffs" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const promotionSubscription = supabase
      .channel("promotions-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promotions" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const zoneSubscription = supabase
      .channel("zones-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "zones" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const computerSubscription = supabase
      .channel("computers-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "computers" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const sessionSubscription = supabase
      .channel("sessions-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tariffSubscription);
      supabase.removeChannel(promotionSubscription);
      supabase.removeChannel(zoneSubscription);
      supabase.removeChannel(computerSubscription);
      supabase.removeChannel(sessionSubscription);
    };
  }, [tariffSort, promotionFilter, promotionSort]);

  const handleTariffChange = useCallback(
    (field: keyof TariffForm, value: string) => {
      setTariffForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handlePromotionChange = useCallback(
    (field: keyof PromotionForm, value: string) => {
      setPromotionForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleZoneChange = useCallback(
    (field: keyof ZoneForm, value: string) => {
      setZoneForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSaleChange = useCallback(
    (field: keyof SaleForm, value: string) => {
      setSaleForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

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

  const handleDeleteZone = async () => {
    if (!deleteZoneId) return;

    setIsDeletingZone(deleteZoneId);

    try {
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

  const handleEditComputer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComputer) {
      toast({
        title: "Ошибка",
        description: "Компьютер не выбран",
        variant: "destructive",
      });
      return;
    }

    const positionX = Math.max(10, Math.min(480, editComputer.position_x));
    const positionY = Math.max(10, Math.min(70, editComputer.position_y));

    setIsCreatingZone(true);

    try {
      const { error } = await supabase
        .from("computers")
        .update({
          name: editComputer.name,
          type: editComputer.type,
          zone_id: editComputer.zone_id,
          position_x: positionX,
          position_y: positionY,
        })
        .eq("id", editComputer.id);

      if (error) {
        throw new Error(`Ошибка редактирования компьютера: ${error.message}`);
      }

      setComputers((prev) =>
        prev.map((comp) =>
          comp.id === editComputer.id
            ? { ...comp, position_x: positionX, position_y: positionY }
            : comp
        )
      );

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
      const customer = customers.find((c) => c.id === customerId);

      if (!tariff || !computer || !customer) {
        throw new Error("Тариф, компьютер или клиент не найдены");
      }

      if (computer.status === "occupied") {
        throw new Error("Этот компьютер уже занят");
      }

      if (computer.zone_id !== tariff.zone_id) {
        const zone = zones.find((z) => z.id === tariff.zone_id);
        throw new Error(`Этот тариф можно использовать только в зоне "${zone?.name}"`);
      }

      const durationHours = parseFloat(duration);
      let totalCost = tariff.price * durationHours;

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

      toast({
        title: "Сессия начата",
        description: `Клиент ${customer.name} начал сессию на ${computer.name} по тарифу "${tariff.name}" на ${duration} ч. Стоимость: ₸${totalCost.toFixed(2)}`,
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

  const handleEndSession = async () => {
    if (!endSessionId) return;

    setIsEndingSession(endSessionId);

    try {
      const session = sessions.find((s) => s.id === endSessionId);
      if (!session) {
        throw new Error("Сессия не найдена");
      }

      const { error: sessionError } = await supabase
        .from("sessions")
        .delete()
        .eq("id", endSessionId);

      if (sessionError) {
        throw new Error(`Ошибка завершения сессии: ${sessionError.message}`);
      }

      const { error: computerError } = await supabase
        .from("computers")
        .update({ status: "free" })
        .eq("id", session.computer_id);

      if (computerError) {
        throw new Error(`Ошибка обновления статуса компьютера: ${computerError.message}`);
      }

      setComputers((prev) =>
        prev.map((comp) =>
          comp.id === session.computer_id ? { ...comp, status: "free" } : comp
        )
      );

      toast({
        title: "Сессия завершена",
        description: `Сессия на ${session.computers.name} завершена.`,
      });
      setEndSessionDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Ошибка завершения сессии",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsEndingSession(null);
      setEndSessionId(null);
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    zones.forEach((zone, index) => {
      const y = 50 + index * 120;
      ctx.fillStyle = hoveredZone === zone.id ? "#d0d0d0" : "#e0e0e0";
      ctx.fillRect(10, y - 30, 480, 100);
      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.fillText(zone.name, 20, y - 10);

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
  }, [zones, computers, hoveredZone]);

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

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const hoveredZoneIndex = Math.floor((y - 20) / 120);
    const zone = zones[hoveredZoneIndex];
    setHoveredZone(zone ? zone.id : null);
  };

  const handleCanvasMouseLeave = () => {
    setHoveredZone(null);
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
          <TabsList className="grid w-full grid-cols-5 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
            <TabsTrigger value="loyalty">Программа лояльности</TabsTrigger>
            <TabsTrigger value="promotions">Акции</TabsTrigger>
            <TabsTrigger value="zones">Зоны и компы</TabsTrigger>
            <TabsTrigger value="sessions">Сессии</TabsTrigger>
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
                            <div className="text-sm text-muted-foreground">
                              {zone.description || "Нет описания"} | Компьютеров: {computers.filter((comp) => comp.zone_id === zone.id).length}
                            </div>
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
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={handleCanvasMouseLeave}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Активные сессии</h3>
            </div>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Список сессий</CardTitle>
                <CardDescription>Управляйте активными сессиями</CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <div className="text-center text-muted-foreground">Нет активных сессий</div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <div className="font-medium">{session.customers.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Компьютер: {session.computers.name}, Тариф: {session.tariffs.name}, Стоимость: ₸{session.cost}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Начало: {new Date(session.start_time).toLocaleString()}, Конец: {new Date(session.end_time).toLocaleString()}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setEndSessionId(session.id);
                            setEndSessionDialogOpen(true);
                          }}
                          disabled={isEndingSession === session.id}
                        >
                          {isEndingSession === session.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Завершить
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

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

      <Dialog open={deleteZoneDialogOpen} onOpenChange={setDeleteZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить эту зону? Убедитесь, что в зоне нет компьютеров.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteZoneDialogOpen(false)} disabled={isDeletingZone !== null}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteZone} disabled={isDeletingZone !== null}>
              {isDeletingZone ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editComputerDialogOpen} onOpenChange={setEditComputerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать компьютер</DialogTitle>
            <DialogDescription>Измените данные компьютера {editComputer?.name}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditComputer}>
            <div className="space-y-2">
              <Label htmlFor="edit-computer-name">Название компьютера</Label>
              <Input
                id="edit-computer-name"
                placeholder="Введите название"
                value={editComputer?.name || ""}
                onChange={(e) => setEditComputer((prev) => prev ? { ...prev, name: e.target.value } : null)}
                className="shadow-sm"
                disabled={isCreatingZone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-computer-type">Тип</Label>
              <Select
                value={editComputer?.type || ""}
                onValueChange={(value) => setEditComputer((prev) => prev ? { ...prev, type: value as "PC" | "PlayStation" } : null)}
                disabled={isCreatingZone}
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
              <Label htmlFor="edit-computer-zone">Зона</Label>
              <Select
                value={editComputer?.zone_id || ""}
                onValueChange={(value) => setEditComputer((prev) => prev ? { ...prev, zone_id: value } : null)}
                disabled={isCreatingZone}
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
              <Label htmlFor="edit-computer-x">Позиция X</Label>
              <Input
                id="edit-computer-x"
                type="number"
                value={editComputer?.position_x || 0}
                onChange={(e) => setEditComputer((prev) => prev ? { ...prev, position_x: parseInt(e.target.value) } : null)}
                className="shadow-sm"
                disabled={isCreatingZone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-computer-y">Позиция Y</Label>
              <Input
                id="edit-computer-y"
                type="number"
                value={editComputer?.position_y || 0}
                onChange={(e) => setEditComputer((prev) => prev ? { ...prev, position_y: parseInt(e.target.value) } : null)}
                className="shadow-sm"
                disabled={isCreatingZone}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditComputerDialogOpen(false)} disabled={isCreatingZone}>
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
      <Dialog open={deleteComputerDialogOpen} onOpenChange={setDeleteComputerDialogOpen}>
              <Dialog open={deleteComputerDialogOpen} onOpenChange={setDeleteComputerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот компьютер? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteComputerDialogOpen(false)} disabled={isDeletingComputer !== null}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteComputer} disabled={isDeletingComputer !== null}>
              {isDeletingComputer ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Продать тариф</DialogTitle>
            <DialogDescription>Выберите клиента, тариф, компьютер и длительность сессии</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSellTariff}>
            <div className="space-y-2">
              <Label htmlFor="sale-customer">Клиент</Label>
              <Select
                value={saleForm.customerId}
                onValueChange={(value) => handleSaleChange("customerId", value)}
                disabled={isSelling}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-tariff">Тариф</Label>
              <Select
                value={saleForm.tariffId}
                onValueChange={(value) => handleSaleChange("tariffId", value)}
                disabled={isSelling}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тариф" />
                </SelectTrigger>
                <SelectContent>
                  {tariffs.map((tariff) => (
                    <SelectItem key={tariff.id} value={tariff.id}>
                      {tariff.name} ({tariff.type}) - ₸{tariff.price}/час
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-computer">Компьютер</Label>
              <Select
                value={saleForm.computerId}
                onValueChange={(value) => handleSaleChange("computerId", value)}
                disabled={isSelling}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите компьютер" />
                </SelectTrigger>
                <SelectContent>
                  {computers
                    .filter((comp) => {
                      const tariff = tariffs.find((t) => t.id === saleForm.tariffId);
                      return !tariff || comp.zone_id === tariff.zone_id;
                    })
                    .map((computer) => (
                      <SelectItem key={computer.id} value={computer.id} disabled={computer.status === "occupied"}>
                        {computer.name} ({computer.type}) - {computer.status === "free" ? "Свободен" : "Занят"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-duration">Длительность (часы)</Label>
              <Input
                id="sale-duration"
                type="number"
                min="1"
                placeholder="Введите длительность"
                value={saleForm.duration}
                onChange={(e) => handleSaleChange("duration", e.target.value)}
                className="shadow-sm"
                disabled={isSelling}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaleDialogOpen(false)} disabled={isSelling}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSelling}>
                {isSelling ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Продать
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={endSessionDialogOpen} onOpenChange={setEndSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Завершить сессию</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите завершить эту сессию? Компьютер станет свободным.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndSessionDialogOpen(false)} disabled={isEndingSession !== null}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleEndSession} disabled={isEndingSession !== null}>
              {isEndingSession ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Завершить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
