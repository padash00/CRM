"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
    if (!name.trim() || !discount || isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100) {
      toast({
        title: "Ошибка",
        description: "Заполните название и корректную скидку (0–100%)",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const discountValue = parseFloat(discount);
      if (program) {
        const { error } = await supabase
          .from("loyalty_programs")
          .update({
            name: name.trim(),
            discount: discountValue,
            description: description.trim() || null,
          })
          .eq("id", program.id);

        if (error) {
          throw new Error(`Ошибка обновления программы лояльности: ${error.message}`);
        }

        setProgram({ ...program, name: name.trim(), discount: discountValue, description: description.trim() || "" });
        toast({
          title: "Программа лояльности обновлена",
          description: "Данные успешно сохранены.",
        });
      } else {
        const { data, error } = await supabase
          .from("loyalty_programs")
          .insert([
            {
              name: name.trim(),
              discount: discountValue,
              description: description.trim() || null,
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
      setIsEditing(false);
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

  const handleDelete = async () => {
    if (!program) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("loyalty_programs")
        .delete()
        .eq("id", program.id);

      if (error) {
        throw new Error(`Ошибка удаления программы лояльности: ${error.message}`);
      }

      setProgram(null);
      setName("");
      setDiscount("");
      setDescription("");
      toast({
        title: "Программа лояльности удалена",
        description: "Данные успешно удалены.",
      });
      setDeleteDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Ошибка",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
            <span className="animate-spin">⏳</span>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Программа лояльности</CardTitle>
          <CardDescription>Настройте скидки для постоянных клиентов</CardDescription>
        </div>
        {program && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isSaving || isDeleting}
            >
              <Edit className="mr-2 h-4 w-4" /> Редактировать
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isSaving || isDeleting}
            >
              {isDeleting ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
              Удалить
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {program && !isEditing ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Название:</span>
              <span>{program.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Скидка:</span>
              <span>{program.discount}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Описание:</span>
              <span>{program.description || "Нет описания"}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loyalty-name">Название программы</Label>
              <Input
                id="loyalty-name"
                placeholder="Введите название"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving || isDeleting}
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
                disabled={isSaving || isDeleting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loyalty-description">Описание</Label>
              <Input
                id="loyalty-description"
                placeholder="Описание программы"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving || isDeleting}
              />
            </div>
          </div>
        )}
      </CardContent>
      {(isEditing || !program) && (
        <CardFooter>
          {isEditing && (
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                if (program) {
                  setName(program.name);
                  setDiscount(program.discount.toString());
                  setDescription(program.description || "");
                }
              }}
              disabled={isSaving || isDeleting}
              className="mr-2"
            >
              Отмена
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || isDeleting}>
            {isSaving ? <span className="animate-spin mr-2">⏳</span> : "Сохранить"}
          </Button>
        </CardFooter>
      )}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить программу лояльности? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <span className="animate-spin mr-2">⏳</span> : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
