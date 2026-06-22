"use client";

import { useEffect, useState, useCallback } from "react";
import { env } from "@/lib/env";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/components/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@repo/ui/components/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateMembershipPlanSchema } from "@repo/schemas/member";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  priceString: z.string().min(1, "Price is required"),
  interval: z.enum(["MONTHLY", "ANNUAL"]),
  benefitsString: z.string().min(1, "Benefits are required"),
  isCorporate: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof FormSchema>;

export function PlansClient() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<any>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/admin/plans`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      toast.error("Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const form = useForm<any>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      priceString: "",
      interval: "MONTHLY",
      benefitsString: "",
      isCorporate: false,
      isActive: true,
    },
  });

  const openCreateSheet = () => {
    setEditingPlan(null);
    form.reset({
      name: "",
      priceString: "",
      interval: "MONTHLY",
      benefitsString: "",
      isCorporate: false,
      isActive: true,
    });
    setIsSheetOpen(true);
  };

  const openEditSheet = (plan: any) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      priceString: Number(plan.price).toFixed(2),
      interval: plan.interval,
      benefitsString: plan.benefits.join("\n"),
      isCorporate: plan.isCorporate,
      isActive: plan.isActive,
    });
    setIsSheetOpen(true);
  };

  const onSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      price: parseFloat(data.priceString.replace(",", ".")),
      interval: data.interval,
      benefits: data.benefitsString.split("\n").map((s: string) => s.trim()).filter(Boolean),
      isCorporate: data.isCorporate,
      isActive: data.isActive,
    };

    try {
      let res;
      if (editingPlan) {
        res = await fetch(`${env.NEXT_PUBLIC_API_URL}/admin/plans/${editingPlan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      } else {
        res = await fetch(`${env.NEXT_PUBLIC_API_URL}/admin/plans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      }

      if (!res.ok) {
        if (res.status === 409) {
            toast.error("Cannot modify: plan has active subscribers");
        } else {
            toast.error(editingPlan ? "Erro ao atualizar plano" : "Erro ao criar plano");
        }
        return;
      }

      toast.success(editingPlan ? "Plano atualizado" : "Plano criado");
      setIsSheetOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error("Erro na operação");
    }
  };

  const confirmDelete = (plan: any) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!planToDelete) return;
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/admin/plans/${planToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 409) {
        toast.error("Não é possível desativar plano com sócios ativos.");
      } else if (!res.ok) {
        toast.error("Erro ao desativar plano.");
      } else {
        toast.success("Plano desativado com sucesso.");
        fetchPlans();
      }
    } catch (error) {
      toast.error("Erro na operação");
    } finally {
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os planos de Sócio-Torcedor.</p>
        </div>
        <Button onClick={openCreateSheet}>
          <Plus className="w-4 h-4 mr-2" />
          Novo plano
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Corporativo?</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum plano encontrado.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id} className={!plan.isActive ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>R$ {Number(plan.price).toFixed(2).replace(".", ",")}</TableCell>
                  <TableCell>{plan.interval === "MONTHLY" ? "Mensal" : "Anual"}</TableCell>
                  <TableCell>{plan.isCorporate ? "Sim" : "Não"}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditSheet(plan)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {plan.isActive && (
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete(plan)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingPlan ? "Editar Plano" : "Novo Plano"}</SheetTitle>
            <SheetDescription>
              {editingPlan ? "Modifique as configurações do plano selecionado." : "Crie um novo plano de Sócio-Torcedor."}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sócio Ouro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="priceString"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 49.90" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control as any}
                    name="interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="MONTHLY">Mensal</option>
                            <option value="ANNUAL">Anual</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control as any}
                  name="benefitsString"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefícios (um por linha)</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Camisa oficial\nAcesso aos jogos..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="isCorporate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Plano Corporativo</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ativo</FormLabel>
                      </div>
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar Plano</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desativar o plano <strong>{planToDelete?.name}</strong>?
              Novos sócios não poderão mais assinar este plano.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={executeDelete}>
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
