"use client"

import { useLanguage } from "@/contexts/language-context"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"

// Типизация данных графика
interface RevenueData {
  name: string // Название дня недели
  total: number // Сумма выручки в тенге
}

export function RevenueChart() {
  const { t } = useLanguage()

  // Данные графика с переводом названий дней
  const data: RevenueData[] = [
    { name: t("mon"), total: 12000 },
    { name: t("tue"), total: 14500 },
    { name: t("wed"), total: 17800 },
    { name: t("thu"), total: 15300 },
    { name: t("fri"), total: 21500 },
    { name: t("sat"), total: 25000 },
    { name: t("sun"), total: 23200 },
  ]

  // Форматирование значений оси Y
  const formatYAxis = (value: number) => `₸${(value / 1000).toFixed(0)}k`

  // Кастомизация тултипа
  const customTooltipFormatter = (value: number) => [`₸${value.toLocaleString()}`, t("revenue")]
  const customLabelFormatter = (label: string) => `${t("day")}: ${label}`

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
      >
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          label={{ value: t("days"), position: "insideBottom", offset: -5 }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatYAxis}
          label={{ value: t("revenue"), angle: -90, position: "insideLeft", offset: 10 }}
        />
        <Tooltip
          formatter={customTooltipFormatter}
          labelFormatter={customLabelFormatter}
          contentStyle={{
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "4px",
            border: "none",
          }}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="total"
          name={t("revenue")}
          stroke="#adfa1d"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

