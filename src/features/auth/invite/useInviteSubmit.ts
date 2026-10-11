/**
 * PL: Hook wysyłania formularza kodu zaproszenia albo logowania: pilnuje, czy trwa rozmowa z serwerem, trzyma komunikat błędu i po sukcesie odświeża sesję, żeby ekran przeniósł ucznia na pulpit. Osobny hook, żeby formularze tylko rysowały.
 * EN: The hook that submits the invitation code or sign-in form: it tracks whether a server conversation is running, holds the error message and after success refreshes the session so the screen takes the student to the dashboard. A separate hook so the forms only draw.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses src/features/auth/invite/inviteApi.ts::InviteResult
 * @used_by src/features/auth/invite/SignUpForm.tsx::useInviteSubmit
 * @used_by src/features/auth/invite/SignInForm.tsx::useInviteSubmit
 */

import { useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import type { InviteResult } from './inviteApi';

/**
 * PL: Klucz zapytania o sesję z podtoru 1a (useAuthSession). Podtor 1a nie wystawia funkcji odświeżającej sesję przez swoje drzwi, więc klucz jest tu powtórzony. Gdy 1a go zmieni, test e2e „po założeniu konta jestem na pulpicie” przestanie przechodzić. Brakująca funkcja: zgłoszone w pull requeście.
 * EN: The session query key from subtrack 1a (useAuthSession). Subtrack 1a does not expose a session-refreshing function through its door, so the key is repeated here. When 1a changes it, the e2e test "after creating an account I am on the dashboard" stops passing. The missing function is reported in the pull request.
 */
const SESSION_QUERY_KEY = ['auth', 'session'] as const;

/**
 * PL: Stan wysyłania formularza i funkcja wysłania.
 * EN: The form submission state and the submit function.
 */
export type InviteSubmit = {
  /** PL: Prawda, gdy trwa rozmowa z serwerem. EN: True while a server conversation is running. */
  isBusy: boolean;
  /** PL: Komunikat błędu albo null. EN: The error message or null. */
  error: string | null;
  /** PL: Obsługa zdarzenia wysłania formularza. EN: The form submit event handler. */
  submit: (event: FormEvent) => Promise<void>;
};

/**
 * PL: Buduje stan wysyłania dla jednego formularza.
 * EN: Builds the submission state for one form.
 *
 * @param send - PL: wysyła pola formularza do serwera. EN: sends the form fields to the server.
 * @returns PL: stan i funkcja wysłania. EN: the state and the submit function.
 */
export function useInviteSubmit(send: () => Promise<InviteResult>): InviteSubmit {
  const queryClient = useQueryClient();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    // PL: Przeglądarka nie przeładowuje strony, bo wysyłamy sami.
    // EN: The browser does not reload the page, because we send it ourselves.
    event.preventDefault();
    setIsBusy(true);
    const result = await send();

    // PL: Po sukcesie pobierz sesję od nowa: ekran nadrzędny zobaczy „zalogowany” i przeniesie ucznia na pulpit.
    // EN: After success fetch the session again: the parent screen sees "signed in" and takes the student to the dashboard.
    if (result.ok) await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    setIsBusy(false);
    setError(result.ok ? null : result.message);
  };

  return { isBusy, error, submit };
}
