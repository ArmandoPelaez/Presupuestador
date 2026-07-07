import { QuoteForm } from "@/components/forms/quote-form";
import { PageHeader } from "@/components/layout/page-header";
export default function Page() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Nuevo presupuesto"
        description="Completá los datos, ítems y condiciones"
        backHref="/quotes"
      />
      <QuoteForm />
    </div>
  );
}
