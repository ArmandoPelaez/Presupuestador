"use client";

import { api, ApiError } from "@/lib/api";
import type {
  CatalogItem,
  Customer,
  Page,
  Quote,
  QuoteItem,
} from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  ReceiptText,
  Save,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const selectClass =
  "h-12 w-full rounded-xl border border-border bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20";

type QuoteType = CatalogItem["type"];
type WizardStep = 1 | 2 | 3;
type ValidityDays = 7 | 14 | 30;

const validityOptions: ValidityDays[] = [7, 14, 30];

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: string, days: number) {
  const result = new Date(`${date}T12:00:00`);
  result.setDate(result.getDate() + days);
  return toDateInput(result);
}

function initialValidity(quote?: Quote): ValidityDays {
  if (!quote?.validUntil) return 14;
  const issue = new Date(`${quote.issueDate.slice(0, 10)}T12:00:00`);
  const validUntil = new Date(`${quote.validUntil.slice(0, 10)}T12:00:00`);
  const days = Math.round((validUntil.getTime() - issue.getTime()) / 86400000);
  return validityOptions.includes(days as ValidityDays)
    ? (days as ValidityDays)
    : 14;
}

export function QuoteForm({ quote }: { quote?: Quote }) {
  const [step, setStep] = useState<WizardStep>(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [items, setItems] = useState<QuoteItem[]>(quote?.items ?? []);
  const [quoteType, setQuoteType] = useState<QuoteType>("PRODUCT");
  const [customerId, setCustomerId] = useState(quote?.customerId ?? "");
  const [issueDate] = useState(
    quote?.issueDate.slice(0, 10) ?? toDateInput(new Date()),
  );
  const [validityDays, setValidityDays] = useState<ValidityDays>(() =>
    initialValidity(quote),
  );
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [discountType, setDiscountType] = useState(
    quote?.discountType ?? "NONE",
  );
  const [discountValue, setDiscountValue] = useState(
    quote?.discountValue ?? "0",
  );
  const [notes, setNotes] = useState(quote?.notes ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Page<Customer>>("/customers?pageSize=100").then((r) =>
      setCustomers(r.items.filter((x) => x.isActive)),
    );
    api<Page<CatalogItem>>("/catalog-items?pageSize=100&isActive=true").then(
      (r) => {
        setCatalog(r.items);
        const savedCatalogItem = r.items.find((catalogItem) =>
          quote?.items.some((item) => item.catalogItemId === catalogItem.id),
        );
        if (savedCatalogItem) setQuoteType(savedCatalogItem.type);
      },
    );
  }, [quote?.items]);

  const filteredCatalog = useMemo(() => {
    const search = catalogSearch.trim().toLocaleLowerCase("es");
    return catalog.filter(
      (item) =>
        item.type === quoteType &&
        (!search || item.name.toLocaleLowerCase("es").includes(search)),
    );
  }, [catalog, catalogSearch, quoteType]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0,
    );
    const discount =
      discountType === "PERCENTAGE"
        ? (subtotal * Number(discountValue)) / 100
        : discountType === "FIXED"
          ? Number(discountValue)
          : 0;
    const tax = items.reduce((sum, item) => {
      const line = Number(item.quantity) * Number(item.unitPrice);
      return (
        sum +
        ((line - (subtotal ? (discount * line) / subtotal : 0)) *
          Number(item.taxRate)) /
          100
      );
    }, 0);
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  }, [items, discountType, discountValue]);

  function update(index: number, patch: Partial<QuoteItem>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addCatalogItem(catalogItem: CatalogItem) {
    setItems((current) => [
      ...current,
      {
        catalogItemId: catalogItem.id,
        description: catalogItem.name,
        quantity: "1",
        unit: catalogItem.type === "PRODUCT" ? "unidad" : "servicio",
        unitPrice: catalogItem.unitPrice,
        taxRate: "0",
        position: current.length,
      },
    ]);
    setCatalogSearch("");
    setCatalogMenuOpen(false);
  }

  function changeQuoteType(type: QuoteType) {
    setQuoteType(type);
    setItems([]);
    setCatalogSearch("");
  }

  function nextStep() {
    setError("");
    if (step === 1 && !customerId) {
      setError("Seleccioná un cliente para continuar");
      return;
    }
    if (step === 2 && items.length === 0) {
      setError("Agregá al menos un ítem para continuar");
      return;
    }
    setStep((current) => Math.min(3, current + 1) as WizardStep);
  }

  async function submit() {
    if (step !== 3 || !customerId || items.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const payload = {
        customerId,
        issueDate,
        validUntil: addDays(issueDate, validityDays),
        notes: notes.trim() || undefined,
        discountType,
        discountValue,
        items: items.map((item, position) => ({
          catalogItemId: item.catalogItemId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          position,
        })),
      };
      const saved = await api<Quote>(
        quote ? `/quotes/${quote.id}` : "/quotes",
        {
          method: quote ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      window.location.href = `/quotes/${saved.id}${quote ? "" : "?created=1"}`;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error inesperado");
      setBusy(false);
    }
  }

  const wizardActions = (
    <div className="mt-8 border-t pt-6">
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            className="h-12 px-5"
            onClick={() => {
              setError("");
              setStep((current) => (current - 1) as WizardStep);
            }}
          >
            <ChevronLeft />
            Volver
          </Button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <Button
            type="button"
            variant="action"
            className="h-12 px-6"
            onClick={nextStep}
          >
            Continuar
            <ChevronRight />
          </Button>
        ) : (
          <Button
            type="button"
            variant="action"
            disabled={busy}
            className="h-12 px-6 text-base"
            onClick={() => void submit()}
          >
            {busy ? (
              "Guardando…"
            ) : (
              <>
                <Save />
                Guardar presupuesto
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <StepProgress step={step} />

      {step === 1 && (
        <section className="app-card">
          <SectionTitle
            icon={UserRound}
            title="Datos generales"
            subtitle="Cliente y vigencia del presupuesto"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Label htmlFor="customerId">Cliente</Label>
              <select
                id="customerId"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                required
                className={selectClass}
              >
                <option value="">Seleccionar cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-5">
              <Label htmlFor="quoteType">Presupuestar</Label>
              <select
                id="quoteType"
                value={quoteType}
                className={selectClass}
                onChange={(event) =>
                  changeQuoteType(event.target.value as QuoteType)
                }
              >
                <option value="PRODUCT">Productos</option>
                <option value="SERVICE">Servicios</option>
              </select>
            </div>
            <div className="lg:col-span-4">
              <Label htmlFor="issueDate">Fecha de emisión</Label>
              <Input
                id="issueDate"
                type="date"
                readOnly
                className="h-12 bg-background px-4"
                value={issueDate}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-8">
              <Label>Validez del presupuesto</Label>
              <div className="grid grid-cols-3 gap-3">
                {validityOptions.map((days) => (
                  <Button
                    key={days}
                    type="button"
                    variant={validityDays === days ? "action" : "outline"}
                    className="h-12"
                    aria-pressed={validityDays === days}
                    onClick={() => setValidityDays(days)}
                  >
                    {days} días
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Válido hasta el{" "}
                {formatDisplayDate(addDays(issueDate, validityDays))}
              </p>
            </div>
          </div>
          {wizardActions}
        </section>
      )}

      {step === 2 && (
        <section className="app-card">
          <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
            <SectionTitle
              icon={ReceiptText}
              title="Ítems del presupuesto"
              subtitle={`${quoteType === "PRODUCT" ? "Productos" : "Servicios"}, cantidades y precios`}
              compact
            />
            <DropdownMenu
              open={catalogMenuOpen}
              onOpenChange={(open) => {
                setCatalogMenuOpen(open);
                if (!open) setCatalogSearch("");
              }}
            >
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-4"
                  />
                }
              >
                <Plus />
                Agregar ítem
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[min(28rem,calc(100vw-2rem))] p-0"
              >
                <div
                  className="flex items-center gap-2 border-b px-3"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    autoFocus
                    value={catalogSearch}
                    onChange={(event) => setCatalogSearch(event.target.value)}
                    placeholder={`Buscar ${quoteType === "PRODUCT" ? "producto" : "servicio"}...`}
                    className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="max-h-72 overflow-y-auto p-1">
                  {filteredCatalog.length > 0 ? (
                    filteredCatalog.map((catalogItem) => (
                      <DropdownMenuItem
                        key={catalogItem.id}
                        className="min-h-11 justify-between gap-4 px-3 py-2"
                        onClick={() => addCatalogItem(catalogItem)}
                      >
                        <span className="min-w-0 truncate font-medium">
                          {catalogItem.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          ${Number(catalogItem.unitPrice).toFixed(2)}
                          {catalogItem.type === "PRODUCT" && (
                            <> · Stock: {catalogItem.stock}</>
                          )}
                        </span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No hay{" "}
                      {quoteType === "PRODUCT" ? "productos" : "servicios"} que
                      coincidan.
                    </p>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[680px] table-fixed text-left text-sm">
              <thead className="border-b bg-background text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-1/2 px-4 py-3">Descripción del ítem</th>
                  <th className="w-32 px-4 py-3">Tipo</th>
                  <th className="w-28 px-3 py-3 text-center">Cant.</th>
                  <th className="w-44 px-3 py-3">Precio unitario</th>
                  <th className="w-14 px-3 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-36 px-6 text-center text-muted-foreground"
                    >
                      No hay ítems agregados. Usá “Agregar ítem” para
                      seleccionar un{" "}
                      {quoteType === "PRODUCT" ? "producto" : "servicio"}.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.id ?? `${item.catalogItemId}-${index}`}
                      className="bg-white align-middle hover:bg-background"
                    >
                      <td className="px-4 py-4">
                        <p className="truncate font-semibold">
                          {item.description}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="status-sent rounded-full px-2.5 py-1 text-xs font-semibold">
                          {quoteType === "PRODUCT" ? "Producto" : "Servicio"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          aria-label={`Cantidad de ${item.description}`}
                          className="h-10 text-center"
                          type="number"
                          min="0.0001"
                          step="0.0001"
                          value={item.quantity}
                          onChange={(event) =>
                            update(index, { quantity: event.target.value })
                          }
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          aria-label={`Precio de ${item.description}`}
                          className="h-10 text-right"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) =>
                            update(index, { unitPrice: event.target.value })
                          }
                        />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Quitar ${item.description}`}
                          onClick={() =>
                            setItems((current) =>
                              current
                                .filter((_, i) => i !== index)
                                .map((value, position) => ({
                                  ...value,
                                  position,
                                })),
                            )
                          }
                        >
                          <Trash2 />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {wizardActions}
        </section>
      )}

      {step === 3 && (
        <section className="app-card">
          <SectionTitle
            icon={FileText}
            title="Condiciones y totales"
            subtitle="Descuento, notas y resumen final"
          />
          <div className="grid gap-7 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              <div>
                <Label>Descuento</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    className={selectClass}
                    value={discountType}
                    onChange={(event) =>
                      setDiscountType(event.target.value as typeof discountType)
                    }
                  >
                    <option value="NONE">Sin descuento</option>
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED">Importe fijo</option>
                  </select>
                  <Input
                    aria-label="Valor del descuento"
                    className="h-12 px-4"
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountValue}
                    disabled={discountType === "NONE"}
                    onChange={(event) => setDiscountValue(event.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">
                  Notas{" "}
                  <span className="font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  className="min-h-32"
                  placeholder="Condiciones, plazos o información adicional"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
            </div>
            <div className="rounded-2xl border bg-background p-5">
              <h3 className="mb-4 font-bold">Resumen</h3>
              <TotalRow label="Subtotal" value={totals.subtotal} />
              <TotalRow label="Descuento" value={totals.discount} />
              <TotalRow label="Impuestos" value={totals.tax} />
              <div className="mt-4 flex items-center justify-between border-t pt-4 text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {wizardActions}
        </section>
      )}
    </div>
  );
}

function StepProgress({ step }: { step: WizardStep }) {
  const steps = [
    "Datos del cliente",
    "Ítems del presupuesto",
    "Totales y detalles",
  ];
  return (
    <div
      className="pb-2 pt-1"
      aria-label={`Paso ${step} de 3: ${steps[step - 1]}`}
    >
      <div className="grid grid-cols-3 gap-2.5" aria-hidden="true">
        {steps.map((label, index) => (
          <div
            key={label}
            className={`h-1.5 rounded-full transition-colors ${index < step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground sm:text-base">
        Paso {step} de 3 — {steps[step - 1]}
      </p>
    </div>
  );
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("es-AR").format(new Date(`${date}T12:00:00`));
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  compact = false,
}: {
  icon: typeof CalendarDays;
  title: string;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact ? "flex items-center gap-3" : "mb-7 flex items-center gap-3"
      }
    >
      <div className="app-icon">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">${value.toFixed(2)}</span>
    </div>
  );
}
