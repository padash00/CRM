// useSupabaseData.ts
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { Tariff, Promotion, Customer, Computer, Session } from "./types";

export function useSupabaseData(
  tariffSort: "asc" | "desc",
  promotionFilter: "all" | "active" | "expired",
  promotionSort: "asc" | "desc"
) {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: tariffsData, error: tariffsError } = await supabase
        .from("tariffs")
        .select("*")
        .order("created_at", { ascending: tariffSort === "asc" });
      if (tariffsError) throw new Error(`Ошибка загрузки тарифов: ${tariffsError.message}`);
      setTariffs(tariffsData || []);

      let promotionsQuery = supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: promotionSort === "asc" });

      if (promotionFilter === "active") {
        promotionsQuery = promotionsQuery.gte("end_date", today);
      } else if (promotionFilter === "expired") {
        promotionsQuery = promotionsQuery.lt("end_date", today);
      }

      const { data: promotionsData, error: promotionsError } = await promotionsQuery;
      if (promotionsError) throw new Error(`Ошибка загрузки акций: ${promotionsError.message}`);
      setPromotions(promotionsData || []);

      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("id, name");
      if (customersError) throw new Error(`Ошибка загрузки клиентов: ${customersError.message}`);
      setCustomers(customersData || []);

      const { data: computersData, error: computersError } = await supabase
        .from("computers")
        .select("*");
      if (computersError) throw new Error(`Ошибка загрузки компьютеров: ${computersError.message}`);

      const [vipZone, consoleZone, standardZone] = await Promise.all([
        supabase.from("zones").select("id").eq("name", "VIP").single(),
        supabase.from("zones").select("id").eq("name", "PlayStation").single(),
        supabase.from("zones").select("id").eq("name", "Standard").single(),
      ]);

      const transformedComputers = computersData?.map((comp) => ({
        ...comp,
        status: comp.status === "free" ? "available" : "occupied",
        zone:
          comp.zone_id === vipZone.data?.id
            ? "vip"
            : comp.zone_id === consoleZone.data?.id
            ? "console"
            : "standard",
      })) || [];

      setComputers(transformedComputers);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("*, customers(name), tariffs(name), computers(name)")
        .gt("end_time", new Date().toISOString());
      if (sessionsError) throw new Error(`Ошибка загрузки сессий: ${sessionsError.message}`);
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

    const subscribeToTableChanges = (channel: string, table: string) =>
      supabase
        .channel(channel)
        .on("postgres_changes", { event: "*", schema: "public", table }, fetchData)
        .subscribe();

    const tariffSub = subscribeToTableChanges("tariffs-channel", "tariffs");
    const promoSub = subscribeToTableChanges("promotions-channel", "promotions");
    const computerSub = subscribeToTableChanges("computers-channel", "computers");
    const sessionSub = subscribeToTableChanges("sessions-channel", "sessions");

    return () => {
      supabase.removeChannel(tariffSub);
      supabase.removeChannel(promoSub);
      supabase.removeChannel(computerSub);
      supabase.removeChannel(sessionSub);
    };
  }, [tariffSort, promotionFilter, promotionSort]);

  return { tariffs, promotions, customers, computers, sessions, isLoading, error, fetchData, setComputers };
}
