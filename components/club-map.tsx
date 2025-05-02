import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
}

export function ClubMap({ computers = [], setComputers }: ClubMapProps) {
  const handleStatusChange = (id: string, newStatus: Computer["status"]) => {
    setComputers((prev) =>
      prev.map((comp) =>
        comp.id === id ? { ...comp, status: newStatus } : comp
      )
    );
  };

  return (
    <Tabs defaultValue="standard" className="w-full">
      <TabsList>
        <TabsTrigger value="standard">Стандарт</TabsTrigger>
        <TabsTrigger value="vip">VIP</TabsTrigger>
        <TabsTrigger value="console">Консоль</TabsTrigger>
      </TabsList>
      <TabsContent value="standard">
        {computers?.length > 0 ? (
          computers
            .filter((comp) => comp.zone === "standard")
            .map((computer) => (
              <Card key={computer.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{computer.name}</CardTitle>
                  <CardDescription>{computer.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Статус:</span>
                      <Badge
                        variant="outline"
                        className={
                          computer.status === "available"
                            ? "bg-green-100 text-green-800"
                            : computer.status === "occupied"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {computer.status === "available"
                          ? "Свободен"
                          : computer.status === "occupied"
                          ? "Занят"
                          : computer.status === "reserved"
                          ? "Зарезервирован"
                          : "На обслуживании"}
                      </Badge>
                    </div>
                    {computer.status === "occupied" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Клиент:</span>
                          <span>{computer.customer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Оставшееся время:</span>
                          <span>{computer.timeLeft}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <div className="text-center text-muted-foreground">
            Нет компьютеров в зоне "Стандарт"
          </div>
        )}
      </TabsContent>
      <TabsContent value="vip">
        {computers?.length > 0 ? (
          computers
            .filter((comp) => comp.zone === "vip")
            .map((computer) => (
              <Card key={computer.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{computer.name}</CardTitle>
                  <CardDescription>{computer.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Статус:</span>
                      <Badge
                        variant="outline"
                        className={
                          computer.status === "available"
                            ? "bg-green-100 text-green-800"
                            : computer.status === "occupied"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {computer.status === "available"
                          ? "Свободен"
                          : computer.status === "occupied"
                          ? "Занят"
                          : computer.status === "reserved"
                          ? "Зарезервирован"
                          : "На обслуживании"}
                      </Badge>
                    </div>
                    {computer.status === "occupied" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Клиент:</span>
                          <span>{computer.customer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Оставшееся время:</span>
                          <span>{computer.timeLeft}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <div className="text-center text-muted-foreground">
            Нет компьютеров в зоне "VIP"
          </div>
        )}
      </TabsContent>
      <TabsContent value="console">
        {computers?.length > 0 ? (
          computers
            .filter((comp) => comp.zone === "console")
            .map((computer) => (
              <Card key={computer.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{computer.name}</CardTitle>
                  <CardDescription>{computer.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Статус:</span>
                      <Badge
                        variant="outline"
                        className={
                          computer.status === "available"
                            ? "bg-green-100 text-green-800"
                            : computer.status === "occupied"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {computer.status === "available"
                          ? "Свободен"
                          : computer.status === "occupied"
                          ? "Занят"
                          : computer.status === "reserved"
                          ? "Зарезервирован"
                          : "На обслуживании"}
                      </Badge>
                    </div>
                    {computer.status === "occupied" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Клиент:</span>
                          <span>{computer.customer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Оставшееся время:</span>
                          <span>{computer.timeLeft}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <div className="text-center text-muted-foreground">
            Нет компьютеров в зоне "Консоль"
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
