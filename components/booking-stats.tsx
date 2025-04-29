"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

// Типизация данных для графика
interface ChartData {
  name: string // Время в формате HH:MM
  total: number // Количество бронирований
}

// Данные для графика
const data: ChartData[] = [
  { name: "8:00", total: 5 },
  { name: "10:00", total: 12 },
  { name: "12:00", total: 18 },
  { name: "14:00", total: 25 },
  { name: "16:00", total: 32 },
  { name: "18:00", total: 45 },
  { name: "20:00", total: 50 },
  { name: "22:00", total: 42 },
  { name: "00:00", total: 30 },
  { name: "02:00", total: 15 },
]

export function BookingStats() {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Статистика бронирований по времени</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: "Время", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            label={{ value: "Количество", angle: -90, position: "insideLeft", offset: 10 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value} бронирований`, "Всего"]}
            labelFormatter={(label) => `Время: ${label}`}
            contentStyle={{ backgroundColor: "#333", color: "#fff", borderRadius: "4px" }}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar
            dataKey="total"
            name="Бронирования"
            fill="#adfa1d"
            radius={[4, 4, 0, 0]}
            barSize={30}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

