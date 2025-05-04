// dialogs/CreateTariffDialog.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TariffForm } from "../types";

interface CreateTariffDialogProps {
  tariffForm: TariffForm;
  isCreatingTariff: boolean;
  createTariffDialogOpen: boolean;
  handleTariffChange: (field: keyof TariffForm, value: string) => void;
  handleCreateTariff: (e: React.FormEvent) => Promise<void>;
  setCreateTariffDialogOpen: (open: boolean) => void;
}

export function CreateTariffDialog({
  tariffForm,
  isCreatingTariff,
  createTariffDialogOpen,
  handleTariffChange,
  handleCreateTariff,
  setCreateTariffDialogOpen,
}: CreateTariffDialogProps) {
  return (
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
                <SelectItem value="standard">Стандарт</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="console">Консоль</SelectItem>
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
  );
}
