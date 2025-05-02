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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronLeft, ChevronRight, DollarSign, Edit, Trash } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { ClubMap } from "@/components/club-map";
import { TariffList } from "./tariff-list";
import { LoyaltyProgram } from "./loyalty-program";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialogs } from "./dialogs";

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

interface Computer {
  id: string;
  name: string;
  type: "PC" | "PlayStation";
  status: "available" | "occupied" | "reserved" | "maintenance";
  zone: "standard" | "vip" | "console";
  timeLeft?: string;
  customer?: string;
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
  const [computers, setComputers] = useState<Computer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTariff, setIsCreatingTariff] = useState<boolean>(false);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState<boolean>(false);
  const [createTariffDialogOpen, setCreateTariffDialogOpen] = useState<boolean>(false);
  const [createPromotionDialogOpen, setCreatePromotionDialogOpen] = useState<boolean>(false);
  const [editTariffDialogOpen, setEditTariffDialogOpen] = useState<boolean>(false);
  const [editPromotionDialogOpen, setEditPromotionDialogOpen] = useState<boolean>(false);
  const [editComputerDialogOpen, setEditComputerDialogOpen] = useState<boolean>(false);
  const [deleteTariffDialogOpen, setDeleteTariffDialogOpen] = useState<boolean>(false);
  const [deletePromotionDialogOpen, setDeletePromotionDialogOpen] = useState<boolean>(false);
  const [deleteComputerDialogOpen, setDeleteComputerDialogOpen] = useState<boolean>(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState<boolean>(false);
  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState<boolean>(false);
  const [editTariff, setEditTariff] = useState<Tariff | null>(null);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [editComputer, setEditComputer] = useState<Computer | null>(null);
  const [deleteTariffId, setDeleteTariffId] = useState<string | null>(null);
  const [deletePromotionId, setDeletePromotionId] = useState<string | null>(null);
  const [deleteComputerId, setDeleteComputerId] = useState<string | null>(null);
  const [endSessionId, setEndSessionId] = useState<string | null>(null);
  const [isDeletingTariff, setIsDeletingTariff] = useState<string | null>(null);
  const [isDeletingPromotion, setIsDeletingPromotion] = useState<string | null>(null);
  const [isDeletingComputer, setIsDeletingComputer] = useState<string | null>(null);
  const [isSelling, setIsSelling] = useState<boolean>(false);
  const [isEndingSession, setIsEndingSession] = useState<string | null>(null);

  const [tariffSort, setTariffSort] = useState<"asc" | "desc">("desc");
  const [promotionFilter, setPromotionFilter] = useState<"all" | "active" | "expired">("all");
  const [promotionSort, setPromotionSort] = useState<"asc" | "desc">("desc");
  const [tariffPage, setTariffPage] = useState<number>(1);
  const [promotionPage, setPromotionPage] =(duration: string;
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
  const [computers, setComputers] = useState<Computer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingTariff, setIsCreatingTariff] = useState<boolean>(false);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState<boolean>(false);
  const [createTariffDialogOpen, setCreateTariffDialogOpen] = useState<boolean>(false);
  const [createPromotionDialogOpen, setCreatePromotionDialogOpen] = useState<boolean>(false);
  const [editTariffDialogOpen, setEditTariffDialogOpen] = useState<boolean>(false);
  const [editPromotionDialogOpen, setEditPromotionDialogOpen] = useState<boolean>(false);
  const [editComputerDialogOpen, setEditComputerDialogOpen] = useState<boolean>(false);
  const [deleteTariffDialogOpen, setDeleteTariffDialogOpen] = useState<boolean>(false);
  const [deletePromotionDialogOpen, setDeletePromotionDialogOpen] = useState<boolean>(false);
  const [deleteComputerDialogOpen, setDeleteComputerDialogOpen] = useState<boolean>(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState<boolean>(false);
  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState<boolean>(false);
  const [editTariff, setEditTariff] = useState<Tariff | null>(null);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [editComputer, setEditComputer] = useState<Computer | null>(null);
  const [deleteTariffId, setDeleteTariffId] = useState<string | null>(null);
  const [deletePromotionId, setDeletePromotionId] = useState<string | null>(null);
  const [deleteComputerId, setDeleteComputerId] = useState<string | null>(null);
  const [endSessionId, setEndSessionId] = useState<string | null>(null);
  const [isDeletingTariff, setIsDeletingTariff] = useState<string | null>(null);
  const [isDeletingPromotion, setIsDeletingPromotion] = useState<string | null>(null);
  const [isDeletingComputer, setIsDeletingComputer] = useState<string | null>(null);
  const [isSelling, setIsSelling] = useState<boolean>(false);
  const [isEndingSession, setIsEndingSession] = useState<string | null>(null);

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

      const { data: computersData, error: computersError } = await supabase
        .from("computers")
        .select("*");

      if (computersError) {
        throw new Error(`Ошибка загрузки компьютеров: ${computersError.message}`);
      }
      const transformedComputers = computersData?.map((comp) => ({
        ...comp,
        status: comp.status === "free" ? "available" : (comp.status as "available" | "occupied" | "reserved" | "maintenance"),
        zone: comp.zone === "vip" ? "vip" : comp.zone === "console" ? "console" : "standard", // Используем поле zone
      })) || [];
      setComputers(transformedComputers);

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
      supabase.removeChannel(computerSubscription);
      supabase.removeChannel(sessionSubscription);
    };
  }, [tariffSort, promotionFilter, promotionSort]);

  const handleTariffChange = useCallback(
    (field: keyof TariffForm, value: string) => {
      console.log(`Изменение поля тарифа ${field}: ${value}`);
      setTariffForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handlePromotionChange = useCallback(
    (field: keyof PromotionForm, value: string) => {
      console.log(`Изменение поля акции ${field}: ${value}`);
      setPromotionForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSaleChange = useCallback(
    (field: keyof SaleForm, value: string) => {
      console.log(`Изменение поля продажи ${field}: ${value}`);
      setSaleForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleCreateTariff = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Создание тарифа:", tariffForm);
      const { name, type, price, description, zoneId } = tariffForm;

      if (!name || !type || !price || !zoneId || Number(price) <= 0) {
        console.log("Ошибка валидации:", { name, type, price, zoneId });
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
          console.log("Ошибка Supabase:", error);
          throw new Error(`Ошибка создания тарифа: ${error.message}`);
        }

        toast({
          title: "Тариф создан",
          description: `Тариф "${name}" успешно добавлен в систему.`,
        });
        setCreateTariffDialogOpen(false);
        setTariffForm({ name: "", type: "", price: "", description: "", zoneId: "" });
      } catch (err: any) {
        console.log("Исключение:", err);
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
      console.log("Редактирование тарифа:", editTariff);
      if (!editTariff) return;

      const { name, type, price, description, zoneId } = tariffForm;

      if (!name || !type || !price || !zoneId || Number(price) <= 0) {
        console.log("Ошибка валидации:", { name, type, price, zoneId });
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
          console.log("Ошибка Supabase:", error);
          throw new Error(`Ошибка редактирования тарифа: ${error.message}`);
        }

        toast({
          title: "Тариф обновлён",
          description: `Тариф "${name}" успешно обновлён.`,
        });
        setEditTariffDialogOpen(false);
      } catch (err: any) {
        console.log("Исключение:", err);
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

    console.log("Удаление тарифа:", deleteTariffId);
    setIsDeletingTariff(deleteTariffId);

    try {
      const { error } = await supabase
        .from("tariffs")
        .delete()
        .eq("id", deleteTariffId);

      if (error) {
        console.log("Ошибка Supabase:", error);
        throw new Error(`Ошибка удаления тарифа: ${error.message}`);
      }

      toast({
        title: "Тариф удалён",
        description: "Тариф успешно удалён из системы.",
      });
      setDeleteTariffDialogOpen(false);
    } catch (err: any) {
      console.log("Исключение:", err);
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
      console.log("Создание акции:", promotionForm);
      const { name, discount, startDate, endDate, description } = promotionForm;

      if (!name || !discount || !startDate || !endDate || Number(discount) <= 0 || Number(discount) > 100) {
        console.log("Ошибка валидации:", { name, discount, startDate, endDate });
        toast({
          title: "Ошибка",
          description: "Заполните все обязательные поля корректно",
          variant: "destructive",
        });
        return;
      }

      if (new Date(endDate) < new Date(startDate)) {
        console.log("Ошибка дат:", { startDate, endDate });
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
          console.log("Ошибка Supabase:", error);
          throw new Error(`Ошибка создания акции: ${error.message}`);
        }

        toast({
          title: "Акция создана",
          description: `Акция "${name}" успешно добавлена в систему.`,
        });
        setCreatePromotionDialogOpen(false);
        setPromotionForm({ name: "", discount: "", startDate: "", endDate: "", description: "" });
      } catch (err: any) {
        console.log("Исключение:", err);
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
      console.log("Редактирование акции:", editPromotion);
      if (!editPromotion) return;

      const { name, discount, startDate, endDate, description } = promotionForm;

      if (!name || !discount || !startDate || !endDate || Number(discount) <= 0 || Number(discount) > 100) {
        console.log("Ошибка валидации:", { name, discount, startDate, endDate });
        toast({
          title: "Ошибка",
          description: "Заполните все обязательные поля корректно",
          variant: "destructive",
        });
        return;
      }

      if (new Date(endDate) < new Date(startDate)) {
        console.log("Ошибка дат:", { startDate, endDate });
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
          console.log("Ошибка Supabase:", error);
          throw new Error(`Ошибка редактирования акции: ${error.message}`);
        }

        toast({
          title: "Акция обновлена",
          description: `Акция "${name}" успешно обновлена.`,
        });
        setEditPromotionDialogOpen(false);
      } catch (err: any) {
        console.log("Исключение:", err);
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

    console.log("Удаление акции:", deletePromotionId);
    setIsDeletingPromotion(deletePromotionId);

    try {
      const { error } = await supabase
        .from("promotions")
        .delete()
        .eq("id", deletePromotionId);

      if (error) {
        console.log("Ошибка Supabase:", error);
        throw new Error(`Ошибка удаления акции: ${error.message}`);
      }

      toast({
        title: "Акция удалена",
        description: "Акция успешно удалена из системы.",
      });
      setDeletePromotionDialogOpen(false);
    } catch (err: any) {
      console.log("Исключение:", err);
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

  const handleEditComputer = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Редактирование компьютера:", editComputer);
    if (!editComputer) {
      console.log("Компьютер не выбран");
      toast({
        title: "Ошибка",
        description: "Компьютер не выбран",
        variant: "destructive",
      });
      return;
    }

    // Валидация поля type
    const validTypes = ["PC", "PlayStation"];
    if (!validTypes.includes(editComputer.type)) {
      console.log("Некорректное значение type:", editComputer.type);
      toast({
        title: "Ошибка",
        description: `Поле type должно быть "PC" или "PlayStation". Текущее значение: ${editComputer.type}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("computers")
        .update({
          name: editComputer.name,
          type: editComputer.type,
          status: editComputer.status === "available" ? "free" : editComputer.status,
          zone: editComputer.zone, // Используем zone вместо zone_id
        })
        .eq("id", editComputer.id);

      if (error) {
        console.log("Ошибка Supabase:", error);
        throw new Error(`Ошибка редактирования компьютера: ${error.message}`);
      }

      setComputers((prev) =>
        prev.map((comp) =>
          comp.id === editComputer.id
            ? { ...comp, name: editComputer.name, type: editComputer.type, status: editComputer.status, zone: editComputer.zone }
            : comp
        )
      );

      toast({
        title: "Компьютер обновлён",
        description: `Компьютер "${editComputer.name}" успешно обновлён.`,
      });
      setEditComputerDialogOpen(false);
    } catch (err: any) {
      console.log("Исключение:", err);
      toast({
        title: "Ошибка",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteComputer = async () => {
    if (!deleteComputerId) return;

    console.log("Удаление компьютера:", deleteComputerId);
    setIsDeletingComputer(deleteComputerId);

    try {
      const { data: activeSessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("computer_id", deleteComputerId)
        .gt("end_time", new Date().toISOString())
        .limit(1);

      if (activeSessions && activeSessions.length > 0) {
        console.log("Компьютер имеет активные сессии:", activeSessions);
        throw new Error("Нельзя удалить компьютер, на котором активна сессия");
      }

      const { error } = await supabase
        .from("computers")
        .delete()
        .eq("id", deleteComputerId);

      if (error) {
        console.log("Ошибка Supabase:", error);
        throw new Error(`Ошибка удаления компьютера: ${error.message}`);
      }

      setComputers((prev) => prev.filter((comp) => comp.id !== deleteComputerId));

      toast({
        title: "Компьютер удалён",
        description: "Компьютер успешно удалён.",
      });
      setDeleteComputerDialogOpen(false);
    } catch (err: any) {
      console.log("Исключение:", err);
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
    console.log("Продажа тарифа:", saleForm);
    const { customerId, tariffId, computerId, duration } = saleForm;

    if (!customerId || !tariffId || !computerId || !duration || Number(duration) <= 0) {
      console.log("Ошибка валидации:", { customerId, tariffId, computerId, duration });
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
        console.log("Не найдены данные:", { tariff, computer, customer });
        throw new Error("Тариф, компьютер или клиент не найдены");
      }

      if (computer.status !== "available") {
        console.log("Компьютер занят:", computer);
        throw new Error("Этот компьютер уже занят");
      }

      if (computer.zone !== tariff.zone_id) {
        console.log("Несоответствие зоны:", { computerZone: computer.zone, tariffZone: tariff.zone_id });
        throw new Error(`Этот тариф можно использовать только в зоне "${tariff.zone_id}"`);
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
        console.log("Ошибка Supabase (сессия):", sessionError);
        throw new Error(`Ошибка создания сессии: ${sessionError.message}`);
      }

      const { error: computerError } = await supabase
        .from("computers")
        .update({ status: "occupied" })
        .eq("id", computerId);

      if (computerError) {
        console.log("Ошибка Supabase (компьютер):", computerError);
        throw new Error(`Ошибка обновления статуса компьютера: ${computerError.message}`);
      }

      setComputers((prev) =>
        prev.map((comp) =>
          comp.id === computerId
            ? { ...comp, status: "occupied", customer: customer.name, timeLeft: `${duration}:00` }
            : comp
        )
      );

      toast({
        title: "Сессия начата",
        description: `Клиент ${customer.name} начал сессию на ${computer.name} по тарифу "${tariff.name}" на ${duration} ч. Стоимость: ₸${totalCost.toFixed(2)}`,
      });

      setSaleDialogOpen(false);
      setSaleForm({ customerId: "", tariffId: "", computerId: "", duration: "1" });
    } catch (err: any) {
      console.log("Исключение:", err);
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

    console.log("Завершение сессии:", endSessionId);
    setIsEndingSession(endSessionId);

    try {
      const session = sessions.find((s) => s.id === endSessionId);
      if (!session) {
        console.log("Сессия не найдена:", endSessionId);
        throw new Error("Сессия не найдена");
      }

      const { error: sessionError } = await supabase
        .from("sessions")
        .delete()
        .eq("id", endSessionId);

      if (sessionError) {
        console.log("Ошибка Supabase (сессия):", sessionError);
        throw new Error(`Ошибка завершения сессии: ${sessionError.message}`);
      }

      const { error: computerError } = await supabase
        .from("computers")
        .update({ status: "free" })
        .eq("id", session.computer_id);

      if (computerError) {
        console.log("Ошибка Supabase (компьютер):", computerError);
        throw new Error(`Ошибка обновления статуса компьютера: ${computerError.message}`);
      }

      setComputers((prev) =>
        prev.map((comp) =>
          comp.id === session.computer_id
            ? { ...comp, status: "available", customer: undefined, timeLeft: undefined }
            : comp
        )
      );

      toast({
        title: "Сессия завершена",
        description: `Сессия на ${session.computers.name} завершена.`,
      });
      setEndSessionDialogOpen(false);
    } catch (err: any) {
      console.log("Исключение:", err);
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
    console.log("Смена вкладки:", value);
    setActiveTab(value);
  }, []);

  const handleEditTariffOpen = (tariff: Tariff) => {
    console.log("Открытие редактирования тарифа:", tariff);
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
    console.log("Открытие редактирования акции:", promotion);
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

  const handleEditComputerOpen = (computer: Computer) => {
    console.log("Открытие редактирования компьютера:", computer);
    setEditComputer(computer);
    setEditComputerDialogOpen(true);
  };

  const handleDeleteTariffOpen = (tariffId: string) => {
    console.log("Открытие удаления тарифа:", tariffId);
    setDeleteTariffId(tariffId);
    setDeleteTariffDialogOpen(true);
  };

  const handleDeletePromotionOpen = (promotionId: string) => {
    console.log("Открытие удаления акции:", promotionId);
    setDeletePromotionId(promotionId);
    setDeletePromotionDialogOpen(true);
  };

  const handleDeleteComputerOpen = (computerId: string) => {
    console.log("Открытие удаления компьютера:", computerId);
    setDeleteComputerId(computerId);
    setDeleteComputerDialogOpen(true);
  };

  const handleSellTariffOpen = () => {
    console.log("Открытие продажи тарифа");
    setSaleForm({ customerId: "", tariffId: "", computerId: "", duration: "1" });
    setSaleDialogOpen(true);
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
            <span className="animate-spin">⏳</span>
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
                        <span className="animate-spin mr-2">⏳</span>
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
            </div>
            <div className="grid gap-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Карта клуба</CardTitle>
                  <CardDescription>Список компьютеров (кликните, чтобы редактировать)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClubMap
                    computers={computers}
                    setComputers={setComputers}
                    onEdit={handleEditComputerOpen}
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
                            <span className="animate-spin mr-2">⏳</span>
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

      <Dialogs
        tariffForm={tariffForm}
        promotionForm={promotionForm}
        saleForm={saleForm}
        tariffs={tariffs}
        promotions={promotions}
        customers={customers}
        computers={computers}
        setComputers={setComputers}
        sessions={sessions}
        isCreatingTariff={isCreatingTariff}
        isCreatingPromotion={isCreatingPromotion}
        createTariffDialogOpen={createTariffDialogOpen}
        createPromotionDialogOpen={createPromotionDialogOpen}
        editTariffDialogOpen={editTariffDialogOpen}
        editPromotionDialogOpen={editPromotionDialogOpen}
        editComputerDialogOpen={editComputerDialogOpen}
        deleteTariffDialogOpen={deleteTariffDialogOpen}
        deletePromotionDialogOpen={deletePromotionDialogOpen}
        deleteComputerDialogOpen={deleteComputerDialogOpen}
        saleDialogOpen={saleDialogOpen}
        endSessionDialogOpen={endSessionDialogOpen}
        editTariff={editTariff}
        editPromotion={editPromotion}
        editComputer={editComputer}
        deleteTariffId={deleteTariffId}
        deletePromotionId={deletePromotionId}
        deleteComputerId={deleteComputerId}
        endSessionId={endSessionId}
        isDeletingTariff={isDeletingTariff}
        isDeletingPromotion={isDeletingPromotion}
        isDeletingComputer={isDeletingComputer}
        isSelling={isSelling}
        isEndingSession={isEndingSession}
        handleTariffChange={handleTariffChange}
        handlePromotionChange={handlePromotionChange}
        handleSaleChange={handleSaleChange}
        handleCreateTariff={handleCreateTariff}
        handleEditTariff={handleEditTariff}
        handleDeleteTariff={handleDeleteTariff}
        handleCreatePromotion={handleCreatePromotion}
        handleEditPromotion={handleEditPromotion}
        handleDeletePromotion={handleDeletePromotion}
        handleEditComputer={handleEditComputer}
        handleDeleteComputer={handleDeleteComputer}
        handleSellTariff={handleSellTariff}
        handleEndSession={handleEndSession}
        setCreateTariffDialogOpen={setCreateTariffDialogOpen}
        setCreatePromotionDialogOpen={setCreatePromotionDialogOpen}
        setEditTariffDialogOpen={setEditTariffDialogOpen}
        setEditPromotionDialogOpen={setEditPromotionDialogOpen}
        setEditComputerDialogOpen={setEditComputerDialogOpen}
        setDeleteTariffDialogOpen={setDeleteTariffDialogOpen}
        setDeletePromotionDialogOpen={setDeletePromotionDialogOpen}
        setDeleteComputerDialogOpen={setDeleteComputerDialogOpen}
        setSaleDialogOpen={setSaleDialogOpen}
        setEndSessionDialogOpen={setEndSessionDialogOpen}
        setEditComputer={setEditComputer}
      />
    </div>
  );
}
