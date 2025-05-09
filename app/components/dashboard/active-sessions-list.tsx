// app/components/dashboard/active-sessions-list.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Computer as ComputerIcon, PowerOff, Edit } from "lucide-react"; // Добавил PowerOff
import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Интерфейс для сессии (должен совпадать с тем, что будет в page.tsx)
// Предполагаем, что имена клиента и компьютера уже подгружены
export interface SessionData {
  id: string;
  customer_name: string | null; // Имя клиента (или "Гость" + guest_name)
  guest_name?: string | null;
  computer_name: string | null; // Имя компьютера
  start_time: string; // ISO string
  end_time: string | null; // ISO string, null если активна
  cost?: number | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'; // ENUM из БД
  tariff_name?: string | null; // Название тарифа (опционально)
  // Дополнительные поля, если нужны для отображения
  customers?: { name: string | null } | null; // Для customer_name
  computers?: { name: string | null } | null; // Для computer_name
  tariffs?: { name: string | null } | null; // Для tariff_name
}

interface ActiveSessionsListProps {
  sessions: SessionData[];
  loading: boolean;
  onEndSession: (sessionId: string) => Promise<void>; // Функция для завершения сессии
  // onEditSession?: (session: SessionData) => void; // Для будущего редактирования
}

// Компонент для отображения прошедшего времени
const TimeElapsed = ({ startTime }: { startTime: string }) => {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const updateElapsed = () => {
      try {
        const start = parseISO(startTime);
        setElapsed(formatDistanceToNowStrict(start, { locale: ru, addSuffix: false }));
      } catch (e) {
        setElapsed("Ошибка времени");
      }
    };

    updateElapsed(); // Сразу при монтировании
    const intervalId = setInterval(updateElapsed, 1000 * 30); // Обновляем каждые 30 сек

    return () => clearInterval(intervalId);
  }, [startTime]);

  return <span>{elapsed}</span>;
};


export function ActiveSessionsList({ sessions, loading, onEndSession }: ActiveSessionsListProps) {
  const [endingSessionId, setEndingSessionId] = useState<string | null>(null);

  const handleEndSessionClick = async (sessionId: string) => {
    setEndingSessionId(sessionId);
    try {
      await onEndSession(sessionId);
    } finally {
      setEndingSessionId(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Загрузка активных сессий...</div>;
  }

  if (sessions.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Нет активных сессий.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Клиент</TableHead>
          <TableHead>Компьютер</TableHead>
          <TableHead>Время начала</TableHead>
          <TableHead>Прошло времени</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                {session.customer_name || `Гость: ${session.guest_name}` || "Неизвестно"}
              </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <ComputerIcon size={16} className="text-muted-foreground" />
                    {session.computer_name || "N/A"}
                </div>
            </TableCell>
            <TableCell>
                {format(parseISO(session.start_time), 'HH:mm dd.MM.yy', { locale: ru })}
            </TableCell>
            <TableCell>
                <TimeElapsed startTime={session.start_time} />
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                onClick={() => handleEndSessionClick(session.id)}
                disabled={endingSessionId === session.id}
                title="Завершить сессию"
              >
                {endingSessionId === session.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <PowerOff className="h-4 w-4" />
                )}
                <span className="ml-1 hidden sm:inline">Завершить</span>
              </Button>
              {/* TODO: Кнопка редактирования сессии (если нужно) */}
              {/* <Button variant="ghost" size="icon" className="ml-2 h-8 w-8"><Edit size={16}/></Button> */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
