import { CatalogList } from "@/components/catalog/catalog-list";
import { PageHeader } from "@/components/layout/page-header";
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader
        title="Productos y servicios"
        description="Organizá los conceptos que usás en tus presupuestos"
      />
      <CatalogList />
    </div>
  );
}
