"use client";

import { CatalogForm } from "@/components/forms/catalog-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { LoadingState, QueryError } from "@/components/ui/query-state";
import { api } from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";
import type { CatalogItem } from "@/types/api";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const itemQuery = useApiQuery<CatalogItem>(`/catalog-items/${id}`);
  const item = itemQuery.data;

  if (!item) {
    return itemQuery.isLoading ? (
      <LoadingState label="Cargando concepto…" />
    ) : (
      <div className="mx-auto max-w-4xl">
        <QueryError
          error={itemQuery.error}
          message="No se pudo cargar el concepto."
          onRetry={itemQuery.retry}
          retrying={itemQuery.isLoading || itemQuery.isRefreshing}
        />
      </div>
    );
  }

  async function deactivate() {
    if (
      confirm(
        "¿Desactivar este concepto? Los presupuestos existentes no cambiarán.",
      )
    ) {
      await api<CatalogItem>(`/catalog-items/${id}`, { method: "DELETE" });
      itemQuery.retry();
    }
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
