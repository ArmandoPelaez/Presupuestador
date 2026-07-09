"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, publicApi } from "@/lib/api";
import type {
  PublicQuote,
  PublicQuoteDecision,
  PublicQuoteDecisionResult,
} from "@/types/api";
import {
  Building2,
  CheckCircle2,
  FileText,
  LoaderCircle,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const COMMENT_MAX_LENGTH = 1000;

export default function PublicQuotePage() {
  const { token } = useParams<{ token: string }>();
  const [quote, setQuote] = useState<PublicQuote>();
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState<PublicQuoteDecision>();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PublicQuoteDecisionResult>();

  useEffect(() => {
    let active = true;
    publicApi<PublicQuote>(`/public/quotes/${encodeURIComponent(token)}`)
      .then((data) => {
        if (!active) return;
        setQuote(data);
        setUnavailable(false);
      })
      .catch(() => {
        if (active) setUnavailable(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function submitDecision() {
    if (!decision) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await publicApi<PublicQuoteDecisionResult>(
        `/public/quotes/${encodeURIComponent(token)}/decision`,
        {
          method: "POST",
          body: JSON.stringify({ decision, comment: comment || undefined }),
        },
      );
      setResult(response);
      setDecision(undefined);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 404) {
        setUnavailable(true);
      } else {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "No pudimos registrar tu respuesta. Intentá nuevamente.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <PublicState
        icon={<LoaderCircle className="size-9 animate-spin" />}
        title="Cargando presupuesto…"
      />
    );
  if (unavailable || !quote)
    return (
      <PublicState
        icon={<FileText className="size-9" />}
        title="Este enlace no está disponible"
        description="Puede haber vencido, ya haber sido respondido o no ser válido. Consultá con quien te envió el presupuesto."
      />
    );

  const finalDecision = result?.decision ?? quote.response?.decision;
  const businessName = quote.user.businessName || quote.user.name;

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="app-quote-header p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/85">
                <Building2 className="size-4" />
                {businessName}
              </p>
              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                Presupuesto #{String(quote.number).padStart(6, "0")}
              </h1>
              {quote.user.taxId && (
                <p className="mt-2 text-sm text-primary-foreground/80">
                  CUIT: {quote.user.taxId}
                </p>
              )}
            </div>
            <span className="w-fit rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-semibold">
              {statusLabel(quote.status)}
            </span>
          </div>
        </header>

        {finalDecision && (
          <section
            aria-live="polite"
            className={`rounded-3xl border p-6 shadow-sm ${finalDecision === "APPROVED" ? "app-success-alert" : "status-rejected"}`}
          >
            <div className="flex items-start gap-3">
              {finalDecision === "APPROVED" ? (
                <CheckCircle2 className="mt-0.5 size-7 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 size-7 shrink-0" />
              )}
              <div>
                <h2 className="text-lg font-bold">
                  Presupuesto{" "}
                  {finalDecision === "APPROVED" ? "aceptado" : "rechazado"}
                </h2>
                <p className="mt-1 text-sm">
                  Tu respuesta ya quedó registrada. No es necesario volver a
                  enviarla.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="app-card p-5 sm:p-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Cliente
          </h2>
          <p className="mt-3 text-xl font-bold text-foreground">
            {quote.customer.businessName || quote.customer.name}
          </p>
          {quote.customer.businessName && (
            <p className="mt-1 text-muted-foreground">{quote.customer.name}</p>
          )}
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {quote.customer.taxId && <p>CUIT: {quote.customer.taxId}</p>}
            {quote.customer.address && <p>{quote.customer.address}</p>}
            <p>Emisión: {formatDate(quote.issueDate)}</p>
            <p>
              Válido hasta:{" "}
              {quote.validUntil
                ? formatDate(quote.validUntil)
                : "Sin fecha definida"}
            </p>
          </div>
        </section>

        <section className="app-surface overflow-hidden">
          <div className="border-b px-5 py-5 sm:px-8">
            <h2 className="text-lg font-bold">Detalle</h2>
          </div>
          <div className="divide-y">
            {quote.items.map((item) => (
              <article
                key={item.position}
                className="grid gap-3 px-5 py-5 sm:grid-cols-[1fr_auto] sm:px-8"
              >
                <div>
                  <h3 className="font-semibold text-foreground">
                    {item.description}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.quantity} {item.unit} ×{" "}
                    {money(item.unitPrice, quote.currency)} · IVA {item.taxRate}
                    %
                  </p>
                </div>
                <p className="font-bold text-foreground sm:text-right">
                  {money(item.lineTotal, quote.currency)}
                </p>
              </article>
            ))}
          </div>
          <dl className="space-y-3 border-t bg-background px-5 py-5 text-sm sm:ml-auto sm:max-w-md sm:px-8">
            <TotalRow
              label="Subtotal"
              value={money(quote.subtotal, quote.currency)}
            />
            {Number(quote.discountTotal) > 0 && (
              <TotalRow
                label="Descuento"
                value={`−${money(quote.discountTotal, quote.currency)}`}
              />
            )}
            <TotalRow
              label="Impuestos"
              value={money(quote.taxTotal, quote.currency)}
            />
            <TotalRow
              label="Total"
              value={money(quote.total, quote.currency)}
              strong
            />
          </dl>
        </section>

        {quote.notes && (
          <section className="app-card p-5 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Notas
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-foreground">
              {quote.notes}
            </p>
          </section>
        )}

        {!finalDecision && (
          <section className="app-card p-5 sm:p-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-6 shrink-0 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Responder presupuesto</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tu decisión es final y solo puede registrarse una vez.
                </p>
              </div>
            </div>
            {!decision ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button
                  className="h-12 text-base"
                  variant="success"
                  onClick={() => setDecision("APPROVED")}
                >
                  <CheckCircle2 />
                  Aceptar presupuesto
                </Button>
                <Button
                  className="h-12 text-base"
                  variant="destructive"
                  onClick={() => setDecision("REJECTED")}
                >
                  <XCircle />
                  Rechazar presupuesto
                </Button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border bg-background p-4 sm:p-5">
                <h3 className="font-bold">
                  Confirmar {decision === "APPROVED" ? "aceptación" : "rechazo"}
                </h3>
                <label
                  htmlFor="decision-comment"
                  className="mt-4 block text-sm font-medium text-foreground"
                >
                  Comentario opcional
                </label>
                <Textarea
                  id="decision-comment"
                  className="mt-2"
                  maxLength={COMMENT_MAX_LENGTH}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Podés dejar una aclaración para el propietario"
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {comment.length}/{COMMENT_MAX_LENGTH}
                </p>
                {error && (
                  <p
                    role="alert"
                    className="mt-3 text-sm font-medium text-foreground"
                  >
                    {error}
                  </p>
                )}
                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    disabled={submitting}
                    onClick={() => {
                      setDecision(undefined);
                      setError("");
                    }}
                  >
                    Volver
                  </Button>
                  <Button
                    variant={
                      decision === "APPROVED" ? "success" : "destructive"
                    }
                    disabled={submitting}
                    onClick={submitDecision}
                  >
                    {submitting ? (
                      <LoaderCircle className="animate-spin" />
                    ) : decision === "APPROVED" ? (
                      <CheckCircle2 />
                    ) : (
                      <XCircle />
                    )}
                    {submitting ? "Enviando…" : "Confirmar respuesta"}
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="px-3 pb-4 text-center text-xs text-muted-foreground">
          Este enlace permite una única respuesta y no equivale a una firma
          digital.
        </footer>
      </div>
    </main>
  );
}

function PublicState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section
        className="app-surface w-full max-w-lg p-8 text-center"
        role="status"
      >
        <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-border bg-background text-primary">
          {icon}
        </div>
        <h1 className="mt-5 text-xl font-bold">{title}</h1>
        {description && (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </section>
    </main>
  );
}

function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${strong ? "border-t pt-3 text-lg font-bold text-foreground" : "text-muted-foreground"}`}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function statusLabel(status: PublicQuote["status"]) {
  return status === "APPROVED"
    ? "Aprobado"
    : status === "REJECTED"
      ? "Rechazado"
      : "Enviado";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function money(value: string, currency: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(
    Number(value),
  );
}
