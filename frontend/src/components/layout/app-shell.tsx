"use client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
const links = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Presupuestos", href: "/quotes", icon: FileText },
  { label: "Clientes", href: "/clients", icon: Users },
  { label: "Catálogo", href: "/catalog", icon: Package },
];
function Nav() {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1">
      {links.map(({ label, href, icon: Icon }) => (
        <Button
          key={href}
          asChild
          variant={pathname.startsWith(href) ? "action" : "ghost"}
          className="h-11 justify-start px-4"
        >
          <Link href={href}>
            <Icon className="mr-2 size-4" />
            {label}
          </Link>
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
    <div className="min-h-screen">
      <aside className="app-sidebar-shadow fixed inset-y-0 hidden w-64 flex-col border-r bg-sidebar p-4 md:flex">
        <div className="mb-7 flex items-center gap-3 px-2 py-3">
          <div className="app-brand-mark">
            <FileText className="size-6" />
          </div>
          <h1 className="font-heading text-lg font-bold leading-tight">
            Presupuesto
            <span className="block text-primary">Simple</span>
          </h1>
        </div>
        <Nav />
        <div className="mt-auto rounded-2xl border bg-background p-3">
          <div className="mb-3 flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">Ver perfil</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut />
            Cerrar sesi&oacute;n
          </Button>
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 shadow-sm md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="md:hidden" size="icon" variant="outline">
                <Menu />
                <span className="sr-only">Abrir navegación</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="mb-6 flex items-center gap-3">
                <div className="app-brand-mark">
                  <FileText className="size-6" />
                </div>
                <h2 className="font-heading text-lg font-bold leading-tight">
                  Presupuesto
                  <span className="block text-primary">Simple</span>
                </h2>
              </div>
              <Nav />
              <div className="mt-auto border-t pt-4">
                <p className="mb-2 truncate px-3 text-sm font-medium">
                  {user.name}
                </p>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={logout}
                >
                  <LogOut />
                  Cerrar sesi&oacute;n
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
