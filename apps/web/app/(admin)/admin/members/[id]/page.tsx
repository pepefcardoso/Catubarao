"use client";

import { useEffect, useState, useCallback, use } from "react";
import { env } from "@/lib/env";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useRouter } from "next/navigation";

function maskCpf(cpf: string | null) {
  if (!cpf) return "N/A";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `***.***.***-${digits.slice(-2)}`;
}

function getStatusBadgeVariant(status: string | null) {
  switch (status) {
    case "ACTIVE": return "default";
    case "PENDING": return "secondary";
    case "SUSPENDED": return "destructive";
    case "CANCELLED": return "outline";
    default: return "outline";
  }
}

export default function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [rotatingCard, setRotatingCard] = useState(false);

  const fetchMember = useCallback(async () => {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/members/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch member");
      const data = await res.json();
      setMember(data);
      setAdminNotes(data.adminNotes || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/members/${id}/admin-notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to save notes");
      // Could show a toast here
    } catch (error) {
      console.error(error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRotateCard = async () => {
    setRotatingCard(true);
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/members/${id}/card/rotate`, {
        method: "POST",
        credentials: "include"
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to rotate card");
        throw new Error("Failed to rotate card");
      }
      await fetchMember(); // Refresh data to show new card
    } catch (error) {
      console.error(error);
    } finally {
      setRotatingCard(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Member not found.
        <br />
        <Button variant="link" onClick={() => router.push("/admin/members")}>Back to Members</Button>
      </div>
    );
  }

  const isEligibleToVote = member.adimplenciaStreak >= 12;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/members")}>
            &larr; Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {member.name}
              <Badge variant={getStatusBadgeVariant(member.subscriptionStatus) as any}>
                {member.subscriptionStatus || "NO SUBSCRIPTION"}
              </Badge>
            </h1>
            <p className="text-muted-foreground">{member.email}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={isEligibleToVote ? "default" : "secondary"}>
            {isEligibleToVote ? "Eligible to Vote" : "Not Eligible to Vote"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details */}
        <div className="rounded-xl border bg-card text-card-foreground p-6 space-y-4">
          <h2 className="text-xl font-semibold">Profile Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">CPF</p>
              <p className="font-medium">{maskCpf(member.cpf)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{member.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Join Date</p>
              <p className="font-medium">{new Date(member.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Adimplência Streak</p>
              <p className="font-medium">{member.adimplenciaStreak} months</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Admin Notes</label>
            <textarea 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Internal notes about this member..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
                {savingNotes ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="rounded-xl border bg-card text-card-foreground p-6 space-y-4">
          <h2 className="text-xl font-semibold">Current Subscription</h2>
          {member.subscriptions && member.subscriptions.length > 0 ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Plan Name</p>
                  <p className="font-medium">{member.activePlanName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(member.subscriptionStatus) as any}>{member.subscriptionStatus}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Period Start</p>
                  <p className="font-medium">{new Date(member.subscriptions[0].currentPeriodStart).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Period End</p>
                  <p className="font-medium">{new Date(member.subscriptions[0].currentPeriodEnd).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">MP Subscription ID</p>
                  <p className="font-medium break-all">{member.subscriptions[0].gatewaySubscriptionId || "N/A"}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Note: Subscription status updates are handled automatically via Mercado Pago webhooks. Direct manual updates are disabled per system policy.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active subscription found.</p>
          )}
        </div>
      </div>

      {/* Membership Card */}
      <div className="rounded-xl border bg-card text-card-foreground p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Membership Card</h2>
          <Button variant="outline" size="sm" onClick={handleRotateCard} disabled={rotatingCard}>
            {rotatingCard ? "Rotating..." : "Rotar Carteirinha"}
          </Button>
        </div>
        
        {member.membershipCards && member.membershipCards.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>QR Token</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {member.membershipCards.map((card: any) => (
                <TableRow key={card.id}>
                  <TableCell>
                    <Badge variant={card.isActive ? "default" : "secondary"}>
                      {card.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(card.validUntil).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{new Date(card.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-xs">{card.qrToken}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No membership cards found.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payments */}
        <div className="rounded-xl border bg-card text-card-foreground p-6 space-y-4">
          <h2 className="text-xl font-semibold">Payment History</h2>
          {member.payments && member.payments.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(payment.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.status === "PAID" ? "default" : payment.status === "FAILED" ? "destructive" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No payments found.</p>
          )}
        </div>

        {/* Gamification Events */}
        <div className="rounded-xl border bg-card text-card-foreground p-6 space-y-4">
          <h2 className="text-xl font-semibold">Gamification Points</h2>
          {member.gamificationEvents && member.gamificationEvents.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.gamificationEvents.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell>{new Date(event.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{event.type}</TableCell>
                      <TableCell className="text-right font-medium text-primary">+{event.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No points history found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
