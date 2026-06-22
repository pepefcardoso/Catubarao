"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";

const CATEGORIES = [
  { id: "BALANCO_MENSAL", label: "Balanço Mensal" },
  { id: "STATUS_DIVIDAS", label: "Status de Dívidas" },
  { id: "ATA_ASSEMBLEIA", label: "Ata de Assembleia" },
  { id: "COMPOSICAO_SOCIETARIA", label: "Composição Societária" },
  { id: "DOCUMENTO_SAF", label: "Documento SAF" },
  { id: "OUTRO", label: "Outros" },
];

export function FilterBar({ currentCategories, currentYear }: { currentCategories: string[], currentYear?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // Reset pagination when filter changes
    
    let categories = params.getAll('category');
    if (checked) {
      if (!categories.includes(categoryId)) categories.push(categoryId);
    } else {
      categories = categories.filter(c => c !== categoryId);
    }
    
    params.delete('category');
    categories.forEach(c => params.append('category', c));
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (e.target.value) {
      params.set('referenceYear', e.target.value);
    } else {
      params.delete('referenceYear');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="bg-card border rounded-lg p-6 space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Categorias</h3>
        <div className="space-y-3">
          {CATEGORIES.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`cat-${category.id}`} 
                checked={currentCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked === true)}
              />
              <Label htmlFor={`cat-${category.id}`}>{category.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-4">Ano de Referência</h3>
        <select 
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={currentYear || ""}
          onChange={handleYearChange}
        >
          <option value="">Todos os anos</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
