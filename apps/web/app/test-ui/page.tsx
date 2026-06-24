import { Button } from "@repo/ui/components/button";
import { ClubCrest } from "@repo/ui/components/ClubCrest";

export default function TestUIPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="space-y-4 rounded-lg border p-8 shadow-sm">
        <h1 className="text-2xl font-bold font-display text-brand-secondary">Tailwind 4 + shadcn/ui</h1>
        <p className="text-muted-foreground">Component test page</p>
        <div className="flex gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="pt-4 border-t flex flex-col items-center">
          <h2 className="text-xl mb-4 text-brand-primary">Club Crest</h2>
          <ClubCrest size={64} className="bg-brand-surface rounded-full p-2" />
        </div>
      </div>
    </div>
  );
}
