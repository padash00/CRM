import { Session } from "./types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SessionsTabProps {
  sessions: Session[];
  isEndingSession: string | null;
  setEndSessionId: (id: string | null) => void;
  setEndSessionDialogOpen: (open: boolean) => void;
}

export function SessionsTab({
  sessions,
  isEndingSession,
  setEndSessionId,
  setEndSessionDialogOpen,
}: SessionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Активные сессии</h3>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Список сессий</CardTitle>
          <CardDescription>Управляйте активными сессиями</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center text-muted-foreground">Нет активных сессий</div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <div className="font-medium">{session.customers.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Компьютер: {session.computers.name}, Тариф: {session.tariffs.name}, Стоимость: ₸{session.cost}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Начало: {new Date(session.start_time).toLocaleString()}, Конец: {new Date(session.end_time).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setEndSessionId(session.id);
                      setEndSessionDialogOpen(true);
                    }}
                    disabled={isEndingSession === session.id}
                  >
                    {isEndingSession === session.id ? (
                      <span className="animate-spin mr-2">⏳</span>
                    ) : null}
                    Завершить
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
