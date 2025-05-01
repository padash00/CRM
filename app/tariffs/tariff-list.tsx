// components/tariff-list.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Loader2 } from "lucide-react";

interface Tariff {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  created_at: string;
}

interface TariffListProps {
  tariffs: Tariff[];
  onEdit: (tariff: Tariff) => void;
  onDelete: (tariffId: string) => void;
  isDeleting: string | null;
}

export function TariffList({ tariffs, onEdit, onDelete, isDeleting }: TariffListProps) {
  return (
    <>
      {tariffs.map((tariff) => (
        <Card key={tariff.id} className="shadow-sm">
          <CardHeader>
            <CardTitle>{tariff.name}</CardTitle>
            <CardDescription>{tariff.description || "Нет описания"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Тип:</span>
                <span>{tariff.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Цена:</span>
                <span>₸{tariff.price}/час</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Статус:</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Активен
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(tariff)}
              disabled={isDeleting === tariff.id}
            >
              <Edit className="mr-2 h-4 w-4" /> Редактировать
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(tariff.id)}
              disabled={isDeleting === tariff.id}
            >
              {isDeleting === tariff.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
              Удалить
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
