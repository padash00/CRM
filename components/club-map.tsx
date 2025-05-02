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

  // Определяем позиции компьютеров для каждой зоны
  const standardPositions = [
    { name: "1", top: "10%", left: "5%" },
    { name: "2", top: "10%", left: "10%" },
    { name: "3", top: "10%", left: "15%" },
    { name: "4", top: "15%", left: "5%" },
    { name: "5", top: "15%", left: "10%" },
    { name: "6", top: "15%", left: "15%" },
    { name: "7", top: "20%", left: "5%" },
    { name: "8", top: "20%", left: "10%" },
    { name: "9", top: "20%", left: "15%" },
    { name: "10", top: "25%", left: "5%" },
    { name: "11", top: "25%", left: "10%" },
    { name: "12", top: "25%", left: "15%" },
    { name: "13", top: "30%", left: "5%" },
    { name: "14", top: "30%", left: "10%" },
    { name: "15", top: "30%", left: "15%" },
    { name: "16", top: "35%", left: "5%" },
    { name: "17", top: "35%", left: "10%" },
    { name: "18", top: "35%", left: "15%" },
    { name: "19", top: "40%", left: "5%" },
    { name: "20", top: "40%", left: "10%" },
    { name: "21", top: "40%", left: "15%" },
    { name: "22", top: "45%", left: "5%" },
    { name: "23", top: "45%", left: "10%" },
    { name: "24", top: "45%", left: "15%" },
    { name: "25", top: "50%", left: "5%" },
    { name: "26", top: "50%", left: "10%" },
    { name: "27", top: "50%", left: "15%" },
    { name: "28", top: "55%", left: "5%" },
    { name: "29", top: "55%", left: "10%" },
    { name: "30", top: "55%", left: "15%" },
    { name: "31", top: "60%", left: "5%" },
    { name: "32", top: "60%", left: "10%" },
    { name: "33", top: "60%", left: "15%" },
    { name: "34", top: "65%", left: "5%" },
    { name: "35", top: "65%", left: "10%" },
    { name: "36", top: "65%", left: "15%" },
    { name: "37", top: "70%", left: "5%" },
    { name: "38", top: "70%", left: "10%" },
    { name: "39", top: "70%", left: "15%" },
  ];

  const vipPositions = [
    { name: "101", top: "50%", left: "70%" },
    { name: "102", top: "50%", left: "75%" },
    { name: "103", top: "50%", left: "80%" },
    { name: "104", top: "55%", left: "70%" },
    { name: "105", top: "55%", left: "75%" },
    { name: "106", top: "55%", left: "80%" },
    { name: "107", top: "60%", left: "70%" },
    { name: "108", top: "60%", left: "75%" },
    { name: "109", top: "60%", left: "80%" },
  ];

  const consolePositions = [
    { name: "301", top: "10%", left: "70%" },
    { name: "302", top: "10%", left: "75%" },
    { name: "303", top: "10%", left: "80%" },
    { name: "304", top: "15%", left: "70%" },
    { name: "305", top: "15%", left: "75%" },
    { name: "306", top: "15%", left: "80%" },
  ];

  // Сопоставляем компьютеры с их позициями
  const standardComputers = computers.filter((comp) => comp.zone === "standard");
  const vipComputers = computers.filter((comp) => comp.zone === "vip");
  const consoleComputers = computers.filter((comp) => comp.zone === "console");

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-lg shadow-lg">
      {/* Стандартная зона */}
      {standardComputers.map((computer, index) => {
        const position = standardPositions[index] || { top: "0%", left: "0%" };
        return (
          <Button
            key={computer.id}
            variant="outline"
            className={`
              absolute w-10 h-10 rounded-md text-sm font-bold
              ${computer.status === "available" ? "bg-green-500 hover:bg-green-600" : ""}
              ${computer.status === "occupied" ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
              ${computer.status === "reserved" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              ${computer.status === "maintenance" ? "bg-gray-500 hover:bg-gray-600" : ""}
              text-white border-none
            `}
            style={{
              top: position.top,
              left: position.left,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => handleEditComputer(computer)}
          >
            {computer.name}
          </Button>
        );
      })}

      {/* VIP зона */}
      {vipComputers.map((computer, index) => {
        const position = vipPositions[index] || { top: "0%", left: "0%" };
        return (
          <Button
            key={computer.id}
            variant="outline"
            className={`
              absolute w-10 h-10 rounded-md text-sm font-bold
              ${computer.status === "available" ? "bg-purple-500 hover:bg-purple-600" : ""}
              ${computer.status === "occupied" ? "bg-purple-700 hover:bg-purple-800 animate-pulse" : ""}
              ${computer.status === "reserved" ? "bg-purple-600 hover:bg-purple-700" : ""}
              ${computer.status === "maintenance" ? "bg-gray-500 hover:bg-gray-600" : ""}
              text-white border-none
            `}
            style={{
              top: position.top,
              left: position.left,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => handleEditComputer(computer)}
          >
            {computer.name}
          </Button>
        );
      })}

      {/* Консольная зона */}
      {consoleComputers.map((computer, index) => {
        const position = consolePositions[index] || { top: "0%", left: "0%" };
        return (
          <Button
            key={computer.id}
            variant="outline"
            className={`
              absolute w-10 h-10 rounded-md text-sm font-bold
              ${computer.status === "available" ? "bg-blue-500 hover:bg-blue-600" : ""}
              ${computer.status === "occupied" ? "bg-blue-700 hover:bg-blue-800 animate-pulse" : ""}
              ${computer.status === "reserved" ? "bg-blue-600 hover:bg-blue-700" : ""}
              ${computer.status === "maintenance" ? "bg-gray-500 hover:bg-gray-600" : ""}
              text-white border-none
            `}
            style={{
              top: position.top,
              left: position.left,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => handleEditComputer(computer)}
          >
            {computer.name}
          </Button>
        );
      })}
    </div>
  );
}
