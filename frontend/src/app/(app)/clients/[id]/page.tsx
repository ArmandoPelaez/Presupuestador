"use client";
import { api } from "@/lib/api";
import type { Customer } from "@/types/api";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "@/components/forms/customer-form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [c, setCustomer] = useState<Customer>();
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    api<Customer>(`/customers/${id}`).then(setCustomer);
  }, [id]);
  if (!c) return <p>Cargando…</p>;
  async function deactivate() {
    if (
      confirm(
        "¿Desactivar este cliente? Podrás seguir consultando su historial.",
      )
    ) {
      setCustomer(
        await api<Customer>(`/customers/${id}`, { method: "DELETE" }),
      );
    }
  }
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{c.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            Editar
          </Button>
          <Button
            variant="destructive"
            disabled={!c.isActive}
            onClick={deactivate}
          >
            Desactivar
          </Button>
        </div>
      </div>
      {editing ? (
        <CustomerForm customer={c} />
      ) : (
        <dl className="grid max-w-2xl gap-4 rounded-lg border bg-background p-5 sm:grid-cols-2">
          <Info l="Empresa" v={c.businessName} />
          <Info l="Email" v={c.email} />
          <Info l="Teléfono" v={c.phone} />
          <Info l="CUIT/ID fiscal" v={c.taxId} />
          <Info l="Dirección" v={c.address} />
          <Info l="Estado" v={c.isActive ? "Activo" : "Inactivo"} />
          <Info l="Notas" v={c.notes} />
        </dl>
      )}
    </>
  );
}
function Info({ l, v }: { l: string; v?: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{l}</dt>
      <dd>{v || "—"}</dd>
    </div>
  );
}
