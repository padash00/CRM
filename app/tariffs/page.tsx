"use client";
import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav";
import { LoyaltyProgram } from "./loyalty-program";
import { TariffForm, PromotionForm, SaleForm, Tariff, Promotion, Customer, Computer, Session } from "./types";
import { useSupabaseData } from "./useSupabaseData";
import { useTariffHandlers } from "./useTariffHandlers";
import { TariffsTab } from "./TariffsTab";
import { PromotionsTab } from "./PromotionsTab";
import { ZonesTab } from "./ZonesTab";
import { SessionsTab } from "./SessionsTab";
import { Dialogs } from "./dialogs";

// Обновим интерфейс Computer для синхронизации с dialogs.tsx
interface Computer {
  id: string;
  name: string;
  type: "PC" | "PlayStation";
  status: "available" | "occupied" | "reserved" | "maintenance";
  zone: "standard" | "vip" | "console";
  position_x: number;
  position_y: number;
  timeLeft?: string;
  customer?: string;
  created_at: string;
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

  // Используем хук useSupabaseData для получения данных
  const {
    tariffs,
    promotions,
    customers,
    computers,
    sessions,
    isLoading,
    error,
    fetchData,
    setComputers,
  } = useSupabaseData(tariffSort, promotionFilter, promotionSort);

  // Используем хук useTariffHandlers для обработчиков
  const {
    handleTariffChange,
    handlePromotionChange,
    handleSaleChange,
    handleCreateTariff,
    handleEditTariff,
    handleDeleteTariff,
    handleCreatePromotion,
    handleEditPromotion,
    handleDeletePromotion,
    handleEditComputer,
    handleDeleteComputer,
    handleSellTariff,
    handleEndSession,
  } = useTariffHandlers(
    tariffs,
    promotions,
    customers,
    computers,
    setComputers,
    setTariffForm,
    setPromotionForm,
    setSaleForm,
    setCreateTariffDialogOpen,
    setCreatePromotionDialogOpen,
    setEditTariffDialogOpen,
    setEditPromotionDialogOpen,
    setSaleDialogOpen
  );

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

  const paginatedTariffs = tariffs.slice((tariffPage - 1) * itemsPerPage, tariffPage * itemsPerPage);
  const totalTariffPages = Math.ceil(tariffs.length / itemsPerPage);

  const paginatedPromotions = promotions.slice((promotionPage - 1) * itemsPerPage, promotionPage * itemsPerPage);
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

          <TariffsTab
            tariffs={tariffs}
            tariffSort={tariffSort}
            tariffPage={tariffPage}
            totalTariffPages={totalTariffPages}
            setTariffSort={setTariffSort}
            setTariffPage={setTariffPage}
            handleSellTariffOpen={handleSellTariffOpen}
            setCreateTariffDialogOpen={setCreateTariffDialogOpen}
            handleEditTariffOpen={handleEditTariffOpen}
            handleDeleteTariffOpen={handleDeleteTariffOpen}
            isDeletingTariff={isDeletingTariff}
          />

          <TabsContent value="loyalty" className="space-y-4">
            <LoyaltyProgram />
          </TabsContent>

          <PromotionsTab
            paginatedPromotions={paginatedPromotions}
            promotionFilter={promotionFilter}
            promotionSort={promotionSort}
            promotionPage={promotionPage}
            totalPromotionPages={totalPromotionPages}
            setPromotionFilter={setPromotionFilter}
            setPromotionSort={setPromotionSort}
            setPromotionPage={setPromotionPage}
            setCreatePromotionDialogOpen={setCreatePromotionDialogOpen}
            handleEditPromotionOpen={handleEditPromotionOpen}
            handleDeletePromotionOpen={handleDeletePromotionOpen}
            isDeletingPromotion={isDeletingPromotion}
          />

          <ZonesTab
            computers={computers}
            setComputers={setComputers}
            handleEditComputerOpen={handleEditComputerOpen}
          />

          <SessionsTab
            sessions={sessions}
            isEndingSession={isEndingSession}
            setEndSessionId={setEndSessionId}
            setEndSessionDialogOpen={setEndSessionDialogOpen}
          />
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
