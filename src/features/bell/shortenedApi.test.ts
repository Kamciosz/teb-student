/**
 * PL: Testy rozmowy z serwerem dni skróconych: odczyt listy, zapis (POST) i zdjęcie (DELETE) dnia, a przy odmowie błąd z kodem 403. Sieć jest zastąpiona atrapą fetch.
 * EN: Tests of the talk with the shortened-days server: reading the list, saving (POST) and removing (DELETE) a day, and an error with the 403 code on a refusal. The network is replaced by a fetch stub.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/shortenedApi.ts::fetchShortenedDays
 * @uses src/features/bell/shortenedApi.ts::setShortenedDay
 * @uses src/features/bell/shortenedApi.ts::BellHttpError
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest i atrapy globalne.
// EN: Vitest test functions and global stubs.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BellHttpError, fetchShortenedDays, setShortenedDay } from './shortenedApi';

// PL: Atrapa fetch dla jednego testu: zwraca podaną odpowiedź.
// EN: A fetch stub for one test: returns the given response.
const fetchMock = vi.fn();

beforeEach(() => {
  // PL: Każdy test dostaje świeżą atrapę, żeby wywołania nie mieszały się między testami.
  // EN: Each test gets a fresh stub, so the calls do not mix between tests.
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchShortenedDays', () => {
  it('zwraca listę dni z odpowiedzi', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ dates: ['2026-10-19'] }), { status: 200 }));
    await expect(fetchShortenedDays()).resolves.toEqual({ dates: ['2026-10-19'] });
    expect(fetchMock).toHaveBeenCalledWith('/api/bell/shortened');
  });

  it('przy odpowiedzi 403 rzuca błąd z kodem 403', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 403 }));
    const error = await fetchShortenedDays().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(BellHttpError);
    expect((error as BellHttpError).status).toBe(403);
  });
});

describe('setShortenedDay', () => {
  it('włączenie wysyła POST na adres dnia', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
    await setShortenedDay('2026-10-19', true);
    expect(fetchMock).toHaveBeenCalledWith('/api/bell/shortened/2026-10-19', { method: 'POST' });
  });

  it('wyłączenie wysyła DELETE na adres dnia', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    await setShortenedDay('2026-10-19', false);
    expect(fetchMock).toHaveBeenCalledWith('/api/bell/shortened/2026-10-19', { method: 'DELETE' });
  });

  it('przy odmowie 403 rzuca błąd z kodem 403', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 403 }));
    const error = await setShortenedDay('2026-10-19', true).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(BellHttpError);
    expect((error as BellHttpError).status).toBe(403);
  });
});
