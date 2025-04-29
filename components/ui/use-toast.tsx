"use client"

import { useState, useEffect, useCallback } from "react"

// Типизация свойств тоста
interface ToastProps {
  title?: string
  description?: string
  duration?: number // В миллисекундах, 0 для бесконечного отображения
  variant?: "default" | "destructive"
}

// Типизация тоста с идентификатором
interface Toast extends ToastProps {
  id: number
}

// Типизация возвращаемого значения функции toast
interface ToastControl {
  id: number
  dismiss: () => void
  update: (props: Partial<ToastProps>) => void
}

// Глобальное состояние тостов
const toasts: Record<number, Toast> = {}
let toastId = 0
const listeners: Array<() => void> = []

// Основная функция создания тоста
export function toast(props: ToastProps): ToastControl {
  const id = toastId++
  const newToast: Toast = { ...props, id }
  toasts[id] = newToast

  // Уведомляем всех слушателей
  notifyListeners()

  // Установка таймера на удаление, если duration !== 0
  if (props.duration !== 0) {
    const timeoutId = setTimeout(() => {
      delete toasts[id]
      notifyListeners()
    }, props.duration || 3000)

    // Очистка таймера при dismiss или update
    return {
      id,
      dismiss: () => {
        clearTimeout(timeoutId)
        delete toasts[id]
        notifyListeners()
      },
      update: (updatedProps: Partial<ToastProps>) => {
        clearTimeout(timeoutId)
        toasts[id] = { ...toasts[id], ...updatedProps }
        notifyListeners()

        if (updatedProps.duration !== 0) {
          setTimeout(() => {
            delete toasts[id]
            notifyListeners()
          }, updatedProps.duration || toasts[id].duration || 3000)
        }
      },
    }
  }

  return {
    id,
    dismiss: () => {
      delete toasts[id]
      notifyListeners()
    },
    update: (updatedProps: Partial<ToastProps>) => {
      toasts[id] = { ...toasts[id], ...updatedProps }
      notifyListeners()
    },
  }
}

// Утилита для уведомления слушателей
const notifyListeners = () => {
  listeners.forEach((listener) => listener())
}

// Хук для использования тостов
export function useToast() {
  const [activeToasts, setActiveToasts] = useState<Record<number, Toast>>({})

  // Регистрация слушателя
  useEffect(() => {
    const listener = () => {
      setActiveToasts({ ...toasts })
    }
    listeners.push(listener)

    // Инициализация состояния при монтировании
    setActiveToasts({ ...toasts })

    return () => {
      listeners.splice(listeners.indexOf(listener), 1)
    }
  }, [])

  // Обработчик закрытия тоста
  const dismissToast = useCallback((id: number) => {
    delete toasts[id]
    notifyListeners()
  }, [])

  return {
    toast,
    toasts: activeToasts, // Возвращаем текущее состояние тостов
    dismissToast,
  }
}

// Компонент для отображения тостов (пример)
export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {Object.values(toasts).map((t) => (
        <div
          key={t.id}
          className={`rounded-md p-4 shadow-md ${
            t.variant === "destructive"
              ? "bg-red-500 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          {t.title && <h3 className="font-bold">{t.title}</h3>}
          {t.description && <p>{t.description}</p>}
        </div>
      ))}
    </div>
  )
}

