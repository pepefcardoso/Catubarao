"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@repo/ui/components/badge";

interface CategoryFilterProps {
  categories: string[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        variant={!currentCategory ? "default" : "outline"}
        className="cursor-pointer text-sm py-1.5 px-3 transition-colors hover:bg-primary hover:text-primary-foreground"
        onClick={() => router.push(pathname)}
      >
        Todos
      </Badge>
      
      {categories.map((category) => (
        <Badge
          key={category}
          variant={currentCategory === category ? "default" : "outline"}
          className="cursor-pointer text-sm py-1.5 px-3 transition-colors hover:bg-primary hover:text-primary-foreground"
          onClick={() => {
            router.push(`${pathname}?${createQueryString("category", category)}`);
          }}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}
