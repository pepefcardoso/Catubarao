"use client";

import { useState } from "react";
import { MonumentMember } from "@repo/schemas/member";
import { useMemberStatus } from "@/lib/use-member-status";
import { MonumentBrick } from "@/components/monument/MonumentBrick";
import { MonumentCTA } from "@/components/monument/MonumentCTA";
import { useToast } from "@/components/ui/use-toast";
import { apiFetch } from "@/lib/api";

interface MuroWallClientProps {
  initialMembers: MonumentMember[];
}

export function MuroWallClient({ initialMembers }: MuroWallClientProps) {
  const { isMember, isActive, profile } = useMemberStatus();
  const { toast } = useToast();
  
  const [members, setMembers] = useState<MonumentMember[]>(initialMembers);
  const [isPending, setIsPending] = useState(false);
  const [optimisticMember, setOptimisticMember] = useState<MonumentMember | null>(null);

  const hasOptedIn = profile?.showOnMonument === true;
  const canOptIn = isMember && isActive && !hasOptedIn;

  const handleOptIn = async () => {
    if (!profile?.name) return;

    setIsPending(true);
    
    // Create optimistic member
    const nameParts = profile.name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts[nameParts.length - 1] ?? "";
    const lastInitial = nameParts.length > 1 ? (lastName[0]?.toUpperCase() ?? "") : "";
    
    const newMember: MonumentMember = {
      firstName,
      lastInitial,
      tier: "Sócio", // We don't have the exact tier synchronously, but "Sócio" is a fine fallback
      joinedAt: new Date().toISOString(),
    };

    setOptimisticMember(newMember);

    try {
      await apiFetch("/api/members/me", {
        method: "PATCH",
        body: JSON.stringify({ showOnMonument: true }),
      });
      
      // On success, append permanently (in real app, we might want to trigger a router refresh too)
      setMembers((prev) => [newMember, ...prev]);
      setOptimisticMember(null);
      
      toast({
        title: "Sucesso!",
        description: "Seu nome agora faz parte da nossa história.",
      });
    } catch (error) {
      console.error(error);
      setOptimisticMember(null);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível adicionar seu nome. Tente novamente.",
      });
    } finally {
      setIsPending(false);
    }
  };

  const getDelay = (index: number) => {
    if (index < 100) return `${index * 30}ms`;
    // Batch animate items beyond 100
    return `${Math.floor(index / 20) * 30}ms`;
  };

  // If opted in, figure out if a brick is the current user's brick.
  // We match by name for highlighting purposes.
  const isMyBrick = (brick: MonumentMember) => {
    if (!profile?.name) return false;
    const nameParts = profile.name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts[nameParts.length - 1] ?? "";
    const lastInitial = nameParts.length > 1 ? (lastName[0]?.toUpperCase() ?? "") : "";
    return brick.firstName === firstName && brick.lastInitial === lastInitial;
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-24">
        {members.length === 0 && !optimisticMember ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/50">
            <p className="text-muted-foreground">
              O muro ainda está vazio. Seja o primeiro a eternizar seu nome!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {optimisticMember && (
              <MonumentBrick
                {...optimisticMember}
                isHighlighted={true}
                isOptimistic={true}
                animationDelay="0ms"
              />
            )}
            {members.map((member, i) => (
              <MonumentBrick
                key={`${member.firstName}-${member.lastInitial}-${member.joinedAt}-${i}`}
                {...member}
                isHighlighted={hasOptedIn && isMyBrick(member)}
                animationDelay={getDelay(i)}
              />
            ))}
          </div>
        )}
      </div>

      {(!isMember || canOptIn) && (
        <MonumentCTA
          isMember={isMember}
          onOptIn={handleOptIn}
          isPending={isPending}
        />
      )}
    </>
  );
}
