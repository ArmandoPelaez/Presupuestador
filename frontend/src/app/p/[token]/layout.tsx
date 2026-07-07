import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presupuesto compartido",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function PublicQuoteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
