import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md py-2">
        <CardHeader className="pt-5 text-center">
          <p className="text-sm font-semibold text-primary">
            Presupuesto Simple
          </p>
          <CardTitle className="mt-2 text-2xl font-bold">Ingresar</CardTitle>
          <p className="text-sm text-muted-foreground">
            Accedé a tu panel de gestión
          </p>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" />
          <p className="mt-4 text-center text-sm">
            ¿Sin cuenta?{" "}
            <Link
              className="font-semibold text-primary hover:underline"
              href="/register"
            >
              Registrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
