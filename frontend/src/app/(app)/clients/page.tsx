import { CustomerList } from "@/components/customers/customer-list";
export default function Page() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Clientes</h1>
      <CustomerList />
    </>
  );
}
