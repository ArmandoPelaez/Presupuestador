"use client";
import { api } from "@/lib/api";
import type { Quote } from "@/types/api";
import { QuoteForm } from "@/components/forms/quote-form";
import { PageHeader } from "@/components/layout/page-header";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote>();
  useEffect(() => {
    api<Quote>(`/quotes/${id}`).then(setQuote);
  }, [id]);
  return quote ? (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={`Editar presupuesto #${quote.number}`}
        description="Actualizá los datos, ítems y condiciones"
        backHref={`/quotes/${quote.id}`}
      />
      <QuoteForm quote={quote} />
    </div>
  ) : (
    <div className="grid min-h-64 place-items-center text-muted-foreground">
      Cargando…
    </div>
  );
}
