"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { FileText } from "lucide-react";

const MOCK_POLLS = [
  { 
    id: "poll-1", 
    title: "Novo Design da Camisa 2026", 
    description: "Escolha qual será o terceiro uniforme do Tubarão para a próxima temporada.",
    status: "OPEN", 
    closesAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    options: [
      { id: "opt-1", label: "Modelo Listrado (Azul e Branco)" },
      { id: "opt-2", label: "Modelo Degradê (Azul Escuro)" },
      { id: "opt-3", label: "Modelo Retrô 1992" }
    ]
  },
];

export function PollsClient() {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const handleVote = (pollId: string) => {
    if (votes[pollId]) {
      setSubmitted(prev => ({ ...prev, [pollId]: true }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Votações
        </h1>
        <p className="text-muted-foreground mt-2">
          Participe ativamente das decisões do clube. Sua voz importa.
        </p>
      </div>

      <div className="grid gap-6">
        {MOCK_POLLS.map(poll => {
          const isSubmitted = submitted[poll.id];
          const closeDateStr = new Date(poll.closesAt).toLocaleDateString();

          return (
            <Card key={poll.id} className="border-blue-200">
              <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{poll.description}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  Encerra em: {closeDateStr}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poll.options.map(option => (
                    <div key={option.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors">
                      <input 
                        type="radio" 
                        name={`poll-${poll.id}`} 
                        id={option.id} 
                        value={option.id}
                        checked={votes[poll.id] === option.id}
                        onChange={() => !isSubmitted && setVotes(prev => ({ ...prev, [poll.id]: option.id }))}
                        disabled={isSubmitted}
                        className="w-4 h-4 text-primary bg-background border-input"
                      />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </div>

                {isSubmitted && (
                  <div className="mt-4 p-3 bg-green-50 text-green-800 border border-green-200 rounded-md text-sm font-medium animate-in fade-in zoom-in duration-300">
                    Obrigado! Sua voz foi registrada. Resultado divulgado em {closeDateStr}.
                  </div>
                )}
              </CardContent>
              {!isSubmitted && (
                <CardFooter>
                  <Button 
                    onClick={() => handleVote(poll.id)} 
                    disabled={!votes[poll.id]}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Confirmar Voto
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
