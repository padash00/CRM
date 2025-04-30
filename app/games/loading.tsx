// games/loading.tsx
"use client";

import { Loader2 } from "lucide-react"; // Импортируем иконку загрузки из lucide-react

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-semibold text-muted-foreground">
        Загрузка данных...
      </p>
    </div>
  );
}
