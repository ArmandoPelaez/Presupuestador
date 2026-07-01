export type User = {
  id: string;
  name: string;
  email: string;
  businessName?: string;
};
export type Session = { user: User; accessToken: string };
export type Page<T> = {
  items: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};
export type Customer = {
  id: string;
  name: string;
  businessName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
};
export type CatalogItem = {
  id: string;
  type: "PRODUCT" | "SERVICE";
  name: string;
  description?: string;
  unit: string;
  unitPrice: string;
  taxRate: string;
  isActive: boolean;
};
