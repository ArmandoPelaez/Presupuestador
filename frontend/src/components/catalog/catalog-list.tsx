"use client";

import { api } from "@/lib/api";
import type { CatalogItem, Page } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Package, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CatalogList() {
  const [data, setData] = useState<Page<CatalogItem>>();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    api<Page<CatalogItem>>(
      `/catalog-items?page=${page}&pageSize=10&search=${encodeURIComponent(search)}${type ? `&type=${type}` : ""}`,
    ).then(setData);
  }, [page, search, type]);

  return (
    <div className="space-y-3">
      <Card className="py-0">
        <CardContent className="flex flex-col gap-2 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_180px] lg:max-w-[680px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-9"
                placeholder="Buscar productos o servicios"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="form-select h-9 rounded-lg px-2.5"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos los tipos</option>
              <option value="PRODUCT">Productos</option>
              <option value="SERVICE">Servicios</option>
            </select>
          </div>
          <Button
            asChild
            variant="action"
            className="h-9 w-full px-3 sm:w-auto sm:self-end lg:self-auto"
          >
            <Link href="/catalog/new">
              <Plus />
              Nuevo producto/servicio
            </Link>
          </Button>
        </CardContent>
      </Card>
      {!data ? (
        <Card className="py-0">
          <CardContent className="py-10 text-center text-muted-foreground">
            Cargando…
          </CardContent>
        </Card>
      ) : data.items.length === 0 ? (
        <Card className="py-0">
          <CardContent className="py-12 text-center">
            <Package className="mx-auto mb-3 size-9 text-primary/45" />
            <p className="font-medium">No hay productos ni servicios</p>
            <Button asChild variant="link">
              <Link href="/catalog/new">Crear el primero</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-x-auto py-0">
          <table className="w-full min-w-[500px] text-left text-sm sm:min-w-[600px]">
            <thead className="border-b bg-background text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 sm:px-4">Nombre</th>
                <th className="px-3 py-2.5 sm:px-4">Tipo</th>
                <th className="px-3 py-2.5 sm:px-4">Precio unitario</th>
                <th className="hidden px-3 py-2.5 sm:table-cell sm:px-4">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((item) => (
                <tr key={item.id} className="hover:bg-background">
                  <td className="px-3 py-2.5 font-semibold sm:px-4">
                    <Link
                      href={`/catalog/${item.id}`}
                      className="inline-flex items-center gap-2 hover:text-primary"
                    >
                      {item.name}
                      <ArrowRight className="size-4" />
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4">
                    <span className="status-sent inline-flex min-w-16 justify-center rounded-full px-2 py-0.5 text-xs font-semibold">
                      {item.type === "PRODUCT" ? "Producto" : "Servicio"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-bold sm:px-4">
                    ${item.unitPrice}
                  </td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground sm:table-cell sm:px-4">
                    {item.type === "PRODUCT" ? item.stock : "No aplica"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Pagination page={page} data={data} setPage={setPage} />
    </div>
  );
}

function Pagination({
  page,
  data,
  setPage,
}: {
  page: number;
  data?: Page<CatalogItem>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => setPage((value) => value - 1)}
      >
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {data?.meta.page ?? 1} de{" "}
        {Math.max(data?.meta.totalPages ?? 1, 1)}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!data || page >= data.meta.totalPages}
        onClick={() => setPage((value) => value + 1)}
      >
        Siguiente
      </Button>
    </div>
  );
}
