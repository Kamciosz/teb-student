/**
 * PL: Test wysyłania zgłoszenia z numerem zdjęcia. Sprawdza, że photoId trafia do treści JSON, a gdy zdjęcia nie ma, klucz w ogóle nie jest wysyłany. Fetch jest podmieniony, więc test nie łączy się z serwerem.
 * EN: Test of sending a report with a photo id. Checks that photoId goes into the JSON body, and when there is no photo the key is not sent at all. Fetch is replaced, so the test does not reach the server.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/reports/student/api.ts::sendReport
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { afterEach, describe, expect, it, vi } from 'vitest';
// PL: Funkcja, którą sprawdzamy, i typ danych zgłoszenia.
// EN: The function under test and the report data type.
import { sendReport, type NewReport } from './api';

/** PL: Dane zgłoszenia bez zdjęcia. EN: The report data without a photo. */
const BASE: NewReport = {
  category: 'cleanliness',
  place: 'corridor',
  placeDetail: '',
  description: 'Brudna podłoga',
  isAnonymous: true,
};

/**
 * PL: Podmienia fetch i zwraca listę treści wysłanych w kolejnych wywołaniach.
 * EN: Replaces fetch and returns the list of bodies sent in the calls.
 *
 * @returns PL: tablica treści (tekst JSON). EN: the array of bodies (JSON text).
 */
function stubFetch(): string[] {
  const bodies: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      bodies.push(String(init?.body));
      return new Response(JSON.stringify({ id: 'r1' }), { status: 201, headers: { 'content-type': 'application/json' } });
    }),
  );
  return bodies;
}

describe('sendReport: zdjęcie', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('wysyła photoId w treści, gdy uczeń dołączył zdjęcie', async () => {
    const bodies = stubFetch();

    await sendReport({ ...BASE, photoId: 'abc_DEF-123' });

    expect(JSON.parse(bodies[0])).toMatchObject({ photoId: 'abc_DEF-123', description: 'Brudna podłoga' });
  });

  it('nie wysyła klucza photoId, gdy zdjęcia nie ma', async () => {
    const bodies = stubFetch();

    await sendReport({ ...BASE, photoId: undefined });

    expect(JSON.parse(bodies[0])).not.toHaveProperty('photoId');
  });
});
