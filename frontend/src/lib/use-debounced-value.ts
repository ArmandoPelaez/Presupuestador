import { useEffect, useRef, useState } from "react";

export const SEARCH_DEBOUNCE_MS = 350;

export function useDebouncedValue<T>(
  value: T,
  delay = SEARCH_DEBOUNCE_MS,
  onDebounced?: (value: T) => void,
): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const onDebouncedRef = useRef(onDebounced);

  useEffect(() => {
    onDebouncedRef.current = onDebounced;
  }, [onDebounced]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
      onDebouncedRef.current?.(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}
