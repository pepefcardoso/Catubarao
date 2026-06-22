"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@repo/ui/components/button";

export function Pagination({ page, totalPages }: { page: number, totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex justify-center space-x-2 mt-8">
      <Button 
        variant="outline" 
        disabled={page <= 1}
        onClick={() => handlePageChange(page - 1)}
      >
        Anterior
      </Button>
      <div className="flex items-center text-sm font-medium">
        Página {page} de {totalPages}
      </div>
      <Button 
        variant="outline" 
        disabled={page >= totalPages}
        onClick={() => handlePageChange(page + 1)}
      >
        Próxima
      </Button>
    </div>
  );
}
