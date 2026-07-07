import { CustomerForm } from "@/components/forms/customer-form";
import { PageHeader } from "@/components/layout/page-header";
export default function Page() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Nuevo cliente"
        description="Registrá sus datos de contacto y facturación"
        backHref="/clients"
      />
      <CustomerForm />
    </div>
  );
}
