import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Computer {
  id: string;
  name: string;
  type: "PC" | "PlayStation";
  status: "available" | "occupied";
  zone: "standard" | "vip" | "console";
  position_x: number;
  position_y: number;
  timeLeft?: string;
  customer?: string;
  created_at: string;
}

interface ClubMapProps {
  computers: Computer[];
  setComputers: React.Dispatch<React.SetStateAction<Computer[]>>;
  onEdit?: (computer: Computer) => void;
}

export function ClubMap({ computers = [], onEdit }: ClubMapProps) {
  const renderZoneLabel = (label: string, position: string) => (
    <div className={`absolute ${position}`}>
      <h3 className="text-lg font-bold text-white">{label}</h3>
    </div>
  );

  const renderComputerButton = (
    computer: Computer,
    color: string,
    occupiedColor: string
  ) => {
    const isOccupied = computer.status === "occupied";

    const tooltipText = isOccupied
      ? `Клиент: ${computer.customer || "Неизвестен"}\nОсталось: ${computer.timeLeft || "??"}`
      : "Свободно";

    return (
      <Tooltip key={computer.id}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className={`absolute w-14 h-14 rounded-lg text-sm font-bold text-white border-none shadow-lg
              ${isOccupied ? `${occupiedColor} hover:brightness-110 animate-pulse` : `${color} hover:brightness-110`}
            `}
            style={{
              top: `${(computer.position_y / 600) * 100}%`,
              left: `${(computer.position_x / 1200) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => onEdit?.(computer)}
          >
            {computer.name}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="whitespace-pre-line text-xs">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <div
        className="relative w-full h-[600px] rounded-lg shadow-lg"
        style={{
          background: `linear-gradient(45deg, rgba(0, 30, 60, 0.8), rgba(20, 60, 90, 0.8)),
            url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"%3E%3Cpath d="M0 0h200v200H0z"/%3E%3Cpath d="M0 20h200M0 40h200M0 60h200M0 80h200M0 100h200M0 120h200M0 140h200M0 160h200M0 180h200M20 0v200M40 0v200M60 0v200M80 0v200M100 0v200M120 0v200M140 0v200M160 0v200M180 0v200"/%3E%3C/svg%3E')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {renderZoneLabel("Крыло Ингбор", "top-4 left-4")}
        {computers
          .filter((c) => c.zone === "standard")
          .map((c) => renderComputerButton(c, "bg-green-500", "bg-red-500"))}

        {renderZoneLabel("Гаронин", "top-4 right-4")}
        {computers
          .filter((c) => c.zone === "vip")
          .map((c) => renderComputerButton(c, "bg-purple-500", "bg-purple-700"))}

        {renderZoneLabel("Соффааб", "bottom-4 left-4")}
        {computers
          .filter((c) => c.zone === "console")
          .map((c) => renderComputerButton(c, "bg-blue-500", "bg-blue-700"))}
      </div>
    </TooltipProvider>
  );
}
