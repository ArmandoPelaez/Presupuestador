"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { api, ApiError } from "@/lib/api";
import type { Quote } from "@/types/api";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CheckSquare2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Download,
  Link2,
  Mail,
  Package,
  Phone,
  Share2,
  Square,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const labels = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [quote, setQuote] = useState<Quote>();
  const [busy, setBusy] = useState<"copy" | "share" | "pdf">();
  const [copied, setCopied] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [error, setError] = useState("");

  const loadQuote = useCallback(
    () => api<Quote>(`/quotes/${id}`).then(setQuote),
    [id],
  );

  async function markSentAfterSharing() {
    if (quote?.status !== "DRAFT") return;
    const updated = await api<Quote>(`/quotes/${id}/share/copied`, {
      method: "POST",
    });
    setQuote(updated);
  }

  useEffect(() => {
    void loadQuote();
  }, [loadQuote]);

  if (!quote) {
    return (
      <div className="grid min-h-64 place-items-center text-muted-foreground">
        Cargando...
      </div>
    );
  }

  async function copyLink() {
    const publicUrl = quote?.activeShare?.publicUrl;
    if (!publicUrl) return;
    setBusy("copy");
    setError("");
    try {
      await navigator.clipboard.writeText(publicUrl);
      await markSentAfterSharing();
      setCopied(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No se pudo copiar el link. Intentá nuevamente.",
      );
    } finally {
      setBusy(undefined);
    }
  }

  async function shareQuote() {
    const publicUrl = quote?.activeShare?.publicUrl;
    if (!publicUrl) return;
    setBusy("share");
    setError("");
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Presupuesto #${quote.number}`,
          text: `Te comparto el presupuesto #${quote.number}.`,
          url: publicUrl,
        });
      } else {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
      }
      await markSentAfterSharing();
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError("No se pudo compartir el presupuesto. Intentá nuevamente.");
    } finally {
      setBusy(undefined);
    }
  }

  async function downloadPdf() {
    setBusy("pdf");
    setError("");
    try {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/quotes/${id}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );
      if (!response.ok) throw new Error("pdf");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `presupuesto-${quote!.number}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      await loadQuote();
    } catch {
      setError("No se pudo descargar el PDF. Intentá nuevamente.");
    } finally {
      setBusy(undefined);
    }
  }

  const issueDate = formatDate(quote.issueDate);
  const issueTime = formatTime(quote.issueDate);
  const validityDays = quote.validUntil
    ? Math.max(
        0,
        Math.round(
          (new Date(quote.validUntil).getTime() -
            new Date(quote.issueDate).getTime()) /
            86400000,
        ),
      )
    : undefined;
  const hasMoreThanOneItem = quote.items.length > 1;
  const visibleItems =
    detailsExpanded || !hasMoreThanOneItem ? quote.items : quote.items.slice(0, 1);
  const hiddenItemsCount = quote.items.length - visibleItems.length;
  const taxLabel = getTaxLabel(quote.items);

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 pb-10">
      <Button asChild variant="link" className="h-auto px-0 text-muted-foreground">
        <Link href="/quotes">
          <ArrowLeft />
          Presupuestos
        </Link>
      </Button>

      {searchParams.get("created") === "1" && (
        <div className="app-success-alert flex items-center gap-4 rounded-2xl px-5 py-4 shadow-sm md:px-7">
          <CheckCircle2 className="size-8 shrink-0 text-[var(--success)]" />
          <div>
            <h1 className="text-lg font-bold">¡Presupuesto creado!</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              El link ya está listo. Se marcará como enviado al copiarlo o
              descargar el PDF.
            </p>
          </div>
        </div>
      )}

      <div className="app-quote-header flex w-full flex-wrap items-center justify-between gap-3 px-6 py-6 md:px-9">
        <h1 className="text-lg font-bold uppercase md:text-xl">
          Presupuesto #{String(quote.number).padStart(6, "0")}
        </h1>
        <span className="rounded-full border border-primary-foreground/25 bg-primary-foreground/15 px-3 py-1 text-sm font-semibold text-primary-foreground">
          {labels[quote.status]}
        </span>
      </div>

      <section className="app-card md:p-9">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="space-y-3 text-sm md:text-base">
              <InfoLine icon={User} value={quote.customer.name} strong />
              {quote.customer.email && (
                <InfoLine icon={Mail} value={quote.customer.email} />
              )}
              {quote.customer.phone && (
                <InfoLine icon={Phone} value={quote.customer.phone} />
              )}
              {quote.customer.businessName && (
                <p className="pl-8 text-muted-foreground">
                  {quote.customer.businessName}
                </p>
              )}
            </div>

            <div className="grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
              {quote.activeShare && (
                <div
                  className="flex min-w-0 items-center gap-2 px-2 py-2 text-sm font-medium text-primary"
                  title={quote.activeShare.publicUrl}
                >
                  <Link2 className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{quote.activeShare.publicUrl}</span>
                </div>
              )}
              {quote.activeShare && (
                <Button
                  variant="outline"
                  className="h-11 px-4 xl:min-w-32"
                  disabled={Boolean(busy)}
                  onClick={copyLink}
                >
                  {copied ? <CheckSquare2 /> : <Square />}
                  {busy === "copy" ? "Copiando..." : "Copiar link"}
                </Button>
              )}
              {quote.activeShare && (
                <Button
                  variant="success"
                  className="h-11 px-4 xl:min-w-32"
                  disabled={Boolean(busy)}
                  onClick={shareQuote}
                >
                  <Share2 />
                  {busy === "share" ? "Compartiendo..." : "Compartir"}
                </Button>
              )}
              <Button
                disabled={Boolean(busy)}
                variant="default"
                className="h-11 px-4 xl:min-w-36"
                onClick={downloadPdf}
              >
                <Download />
                {busy === "pdf" ? "Descargando..." : "Descargar PDF"}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <DateInfo
              icon={CalendarDays}
              label="Creado"
              value={issueDate}
              detail={issueTime}
            />
            <DateInfo
              icon={Clock3}
              label="Vigencia"
              value={validityDays === undefined ? "-" : `${validityDays} días`}
              detail={
                quote.validUntil
                  ? `Hasta el ${formatShortDate(quote.validUntil)}`
                  : "-"
              }
            />
          </div>
        </div>

        {error && (
          <div aria-live="polite" className="mt-3 min-h-5 text-sm">
            <p role="alert" className="font-medium text-foreground">
              {error}
            </p>
          </div>
        )}
      </section>

      <section className="app-card md:p-9">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Detalle del presupuesto
        </h2>
        <div
          className={`mt-6 overflow-hidden ${
            detailsExpanded && hasMoreThanOneItem
              ? "max-h-[360px] overflow-y-auto pr-2"
              : ""
          }`}
        >
          <div className="hidden grid-cols-[minmax(0,1fr)_110px_160px_140px_160px] border-b border-border pb-3 text-sm font-semibold text-muted-foreground md:grid">
            <span>Producto</span>
            <span className="text-center">Cantidad</span>
            <span className="text-right">Precio unitario</span>
            <span className="text-right">Impuestos</span>
            <span className="text-right">Subtotal</span>
          </div>
          {visibleItems.map((item, index) => (
            <div
              key={item.id ?? index}
              className="grid gap-3 border-b border-border py-4 last:border-0 md:grid-cols-[minmax(0,1fr)_110px_160px_140px_160px] md:items-center"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="app-icon size-14 rounded-lg text-muted-foreground">
                  <Package className="size-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">
                    {item.description}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {item.unit || "Unidad"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground md:hidden">
                    {formatQuantity(item.quantity)} {item.unit} x{" "}
                    {moneyWithCents(item.unitPrice)} · {formatTax(item.taxRate)}
                  </p>
                </div>
              </div>
              <span className="hidden text-center font-semibold md:block">
                {formatQuantity(item.quantity)}
              </span>
              <span className="hidden text-right font-semibold md:block">
                {moneyWithCents(item.unitPrice)}
              </span>
              <span className="hidden text-right font-semibold md:block">
                {formatTax(item.taxRate)}
              </span>
              <span className="font-bold md:text-right">
                {moneyWithCents(item.lineTotal ?? "0")}
              </span>
            </div>
          ))}
        </div>
        {hasMoreThanOneItem && (
          <Button
            variant="ghost"
            className="mt-5 h-auto px-0 text-primary"
            onClick={() => setDetailsExpanded((current) => !current)}
          >
            {detailsExpanded ? <ChevronUp /> : <ChevronDown />}
            {detailsExpanded
              ? "Ver menos productos"
              : `Ver ${hiddenItemsCount} producto${hiddenItemsCount === 1 ? "" : "s"} más`}
          </Button>
        )}
        {quote.notes && (
          <p className="border-t border-border py-4 text-sm italic text-muted-foreground">
            {quote.notes}
          </p>
        )}
        <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <p className="text-sm font-semibold text-muted-foreground">
            {quote.items.length} producto{quote.items.length === 1 ? "" : "s"}{" "}
            en total
          </p>
          <div className="w-full rounded-2xl border border-border bg-background p-5 shadow-sm lg:max-w-[420px]">
            <SummaryRow label="Subtotal" value={moneyWithCents(quote.subtotal)} />
            {Number(quote.discountTotal) > 0 && (
              <SummaryRow
                label="Descuento"
                value={`-${moneyWithCents(quote.discountTotal)}`}
              />
            )}
            <SummaryRow label={taxLabel} value={moneyWithCents(quote.taxTotal)} />
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-lg font-bold uppercase">Total</span>
              <span className="text-2xl font-bold text-primary">
                {moneyWithCents(quote.total)}
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return `${new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value))} hs`;
}

function moneyWithCents(value: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatQuantity(value: string) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatTax(value: string) {
  const rate = Number(value);
  return rate > 0 ? `IVA ${formatQuantity(value)}%` : "Sin IVA";
}

function getTaxLabel(items: Quote["items"]) {
  const rates = Array.from(new Set(items.map((item) => Number(item.taxRate))));
  const positiveRates = rates.filter((rate) => rate > 0);
  return positiveRates.length === 1
    ? `IVA (${formatQuantity(String(positiveRates[0]))}%)`
    : "Impuestos";
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function InfoLine({
  icon: Icon,
  value,
  strong = false,
}: {
  icon: typeof User;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <span
        className={
          strong
            ? "min-w-0 truncate text-lg font-bold text-foreground"
            : "min-w-0 truncate text-muted-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function DateInfo({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2.5">
      <div className="app-icon size-9 rounded-full bg-accent">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-0.5 text-sm font-semibold">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
