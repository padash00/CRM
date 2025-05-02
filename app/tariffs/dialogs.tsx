"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash } from "lucide-react";

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

interface DialogsProps {
  tariffForm: TariffForm;
  promotionForm: PromotionForm;
  zoneForm: ZoneForm;
  saleForm: SaleForm;
  tariffs: Tariff[];
  promotions: Promotion[];
  customers: Customer[];
  zones: Zone[];
  computers: Computer[];
  sessions: Session[];
  isCreatingTariff: boolean;
  isCreatingPromotion: boolean;
  isCreatingZone: boolean;
  createTariffDialogOpen: boolean;
  createPromotionDialogOpen: boolean;
  createZoneDialogOpen: boolean;
  editTariffDialogOpen: boolean;
  editPromotionDialogOpen: boolean;
  editZoneDialogOpen: boolean;
  editComputerDialogOpen: boolean;
  deleteTariffDialogOpen: boolean;
  deletePromotionDialogOpen: boolean;
  deleteZoneDialogOpen: boolean;
  deleteComputerDialogOpen: boolean;
  saleDialogOpen: boolean;
  endSessionDialogOpen: boolean;
  editTariff: Tariff | null;
  editPromotion: Promotion | null;
  editZone: Zone | null;
  editComputer: Computer | null;
  deleteTariffId: string | null;
  deletePromotionId: string | null;
  deleteZoneId: string | null;
  deleteComputerId: string | null;
  endSessionId: string | null;
  isDeletingTariff: string | null;
  isDeletingPromotion: string | null;
  isDeletingZone: string | null;
  isDeletingComputer: string | null;
  isSelling: boolean;
  isEndingSession: string | null;
  handleTariffChange: (field: keyof TariffForm, value: string) => void;
  handlePromotionChange: (field: keyof PromotionForm, value: string) => void;
  handleZoneChange: (field: keyof ZoneForm, value: string) => void;
  handleSaleChange: (field: keyof SaleForm, value: string) => void;
  handleCreateTariff: (e: React.FormEvent) => Promise<void>;
  handleEditTariff: (e: React.FormEvent) => Promise<void>;
  handleDeleteTariff: () => Promise<void>;
  handleCreatePromotion: (e: React.FormEvent) => Promise<void>;
  handleEditPromotion: (e: React.FormEvent) => Promise<void>;
  handleDeletePromotion: () => Promise<void>;
  handleCreateZone: (e: React.FormEvent) => Promise<void>;
  handleEditZone: (e: React.FormEvent) => Promise<void>;
  handleDeleteZone: () => Promise<void>;
  handleEditComputer: (e: React.FormEvent) => Promise<void>;
  handleDeleteComputer: () => Promise<void>;
  handleSellTariff: (e: React.FormEvent) => Promise<void>;
  handleEndSession: () => Promise<void>;
  setCreateTariffDialogOpen: (open: boolean) => void;
  setCreatePromotionDialogOpen: (open: boolean) => void;
  setCreateZoneDialogOpen: (open: boolean) => void;
  setEditTariffDialogOpen: (open: boolean) => void;
  setEditPromotionDialogOpen: (open: boolean) => void;
  setEditZoneDialogOpen: (open: boolean) => void;
  setEditComputerDialogOpen: (open: boolean) => void;
  setDeleteTariffDialogOpen: (open: boolean) => void;
  setDeletePromotionDialogOpen: (open: boolean) => void;
  setDeleteZoneDialogOpen: (open: boolean) => void;
  setDeleteComputerDialogOpen: (open: boolean) => void;
  setSaleDialogOpen: (open: boolean) => void;
  setEndSessionDialogOpen: (open: boolean) => void;
  setEditComputer: (computer: Computer | null) => void;
}

