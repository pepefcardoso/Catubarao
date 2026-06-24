"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RegisterMemberSchema, type RegisterMemberInput } from "@repo/schemas/member";

import { StepIndicator } from "@repo/ui/components/StepIndicator";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { copy } from "@/lib/copy";

const SignupFormSchema = RegisterMemberSchema.extend({
  passwordConfirmation: z.string(),
}).superRefine((data: any, ctx: any) => {
  if (data.password !== data.passwordConfirmation) {
    ctx.addIssue({
      code: "custom",
      message: "Senhas não conferem",
      path: ["passwordConfirmation"],
    });
  }
});

type SignupFormValues = RegisterMemberInput & { passwordConfirmation: string };

const applyCpfMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const stripCpfMask = (value: string) => value.replace(/\D/g, "");

const applyPhoneMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(SignupFormSchema as any) as any,
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      birthDate: undefined,
      referralCode: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      marketingConsent: false,
      whatsappOptIn: false,
      showOnMonument: false,
    },
    mode: "onTouched",
  });

  const { register, handleSubmit, formState: { errors }, control, trigger } = form;

  const nextStep = async () => {
    const valid = await trigger(["name", "cpf", "phone", "birthDate", "referralCode"] as any);
    if (valid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsSubmitting(true);
      
      const payload = {
        email: data.email,
        password: data.password,
        name: data.name,
        cpf: stripCpfMask(data.cpf),
        phone: data.phone,
        birthDate: data.birthDate,
        referralCode: data.referralCode || undefined,
        marketingConsent: data.marketingConsent,
        whatsappOptIn: data.whatsappOptIn,
        showOnMonument: data.showOnMonument,
      } as any;

      const { error } = await signUp.email(payload);

      if (error) {
        if (error.status === 409 && error.message?.toLowerCase().includes("cpf")) {
          form.setError("cpf", { type: "server", message: "Este CPF já está cadastrado." } as any);
          setStep(1);
          return;
        }
        throw new Error(error.message || "Failed to sign up");
      }

      toast.success("Cadastro realizado com sucesso!");
      router.push("/socio"); // Route to plans

    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao realizar o cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-xl bg-card/50 backdrop-blur border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Seja Sócio-Torcedor</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? copy.signup.subtitle : "Crie seu acesso"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <StepIndicator current={step} total={2} labels={["Seus Dados", "Escolha seu Plano"]} />
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Leva menos de 2 minutos</p>
              <div className="inline-block bg-muted/50 rounded-full px-4 py-1.5 text-xs text-muted-foreground font-medium border border-border/50">
                🔒 Seus dados estão protegidos pela LGPD
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    placeholder="João da Silva" 
                    {...register("name")} 
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && <p id="name-error" className="text-sm text-destructive" role="alert">{errors.name.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Controller
                    control={control}
                    name="cpf"
                    render={({ field }) => (
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) => {
                          const masked = applyCpfMask(e.target.value);
                          field.onChange(stripCpfMask(masked));
                          e.target.value = masked;
                        }}
                        onBlur={(e) => {
                          const masked = applyCpfMask(e.target.value);
                          e.target.value = masked;
                          field.onBlur();
                        }}
                        value={applyCpfMask(field.value || "")}
                        aria-invalid={!!errors.cpf}
                        aria-describedby={errors.cpf ? "cpf-error" : undefined}
                      />
                    )}
                  />
                  {errors.cpf && <p id="cpf-error" className="text-sm text-destructive" role="alert">{errors.cpf.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (Celular)</Label>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <Input
                        id="phone"
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={(e) => {
                          const masked = applyPhoneMask(e.target.value);
                          field.onChange(masked);
                          e.target.value = masked;
                        }}
                        value={applyPhoneMask(field.value || "")}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                      />
                    )}
                  />
                  {errors.phone && <p id="phone-error" className="text-sm text-destructive" role="alert">{errors.phone.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input 
                    id="birthDate" 
                    type="date" 
                    {...register("birthDate")} 
                    aria-invalid={!!errors.birthDate}
                    aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
                  />
                  {errors.birthDate && <p id="birthDate-error" className="text-sm text-destructive" role="alert">{errors.birthDate.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Código de Indicação (Opcional)</Label>
                  <Input id="referralCode" placeholder="Opcional" {...register("referralCode")} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="joao@exemplo.com" 
                    {...register("email")} 
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && <p id="email-error" className="text-sm text-destructive" role="alert">{errors.email.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Mínimo 8 caracteres" 
                    {...register("password")} 
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  {errors.password && <p id="password-error" className="text-sm text-destructive" role="alert">{errors.password.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordConfirmation">Confirme a Senha</Label>
                  <Input 
                    id="passwordConfirmation" 
                    type="password" 
                    placeholder="Repita a senha" 
                    {...register("passwordConfirmation")} 
                    aria-invalid={!!errors.passwordConfirmation}
                    aria-describedby={errors.passwordConfirmation ? "passwordConfirmation-error" : undefined}
                  />
                  {errors.passwordConfirmation && <p id="passwordConfirmation-error" className="text-sm text-destructive" role="alert">{errors.passwordConfirmation.message as string}</p>}
                </div>

                <div className="space-y-4 pt-4">
                  <Controller
                    control={control}
                    name="marketingConsent"
                    render={({ field }) => (
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="marketingConsent"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="marketingConsent" className="font-normal text-sm text-muted-foreground">
                            Aceito receber e-mails promocionais e novidades do Tubarão.
                          </Label>
                        </div>
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="whatsappOptIn"
                    render={({ field }) => (
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="whatsappOptIn"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="whatsappOptIn" className="font-normal text-sm text-muted-foreground">
                            Aceito receber comunicações via WhatsApp.
                          </Label>
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            <CardFooter className="px-0 pt-4 flex gap-4">
              {step === 2 && (
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              {step === 1 ? (
                <Button type="button" className="flex-1" onClick={nextStep}>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    "Concluir Cadastro"
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
