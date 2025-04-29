"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

// Типизация сотрудника
interface Staff {
  name: string
  initials: string
  position: string
}

// Типизация смены
interface Shift {
  time: string
  staff: Staff[]
}

// Типизация данных о сменах
interface ShiftsByDate {
  [date: string]: Shift[]
}

export function ShiftSchedule() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState<boolean>(false)
  const [shiftTime, setShiftTime] = useState<string>("10:00 - 22:00")
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [shiftsByDate, setShiftsByDate] = useState<ShiftsByDate>({
    "2025-03-30": [
      {
        time: "10:00 - 22:00",
        staff: [
          { name: "Иван Смирнов", initials: "ИС", position: "Администратор" },
          { name: "Мария Петрова", initials: "МП", position: "Оператор" },
          { name: "Анна Козлова", initials: "АК", position: "Бармен" },
        ],
      },
    ],
    "2025-03-31": [
      {
        time: "10:00 - 22:00",
        staff: [
          { name: "Екатерина Соколова", initials: "ЕС", position: "Администратор" },
          { name: "Дмитрий Волков", initials: "ДВ", position: "Оператор" },
          { name: "Анна Козлова", initials: "АК", position: "Бармен" },
        ],
      },
    ],
    "2025-04-01": [
      {
        time: "10:00 - 22:00",
        staff: [
          { name: "Иван Смирнов", initials: "ИС", position: "Администратор" },
          { name: "Мария Петрова", initials: "МП", position: "Оператор" },
          { name: "Алексей Новиков", initials: "АН", position: "Техник" },
        ],
      },
    ],
    "2025-04-02": [
      {
        time: "10:00 - 22:00",
        staff: [
          { name: "Екатерина Соколова", initials: "ЕС", position: "Администратор" },
          { name: "Дмитрий Волков", initials: "ДВ", position: "Оператор" },
          { name: "Анна Козлова", initials: "АК", position: "Бармен" },
        ],
      },
    ],
  })

  // Список всех сотрудников
  const allStaff: Staff[] = [
    { name: "Иван Смирнов", initials: "ИС", position: "Администратор" },
    { name: "Мария Петрова", initials: "МП", position: "Оператор" },
    { name: "Анна Козлова", initials: "АК", position: "Бармен" },
    { name: "Алексей Новиков", initials: "АН", position: "Техник" },
    { name: "Екатерина Соколова", initials: "ЕС", position: "Администратор" },
    { name: "Дмитрий Волков", initials: "ДВ", position: "Оператор" },
  ]

  // Форматирование даты в строку
  const formatDate = useCallback((date: Date): string => {
    return date.toISOString().split("T")[0]
  }, [])

  // Получение смен для выбранной даты
  const selectedDateShifts = useCallback(() => {
    return date ? shiftsByDate[formatDate(date)] || [] : []
  }, [date, shiftsByDate, formatDate])

  // Обработчик добавления смены
  const handleAddShift = useCallback(() => {
    if (!date) {
      toast({
        title: "Ошибка",
        description: "Выберите дату для добавления смены",
        variant: "destructive",
      })
      return
    }
    setSelectedStaff([])
    setShiftTime("10:00 - 22:00")
    setAddShiftDialogOpen(true)
  }, [date])

  // Обработчик выбора сотрудников
  const handleStaffSelection = useCallback((staffName: string) => {
    setSelectedStaff((prev) =>
      prev.includes(staffName)
        ? prev.filter((name) => name !== staffName)
        : [...prev, staffName]
    )
  }, [])

  // Сохранение смены
  const saveShift = useCallback(() => {
    if (selectedStaff.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы одного сотрудника для смены",
        variant: "destructive",
      })
      return
    }

    const dateKey = formatDate(date!)
    const staffForShift = allStaff.filter((staff) => selectedStaff.includes(staff.name))

    const newShift: Shift = {
      time: shiftTime,
      staff: staffForShift,
    }

    setShiftsByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newShift],
    }))

    toast({
      title: "Смена добавлена",
      description: `Смена на ${date?.toLocaleDateString("ru-RU")} успешно добавлена`,
    })

    setAddShiftDialogOpen(false)
  }, [date, shiftTime, selectedStaff, allStaff, formatDate])

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      {/* Календарь */}
      <div className="md:w-1/2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Календарь смен</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm"
              components={{
                DayContent: (props) => {
                  const dateStr = formatDate(props.date)
                  const hasShifts = shiftsByDate[dateStr]?.length > 0
                  return (
                    <div className="relative flex items-center justify-center">
                      <div>{props.date.getDate()}</div>
                      {hasShifts && (
                        <div className="absolute bottom-0 h-1 w-1 rounded-full bg-primary" />
                      )}
                    </div>
                  )
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Список смен */}
      <div className="md:w-1/2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Смены на {date?.toLocaleDateString("ru-RU") || "Выберите дату"}
            </CardTitle>
            <Button size="sm" onClick={handleAddShift}>
              Добавить смену
            </Button>
          </CardHeader>
          <CardContent>
            {selectedDateShifts().length > 0 ? (
              <div className="space-y-4">
                {selectedDateShifts().map((shift, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-2 font-medium">{shift.time}</div>
                    <div className="space-y-3">
                      {shift.staff.map((employee) => (
                        <div key={employee.name} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{employee.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {employee.position}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-muted-foreground">Нет смен на выбранную дату</div>
                <Button className="mt-4" onClick={handleAddShift}>
                  Добавить смену
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Диалог добавления смены */}
      <Dialog open={addShiftDialogOpen} onOpenChange={setAddShiftDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить смену</DialogTitle>
            <DialogDescription>
              Добавьте новую смену на {date?.toLocaleDateString("ru-RU")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shift-time">Время смены</Label>
              <Input
                id="shift-time"
                value={shiftTime}
                onChange={(e) => setShiftTime(e.target.value)}
                placeholder="Например: 10:00 - 22:00"
                className="shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Выберите сотрудников</Label>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 shadow-sm">
                {allStaff.map((staff) => (
                  <div key={staff.name} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`staff-${staff.name}`}
                      checked={selectedStaff.includes(staff.name)}
                      onCheckedChange={() => handleStaffSelection(staff.name)}
                    />
                    <label
                      htmlFor={`staff-${staff.name}`}
                      className="text-sm font-medium flex items-center w-full cursor-pointer"
                    >
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">{staff.initials}</AvatarFallback>
                      </Avatar>
                      <span>{staff.name} ({staff.position})</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddShiftDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveShift}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

