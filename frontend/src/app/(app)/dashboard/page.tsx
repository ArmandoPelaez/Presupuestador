"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LoadingState,
  QueryError,
  RefreshingState,
} from "@/components/ui/query-state";
import { useApiQuery } from "@/lib/use-api-query";
import type { Page, Quote } from "@/types/api";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Send,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Summary = {
  counts: Record<string, number>;
  totals: Record<string, string>;
  totalQuotes: number;
  customers: number;
  catalogItems: number;
  recent: Quote[];
};

const labels: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

const badgeStyles: Record<string, string> = {
  DRAFT: "status-draft",
  SENT: "status-sent",
  APPROVED: "status-approved",
  REJECTED: "status-rejected",
};

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState<Quote["status"] | "ALL">(
    "ALL",
  );
  const [quotePage, setQuotePage] = useState(1);
  const summaryQuery = useApiQuery<Summary>("/dashboard/summary");
  const quotePath = useMemo(() => {
    const statusQuery =
      selectedStatus === "ALL" ? "" : `&status=${selectedStatus}`;
    return `/quotes?page=${quotePage}&pageSize=10${statusQuery}`;
  }, [quotePage, selectedStatus]);
  const quoteQuery = useApiQuery<Page<Quote>>(quotePath);
  const d = summaryQuery.data;
  const quotes = quoteQuery.data?.items ?? [];
  const quoteMeta = quoteQuery.data?.meta;

  if (summaryQuery.isLoading && !d) {
    return <LoadingState label="Cargando panel…" />;
  }

  if (summaryQuery.isError && !d) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <QueryError
          error={summaryQuery.error}
          message="No se pudo cargar el panel."
          onRetry={summaryQuery.retry}
          retrying={summaryQuery.isLoading || summaryQuery.isRefreshing}
        />
      </div>
    );
  }

  const metrics: Array<{
    status: Quote["status"] | "ALL";
    label: string;
    value: number;
    icon: typeof FileText;
    color: string;
  }> = [
    {
      status: "ALL",
      label: "Todos",
      value: d?.totalQuotes ?? 0,
      icon: FileText,
      color: "bg-background text-primary border border-border",
    },
    {
      status: "SENT",
      label: "Enviados",
      value: d?.counts.SENT ?? 0,
      icon: Send,
      color: "bg-background text-primary border border-border",
    },
    {
      status: "APPROVED",
      label: "Aprobados",
      value: d?.counts.APPROVED ?? 0,
      icon: CheckCircle2,
      color: "bg-background text-[var(--success)] border border-border",
    },
    {
      status: "REJECTED",
      label: "Rechazados",
      value: d?.counts.REJECTED ?? 0,
      icon: XCircle,
      color: "bg-background text-muted-foreground border border-border",
    },
    {
      status: "DRAFT",
      label: "Borradores",
      value: d?.counts.DRAFT ?? 0,
      icon: Clock3,
      color: "bg-background text-muted-foreground border border-border",
    },
  ];

  function filterQuotes(status: Quote["status"] | "ALL") {
    setSelectedStatus(status);
    setQuotePage(1);
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Panel de control
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen de tu actividad comercial
        </p>
      </div>

      {summaryQuery.isError && d && (
        <QueryError
          error={summaryQuery.error}
          message="No se pudo actualizar el resumen del panel."
          onRetry={summaryQuery.retry}
          retrying={summaryQuery.isLoading || summaryQuery.isRefreshing}
        />
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(({ status, label, value, icon: Icon, color }) => (
          <button
            type="button"
            key={status}
            className="group text-left"
            aria-pressed={selectedStatus === status}
            onClick={() => filterQuotes(status)}
          >
            <Card
              className={`h-full py-0 hover:-translate-y-0.5 hover:shadow-md ${
                selectedStatus === status
                  ? "border-primary ring-2 ring-primary/20"
                  : ""
              }`}
            >
              <CardContent className="flex min-h-24 items-center gap-3 p-4">
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none">{value}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {label}
                  </p>
                </div>
                <ArrowRight className="ml-auto size-4 text-muted-foreground/35 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </CardContent>
            </Card>
          </button>
        ))}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">
            {selectedStatus === "ALL"
              ? "Todos los presupuestos"
              : metrics.find((metric) => metric.status === selectedStatus)
                  ?.label}
          </h2>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="h-9 px-4">
              <Link href="/quotes">Ver todos</Link>
            </Button>
            <Button asChild variant="action" className="h-9 px-4">
              <Link href="/quotes/new">
                <Plus />
                Nuevo
              </Link>
            </Button>
          </div>
        </div>

        {quoteQuery.isLoading && !quoteQuery.data ? (
          <LoadingState label="Cargando presupuestos…" />
        ) : quoteQuery.isError && !quoteQuery.data ? (
          <QueryError
            error={quoteQuery.error}
            message="No se pudieron cargar los presupuestos."
            onRetry={quoteQuery.retry}
            retrying={quoteQuery.isLoading || quoteQuery.isRefreshing}
          />
        ) : quotes.length === 0 ? (
          <Card className="py-0">
            <CardContent className="py-10 text-center">
              <FileText className="mx-auto mb-3 size-9 text-primary/45" />
              <p className="font-medium">No hay presupuestos en esta categoría</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-x-auto py-0">
            <table className="w-full min-w-[600px] text-left text-sm md:min-w-[720px]">
              <thead className="border-b bg-background text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 sm:px-4">#</th>
                  <th className="px-3 py-2.5 sm:px-4">Cliente</th>
                  <th className="px-3 py-2.5 sm:px-4">Total</th>
                  <th className="px-3 py-2.5 sm:px-4">Estado</th>
                  <th className="hidden px-3 py-2.5 md:table-cell md:px-4">
                    Fecha
                  </th>
                  <th className="px-3 py-2.5 text-right sm:px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quotes.map((q) => (
                  <tr key={q.id} className="transition hover:bg-background">
                    <td className="px-3 py-2.5 font-medium text-muted-foreground sm:px-4">
                      #{q.number}
                    </td>
                    <td className="px-3 py-2.5 font-semibold sm:px-4">
                      {q.customer.name}
                    </td>
                    <td className="px-3 py-2.5 font-bold sm:px-4">
                      ${q.total}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4">
                      <Badge
                        className={`min-w-20 justify-center ${badgeStyles[q.status]}`}
                      >
                        {labels[q.status]}
                      </Badge>
                    </td>
                    <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell md:px-4">
                      {new Date(q.issueDate).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-3 py-2.5 text-right sm:px-4">
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link
                          href={`/quotes/${q.id}`}
                          aria-label={`Ver presupuesto ${q.number}`}
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

        {quoteQuery.data && quoteQuery.isError && (
          <div className="mt-3">
            <QueryError
              error={quoteQuery.error}
              message="No se pudo actualizar la lista de presupuestos."
              onRetry={quoteQuery.retry}
              retrying={quoteQuery.isLoading || quoteQuery.isRefreshing}
            />
          </div>
        )}

        {quoteQuery.data && quoteQuery.isRefreshing && (
          <div className="mt-3 flex justify-end">
            <RefreshingState label="Actualizando presupuestos…" />
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={
              quotePage <= 1 ||
              quoteQuery.isLoading ||
              quoteQuery.isRefreshing
            }
            onClick={() => setQuotePage((value) => value - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {quoteMeta?.page ?? quotePage} de {Math.max(quoteMeta?.totalPages ?? 1, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={
              quoteQuery.isLoading ||
              quoteQuery.isRefreshing ||
              !quoteMeta ||
              quotePage >= quoteMeta.totalPages
            }
            onClick={() => setQuotePage((value) => value + 1)}
          >
            Siguiente
          </Button>
        </div>
      </section>
    </div>
  );
}
