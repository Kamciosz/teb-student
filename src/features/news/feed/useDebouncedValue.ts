/**
 * PL: Hak opóźniający wartość: zwraca tekst dopiero, gdy przez podany czas nie zmienił się ponownie. Dzięki temu pole szukania nie wysyła zapytania przy każdej literze.
 * EN: A hook that delays a value: it returns the text only after it has not changed again for the given time. This way the search field does not send a request on every letter.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/news/feed/FeedListScreen.tsx::useDebouncedValue
 */

// PL: Stan i efekt Reacta.
// EN: React state and effect.
import { useEffect, useState } from 'react';

/**
 * PL: Zwraca wartość opóźnioną o delayMs od ostatniej zmiany.
 * EN: Returns the value delayed by delayMs after the last change.
 *
 * @param value - PL: bieżąca wartość. EN: the current value.
 * @param delayMs - PL: opóźnienie w milisekundach. EN: the delay in milliseconds.
 * @returns PL: opóźniona wartość. EN: the delayed value.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [delayed, setDelayed] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDelayed(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return delayed;
}
