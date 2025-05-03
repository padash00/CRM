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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        promotionsQuery = promotionsQuery.gte("end_date", new Date().toISOString().split("T")[0]);
      } else if (promotionFilter === "expired") {
        promotionsQuery = promotionsQuery.lt("end_date", new Date().toISOString().split("T")[0]);
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

      const { data: vipZone } = await supabase.from("zones").select("id").eq("name", "VIP").single();
      const { data: consoleZone } = await supabase.from("zones").select("id").eq("name", "PlayStation").single();
      const { data: standardZone } = await supabase.from("zones").select("id").eq("name", "Standard").single();

      const transformedComputers = computersData?.map((comp) => ({
        ...comp,
        status: comp.status === "free" ? "available" : "occupied",
        zone:
          comp.zone_id === vipZone?.id
            ? "vip"
            : comp.zone_id === consoleZone?.id
            ? "console"
            : comp.zone_id === standardZone?.id
            ? "standard"
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

    const tariffSubscription = supabase
      .channel("tariffs-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "tariffs" }, fetchData)
      .subscribe();

    const promotionSubscription = supabase
      .channel("promotions-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "promotions" }, fetchData)
      .subscribe();

    const computerSubscription = supabase
      .channel("computers-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "computers" }, fetchData)
      .subscribe();

    const sessionSubscription = supabase
      .channel("sessions-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(tariffSubscription);
      supabase.removeChannel(promotionSubscription);
      supabase.removeChannel(computerSubscription);
      supabase.removeChannel(sessionSubscription);
    };
  }, [tariffSort, promotionFilter, promotionSort]);

  return { tariffs, promotions, customers, computers, sessions, isLoading, error, fetchData, setComputers };
}
