"use client";

import { useEffect, useState, useCallback } from "react";
import { env } from "@/lib/env";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@repo/ui/components/table";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
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

export default function AdminMembersPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchMembers = useCallback(async (currentPage: number, currentSearch: string, currentStatus: string, limit = 20) => {
    try {
      const url = new URL(`${env.NEXT_PUBLIC_API_URL}/members`);
      url.searchParams.append("page", currentPage.toString());
      url.searchParams.append("limit", limit.toString());
      if (currentSearch) url.searchParams.append("search", currentSearch);
      if (currentStatus !== "ALL") url.searchParams.append("status", currentStatus);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch members");
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchMembers(page, debouncedSearch, statusFilter).then(res => {
      if (!active) return;
      if (res) {
        setData(res.data);
        setTotalPages(res.totalPages || 1);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [page, debouncedSearch, statusFilter, fetchMembers]);

  const handleExportCSV = async () => {
    // Fetch all for current filters (high limit)
    const res = await fetchMembers(1, debouncedSearch, statusFilter, 10000);
    if (!res || !res.data) return;

      const rows = [
      ["Name", "Email", "Plan", "Status", "Adimplencia (Months)", "Join Date"],
      ...res.data.map((m: any) => [
        m.name,
        m.email,
        m.activePlanName || "N/A",
        m.subscriptionStatus || "N/A",
        m.adimplenciaStreakMonths,
        new Date(m.createdAt).toLocaleDateString("pt-BR")
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `members_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Membros</h1>
        <Button onClick={handleExportCSV} variant="outline">
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-lg">
        <div className="flex-1">
          <Input 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Adimplência</TableHead>
              <TableHead>Join Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <p className="text-lg font-medium">Nenhum sócio encontrado</p>
                    <p className="text-sm">Tente ajustar seus filtros de busca ou status.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((member) => (
                <TableRow 
                  key={member.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/admin/members/${member.id}`)}
                >
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{maskCpf(member.cpf)}</TableCell>
                  <TableCell className="text-muted-foreground">{member.activePlanName || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(member.subscriptionStatus) as any}>
                      {member.subscriptionStatus || "NONE"}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.adimplenciaStreakMonths} mo.</TableCell>
                  <TableCell>{new Date(member.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && data.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
