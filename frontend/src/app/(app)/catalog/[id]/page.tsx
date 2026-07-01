"use client";
import { api } from "@/lib/api";
import type { CatalogItem } from "@/types/api";
import { CatalogForm } from "@/components/forms/catalog-form";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<CatalogItem>();
  useEffect(() => {
    api<CatalogItem>(`/catalog-items/${id}`).then(setItem);
  }, [id]);
  if (!item) return <p>Cargando…</p>;
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
    <>
      <div className="mb-6 flex justify-between">
        <h1 className="text-3xl font-bold">Editar concepto</h1>
        <Button
          variant="destructive"
          disabled={!item.isActive}
          onClick={deactivate}
        >
          Desactivar
        </Button>
      </div>
      <CatalogForm item={item} />
    </>
  );
}
