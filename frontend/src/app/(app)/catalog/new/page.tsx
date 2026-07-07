import { CatalogForm } from "@/components/forms/catalog-form";
import { PageHeader } from "@/components/layout/page-header";
export default function Page() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Nuevo concepto"
        description="Agregá un producto o servicio a tu catálogo"
        backHref="/catalog"
      />
      <CatalogForm />
    </div>
  );
}
