/**
 * PL: Prosty hak do pobierania danych z serwera: stan „wczytuję”, „błąd” albo „gotowe” oraz ponowienie. Zastępuje TanStack Query, dopóki aplikacja nie ma QueryClientProvider (zgłoszenie #41).
 * EN: A simple hook for fetching server data: the "loading", "error" or "ready" state and a retry. Stands in for TanStack Query until the app has a QueryClientProvider (issue #41).
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by src/features/surveys/vote/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 */

// TODO(Jakub, #41): zastąp tym, co wybierze podtor 0 (TanStack Query z zapisem w telefonie), żeby lista działała bez internetu.

// PL: Hak stanu i efektu Reacta.
// EN: React's state and effect hooks.
import { useCallback, useEffect, useState } from 'react';

/** PL: Stan pobierania. EN: The fetching state. */
export type RemoteState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

/**
 * PL: Pobiera dane przy wejściu na ekran i po wywołaniu reload.
 * EN: Fetches the data when the screen opens and after reload is called.
 *
 * @param load - PL: funkcja pobierająca dane. Ma być stała między rysowaniami albo zmieniać się razem z danymi, które pobiera. EN: the function that fetches the data. It must stay constant between renders or change together with the data it fetches.
 * @returns PL: stan i funkcja ponawiająca. EN: the state and the retry function.
 */
export function useRemoteData<T>(load: () => Promise<T>): { state: RemoteState<T>; reload: () => void } {
  const [state, setState] = useState<RemoteState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // PL: Po odpięciu ekranu albo kolejnym ponowieniu stara odpowiedź nie może nadpisać nowej.
    // EN: After the screen unmounts or on the next retry, an old response must not overwrite a new one.
    let current = true;
    setState({ status: 'loading' });
    load().then(
      (data) => current && setState({ status: 'ready', data }),
      () => current && setState({ status: 'error' }),
    );
    return () => {
      current = false;
    };
  }, [load, attempt]);

  // PL: Ponowienie zmienia licznik, a to uruchamia efekt jeszcze raz.
  // EN: A retry changes the counter, which runs the effect again.
  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  return { state, reload };
}
