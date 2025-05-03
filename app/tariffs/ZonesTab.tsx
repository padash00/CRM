import { Computer } from "./types";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card-header";
import { CardTitle } from "@/components/ui/card-title";
import { CardDescription } from "@/components/ui/card-description";
import { CardContent } from "@/components/ui/card-content";
import { ClubMap } from "@/components/club-map";

interface ZonesTabProps {
  computers: Computer[];
  setComputers: React.Dispatch<React.SetStateAction<Computer[]>>;
  handleEditComputerOpen: (computer: Computer) => void;
}

export function ZonesTab({
  computers,
  setComputers,
  handleEditComputerOpen,
}: ZonesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Зоны и компьютеры</h3>
      </div>
      <div className="grid gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Карта клуба</CardTitle>
            <CardDescription>Список компьютеров (кликните, чтобы редактировать)</CardDescription>
          </CardHeader>
          <CardContent>
            <ClubMap
              computers={computers}
              setComputers={setComputers}
              onEdit={handleEditComputerOpen}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
