"use client";
import { api, ApiError } from "@/lib/api";
import type { Customer } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
export function CustomerForm({ customer }: { customer?: Customer }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(form: FormData) {
    setBusy(true);
    setError("");
    try {
      const value = Object.fromEntries(form);
      await api(customer ? `/customers/${customer.id}` : "/customers", {
        method: customer ? "PATCH" : "POST",
        body: JSON.stringify(value),
      });
      window.location.href = "/clients";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error inesperado");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form action={submit} className="grid max-w-2xl gap-4 md:grid-cols-2">
      <Field name="name" label="Nombre" required value={customer?.name} />
      <Field
        name="businessName"
        label="Empresa"
        value={customer?.businessName}
      />
      <Field name="email" label="Email" type="email" value={customer?.email} />
      <Field name="phone" label="Teléfono" value={customer?.phone} />
      <Field
        name="taxId"
        label="Identificador fiscal"
        value={customer?.taxId}
      />
      <Field name="address" label="Dirección" value={customer?.address} />
      <div className="md:col-span-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" defaultValue={customer?.notes} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive md:col-span-2">
          {error}
        </p>
      )}
      <Button disabled={busy} className="md:col-span-2">
        {busy ? "Guardando…" : "Guardar cliente"}
      </Button>
    </form>
  );
}
function Field({
  name,
  label,
  type = "text",
  value,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  value?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        required={required}
      />
    </div>
  );
}
