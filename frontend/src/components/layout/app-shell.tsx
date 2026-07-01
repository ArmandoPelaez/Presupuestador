"use client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
const links = [
  ["Dashboard", "/dashboard"],
  ["Clientes", "/clients"],
  ["Productos y servicios", "/catalog"],
];
function Nav() {
  return (
    <nav className="grid gap-1">
      {links.map(([label, href]) => (
        <Button key={href} asChild variant="ghost" className="justify-start">
          <Link href={href}>{label}</Link>
        </Button>
      ))}
    </nav>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  useEffect(() => {
    if (!loading && !user) window.location.href = "/login";
  }, [loading, user]);
  if (loading || !user)
    return (
      <main className="grid min-h-screen place-items-center">Cargando…</main>
    );
  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 hidden w-64 border-r bg-background p-4 md:block">
        <h1 className="mb-6 text-xl font-bold">Presupuestador Pro</h1>
        <Nav />
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="md:hidden" size="icon" variant="outline">
                <Menu />
                <span className="sr-only">Abrir navegación</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <h2 className="mb-5 font-bold">Presupuestador Pro</h2>
              <Nav />
            </SheetContent>
          </Sheet>
          <span className="ml-auto mr-3 text-sm">{user.name}</span>
          <Button variant="outline" onClick={logout}>
            Salir
          </Button>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
