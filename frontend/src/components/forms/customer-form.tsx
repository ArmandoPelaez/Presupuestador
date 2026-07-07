"use client";

import { api, ApiError } from "@/lib/api";
import type { Customer } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, UserRound } from "lucide-react";
import Link from "next/link";
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
    <form
      action={submit}
      className="app-card md:p-9"
    >
      <div className="mb-7 flex items-center gap-3">
        <div className="app-icon">
          <UserRound className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Datos del cliente</h2>
          <p className="text-sm text-muted-foreground">
            Información de contacto y facturación
          </p>
        </div>
      </div>

      <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
        <Field
          name="name"
          label="Nombre"
          placeholder="Ej: Juan García"
          required
          value={customer?.name}
        />
        <Field
          name="businessName"
          label="Empresa"
          placeholder="Ej: Construcciones del Sur"
          value={customer?.businessName}
        />
        <Field
          name="email"
          label="Email"
          placeholder="cliente@empresa.com"
          type="email"
          value={customer?.email}
        />
        <Field
          name="phone"
          label="Teléfono"
          placeholder="+54 9 11 5555-5555"
          value={customer?.phone}
        />
        <Field
          name="taxId"
          label="Identificador fiscal"
          placeholder="CUIT o documento"
          value={customer?.taxId}
        />
        <Field
          name="address"
          label="Dirección"
          placeholder="Calle, número y localidad"
          value={customer?.address}
        />

        <div className="md:col-span-2">
          <Label htmlFor="notes">
            Notas{" "}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Información adicional sobre el cliente"
            defaultValue={customer?.notes}
            className="min-h-28"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive md:col-span-2">
            {error}
          </p>
        )}

        <div className="mt-2 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end md:col-span-2">
          <Button asChild variant="outline" className="h-12 px-6 text-base">
            <Link href="/clients">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            variant="action"
            disabled={busy}
            className="h-12 px-6 text-base"
          >
            {busy ? (
              "Guardando…"
            ) : (
              <>
                <Save />
                Guardar cliente
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  value,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        required={required}
        className="h-12 px-4 text-base"
      />
    </div>
  );
}
