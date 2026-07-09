import { QuoteForm } from "@/components/forms/quote-form";
import { PageHeader } from "@/components/layout/page-header";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const aiParam = params?.ai;
  const openAiDraft = Array.isArray(aiParam)
    ? aiParam[0] === "1"
    : aiParam === "1";

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Nuevo presupuesto"
        description="Completá los datos, ítems y condiciones"
        backHref="/quotes"
      />
      <QuoteForm initialAiDraftOpen={openAiDraft} />
    </div>
  );
}
