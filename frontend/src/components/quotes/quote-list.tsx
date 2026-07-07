"use client";

import { api } from "@/lib/api";
import type { Page, Quote } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const statusLabel = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};
const statusStyle = {
  DRAFT: "status-draft",
  SENT: "status-sent",
  APPROVED: "status-approved",
  REJECTED: "status-rejected",
};

export function QuoteList() {
  const [data, setData] = useState<Page<Quote>>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    api<Page<Quote>>(
      `/quotes?page=${page}&pageSize=10&search=${encodeURIComponent(search)}${status ? `&status=${status}` : ""}`,
    ).then(setData);
  }, [page, search, status]);

  return (
    <div className="space-y-3">
      <Card className="py-0">
        <CardContent className="flex flex-col gap-2 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_180px] lg:max-w-[680px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-9"
                placeholder="Buscar cliente o notas"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="h-9 rounded-lg border border-border bg-white px-2.5 text-sm shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos los estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="SENT">Enviado</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
          </div>
          <Button
            asChild
            variant="action"
            className="h-9 w-full px-3 sm:w-auto sm:self-end lg:self-auto"
          >
            <Link href="/quotes/new">
              <Plus />
              Nuevo presupuesto
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
            <FileText className="mx-auto mb-3 size-9 text-primary/45" />
            <p className="font-medium">No hay presupuestos</p>
            <Button asChild variant="link">
              <Link href="/quotes/new">Crear el primero</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-x-auto py-0">
          <table className="w-full min-w-[600px] text-left text-sm md:min-w-[720px]">
            <thead className="border-b bg-background text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 sm:px-4">#</th>
                <th className="px-3 py-2.5 sm:px-4">Cliente</th>
                <th className="hidden px-3 py-2.5 md:table-cell md:px-4">
                  Fecha
                </th>
                <th className="px-3 py-2.5 sm:px-4">Total</th>
                <th className="px-3 py-2.5 sm:px-4">Estado</th>
                <th className="px-3 py-2.5 text-right sm:px-4">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((quote) => (
                <tr key={quote.id} className="hover:bg-background">
                  <td className="px-3 py-2.5 font-medium text-muted-foreground sm:px-4">
                    #{quote.number}
                  </td>
                  <td className="px-3 py-2.5 font-semibold sm:px-4">
                    {quote.customer.name}
                  </td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell md:px-4">
                    {new Date(quote.issueDate).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-3 py-2.5 font-bold sm:px-4">
                    ${quote.total}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4">
                    <span
                      className={`inline-flex min-w-20 justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle[quote.status]}`}
                    >
                      {statusLabel[quote.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right sm:px-4">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link
                        href={`/quotes/${quote.id}`}
                        aria-label={`Ver presupuesto ${quote.number}`}
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
      )}

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
    </div>
  );
}
