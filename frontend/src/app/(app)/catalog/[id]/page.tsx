"use client";
import { api } from "@/lib/api";
import type { CatalogItem } from "@/types/api";
import { CatalogForm } from "@/components/forms/catalog-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<CatalogItem>();
  useEffect(() => {
    api<CatalogItem>(`/catalog-items/${id}`).then(setItem);
  }, [id]);
  if (!item)
    return (
      <div className="grid min-h-64 place-items-center text-muted-foreground">
        Cargando…
      </div>
    );
  async function deactivate() {
    if (
      confirm(
        "¿Desactivar este concepto? Los presupuestos existentes no cambiarán.",
      )
    )
      setItem(
        await api<CatalogItem>(`/catalog-items/${id}`, { method: "DELETE" }),
      );
  }
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Editar concepto"
        description={item.name}
        backHref="/catalog"
      >
        <Button
          variant="destructive"
          disabled={!item.isActive}
          onClick={deactivate}
        >
          <Trash2 />
          Desactivar
        </Button>
      </PageHeader>
      <CatalogForm item={item} />
    </div>
  );
}
