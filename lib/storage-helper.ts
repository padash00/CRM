// Типизация для значений, которые могут быть сериализованы в JSON
type StorageValue = string | number | boolean | object | null

/**
 * Получает значение из localStorage по ключу
 * @param key Ключ для получения значения
 * @param defaultValue Значение по умолчанию, если ключ не найден или произошла ошибка
 * @returns Значение из localStorage или defaultValue
 */
export function getStorageItem<T extends StorageValue>(
  key: string,
  defaultValue: T
): T {
  // Проверка на серверный рендеринг (SSR)
  if (typeof window === "undefined") {
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    return item !== null ? (JSON.parse(item) as T) : defaultValue
  } catch (error) {
    console.error(`Ошибка при получении "${key}" из localStorage:`, error)
    return defaultValue
  }
}

/**
 * Сохраняет значение в localStorage по ключу
 * @param key Ключ для сохранения значения
 * @param value Значение для сохранения
 */
export function setStorageItem<T extends StorageValue>(
  key: string,
  value: T
): void {
  // Проверка на серверный рендеринг (SSR)
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Ошибка при сохранении "${key}" в localStorage:`, error)
  }
}

