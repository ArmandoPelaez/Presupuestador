import { QuoteList } from "@/components/quotes/quote-list";
import { PageHeader } from "@/components/layout/page-header";
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader
        title="Presupuestos"
        description="Consultá y gestioná todos tus presupuestos"
      />
      <QuoteList />
    </div>
  );
}
