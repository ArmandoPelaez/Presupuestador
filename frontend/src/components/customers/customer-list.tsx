"use client";
import { api } from "@/lib/api";
import type { Customer, Page } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
export function CustomerList() {
  const [data, setData] = useState<Page<Customer>>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    api<Page<Customer>>(
      `/customers?page=${page}&search=${encodeURIComponent(search)}`,
    ).then(setData);
  }, [page, search]);
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          aria-label="Buscar clientes"
          placeholder="Buscar por nombre, empresa, email o CUIT"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Button asChild>
          <Link href="/clients/new">Nuevo cliente</Link>
        </Button>
      </div>
      {!data ? (
        <p>Cargando…</p>
      ) : data.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            No hay clientes que coincidan.{" "}
            <Link className="underline" href="/clients/new">
              Crear el primero
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data.items.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.businessName || c.email || "Sin datos adicionales"} ·{" "}
                    {c.isActive ? "Activo" : "Inactivo"}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/clients/${c.id}`}>Ver</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm">
          Página {data?.meta.page ?? 1} de{" "}
          {Math.max(data?.meta.totalPages ?? 1, 1)}
        </span>
        <Button
          variant="outline"
          disabled={!data || page >= data.meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </Button>
      </div>
    </>
  );
}
