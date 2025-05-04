import { Tariff } from "./types";
import { TariffList } from "./tariff-list";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, DollarSign, Plus } from "lucide-react";

interface TariffsTabProps {
  tariffs: Tariff[];
  tariffSort: "asc" | "desc";
  tariffPage: number;
  totalTariffPages: number;
  setTariffSort: (sort: "asc" | "desc") => void;
  setTariffPage: (page: number) => void;
  handleSellTariffOpen: () => void;
  setCreateTariffDialogOpen: (open: boolean) => void;
  handleEditTariffOpen: (tariff: Tariff) => void;
  handleDeleteTariffOpen: (tariffId: string) => void;
  isDeletingTariff: string | null;
}

export function TariffsTab({
  tariffs,
  tariffSort,
  tariffPage,
  totalTariffPages,
  setTariffSort,
  setTariffPage,
  handleSellTariffOpen,
  setCreateTariffDialogOpen,
  handleEditTariffOpen,
  handleDeleteTariffOpen,
  isDeletingTariff,
}: TariffsTabProps) {
  const paginatedTariffs = tariffs.slice((tariffPage - 1) * 3, tariffPage * 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label>Сортировка:</Label>
          <Select value={tariffSort} onValueChange={setTariffSort}>
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
            <DollarSign className="mr-2 h-4 w-4" />
            Продать тариф
          </Button>
          <Button onClick={() => setCreateTariffDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Новый тариф
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
            <ChevronLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <span>
            Страница {tariffPage} из {totalTariffPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setTariffPage((prev) => Math.min(prev + 1, totalTariffPages))
            }
            disabled={tariffPage === totalTariffPages}
          >
            Вперед
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
