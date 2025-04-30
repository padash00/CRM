"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

// Типизация для данных графика
interface ChartData {
  name: string; // Месяц ("Янв", "Фев", ...)
  total: number; // Количество посещений
}

// Пропсы компонента
interface CustomerStatsProps {
  monthlyVisits: { month: string; totalVisits: number; year: number }[];
}

// Кастомный тултип
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-background p-2 shadow-md border">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">
          Посещений: <span className="font-medium text-foreground">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Компонент графика
export function CustomerStats({ monthlyVisits }: CustomerStatsProps) {
  // Преобразуем monthlyVisits в формат, который ожидает график
  const chartData: ChartData[] = monthlyVisits.map((entry) => ({
    name: entry.month,
    total: entry.totalVisits,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          stroke="#888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `${val}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="total"
          fill="#cde901" // Цвет как просили — акцент клуба
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
