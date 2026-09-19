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
import type { Customer, Page } from "@/types/api";
import { ArrowRight, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function CustomerList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(
    search,
    SEARCH_DEBOUNCE_MS,
    () => setPage(1),
  );

  const path = useMemo(
    () =>
      `/customers?page=${page}&pageSize=10&search=${encodeURIComponent(debouncedSearch)}`,
    [debouncedSearch, page],
  );
  const query = useApiQuery<Page<Customer>>(path);
  const data = query.data;

  return (
    <div className="space-y-3">
      <Card className="py-0">
        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9"
              aria-label="Buscar clientes"
              placeholder="Buscar por nombre, empresa, email o CUIT"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />
          </div>
          <Button
            asChild
            variant="action"
            className="h-9 w-full px-3 sm:w-auto"
          >
            <Link href="/clients/new">
              <Plus />
              Nuevo cliente
            </Link>
          </Button>
        </CardContent>
      </Card>

      {query.isLoading && !data ? (
        <LoadingState label="Cargando clientes…" />
      ) : query.isError && !data ? (
        <QueryError
          error={query.error}
          message="No se pudieron cargar los clientes."
          onRetry={query.retry}
          retrying={query.isLoading || query.isRefreshing}
        />
      ) : data?.items.length === 0 ? (
        <Empty
          icon={Users}
          text="No hay clientes que coincidan"
          href="/clients/new"
          action="Crear el primero"
        />
      ) : data ? (
        <Card className="overflow-x-auto py-0">
          <table className="w-full min-w-[540px] text-left text-sm md:min-w-[680px]">
            <thead className="border-b bg-background text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 sm:px-4">Cliente</th>
                <th className="px-3 py-2.5 sm:px-4">Contacto</th>
                <th className="hidden px-3 py-2.5 md:table-cell md:px-4">
                  Empresa
                </th>
                <th className="px-3 py-2.5 sm:px-4">Estado</th>
                <th className="px-3 py-2.5 text-right sm:px-4">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((customer) => (
                <tr key={customer.id} className="hover:bg-background">
                  <td className="px-3 py-2.5 font-semibold sm:px-4">
                    {customer.name}
                  </td>
                  <td className="max-w-48 truncate px-3 py-2.5 text-muted-foreground sm:px-4">
                    {customer.email || customer.phone || "—"}
                  </td>
                  <td className="hidden px-3 py-2.5 md:table-cell md:px-4">
                    {customer.businessName || "—"}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4">
                    <span
                      className={`inline-flex min-w-16 justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${customer.isActive ? "status-active" : "status-inactive"}`}
                    >
                      {customer.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right sm:px-4">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link
                        href={`/clients/${customer.id}`}
                        aria-label={`Ver ${customer.name}`}
                      >
                        <ArrowRight />
                      </Link>
                    </Button>
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
          message="No se pudo actualizar la lista de clientes."
          onRetry={query.retry}
          retrying={query.isLoading || query.isRefreshing}
        />
      )}

      {data && query.isRefreshing && (
        <div className="flex justify-end">
          <RefreshingState label="Actualizando clientes…" />
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

function Empty({
  icon: Icon,
  text,
  href,
  action,
}: {
  icon: typeof Users;
  text: string;
  href: string;
  action: string;
}) {
  return (
    <Card className="py-0">
      <CardContent className="py-12 text-center">
        <Icon className="mx-auto mb-3 size-9 text-primary/45" />
        <p className="font-medium">{text}</p>
        <Button asChild variant="link" className="mt-1">
          <Link href={href}>{action}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
