import { Button } from "@repo/ui/components/button"

export default function TestUIPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="space-y-4 rounded-lg border p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Tailwind 4 + shadcn/ui</h1>
        <p className="text-muted-foreground">Component test page</p>
        <div className="flex gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>
    </div>
  )
}
