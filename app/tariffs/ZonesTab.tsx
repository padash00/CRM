import { Computer } from "./types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Карта клуба</CardTitle>
          <CardDescription>
            Список компьютеров (кликните, чтобы редактировать)
          </CardDescription>
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
  );
}
