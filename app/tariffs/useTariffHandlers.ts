// useTariffHandlers.ts
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
    console.log(`Изменение поля тарифа ${field}: ${value}`);
    setTariffForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePromotionChange = useCallback((field: keyof PromotionForm, value: string) => {
    console.log(`Изменение поля акции ${field}: ${value}`);
    setPromotionForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaleChange = useCallback((field: keyof SaleForm, value: string) => {
    console.log(`Изменение поля продажи ${field}: ${value}`);
    setSaleForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateTariff = useCallback(
    async (e: React.FormEvent, tariffForm: TariffForm) => {
      e.preventDefault();
      console.log("Создание тарифа:", tariffForm);
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
        toast({ title: "Тариф создан", description: `Тариф "${name}" успешно добавлен в систему.` });
        setCreateTariffDialogOpen(false);
        setTariffForm({ name: "", type: "", price: "", description: "", zoneId: "" });
      } catch (err: any) {
        toast({ title: "Ошибка", description: err.message, variant: "destructive" });
      }
    },
    []
  );

  // Добавь остальные handlers (handleEditTariff, handleDeleteTariff, handleSellTariff и т.д.)

  return {
    handleTariffChange,
    handlePromotionChange,
    handleSaleChange,
    handleCreateTariff,
    // другие handlers
  };
}
