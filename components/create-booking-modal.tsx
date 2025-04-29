"use client"

import type { FormEvent } from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"

// Типизация данных бронирования
interface BookingFormData {
  customer: string
  station: string
  date: string
  time: string
  duration: string
}

export function CreateBookingModal() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>({
    customer: "",
    station: "",
    date: "",
    time: "",
    duration: "2",
  })
  const router = useRouter()

  // Обработчик изменения полей формы
  const handleChange = useCallback((field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Обработчик отправки формы
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const { customer, station, date, time } = formData

      if (!customer || !station || !date || !time) {
        toast({
          title: t("error"),
          description: t("fillAllFields"),
          variant: "destructive",
        })
        return
      }

      toast({
        title: t("bookingCreated"),
        description: `${customer} ${date} ${t("at")} ${time} ${t("for")} ${station} ${t("durationOf")} ${
          formData.duration
        } ${t("hours")}.`,
      })

      setOpen(false)
      setFormData({ customer: "", station: "", date: "", time: "", duration: "2" }) // Сброс формы
      router.push("/bookings")
    },
    [formData, router, t]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> {t("newBooking")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("createBooking")}</DialogTitle>
            <DialogDescription>{t("fillBookingDetails")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                {t("client")}
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.customer}
                  onValueChange={(value) => handleChange("customer", value)}
                  required
                >
                  <SelectTrigger id="customer" className="shadow-sm">
                    <SelectValue placeholder={t("selectClient")} />
                  </SelectTrigger>
                  <SelectContent>
                    {["Алексей К.", "Михаил С.", "Дмитрий В.", "Сергей Л."].map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="station" className="text-right">
                {t("station")}
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.station}
                  onValueChange={(value) => handleChange("station", value)}
                  required
                >
                  <SelectTrigger id="station" className="shadow-sm">
                    <SelectValue placeholder={t("selectStation")} />
                  </SelectTrigger>
                  <SelectContent>
                    {["PC-02", "PC-05", "PC-08", "VIP-02", "PS5-02", "XBOX-01"].map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                {t("date")}
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3 shadow-sm"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                min={new Date().toISOString().split("T")[0]} // Ограничение на текущую дату
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                {t("time")}
              </Label>
              <Input
                id="time"
                type="time"
                className="col-span-3 shadow-sm"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                {t("duration")}
              </Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => handleChange("duration", value)}
              >
                <SelectTrigger id="duration" className="col-span-3 shadow-sm">
                  <SelectValue placeholder={t("selectDuration")} />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour} {t("hours")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("createBooking")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