export function Dialogs({
  tariffForm,
  promotionForm,
  zoneForm,
  saleForm,
  tariffs,
  promotions,
  customers,
  zones,
  computers,
  sessions,
  isCreatingTariff,
  isCreatingPromotion,
  isCreatingZone,
  createTariffDialogOpen,
  createPromotionDialogOpen,
  createZoneDialogOpen,
  editTariffDialogOpen,
  editPromotionDialogOpen,
  editZoneDialogOpen,
  editComputerDialogOpen,
  deleteTariffDialogOpen,
  deletePromotionDialogOpen,
  deleteZoneDialogOpen,
  deleteComputerDialogOpen,
  saleDialogOpen,
  endSessionDialogOpen,
  editTariff,
  editPromotion,
  editZone,
  editComputer,
  deleteTariffId,
  deletePromotionId,
  deleteZoneId,
  deleteComputerId,
  endSessionId,
  isDeletingTariff,
  isDeletingPromotion,
  isDeletingZone,
  isDeletingComputer,
  isSelling,
  isEndingSession,
  handleTariffChange,
  handlePromotionChange,
  handleZoneChange,
  handleSaleChange,
  handleCreateTariff,
  handleEditTariff,
  handleDeleteTariff,
  handleCreatePromotion,
  handleEditPromotion,
  handleDeletePromotion,
  handleCreateZone,
  handleEditZone,
  handleDeleteZone,
  handleEditComputer,
  handleDeleteComputer,
  handleSellTariff,
  handleEndSession,
  setCreateTariffDialogOpen,
  setCreatePromotionDialogOpen,
  setCreateZoneDialogOpen,
  setEditTariffDialogOpen,
  setEditPromotionDialogOpen,
  setEditZoneDialogOpen,
  setEditComputerDialogOpen,
  setDeleteTariffDialogOpen,
  setDeletePromotionDialogOpen,
  setDeleteZoneDialogOpen,
  setDeleteComputerDialogOpen,
  setSaleDialogOpen,
  setEndSessionDialogOpen,
  setEditComputer,
}: DialogsProps) {
  return (
    <>
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
                {isCreatingTariff ? <span className="animate-spin">⏳</span> : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editTariffDialogOpen} onOpenChange={setEditTariffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать тариф</DialogTitle>
            <DialogDescription>Измените данные тарифа {editTariff?.name || ""}</DialogDescription>
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
                {isCreatingTariff ? <span className="animate-spin">⏳</span> : "Сохранить"}
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
              {isDeletingTariff !== null ? <span className="animate-spin">⏳</span> : "Удалить"}
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
                {isCreatingPromotion ? <span className="animate-spin">⏳</span> : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editPromotionDialogOpen} onOpenChange={setEditPromotionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать акцию</DialogTitle>
            <DialogDescription>Измените данные акции {editPromotion?.name || ""}</DialogDescription>
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
                {isCreatingPromotion ? <span className="animate-spin">⏳</span> : "Сохранить"}
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
              {isDeletingPromotion !== null ? <span className="animate-spin">⏳</span> : "Удалить"}
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
                {isCreatingZone ? <span className="animate-spin">⏳</span> : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editZoneDialogOpen} onOpenChange={setEditZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать зону</DialogTitle>
            <DialogDescription>Измените данные зоны {editZone?.name || ""}</DialogDescription>
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
                {isCreatingZone ? <span className="animate-spin">⏳</span> : "Сохранить"}
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
              {isDeletingZone !== null ? <span className="animate-spin">⏳</span> : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editComputerDialogOpen} onOpenChange={setEditComputerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать компьютер</DialogTitle>
            <DialogDescription>Измените данные компьютера {editComputer?.name || ""}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditComputer}>
            <div className="space-y-2">
              <Label htmlFor="edit-computer-name">Название компьютера</Label>
              <Input
                id="edit-computer-name"
                placeholder="Введите название"
                value={editComputer?.name || ""}
                onChange={(e) =>
                  setEditComputer((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev
                  )
                }
                className="shadow-sm"
                disabled={isCreatingZone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-computer-type">Тип</Label>
              <Select
                value={editComputer?.type || ""}
                onValueChange={(value) =>
                  setEditComputer((prev) =>
                    prev ? { ...prev, type: value as "PC" | "PlayStation" } : prev
                  )
                }
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
                onValueChange={(value) =>
                  setEditComputer((prev) => (prev ? { ...prev, zone_id: value } : prev))
                }
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
                onChange={(e) =>
                  setEditComputer((prev) =>
                    prev ? { ...prev, position_x: parseInt(e.target.value) || 0 } : prev
                  )
                }
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
                onChange={(e) =>
                  setEditComputer((prev) =>
                    prev ? { ...prev, position_y: parseInt(e.target.value) || 0 } : prev
                  )
                }
                className="shadow-sm"
                disabled={isCreatingZone}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditComputerDialogOpen(false)} disabled={isCreatingZone}>
                Отмена
              </Button>
              <Button type="submit" disabled={isCreatingZone}>
                {isCreatingZone ? <span className="animate-spin">⏳</span> : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              {isDeletingComputer !== null ? <span className="animate-spin">⏳</span> : "Удалить"}
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
                {isSelling ? <span className="animate-spin">⏳</span> : "Продать"}
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
              {isEndingSession !== null ? <span className="animate-spin">⏳</span> : "Завершить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
