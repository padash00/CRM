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

// Чёткая типизация — чтоб не засрало проект
interface ChartData {
  name: string
  total: number
}

// Вот данные — реальные, блядь, а не воображаемые
const chartData: ChartData[] = [
  { name: "Янв", total: 240 },
  { name: "Фев", total: 290 },
  { name: "Мар", total: 345 },
  { name: "Апр", total: 410 },
  { name: "Май", total: 470 },
  { name: "Июн", total: 510 },
  { name: "Июл", total: 620 },
  { name: "Авг", total: 700 },
  { name: "Сен", total: 540 },
  { name: "Окт", total: 490 },
  { name: "Ноя", total: 430 },
  { name: "Дек", total: 580 },
]

// Кастомный тултип, без пыли
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-background p-2 shadow-md border">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">
          Посещений: <span className="font-medium text-foreground">{payload[0].value}</span>
        </p>
      </div>
    )
  }
  return null
}

// Сам компонент — шоб вставить и не еб*ться
export function CustomerStats() {
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
          fill="#cde901" // цвет как просили — акцент клуба
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
