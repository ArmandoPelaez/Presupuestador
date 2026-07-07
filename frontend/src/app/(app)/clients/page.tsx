import { CustomerList } from "@/components/customers/customer-list";
import { PageHeader } from "@/components/layout/page-header";
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <PageHeader
        title="Clientes"
        description="Administrá tus contactos y datos comerciales"
      />
      <CustomerList />
    </div>
  );
}
