"use client";
import { api } from "@/lib/api";
import type { CatalogItem, Page } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
export function CatalogList() {
  const [data, setData] = useState<Page<CatalogItem>>();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [active, setActive] = useState("");
  useEffect(() => {
    api<Page<CatalogItem>>(
      `/catalog-items?search=${encodeURIComponent(search)}${type ? `&type=${type}` : ""}${active ? `&isActive=${active}` : ""}`,
    ).then(setData);
  }, [search, type, active]);
  return (
    <>
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Buscar conceptos"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-md border bg-background px-3"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="PRODUCT">Productos</option>
          <option value="SERVICE">Servicios</option>
        </select>
        <select
          className="rounded-md border bg-background px-3"
          value={active}
          onChange={(e) => setActive(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <Button asChild>
          <Link href="/catalog/new">Nuevo concepto</Link>
        </Button>
      </div>
      {!data ? (
        <p>Cargando…</p>
      ) : data.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            No hay conceptos.{" "}
            <Link className="underline" href="/catalog/new">
              Crear el primero
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.items.map((i) => (
            <Card key={i.id}>
              <CardContent className="py-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{i.name}</p>
                    <div className="mt-1 flex gap-2">
                      <Badge>
                        {i.type === "PRODUCT" ? "Producto" : "Servicio"}
                      </Badge>
                      {!i.isActive && (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold">${i.unitPrice}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {i.unit} · Impuesto {i.taxRate}%
                </p>
                <Button asChild className="mt-3" size="sm" variant="outline">
                  <Link href={`/catalog/${i.id}`}>Editar</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
