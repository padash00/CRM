import { useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { Tariff, Promotion, Customer, Computer, Session, TariffForm, PromotionForm, SaleForm } from "./types";

export function useTariffHandlers(
  tariffs: Tariff[],
  promotions: Promotion[],
  customers: Customer[],
  computers: Computer[],
  setComputers: React.Dispatch<React.SetStateAction<Computer[]>>,
  setTariffForm: React.Dispatch<React.SetStateAction<TariffForm>>,
  setPromotionForm: React.Dispatch<React.SetStateAction<PromotionForm>>,
  setSaleForm: React.Dispatch<React.SetStateAction<SaleForm>>,
  setCreateTariffDialogOpen: (open: boolean) => void,
  setCreatePromotionDialogOpen: (open: boolean) => void,
  setEditTariffDialogOpen: (open: boolean) => void,
  setEditPromotionDialogOpen: (open: boolean) => void,
  setSaleDialogOpen: (open: boolean) => void
) {
  const handleTariffChange = useCallback((field: keyof TariffForm, value: string) => {
    setTariffForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePromotionChange = useCallback((field: keyof PromotionForm, value: string) => {
    setPromotionForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaleChange = useCallback((field: keyof SaleForm, value: string) => {
    setSaleForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateTariff = useCallback(
    async (e: React.FormEvent, tariffForm: TariffForm) => {
      e.preventDefault();
      const { name, type, price, description, zoneId } = tariffForm;

      if (!name || !type || !price || !zoneId || Number(price) <= 0) {
        toast({ title: "Ошибка", description: "Заполните все обязательные поля корректно", variant: "destructive" });
        return;
      }

      try {
        const { error } = await supabase
          .from("tariffs")
          .insert([{ name, type, price: parseFloat(price), description: description || null, zone_id: zoneId }]);
        if (error) throw new Error(`Ошибка создания тарифа: ${error.message}`);

        toast({ title: "Тариф создан", description: `Тариф "${name}" успешно добавлен.` });
        setCreateTariffDialogOpen(false);
        setTariffForm({ name: "", type: "", price: "", description: "", zoneId: "" });
      } catch (err: any) {
        toast({ title: "Ошибка", description: err.message, variant: "destructive" });
      }
    },
    []
  );

  const handleEditTariff = useCallback(
    async (e: React.FormEvent, tariffForm: TariffForm, editTariffId: string) => {
      e.preventDefault();
      const { name, type, price, description, zoneId } = tariffForm;

      if (!name || !type || !price || !zoneId || Number(price) <= 0) {
        toast({ title: "Ошибка", description: "Заполните все поля корректно", variant: "destructive" });
        return;
      }

      try {
        const { error } = await supabase
          .from("tariffs")
          .update({ name, type, price: parseFloat(price), description: description || null, zone_id: zoneId })
          .eq("id", editTariffId);

        if (error) throw new Error(`Ошибка обновления тарифа: ${error.message}`);

        toast({ title: "Тариф обновлён", description: `Тариф "${name}" успешно обновлён.` });
        setEditTariffDialogOpen(false);
      } catch (err: any) {
        toast({ title: "Ошибка", description: err.message, variant: "destructive" });
      }
    },
    []
  );

  const handleDeleteTariff = useCallback(
    async (tariffId: string) => {
      try {
        const { error } = await supabase.from("tariffs").delete().eq("id", tariffId);
        if (error) throw new Error(`Ошибка удаления тарифа: ${error.message}`);

        toast({ title: "Тариф удалён", description: "Тариф успешно удалён." });
      } catch (err: any) {
        toast({ title: "Ошибка", description: err.message, variant: "destructive" });
      }
    },
    []
  );

  const handleSellTariff = useCallback(
    async (e: React.FormEvent, saleForm: SaleForm) => {
      e.preventDefault();
      const { customerId, tariffId, computerId, duration } = saleForm;

      if (!customerId || !tariffId || !computerId || Number(duration) <= 0) {
        toast({ title: "Ошибка", description: "Заполните все поля корректно", variant: "destructive" });
        return;
      }

      try {
        const now = new Date();
        const end = new Date(now);
        end.setHours(now.getHours() + Number(duration));

        const { error: sessionError } = await supabase.from("sessions").insert([
          {
            customer_id: customerId,
            tariff_id: tariffId,
            computer_id: computerId,
            start_time: now.toISOString(),
            end_time: end.toISOString(),
            cost: calculateCost(tariffs, tariffId, duration),
          },
        ]);

        if (sessionError) throw new Error(`Ошибка создания сессии: ${sessionError.message}`);

        const { error: compError } = await supabase
          .from("computers")
          .update({ status: "occupied" })
          .eq("id", computerId);
        if (compError) throw new Error(`Ошибка обновления компьютера: ${compError.message}`);

        toast({ title: "Сессия началась", description: "Тариф успешно продан." });
        setSaleDialogOpen(false);
        setSaleForm({ customerId: "", tariffId: "", computerId: "", duration: "" });
      } catch (err: any) {
        toast({ title: "Ошибка", description: err.message, variant: "destructive" });
      }
    },
    [tariffs]
  );

  const calculateCost = (tariffs: Tariff[], tariffId: string, duration: string): number => {
    const tariff = tariffs.find((t) => t.id === tariffId);
    return tariff ? tariff.price * parseInt(duration) : 0;
  };

  return {
    handleTariffChange,
    handlePromotionChange,
    handleSaleChange,
    handleCreateTariff,
    handleEditTariff,
    handleDeleteTariff,
    handleSellTariff,
  };
}
