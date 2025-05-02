import { Button } from "@/components/ui/button";

interface Computer {
  id: string;
  name: string;
  type: "PC" | "PlayStation";
  status: "available" | "occupied" | "reserved" | "maintenance";
  zone: "standard" | "vip" | "console";
  timeLeft?: string;
  customer?: string;
  created_at: string;
}

interface ClubMapProps {
  computers: Computer[];
  setComputers: React.Dispatch<React.SetStateAction<Computer[]>>;
  onEdit?: (computer: Computer) => void;
}

export function ClubMap({ computers = [], setComputers, onEdit }: ClubMapProps) {
  const handleEditComputer = (computer: Computer) => {
    if (onEdit) {
      onEdit(computer);
    }
  };

  // Разделяем компьютеры по зонам
  const standardComputers = computers.filter((comp) => comp.zone === "standard");
  const vipComputers = computers.filter((comp) => comp.zone === "vip");
  const consoleComputers = computers.filter((comp) => comp.zone === "console");

  return (
    <div
      className="relative w-full h-[600px] rounded-lg shadow-lg"
      style={{
        background: `linear-gradient(
          45deg,
          rgba(0, 30, 60, 0.8),
          rgba(20, 60, 90, 0.8)
        ),
        url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"%3E%3Cpath d="M0 0h200v200H0z"/%3E%3Cpath d="M0 20h200M0 40h200M0 60h200M0 80h200M0 100h200M0 120h200M0 140h200M0 160h200M0 180h200M20 0v200M40 0v200M60 0v200M80 0v200M100 0v200M120 0v200M140 0v200M160 0v200M180 0v200"/%3E%3C/svg%3E')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Зона "Крыло Ингбор" (Стандарт) */}
      <div className="absolute top-4 left-4">
        <h3 className="text-lg font-bold text-white">Крыло Ингбор</h3>
        <div className="grid grid-cols-6 gap-2 mt-2">
          {standardComputers.map((computer) => (
            <Button
              key={computer.id}
              variant="outline"
              className={`
                w-12 h-12 rounded-md text-sm font-bold
                ${computer.status === "available" ? "bg-green-500 hover:bg-green-600" : ""}
                ${computer.status === "occupied" ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
                ${computer.status === "reserved" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                ${computer.status === "maintenance" ? "bg-gray-500 hover:bg-gray-600" : ""}
                text-white border-none
              `}
              onClick={() => handleEditComputer(computer)}
            >
              {computer.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Зона "Гаронин" (VIP) */}
      <div className="absolute top-4 right-4">
        <h3 className="text-lg font-bold text-white">Гаронин</h3>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {vipComputers.map((computer) => (
            <Button
              key={computer.id}
              variant="outline"
              className={`
                w-12 h-12 rounded-md text-sm font-bold
                ${computer.status === "available" ? "bg-purple-500 hover:bg-purple-600" : ""}
                ${computer.status === "occupied" ? "bg-purple-700 hover:bg-purple-800 animate-pulse" : ""}
                ${computer.status === "reserved" ? "bg-purple-600 hover:bg-purple-700" : ""}
                ${computer.status === "maintenance" ? "bg-gray-500 hover:bg-gray-600" : ""}
                text-white border-none
              `}
              onClick={() => handleEditComputer(computer)}
            >
              {computer.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Зона "Соффааб" (Консоль) */}
      <div className="absolute bottom-4 left-4">
        <h3 className="text-lg font-bold text-white">Соффааб</h3>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {consoleComputers.map((computer) => (
            <Button
              key={computer.id}
              variant="outline"
              className={`
                w-12 h-12 rounded-md text-sm font-bold
                ${computer.status === "available" ? "bg-blue-500 hover:bg-blue-600" : ""}
                ${computer.status === "occupied" ? "bg-blue-700 hover:bg-blue-800 animate-pulse" : ""}
                ${computer.status === "reserved" ? "bg-blue-600 hover:bg-blue-700" : ""}
                ${computer.status === "maintenance" ? "bg-gray-500 hover:bg-gray-600" : ""}
                text-white border-none
              `}
              onClick={() => handleEditComputer(computer)}
            >
              {computer.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
