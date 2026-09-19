"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LoadingState,
  QueryError,
  RefreshingState,
} from "@/components/ui/query-state";
import { Input } from "@/components/ui/input";
import {
  SEARCH_DEBOUNCE_MS,
  useDebouncedValue,
} from "@/lib/use-debounced-value";
import { useApiQuery } from "@/lib/use-api-query";
import type { CatalogItem, Page } from "@/types/api";
import { ArrowRight, Package, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function CatalogList() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(
    search,
    SEARCH_DEBOUNCE_MS,
    () => setPage(1),
  );

  const path = useMemo(
    () =>
      `/catalog-items?page=${page}&pageSize=10&search=${encodeURIComponent(debouncedSearch)}${type ? `&type=${type}` : ""}`,
    [debouncedSearch, page, type],
  );
  const query = useApiQuery<Page<CatalogItem>>(path);
  const data = query.data;

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
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              />
            </div>
            <select
              className="form-select h-9 rounded-lg px-2.5"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
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

      {query.isLoading && !data ? (
        <LoadingState label="Cargando catálogo…" />
      ) : query.isError && !data ? (
        <QueryError
          error={query.error}
          message="No se pudo cargar el catálogo."
          onRetry={query.retry}
          retrying={query.isLoading || query.isRefreshing}
        />
      ) : data?.items.length === 0 ? (
        <Card className="py-0">
          <CardContent className="py-12 text-center">
            <Package className="mx-auto mb-3 size-9 text-primary/45" />
            <p className="font-medium">No hay productos ni servicios</p>
            <Button asChild variant="link">
              <Link href="/catalog/new">Crear el primero</Link>
            </Button>
          </CardContent>
        </Card>
      ) : data ? (
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
      ) : null}

      {data && query.isError && (
        <QueryError
          error={query.error}
          message="No se pudo actualizar el catálogo."
          onRetry={query.retry}
          retrying={query.isLoading || query.isRefreshing}
        />
      )}

      {data && query.isRefreshing && (
        <div className="flex justify-end">
          <RefreshingState label="Actualizando catálogo…" />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || query.isLoading || query.isRefreshing}
          onClick={() => setPage((value) => value - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {data?.meta.page ?? page} de {Math.max(data?.meta.totalPages ?? 1, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={
            !data ||
            page >= data.meta.totalPages ||
            query.isLoading ||
            query.isRefreshing
          }
          onClick={() => setPage((value) => value + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
