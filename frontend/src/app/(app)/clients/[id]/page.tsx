"use client";
import { api } from "@/lib/api";
import type { Customer } from "@/types/api";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "@/components/forms/customer-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer>();
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    api<Customer>(`/customers/${id}`).then(setCustomer);
  }, [id]);
  if (!customer)
    return (
      <div className="grid min-h-64 place-items-center text-muted-foreground">
        Cargando…
      </div>
    );
  async function deactivate() {
    if (
      confirm(
        "¿Desactivar este cliente? Podrás seguir consultando su historial.",
      )
    )
      setCustomer(
        await api<Customer>(`/customers/${id}`, { method: "DELETE" }),
      );
  }
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={customer.name}
        description="Detalle del cliente"
        backHref="/clients"
      >
        <Button variant="outline" onClick={() => setEditing(!editing)}>
          <Pencil />
          {editing ? "Cancelar" : "Editar"}
        </Button>
        <Button
          variant="destructive"
          disabled={!customer.isActive}
          onClick={deactivate}
        >
          <Trash2 />
          Desactivar
        </Button>
      </PageHeader>
      {editing ? (
        <CustomerForm customer={customer} />
      ) : (
        <Card className="py-0">
          <CardContent className="p-6 md:p-9">
            <div className="mb-7 flex items-center gap-3">
              <div className="app-icon">
                <UserRound className="size-5" />
              </div>
              <h2 className="text-xl font-bold">Información del cliente</h2>
            </div>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Info label="Empresa" value={customer.businessName} />
              <Info label="Email" value={customer.email} />
              <Info label="Teléfono" value={customer.phone} />
              <Info label="CUIT / ID fiscal" value={customer.taxId} />
              <Info label="Dirección" value={customer.address} />
              <Info
                label="Estado"
                value={customer.isActive ? "Activo" : "Inactivo"}
              />
              <div className="sm:col-span-2">
                <Info label="Notas" value={customer.notes} />
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value || "—"}</dd>
    </div>
  );
}
