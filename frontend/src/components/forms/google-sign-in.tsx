"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { env } from "@/env";
import type { Session } from "@/types/api";

type GoogleCredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }): void;
          renderButton(
            element: HTMLElement,
            options: Record<string, string | number>,
          ): void;
        };
      };
    };
  }
}

export function GoogleSignIn() {
  const { setSession } = useAuth();
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    function initializeGoogle() {
      const container = containerRef.current;
      if (!container || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setError("");
          try {
            const session = await api<Session>("/auth/google", {
              method: "POST",
              body: JSON.stringify({ credential }),
            });
            setSession(session);
            window.location.href = "/dashboard";
          } catch (cause) {
            setError(
              cause instanceof ApiError
                ? cause.message
                : "No se pudo ingresar con Google",
            );
          }
        },
      });
      container.replaceChildren();
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 352,
        locale: "es",
      });
      setReady(true);
    }

    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const handleError = () =>
      setError(
        "No se pudo cargar el acceso con Google. Revisá el bloqueador del navegador.",
      );

    if (window.google) {
      initializeGoogle();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", initializeGoogle);
      script.addEventListener("error", handleError);
    }

    const timeout = window.setTimeout(() => {
      if (!window.google) handleError();
    }, 8000);

    return () => {
      window.clearTimeout(timeout);
      script?.removeEventListener("load", initializeGoogle);
      script?.removeEventListener("error", handleError);
    };
  }, [clientId, setSession]);

  if (!clientId) return null;

  return (
    <div className="space-y-3">
      {!ready && !error && (
        <p className="min-h-10 text-center text-sm text-muted-foreground">
          Cargando Google…
        </p>
      )}
      <div ref={containerRef} className="flex min-h-10 justify-center" />
      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        o ingresá con email
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
