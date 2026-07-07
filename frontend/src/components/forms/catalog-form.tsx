"use client";

import { api, ApiError } from "@/lib/api";
import type { CatalogItem } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function CatalogForm({ item }: { item?: CatalogItem }) {
  const [type, setType] = useState<CatalogItem["type"]>(
    item?.type ?? "PRODUCT",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(form: FormData) {
    setBusy(true);
    setError("");
    try {
      await api(item ? `/catalog-items/${item.id}` : "/catalog-items", {
        method: item ? "PATCH" : "POST",
        body: JSON.stringify({
          ...Object.fromEntries(form),
          stock: type === "PRODUCT" ? Number(form.get("stock")) : 0,
        }),
      });
      window.location.href = "/catalog";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error inesperado");
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
          <Package className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Datos del producto o servicio</h2>
          <p className="text-sm text-muted-foreground">
            Información que se reutilizará en los presupuestos
          </p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as CatalogItem["type"])
            }
            className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20"
          >
            <option value="PRODUCT">Producto</option>
            <option value="SERVICE">Servicio</option>
          </select>
        </div>
        <Field
          n="name"
          l="Nombre"
          placeholder="Ej: Instalación eléctrica"
          v={item?.name}
          required
        />
        <Field
          n="unitPrice"
          l="Precio unitario"
          v={item?.unitPrice}
          type="number"
          step="0.01"
          min="0"
          required
        />
        {type === "PRODUCT" ? (
          <Field
            n="stock"
            l="Stock"
            v={String(item?.stock ?? 0)}
            type="number"
            step="1"
            min="0"
            required
          />
        ) : (
          <div className="rounded-xl border border-dashed bg-background px-4 py-3 text-sm text-muted-foreground">
            El stock no aplica a los servicios.
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive md:col-span-2">
            {error}
          </p>
        )}
        <div className="mt-2 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end md:col-span-2">
          <Button asChild variant="outline" className="h-12 px-6 text-base">
            <Link href="/catalog">Cancelar</Link>
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
                Guardar concepto
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
function Field({
  n,
  l,
  v,
  type = "text",
  placeholder,
  ...props
}: {
  n: string;
  l: string;
  v?: string;
  type?: string;
  placeholder?: string;
  [key: string]: unknown;
}) {
  return (
    <div>
      <Label htmlFor={n}>{l}</Label>
      <Input
        id={n}
        name={n}
        defaultValue={v}
        type={type}
        placeholder={placeholder}
        className="h-12 px-4"
        {...props}
      />
    </div>
  );
}
