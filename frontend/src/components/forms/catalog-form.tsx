"use client";
import { api, ApiError } from "@/lib/api";
import type { CatalogItem } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
export function CatalogForm({ item }: { item?: CatalogItem }) {
  const [error, setError] = useState("");
  async function submit(form: FormData) {
    setError("");
    try {
      await api(item ? `/catalog-items/${item.id}` : "/catalog-items", {
        method: item ? "PATCH" : "POST",
        body: JSON.stringify(Object.fromEntries(form)),
      });
      window.location.href = "/catalog";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error inesperado");
    }
  }
  return (
    <form action={submit} className="grid max-w-2xl gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor="type">Tipo</Label>
        <select
          id="type"
          name="type"
          defaultValue={item?.type ?? "SERVICE"}
          className="h-9 w-full rounded-md border bg-transparent px-3"
        >
          <option value="PRODUCT">Producto</option>
          <option value="SERVICE">Servicio</option>
        </select>
      </div>
      <Field n="name" l="Nombre" v={item?.name} required />
      <Field n="unit" l="Unidad" v={item?.unit} required />
      <Field
        n="unitPrice"
        l="Precio unitario"
        v={item?.unitPrice}
        type="number"
        step="0.01"
        min="0"
        required
      />
      <Field
        n="taxRate"
        l="Impuesto (%)"
        v={item?.taxRate ?? "0"}
        type="number"
        step="0.01"
        min="0"
        max="100"
        required
      />
      <div className="md:col-span-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={item?.description}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive md:col-span-2">
          {error}
        </p>
      )}
      <Button className="md:col-span-2">Guardar concepto</Button>
    </form>
  );
}
function Field({
  n,
  l,
  v,
  type = "text",
  ...p
}: {
  n: string;
  l: string;
  v?: string;
  type?: string;
  [k: string]: unknown;
}) {
  return (
    <div>
      <Label htmlFor={n}>{l}</Label>
      <Input id={n} name={n} defaultValue={v} type={type} {...p} />
    </div>
  );
}
