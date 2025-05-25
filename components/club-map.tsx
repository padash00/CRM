import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

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

export function ClubMap({ computers = [], setComputers, onEdit }: ClubMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  const handleEditComputer = (computer: Computer) => {
    setSelectedComputer(computer);
  };

  const standardComputers = computers.filter((comp) => comp.zone === "standard");
  const vipComputers = computers.filter((comp) => comp.zone === "vip");
  const consoleComputers = computers.filter((comp) => comp.zone === "console");

  const changeStatus = async (id: string, status: Computer["status"]) => {
    await supabase.from("computers").update({ status }).eq("id", id);
    fetchComputers(); // обновить карту
  };

  const getColorByStatus = (status: Computer["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600";
      case "occupied":
        return "bg-red-500 hover:bg-red-600 animate-pulse";
      default:
        return "bg-gray-500";
    }
  };

  const rebootComputer = async (id: string) => {
    // если есть API управления, делай fetch или отправь WebSocket
    console.log("Rebooting", id);
  };

  const startTariff = async (computer: Computer) => {
    // если есть API управления, делай fetch или отправь WebSocket
    console.log("Starting tariff", computer.id);
  };

  const markMaintenance = async (computer: Computer) => {
    // если есть API управления, делай fetch или отправь WebSocket
    console.log("Marking maintenance", computer.id);
  };

  const handleAddComputer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const name = form.name.value;
    const type = form.type.value;
    const zone = form.zone.value;
    const position_x = parseInt(form.position_x.value, 10);
    const position_y = parseInt(form.position_y.value, 10);

    // отправить запрос на сервер, чтобы создать новый ПК
    fetch("/api/computers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, zone, position_x, position_y }),
    })
     .then((response) => response.json())
     .then((data) => {
        setComputers([...computers, data]);
        setAddDialogOpen(false);
      });
  };

  return (
    <div>
      <div ref={containerRef} className="relative w-full h-[600px] rounded-lg shadow-lg" style={{
        background: `linear-gradient(
          45deg,
          rgba(0, 30, 60, 0.8),
          rgba(20, 60, 90, 0.8)
        ),
        url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" fill=\"none\" stroke=\"rgba(255,255,255,0.1)\" stroke-width=\"2\"%3E%3Cpath d=\"M0 0h200v200H0z\"/%3E%3Cpath d=\"M0 20h200M0 40h200M0 60h200M0 80h200M0 100h200M0 120h200M0 140h200M0 160h200M0 180h200M20 0v200M40 0v200M60 0v200M80 0v200M100 0v200M120 0v200M140 0v200M160 0v200M180 0v200\"/%3E%3C/svg%3E')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        {standardComputers.map((computer) => (
          <Button key={computer.id} variant="outline" className={`absolute w-14 h-14 rounded-lg text-sm font-bold ${getColorByStatus(computer.status)} text-white border-none shadow-lg`}
            style={{
              top: `${(computer.position_y / dimensions.height) * 100}%`,
              left: `${(computer.position_x / dimensions.width) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => handleEditComputer(computer)} >
            {computer.name}
          </Button>
        ))}
        {vipComputers.map((computer) => (
          <Button key={computer.id} variant="outline" className={`absolute w-14 h-14 rounded-lg text-sm font-bold ${getColorByStatus(computer.status)} text-white border-none shadow-lg`}
            style={{
              top: `${(computer.position_y / dimensions.height) * 100}%`,
              left: `${(computer.position_x / dimensions.width) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => handleEditComputer(computer)} >
            {computer.name}
          </Button>
        ))}
        {consoleComputers.map((computer) => (
          <Button key={computer.id} variant="outline" className={`absolute w-14 h-14 rounded-lg text-sm font-bold ${getColorByStatus(computer.status)} text-white border-none shadow-lg`}
            style={{
              top: `${(computer.position_y / dimensions.height) * 100}%`,
              left: `${(computer.position_x / dimensions.width) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => handleEditComputer(computer)} >
            {computer.name}
          </Button>
        ))}
        <Button className="absolute top-4 right-4 z-50" onClick={() => setAddDialogOpen(true)}>
          + ПК
        </Button>
      </div>
      {selectedComputer && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-xl p-4 shadow-lg flex gap-2 z-50">
          <Button onClick={() => startTariff(selectedComputer)}>Включить по тарифу</Button>
          <Button onClick={() => rebootComputer(selectedComputer.id)}>Перезагрузить</Button>
          <Button onClick={() => markMaintenance(selectedComputer)}>В обслуживание</Button>
          <Button variant="ghost" onClick={() => setSelectedComputer(null)}>Закрыть</Button>
        </div>
      )}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>Добавить новый ПК</DialogHeader>
          <form onSubmit={handleAddComputer}>
            <label>Имя ПК:</label>
            <input type="text" name="name" />
            <label>Тип:</label>
            <select name="type">
              <option value="PC">PC</option>
              <option value="PlayStation">PlayStation</option>
            </select>
            <label>Зона:</label>
            <select name="zone">
              <option value="standard">Стандарт</option>
              <option value="vip">VIP</option>
              <option value="console">Консоль</option>
            </select>
            <label>Позиция X:</label>
            <input type="number" name="position_x" />
            <label>Позиция Y:</label>
            <input type="number" name="position_y" />
            <Button type="submit">Сохранить</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
