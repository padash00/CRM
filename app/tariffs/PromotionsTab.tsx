import { Promotion } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash } from "lucide-react";

interface PromotionsTabProps {
  paginatedPromotions: Promotion[];
  promotionFilter: "all" | "active" | "expired";
  promotionSort: "asc" | "desc";
  promotionPage: number;
  totalPromotionPages: number;
  setPromotionFilter: (filter: "all" | "active" | "expired") => void;
  setPromotionSort: (sort: "asc" | "desc") => void;
  setPromotionPage: (page: number) => void;
  setCreatePromotionDialogOpen: (open: boolean) => void;
  handleEditPromotionOpen: (promotion: Promotion) => void;
  handleDeletePromotionOpen: (promotionId: string) => void;
  isDeletingPromotion: string | null;
}

export function PromotionsTab({
  paginatedPromotions,
  promotionFilter,
  promotionSort,
  promotionPage,
  totalPromotionPages,
  setPromotionFilter,
  setPromotionSort,
  setPromotionPage,
  setCreatePromotionDialogOpen,
  handleEditPromotionOpen,
  handleDeletePromotionOpen,
  isDeletingPromotion,
}: PromotionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label>Фильтр:</Label>
          <Select value={promotionFilter} onValueChange={setPromotionFilter}>
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
          <Select value={promotionSort} onValueChange={setPromotionSort}>
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
    </div>
  );
}
