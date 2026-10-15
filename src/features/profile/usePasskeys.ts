/**
 * PL: Hook sekcji kluczy dostępu w ustawieniach: lista kluczy z zapytania, a dodanie i usunięcie odświeżają listę. Zmiana, która się nie uda, pokazuje komunikat po polsku, a anulowanie nie pokazuje nic.
 * EN: The hook of the passkey section in the settings: the list of keys from a query, and adding and deleting refresh the list. A change that fails shows a message in Polish, and a cancellation shows nothing.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/profile/passkeyApi.ts::addPasskey
 * @uses src/features/profile/passkeyApi.ts::listPasskeys
 * @uses src/features/profile/passkeyApi.ts::deletePasskey
 * @used_by src/features/profile/PasskeySection.tsx::PasskeySection
 */
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addPasskey, deletePasskey, listPasskeys, type PasskeyOutcome } from './passkeyApi';

/** PL: Klucz zapytania o listę kluczy. EN: The query key for the list of keys. */
export const PASSKEYS_QUERY_KEY = ['profile', 'passkeys'] as const;

/**
 * PL: Stan sekcji kluczy: lista, ładowanie, błąd listy, komunikat zmiany i akcje.
 * EN: The state of the keys section: the list, loading, a list error, a change message and the actions.
 *
 * @returns PL: dane i akcje sekcji. EN: the section's data and actions.
 */
export function usePasskeys() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: PASSKEYS_QUERY_KEY, queryFn: listPasskeys });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /**
   * PL: Wykonuje zmianę. Przy błędzie pokazuje komunikat, a przy sukcesie odświeża listę.
   * EN: Runs a change. On error it shows the message, and on success it refreshes the list.
   *
   * @param action - PL: zmiana do wykonania. EN: the change to run.
   */
  async function change(action: () => Promise<PasskeyOutcome>): Promise<void> {
    setBusy(true);
    setMessage(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: PASSKEYS_QUERY_KEY });
  }

  const outcome = query.data;
  return {
    loading: query.isPending,
    items: outcome?.ok ? outcome.value : [],
    listError: outcome && !outcome.ok ? outcome.message : null,
    message,
    busy,
    add: () => change(addPasskey),
    remove: (id: string) => change(() => deletePasskey(id)),
  };
}
