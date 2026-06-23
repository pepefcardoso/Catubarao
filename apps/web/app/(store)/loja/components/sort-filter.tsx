"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function SortFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "relevance";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "relevance") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Ordenar por:
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={(e) => {
          router.push(`${pathname}?${createQueryString("sort", e.target.value)}`);
        }}
        className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="relevance" className="bg-background text-foreground">Relevância</option>
        <option value="price-asc" className="bg-background text-foreground">Menor preço</option>
        <option value="price-desc" className="bg-background text-foreground">Maior preço</option>
      </select>
    </div>
  );
}
