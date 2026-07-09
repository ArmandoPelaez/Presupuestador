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
  unitPrice: string;
  stock: number;
  isActive: boolean;
};
export type QuoteItem = {
  id?: string;
  catalogItemId?: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  taxRate: string;
  lineSubtotal?: string;
  lineTax?: string;
  lineTotal?: string;
  position: number;
};
export type Quote = {
  id: string;
  number: number;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
  customerId: string;
  customer: Customer;
  issueDate: string;
  validUntil?: string;
  notes?: string;
  discountType: "NONE" | "PERCENTAGE" | "FIXED";
  discountValue: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  total: string;
  items: QuoteItem[];
  activeShare?: { publicUrl: string; expiresAt: string } | null;
};

export type AiQuoteDraftItem = {
  description: string;
  quantity: number;
  unit: string;
  catalogMatchId: string | null;
};

export type AiQuoteDraft = {
  customerName: string;
  customerMatchId: string | null;
  items: AiQuoteDraftItem[];
  notes: string;
  validUntilDays: number | null;
  warnings: string[];
};

export type QuoteShare = {
  publicUrl: string;
  expiresAt: string;
};

export type PublicQuoteDecision = "APPROVED" | "REJECTED";

export type PublicQuote = {
  number: number;
  status: "SENT" | "APPROVED" | "REJECTED";
  issueDate: string;
  validUntil?: string;
  currency: string;
  notes?: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  total: string;
  user: { name: string; businessName?: string; taxId?: string };
  customer: {
    name: string;
    businessName?: string;
    taxId?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    taxRate: string;
    lineSubtotal: string;
    lineTax: string;
    lineTotal: string;
    position: number;
  }>;
  response: {
    decision: PublicQuoteDecision;
    respondedAt: string;
  } | null;
};

export type PublicQuoteDecisionResult = {
  status: "recorded" | "already_responded";
  decision: PublicQuoteDecision;
  respondedAt: string;
};
