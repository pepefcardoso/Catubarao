"use client";

import { useState, useMemo } from "react";
import { TransparencyPostResponse } from "@repo/schemas/transparency";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { FileText, Download } from "lucide-react";

const CATEGORIES = [
  "BALANCO_MENSAL",
  "STATUS_DIVIDAS",
  "ATA_ASSEMBLEIA",
  "COMPOSICAO_SOCIETARIA",
  "DOCUMENTO_SAF",
  "OUTRO",
];

const CATEGORY_LABELS: Record<string, string> = {
  BALANCO_MENSAL: "Balanço Mensal",
  STATUS_DIVIDAS: "Status de Dívidas",
  ATA_ASSEMBLEIA: "Ata de Assembleia",
  COMPOSICAO_SOCIETARIA: "Composição Societária",
  DOCUMENTO_SAF: "Documento SAF",
  OUTRO: "Outro",
};

export default function DocumentList({ initialDocuments }: { initialDocuments: TransparencyPostResponse[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const filteredDocs = useMemo(() => {
    return initialDocuments.filter((doc) => {
      const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category ? doc.category === category : true;
      
      const docYear = doc.referenceYear?.toString() || new Date(doc.publishedAt).getFullYear().toString();
      const matchYear = year ? docYear === year : true;
      
      return matchSearch && matchCategory && matchYear;
    });
  }, [initialDocuments, search, category, year]);

  const years = useMemo(() => {
    const y = new Set<number>();
    initialDocuments.forEach(doc => {
      if (doc.referenceYear) y.add(doc.referenceYear);
      else y.add(new Date(doc.publishedAt).getFullYear());
    });
    return Array.from(y).sort((a, b) => b - a);
  }, [initialDocuments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Buscar documento por título..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <select 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
          className="flex h-10 w-full sm:w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Todos os anos</option>
          {years.map(y => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            Nenhum documento encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <Card key={doc.id} className="transition-colors hover:bg-muted/50">
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base line-clamp-1">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {CATEGORY_LABELS[doc.category]} • {new Date(doc.publishedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                {doc.attachmentUrl && (
                  <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={doc.attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </a>
                    </Button>
                    <p className="text-[10px] text-muted-foreground max-w-[200px] text-center sm:text-left">
                      Documentos em PDF podem não ser acessíveis a leitores de tela. Contate-nos para solicitar formato alternativo.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
