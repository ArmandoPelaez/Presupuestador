"use client";

import { QuoteForm } from "@/components/forms/quote-form";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState, QueryError } from "@/components/ui/query-state";
import { useApiQuery } from "@/lib/use-api-query";
import type { Quote } from "@/types/api";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const quoteQuery = useApiQuery<Quote>(`/quotes/${id}`);
  const quote = quoteQuery.data;

  if (quote) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title={`Editar presupuesto #${quote.number}`}
          description="Actualizá los datos, ítems y condiciones"
          backHref={`/quotes/${quote.id}`}
        />
        <QuoteForm quote={quote} />
      </div>
    );
  }

  return quoteQuery.isLoading ? (
    <LoadingState label="Cargando presupuesto…" />
  ) : (
    <div className="mx-auto max-w-5xl">
      <QueryError
        error={quoteQuery.error}
        message="No se pudo cargar el presupuesto."
        onRetry={quoteQuery.retry}
        retrying={quoteQuery.isLoading || quoteQuery.isRefreshing}
      />
    </div>
  );
}
