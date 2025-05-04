export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      <p className="mt-4 text-lg text-muted-foreground">Грузим, б*ять, подожди...</p>
    </div>
  )
}
