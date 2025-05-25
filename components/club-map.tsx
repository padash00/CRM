import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase"; // или актуальный путь

type Zone = "standard" | "vip" | "console";
type ComputerStatus = "FREE" | "BOOKED" | "MAINTENANCE";

interface Computer {
  id: string;
  name: string;
  type: "PC" | "PlayStation";
  status: ComputerStatus;
  zone: Zone;
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

export function ClubMap({ computers = [], setComputers, onEdit }: ClubMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);

  const handleEditComputer = (computer: Computer) => {
    setSelectedComputer(computer);
    if (onEdit) onEdit(computer);
  };

  const standardComputers = computers.filter((comp) => comp.zone === "standard");
  const vipComputers = computers.filter((comp) => comp.zone === "vip");
  const consoleComputers = computers.filter((comp) => comp.zone === "console");
  const changeStatus = async (id: string, status: ComputerStatus) => {
  await supabase.from("computers").update({ status }).eq("id", id);
  fetchComputers(); // обновить карту
};
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newComputer, setNewComputer] = useState({
    name: "",
    type: "PC",
    status: "FREE" as ComputerStatus,
    position_x: 100,
    position_y: 100,
    zone: "standard" as Zone,
  });

  
  const getColorByStatus = (status: Computer["status"]) => {
  switch (status) {
    case "FREE":
      return "bg-green-500 hover:bg-green-600";
    case "BOOKED":
      return "bg-yellow-500 hover:bg-yellow-600 animate-pulse";
    case "MAINTENANCE":
      return "bg-red-500 hover:bg-red-600";
    default:
      return "bg-gray-500";
  }
};


