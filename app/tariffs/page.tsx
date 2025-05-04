"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav";
import { LoyaltyProgram } from "./loyalty-program";
import { useSupabaseData } from "./useSupabaseData";
import { useTariffHandlers } from "./useTariffHandlers";
import { TariffsTab } from "./TariffsTab";
import { PromotionsTab } from "./PromotionsTab";
import { ZonesTab } from "./ZonesTab";
import { SessionsTab } from "./SessionsTab";
import { Dialogs } from "./dialogs";
import type {
  TariffForm,
  PromotionForm,
  SaleForm,
  Tariff,
  Promotion,
  Customer,
  Computer,
  Session
} from "./types";

export default function TariffsPage() {
  const [activeTab, setActiveTab] = useState("tariffs");

  const [tariffForm, setTariffForm] = useState<TariffForm>({
    name: "", type: "", price: "", description: "", zoneId: ""
  });
  const [promotionForm, setPromotionForm] = useState<PromotionForm>({
    name: "", discount: "", startDate: "", endDate: "", description: ""
  });
  const [saleForm, setSaleForm] = useState<SaleForm>({
    customerId: "", tariffId: "", computerId: "", duration: "1"
  });

  const [createTariffDialogOpen, setCreateTariffDialogOpen] = useState(false);
  const [editTariffDialogOpen, setEditTariffDialogOpen] = useState(false);
  const [deleteTariffDialogOpen, setDeleteTariffDialogOpen] = useState(false);
  const [createPromotionDialogOpen, setCreatePromotionDialogOpen] = useState(false);
  const [editPromotionDialogOpen, setEditPromotionDialogOpen] = useState(false);
  const [deletePromotionDialogOpen, setDeletePromotionDialogOpen] = useState(false);
  const [editComputerDialogOpen, setEditComputerDialogOpen] = useState(false);
  const [deleteComputerDialogOpen, setDeleteComputerDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState(false);

  const [editTariff, setEditTariff] = useState<Tariff | null>(null);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [editComputer, setEditComputer] = useState<Computer | null>(null);
  const [deleteTariffId, setDeleteTariffId] = useState<string | null>(null);
  const [deletePromotionId, setDeletePromotionId] = useState<string | null>(null);
  const [deleteComputerId, setDeleteComputerId] = useState<string | null>(null);
  const [endSessionId, setEndSessionId] = useState<string | null>(null);

  const [isCreatingTariff, setIsCreatingTariff] = useState(false);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false);
  const [isDeletingTariff, setIsDeletingTariff] = useState<string | null>(null);
  const [isDeletingPromotion, setIsDeletingPromotion] = useState<string | null>(null);
  const [isDeletingComputer, setIsDeletingComputer] = useState<string | null>(null);
  const [isSelling, setIsSelling] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState<string | null>(null);

  const [tariffSort, setTariffSort] = useState<"asc" | "desc">("desc");
  const [promotionFilter, setPromotionFilter] = useState<"all" | "active" | "expired">("all");
  const [promotionSort, setPromotionSort] = useState<"asc" | "desc">("desc");

  const [tariffPage, setTariffPage] = useState(1);
  const [promotionPage, setPromotionPage] = useState(1);
  const itemsPerPage = 3;

  const {
    tariffs, promotions, customers, computers, sessions,
    isLoading, error, fetchData, setComputers
  } = useSupabaseData(tariffSort, promotionFilter, promotionSort);

  const {
    handleTariffChange, handlePromotionChange, handleSaleChange,
    handleCreateTariff, handleEditTariff, handleDeleteTariff,
    handleCreatePromotion, handleEditPromotion, handleDeletePromotion,
    handleEditComputer, handleDeleteComputer,
    handleSellTariff, handleEndSession
  } = useTariffHandlers(
    tariffs, promotions, customers, computers,
    setComputers, setTariffForm, setPromotionForm, setSaleForm,
    setCreateTariffDialogOpen, setCreatePromotionDialogOpen,
    setEditTariffDialogOpen, setEditPromotionDialogOpen, setSaleDialogOpen
  );

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
      zoneId: tariff.zone_id
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
      description: promotion.description || ""
    });
    setEditPromotionDialogOpen(true);
  };

  const handleEditComputerOpen = (computer: Computer) => {
    setEditComputer(computer);
    setEditComputerDialogOpen(true);
  };

  const handleDeleteTariffOpen = (id: string) => {
    setDeleteTariffId(id);
    setDeleteTariffDialogOpen(true);
  };

  const handleDeletePromotionOpen = (id: string) => {
    setDeletePromotionId(id);
    setDeletePromotionDialogOpen(true);
  };

  const handleDeleteComputerOpen = (id: string) => {
    setDeleteComputerId(id);
    setDeleteComputerDialogOpen(true);
  };

  const handleSellTariffOpen = () => {
    setSaleForm({ customerId: "", tariffId: "", computerId: "", duration: "1" });
    setSaleDialogOpen(true);
  };

  const paginatedTariffs = tariffs.slice((tariffPage - 1) * itemsPerPage, tariffPage * itemsPerPage);
  const paginatedPromotions = promotions.slice((promotionPage - 1) * itemsPerPage, promotionPage * itemsPerPage);

  const totalTariffPages = Math.ceil(tariffs.length / itemsPerPage);
  const totalPromotionPages = Math.ceil(promotions.length / itemsPerPage);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} retry={fetchData} />;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Управление тарифами</h2>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-background p-1 rounded-md shadow-sm">
            <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
            <TabsTrigger value="loyalty">Программа лояльности</TabsTrigger>
            <TabsTrigger value="promotions">Акции</TabsTrigger>
            <TabsTrigger value="zones">Зоны и компы</TabsTrigger>
            <TabsTrigger value="sessions">Сессии</TabsTrigger>
          </TabsList>

          <TabsContent value="tariffs">
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
          </TabsContent>

          <TabsContent value="loyalty"><LoyaltyProgram /></TabsContent>

          <TabsContent value="promotions">
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
          </TabsContent>

          <TabsContent value="zones">
            <ZonesTab
              computers={computers}
              setComputers={setComputers}
              handleEditComputerOpen={handleEditComputerOpen}
            />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionsTab
              sessions={sessions}
              isEndingSession={isEndingSession}
              setEndSessionId={setEndSessionId}
              setEndSessionDialogOpen={setEndSessionDialogOpen}
            />
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

function LoadingState() {
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

function ErrorState({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <MainNav />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={retry} className="mt-4 underline text-blue-600">Повторить попытку</button>
        </div>
      </main>
    </div>
  );
}
