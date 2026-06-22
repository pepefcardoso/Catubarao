"use client";

import { useEffect, useState, useCallback } from "react";
import { env } from "@/lib/env";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@repo/ui/components/table";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Input } from "@repo/ui/components/input";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@repo/ui/components/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { z } from "zod";

const FormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  opponent: z.string().min(2, "Opponent is required"),
  competition: z.string().min(2, "Competition is required"),
});

type FormValues = z.infer<typeof FormSchema>;

export function EventsClient() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/admin/events`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.data);
    } catch (error) {
      toast.error("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: "",
      opponent: "",
      competition: "",
    },
  });

  const openCreateSheet = () => {
    form.reset({
      date: "",
      opponent: "",
      competition: "",
    });
    setIsSheetOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    const payload = {
      date: new Date(data.date).toISOString(),
      opponent: data.opponent,
      competition: data.competition,
    };

    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/admin/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Erro ao criar evento");
        return;
      }

      toast.success("Evento criado");
      setIsSheetOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error("Erro na operação");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os jogos e eventos.</p>
        </div>
        <Button onClick={openCreateSheet}>
          <Plus className="w-4 h-4 mr-2" />
          Novo evento
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Adversário</TableHead>
              <TableHead>Competição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Nenhum evento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    {new Date(event.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{event.opponent}</TableCell>
                  <TableCell>{event.competition}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Novo Evento</SheetTitle>
            <SheetDescription>
              Crie um novo evento de jogo.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="opponent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adversário</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Figueirense" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="competition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Campeonato Catarinense" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Salvar
                </Button>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
