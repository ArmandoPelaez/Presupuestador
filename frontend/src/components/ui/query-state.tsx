import { LoaderCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiError } from "@/lib/api";

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <Card className="py-0">
      <CardContent
        className="flex min-h-28 items-center justify-center gap-2 py-10 text-center text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        <span>{label}</span>
      </CardContent>
    </Card>
  );
}

export function RefreshingState({ label = "Actualizando…" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" />
      {label}
    </span>
  );
}

export function QueryError({
  error,
  message = "No se pudieron cargar los datos.",
  onRetry,
  retrying = false,
}: {
  error?: ApiError;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const canRetry = error?.retryable ?? Boolean(onRetry);

  return (
    <Card className="py-0">
      <CardContent
        className="flex min-h-28 flex-col items-center justify-center gap-3 py-10 text-center"
        role="alert"
        aria-live="assertive"
      >
        <p className="font-medium text-destructive">{message}</p>
        {canRetry && onRetry && (
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            disabled={retrying}
            aria-label={`Reintentar: ${message.toLowerCase()}`}
          >
            <RefreshCw className={retrying ? "animate-spin" : undefined} />
            {retrying ? "Reintentando…" : "Reintentar"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
