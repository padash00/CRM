"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@headlessui/react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Customer {
  id: string
  name: string
}

interface Props {
  value: string
  onChange: (value: string) => void
}

export function CustomerCombobox({ value, onChange }: Props) {
  const [query, setQuery] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
        .order("name", { ascending: true })

      if (!error && data) {
        setCustomers(data)
      }
    }

    fetchCustomers()
  }, [])

  const filtered =
    query === ""
      ? customers
      : customers.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase())
        )

  return (
    <div>
      <Label>Клиент</Label>
      <Combobox value={value} onChange={onChange}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-md border bg-background text-left shadow-sm">
            <Combobox.Input
              className="w-full border-none bg-transparent px-3 py-2 outline-none"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(val: string) => {
                const customer = customers.find((c) => c.id === val)
                return customer?.name || ""
              }}
              placeholder="Введите имя или выберите..."
              onClick={() => setOpen(true)}
            />
            <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Combobox.Button>
          </div>
          {open && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {filtered.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-muted-foreground">
                  Клиент не найден
                </div>
              ) : (
                filtered.map((customer) => (
                  <Combobox.Option
                    key={customer.id}
                    value={customer.id}
                    className={({ active }) =>
                      cn(
                        "relative cursor-pointer select-none px-4 py-2",
                        active && "bg-accent text-accent-foreground"
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={cn(
                            "block truncate",
                            selected && "font-medium"
                          )}
                        >
                          {customer.name}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 right-4 flex items-center">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  )
}
