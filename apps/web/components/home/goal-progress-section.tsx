import { StatsMembersResponse } from "@repo/schemas/stats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/card";

interface GoalProgressSectionProps {
  initialData: StatsMembersResponse;
}

export function GoalProgressSection({ initialData }: GoalProgressSectionProps) {
  if (!initialData.goals || initialData.goals.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">O que construímos juntos</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acompanhe em tempo real o impacto dos sócios no futuro do clube. Metas reais e resultados diretos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {initialData.goals.map((goal) => {
            const current = initialData.total;
            const percentage = Math.min(100, Math.max(0, (current / goal.target) * 100));
            const isCompleted = current >= goal.target;

            return (
              <Card key={goal.id} className={`transition-all duration-300 ${isCompleted ? 'border-brand-primary/50 shadow-md bg-brand-primary/5' : 'bg-card'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex justify-between items-start gap-4">
                    <span className="leading-tight">{goal.label}</span>
                    {isCompleted && (
                      <span className="text-xs font-bold bg-brand-primary text-white px-2.5 py-1 rounded-full whitespace-nowrap">
                        Atingida!
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium pt-2">
                    Objetivo: {goal.target.toLocaleString('pt-BR')} {goal.metric}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{current.toLocaleString('pt-BR')} atuais</span>
                      <span className={isCompleted ? "text-brand-primary" : "text-muted-foreground"}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-brand-primary transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
