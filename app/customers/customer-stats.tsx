"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

// Типизация данных для графика
interface ChartData {
  name: string
  total: number
}

// Данные графика
const chartData: ChartData[] = [
  { name: "Янв", total: 320 },
  { name: "Фев", total: 350 },
  { name: "Мар", total: 410 },
  { name: "Апр", total: 380 },
  { name: "Май", total: 450 },
  { name: "Июн", total: 520 },
  { name: "Июл", total: 580 },
  { name: "Авг", total: 620 },
  { name: "Сен", total: 550 },
  { name: "Окт", total: 480 },
  { name: "Ноя", total: 420 },
  { name: "Дек", total: 490 },
]

// Кастомный компонент Tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-background p-2 shadow-md border">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">
          Клиентов: <span className="font-medium text-foreground">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

export function CustomerStats() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="total"
          fill="#adfa1d"
          radius={[4, 4, 0, 0]}
          barSize={30}
          background={{ fill: "#eee", radius: 4, opacity: 0.2 }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