const rebootComputer = async (id: string) => {
  // если есть API управления, делай fetch или отправь WebSocket
  console.log("Rebooting", id);
};


  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] rounded-lg shadow-lg"
      style={{
        background: `linear-gradient(
          45deg,
          rgba(0, 30, 60, 0.8),
          rgba(20, 60, 90, 0.8)
        ),
        url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" fill=\"none\" stroke=\"rgba(255,255,255,0.1)\" stroke-width=\"2\"%3E%3Cpath d=\"M0 0h200v200H0z\"/%3E%3Cpath d=\"M0 20h200M0 40h200M0 60h200M0 80h200M0 100h200M0 120h200M0 140h200M0 160h200M0 180h200M20 0v200M40 0v200M60 0v200M80 0v200M100 0v200M120 0v200M140 0v200M160 0v200M180 0v200\"/%3E%3C/svg%3E')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-4 left-4">
        <h3 className="text-lg font-bold text-white">Крыло Ингбор</h3>
      </div>
      {standardComputers.map((computer) => (
        <Button
          key={computer.id}
          variant="outline"
          className={`
            absolute w-14 h-14 rounded-lg text-sm font-bold
            ${getColorByStatus(computer.status)}
            text-white border-none shadow-lg
          `}
          style={{
            top: `${(computer.position_y / dimensions.height) * 100}%`,
            left: `${(computer.position_x / dimensions.width) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => handleEditComputer(computer)}
        >
          {computer.name}
        </Button>
      ))}


      <div className="absolute top-4 right-4">
        <h3 className="text-lg font-bold text-white">Гаронин</h3>
      </div>
      {vipComputers.map((computer) => (
        <Button
          key={computer.id}
          variant="outline"
          className={`
            absolute w-14 h-14 rounded-lg text-sm font-bold
            ${computer.status === "available" ? "bg-purple-500 hover:bg-purple-600" : ""}
            ${computer.status === "occupied" ? "bg-purple-700 hover:bg-purple-800 animate-pulse" : ""}
            text-white border-none shadow-lg
          `}
          style={{
            top: `${(computer.position_y / dimensions.height) * 100}%`,
            left: `${(computer.position_x / dimensions.width) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => handleEditComputer(computer)}
        >
          {computer.name}
        </Button>
      ))}

      <div className="absolute bottom-4 left-4">
        <h3 className="text-lg font-bold text-white">Соффааб</h3>
      </div>
      {consoleComputers.map((computer) => (
        <Button
          key={computer.id}
          variant="outline"
          className={`
            absolute w-14 h-14 rounded-lg text-sm font-bold
            ${computer.status === "available" ? "bg-blue-500 hover:bg-blue-600" : ""}
            ${computer.status === "occupied" ? "bg-blue-700 hover:bg-blue-800 animate-pulse" : ""}
            text-white border-none shadow-lg
          `}
          style={{
            top: `${(computer.position_y / dimensions.height) * 100}%`,
            left: `${(computer.position_x / dimensions.width) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => handleEditComputer(computer)}
        >
          {computer.name}
        </Button>
      ))}
    </div>
  <div
    className="absolute z-50 bg-white rounded-xl shadow-xl p-3 space-y-2 w-48"
    style={{
      top: `${(selectedComputer.position_y / dimensions.height) * 100}%`,
      left: `${(selectedComputer.position_x / dimensions.width) * 100}%`,
      transform: "translate(-50%, -110%)",
    }}
  >
    <div className="font-semibold text-gray-800 text-center">
      {selectedComputer.name}
    </div>
    <Button
      className="w-full text-left"
      variant="outline"
      onClick={() => {
        console.log("Включить по тарифу", selectedComputer.id);
        // TODO: вызвать модалку/функцию тарифа
        setSelectedComputer(null);
      }}
    >
      ▶ Включить по тарифу
    </Button>
    <Button
      className="w-full text-left"
      variant="outline"
      onClick={() => {
        console.log("Перезагрузить", selectedComputer.id);
        // TODO: добавить вызов Supabase/локальную логику
        setSelectedComputer(null);
      }}
    >
      🔄 Перезагрузить
    </Button>
    <Button
      className="w-full text-left text-red-600"
      variant="outline"
      onClick={() => {
        console.log("Перевести в обслуживание", selectedComputer.id);
        // TODO: обновить статус через Supabase
        setSelectedComputer(null);
      }}
    >
      🛠 В обслуживание
    </Button>
  </div>
)}

  {showAddDialog && (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-xl shadow-xl p-6 w-[300px] space-y-4">
      <h2 className="text-lg font-bold">Добавить компьютер</h2>
      <input
        type="text"
        placeholder="Имя"
        className="w-full border px-3 py-2 rounded"
        value={newComputer.name}
        onChange={(e) => setNewComputer({ ...newComputer, name: e.target.value })}
      />
      <select
        className="w-full border px-3 py-2 rounded"
        value={newComputer.type}
        onChange={(e) => setNewComputer({ ...newComputer, type: e.target.value as "PC" | "PlayStation" })}
      >
        <option value="PC">PC</option>
        <option value="PlayStation">PlayStation</option>
      </select>
      {/* позже можно вставить dropdown с зонами */}
      <div className="flex justify-between gap-2">
        <Button
          className="w-1/2"
          onClick={async () => {
            // TODO: отправить в Supabase
            const { data, error } = await supabase.from("computers").insert({
              name: newComputer.name,
              type: newComputer.type,
              status: "FREE",
              position_x: newComputer.position_x,
              position_y: newComputer.position_y,
              zone_id: "..." // <-- вручную или через выбор
            });
            if (error) {
              console.error("Ошибка добавления:", error.message);
            } else {
              setShowAddDialog(false);
              setNewComputer({ name: "", type: "PC", status: "FREE", position_x: 100, position_y: 100 });
              // обновим список компьютеров
              setComputers((prev) => [...prev, data?.[0]]);
            }
          }}
        >
          Сохранить
        </Button>
        <Button variant="ghost" className="w-1/2" onClick={() => setShowAddDialog(false)}>
          Отмена
        </Button>
      </div>
    </div>
  </div>
)}

  
  <div className="absolute bottom-4 right-4 z-50">
  <Button
    className="bg-white text-black hover:bg-gray-100"
    onClick={() => setShowAddDialog(true)}
  >
    ➕ Добавить ПК
  </Button>
</div>


  );
}
