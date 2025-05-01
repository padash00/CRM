// components/loyalty-program.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface LoyaltyProgramData {
  id: string;
  name: string;
  discount: number;
  description: string;
}

export function LoyaltyProgram() {
  const [program, setProgram] = useState<LoyaltyProgramData | null>(null);
  const [name, setName] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchProgram = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("loyalty_programs")
          .select("*")
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw new Error(`Ошибка загрузки программы лояльности: ${error.message}`);
        }

        if (data) {
          setProgram(data);
          setName(data.name);
          setDiscount(data.discount.toString());
          setDescription(data.description || "");
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Ошибка",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgram();
  }, []);

  const handleSave = async () => {
    if (!name || !discount || Number(discount) < 0 || Number(discount) > 100) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно (скидка от 0 до 100%)",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (program) {
        const { error } = await supabase
          .from("loyalty_programs")
          .update({
            name,
            discount: parseFloat(discount),
            description: description || null,
          })
          .eq("id", program.id);

        if (error) {
          throw new Error(`Ошибка обновления программы лояльности: ${error.message}`);
        }

        setProgram({ ...program, name, discount: parseFloat(discount), description: description || "" });
        toast({
          title: "Программа лояльности обновлена",
          description: "Данные успешно сохранены.",
        });
      } else {
        const { data, error } = await supabase
          .from("loyalty_programs")
          .insert([
            {
              name,
              discount: parseFloat(discount),
              description: description || null,
            },
          ])
          .select()
          .single();

        if (error) {
          throw new Error(`Ошибка создания программы лояльности: ${error.message}`);
        }

        setProgram(data);
        toast({
          title: "Программа лояльности создана",
          description: "Данные успешно сохранены.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Ошибка",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Программа лояльности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Загрузка...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Программа лояльности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Программа лояльности</CardTitle>
        <CardDescription>Настройте скидки для постоянных клиентов</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loyalty-name">Название программы</Label>
            <Input
              id="loyalty-name"
              placeholder="Введите название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loyalty-discount">Скидка (%)</Label>
            <Input
              id="loyalty-discount"
              type="number"
              min="0"
              max="100"
              placeholder="Введите скидку"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loyalty-description">Описание</Label>
            <Input
              id="loyalty-description"
              placeholder="Описание программы"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Сохранить
        </Button>
      </CardFooter>
    </Card>
  );
}
