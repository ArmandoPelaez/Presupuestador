"use client";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Session } from "@/types/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { setSession } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(form: FormData) {
    setBusy(true);
    setError("");
    try {
      const session = await api<Session>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form)),
      });
      setSession(session);
      window.location.href = "/dashboard";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error inesperado");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form action={submit} className="space-y-4" aria-describedby="form-error">
      {mode === "register" && (
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" minLength={2} maxLength={100} required />
        </div>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
        />
      </div>
      {error && (
        <p id="form-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button className="w-full" disabled={busy}>
        {busy ? "Procesando…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
      </Button>
    </form>
  );
}
