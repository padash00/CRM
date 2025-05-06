// components/revenue-chart.tsx
"use client";

// Импорты из recharts (убедись, что библиотека установлена: pnpm add recharts)
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// Импорт для темы (если используешь смену тем shadcn/ui)
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

// Интерфейс для точки данных (должен совпадать с тем, что в page.tsx)
interface RevenueDataPoint {
  day: string; // Отформатированная дата (напр., "06.05")
  total_revenue: number;
}

// Интерфейс пропсов
interface RevenueChartProps {
    data?: RevenueDataPoint[];
    loading?: boolean;
}

export function RevenueChart({ data = [], loading = false }: RevenueChartProps) {
    const { theme } = useTheme(); // Получаем текущую тему

    // Определяем цвета на основе CSS переменных темы shadcn/ui для лучшей адаптации
    const colors = useMemo(() => {
        // Проверка на случай рендеринга на сервере, где document не доступен
        if (typeof document === 'undefined') {
           // Предоставляем цвета по умолчанию для SSR
           return { primary: '#09090b', muted: '#f1f5f9', text: '#71717a', border: '#e4e4e7', background: '#ffffff'};
        }
        try {
            // Пытаемся получить цвета из CSS переменных
            const styles = getComputedStyle(document.documentElement);
            return {
                primary: `hsl(${styles.getPropertyValue('--primary').trim()})`,
                muted: `hsl(${styles.getPropertyValue('--muted').trim()})`,
                text: `hsl(${styles.getPropertyValue('--muted-foreground').trim()})`,
                border: `hsl(${styles.getPropertyValue('--border').trim()})`,
                background: `hsl(${styles.getPropertyValue('--background').trim()})`,
            };
        } catch (e) {
            console.error("Не удалось получить CSS переменные для цветов графика, используются значения по умолчанию.", e);
             return { primary: '#09090b', muted: '#f1f5f9', text: '#71717a', border: '#e4e4e7', background: '#ffffff'};
        }
    }, [theme]); // Пересчитываем цвета при смене темы

    // Отображение состояния загрузки
    if (loading) {
         return <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse">Загрузка данных графика...</div>;
    }

    // Отображение, если нет данных после загрузки
    if (!data || data.length === 0) {
       return <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Нет данных для построения графика за выбранный период.</div>;
    }

    // Отображение самого графика
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}> {/* Настроили отступы */}
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} strokeOpacity={0.5}/>
                <XAxis
                    dataKey="day" // Данные для оси X (день)
                    stroke={colors.text}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke={colors.text}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    // Форматируем в тыс. тенге (k)
                    tickFormatter={(value) => `₸${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                     cursor={{ fill: colors.muted, radius: 'var(--radius)' }} // Стиль курсора
                     contentStyle={{ // Стили подсказки
                         backgroundColor: colors.background,
                         border: `1px solid ${colors.border}`,
                         borderRadius: 'var(--radius)',
                         padding: '8px 12px',
                         boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                     }}
                     labelStyle={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', display: 'block' }}
                     itemStyle={{ fontSize: '12px' }}
                     // Форматируем значение и название в подсказке
                     formatter={(value: number) => [`₸ ${value.toLocaleString('ru-RU')}`, "Выручка"]}
                     labelFormatter={(label) => `Дата: ${label}`} // Форматируем заголовок подсказки
                />
                <Bar
                    dataKey="total_revenue" // Данные для высоты столбиков
                    fill={colors.primary} // Цвет столбиков из темы
                    radius={[4, 4, 0, 0]} // Скругление верха
                 />
            </BarChart>
        </ResponsiveContainer>
    );
}
