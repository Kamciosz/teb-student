/**
 * PL: Testy mapowania kodów odpowiedzi przy publikacji szkicu (api.ts::publishEntry): sukces, „już opublikowany”, wpis w korekcie i błędy.
 * EN: Tests of mapping response codes when publishing a draft (api.ts::publishEntry): success, "already published", an entry in review and errors.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/admin/api.ts::publishEntry
 * @uses src/features/news/admin/api.ts::EntryInReviewError
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { EntryInReviewError, publishEntry } from './api';

/**
 * PL: Podstawia fetch, który zwraca odpowiedź o podanym statusie i ciele.
 * EN: Stubs fetch to return a response with the given status and body.
 *
 * @param status - PL: kod odpowiedzi. EN: the response code.
 * @param body - PL: ciało odpowiedzi (JSON) albo brak. EN: the response body (JSON), or none.
 */
function stubFetch(status: number, body?: string): void {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(body ?? null, { status })));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('publishEntry', () => {
  it('200 kończy się sukcesem', async () => {
    stubFetch(200, '{}');
    await expect(publishEntry('e-szkic')).resolves.toBeUndefined();
  });

  it('409 already_published nie jest błędem', async () => {
    stubFetch(409, '{"error":"already_published"}');
    await expect(publishEntry('e-szkic')).resolves.toBeUndefined();
  });

  it('409 in_review rzuca EntryInReviewError', async () => {
    stubFetch(409, '{"error":"in_review"}');
    await expect(publishEntry('e-szkic')).rejects.toBeInstanceOf(EntryInReviewError);
  });

  it('409 bez ciała nie jest błędem, jak dotąd', async () => {
    stubFetch(409);
    await expect(publishEntry('e-szkic')).resolves.toBeUndefined();
  });

  it('409 z ciałem, którego nie da się odczytać, nie jest błędem', async () => {
    stubFetch(409, 'to nie jest JSON');
    await expect(publishEntry('e-szkic')).resolves.toBeUndefined();
  });

  it('503 rzuca zwykły błąd z kodem, nie EntryInReviewError', async () => {
    stubFetch(503, '{"error":"unavailable"}');
    const error = await publishEntry('e-szkic').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(EntryInReviewError);
    expect((error as Error).message).toBe('HTTP 503');
  });

  it('błąd sieci przechodzi dalej', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    await expect(publishEntry('e-szkic')).rejects.toBeInstanceOf(TypeError);
  });
});
