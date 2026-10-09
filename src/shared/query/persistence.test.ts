/**
 * PL: Test zapisu danych zapytań w telefonie: zapis i odczyt, odrzucenie zapisu o złej wersji (buster) i po czasie ważności, czyszczenie przy wylogowaniu oraz zachowanie bez localStorage. Pamięć jest atrapą w Map, bo testy działają w Workerze, który nie ma localStorage.
 * EN: Test of saving the query data on the phone: save and restore, dropping data of a wrong version (buster) and after its lifetime, clearing on sign-out, and the behaviour without localStorage. The storage is a Map stub, because the tests run in a Worker that has no localStorage.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/query/queryClient.ts::queryClient
 * @uses src/shared/query/persistence.ts::createQueryPersister
 * @uses src/shared/query/clearQueryData.ts::clearQueryData
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Klient zapytań do budowy klientów testowych.
// EN: The query client, to build test clients.
import { QueryClient } from '@tanstack/react-query';
// PL: Zapis i odczyt stanu klienta, tak jak robi to PersistQueryClientProvider.
// EN: Saving and restoring the client state, the way PersistQueryClientProvider does it.
import { persistQueryClientRestore, persistQueryClientSave } from '@tanstack/react-query-persist-client';
// PL: Ustawienia i funkcje pod testem.
// EN: The settings and functions under test.
import { QUERY_CACHE_BUSTER, QUERY_MAX_AGE_MS, QUERY_STORAGE_KEY, queryClient } from './queryClient';
import { createQueryPersister, getBrowserStorage, type QueryStorage } from './persistence';
import { clearQueryData } from './clearQueryData';

// PL: Atrapa localStorage w pamięci.
// EN: An in-memory localStorage stub.
function createStubStorage(): QueryStorage & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
}

// PL: Klient z jednym pobranym zapytaniem.
// EN: A client with one fetched query.
function createFilledClient(): QueryClient {
  const client = new QueryClient();
  client.setQueryData(['news'], [{ id: 1 }]);
  return client;
}

// PL: Zapisuje stan klienta i czeka chwilę, bo zapisujący odkłada zapis do osobnego zadania (throttle).
// EN: Saves the client state and waits a moment, because the persister defers the save to a separate task (throttle).
async function saveClient(client: QueryClient, persister: ReturnType<typeof createQueryPersister>, buster: string): Promise<void> {
  await persistQueryClientSave({ queryClient: client, persister, buster });
  await new Promise((resolve) => setTimeout(resolve, 20));
}

describe('zapis danych zapytań / saving the query data', () => {
  it('odczytuje to, co zapisał / restores what it saved', async () => {
    const persister = createQueryPersister(createStubStorage(), 0);
    await saveClient(createFilledClient(), persister, QUERY_CACHE_BUSTER);

    const fresh = new QueryClient();
    await persistQueryClientRestore({ queryClient: fresh, persister, buster: QUERY_CACHE_BUSTER, maxAge: QUERY_MAX_AGE_MS });

    expect(fresh.getQueryData(['news'])).toEqual([{ id: 1 }]);
  });

  it('odrzuca zapis o innej wersji danych (buster) / drops data saved under another buster', async () => {
    const storage = createStubStorage();
    const persister = createQueryPersister(storage, 0);
    await saveClient(createFilledClient(), persister, 'stara');

    const fresh = new QueryClient();
    await persistQueryClientRestore({ queryClient: fresh, persister, buster: QUERY_CACHE_BUSTER, maxAge: QUERY_MAX_AGE_MS });

    expect(fresh.getQueryData(['news'])).toBeUndefined();
    expect(storage.map.has(QUERY_STORAGE_KEY)).toBe(false);
  });

  it('odrzuca zapis starszy niż czas ważności / drops data older than its lifetime', async () => {
    const persister = createQueryPersister(createStubStorage(), 0);
    await saveClient(createFilledClient(), persister, QUERY_CACHE_BUSTER);

    const fresh = new QueryClient();
    await persistQueryClientRestore({ queryClient: fresh, persister, buster: QUERY_CACHE_BUSTER, maxAge: -1 });

    expect(fresh.getQueryData(['news'])).toBeUndefined();
  });

  it('gcTime klienta nie jest krótszy niż czas zapisu / the client gcTime is not shorter than the saved-data lifetime', () => {
    expect(queryClient.getDefaultOptions().queries?.gcTime).toBeGreaterThanOrEqual(QUERY_MAX_AGE_MS);
  });

  it('bez localStorage nic nie rzuca / nothing throws without localStorage', async () => {
    expect(getBrowserStorage()).toBeUndefined();
    const persister = createQueryPersister();
    await expect(persistQueryClientSave({ queryClient: createFilledClient(), persister })).resolves.toBeUndefined();
  });
});

describe('czyszczenie przy wylogowaniu / clearing on sign-out', () => {
  it('kasuje pamięć zapytań i zapis w localStorage / clears the query cache and the saved copy', async () => {
    const storage = createStubStorage();
    const client = createFilledClient();
    await saveClient(client, createQueryPersister(storage, 0), QUERY_CACHE_BUSTER);
    expect(storage.map.has(QUERY_STORAGE_KEY)).toBe(true);

    clearQueryData(client, storage);

    expect(client.getQueryCache().getAll()).toHaveLength(0);
    expect(storage.map.has(QUERY_STORAGE_KEY)).toBe(false);
  });

  it('nie przerywa, gdy pamięć rzuca błąd / does not stop when the storage throws', () => {
    const broken: QueryStorage = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => {
        throw new Error('zablokowane / blocked');
      },
    };
    const client = createFilledClient();

    expect(() => clearQueryData(client, broken)).not.toThrow();
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });
});
