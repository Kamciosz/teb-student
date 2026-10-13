/**
 * PL: Testy godziny zaplanowanej publikacji na serwerze. Dowodzą, że godzina w przeszłości jest odrzucana, godzina dalej niż 30 dni też, a pusta wartość daje publikację od razu. Oblewają, gdy ktoś usunie któreś z tych sprawdzeń albo zacznie przyjmować datę przy szkicu.
 * EN: Tests of the scheduled publication time on the server. They prove that a time in the past is rejected, a time more than 30 days ahead is rejected too, and an empty value gives an immediate publication. They fail when someone removes one of these checks or starts accepting a date for a draft.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/news/editor/validatePublishAt.ts::validatePublishAt
 * @uses worker/news/editor/validateEntry.ts::validateEntry
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
import { MAX_PUBLISH_AHEAD_MS, validatePublishAt } from './validatePublishAt';
import { validateEntry } from './validateEntry';

// PL: Stała chwila „teraz”, żeby testy nie zależały od zegara.
// EN: A fixed "now", so the tests do not depend on the clock.
const NOW = Date.UTC(2026, 9, 13, 10, 0, 0);
const HOUR = 60 * 60 * 1000;

describe('validatePublishAt: godzina publikacji / publication time', () => {
  it('pusta wartość daje publikację od razu / an empty value gives an immediate publication', () => {
    expect(validatePublishAt(undefined, 'published', NOW)).toEqual({ ok: true, publishAt: null });
    expect(validatePublishAt(null, 'published', NOW)).toEqual({ ok: true, publishAt: null });
  });

  it('godzina w przeszłości jest odrzucana / a time in the past is rejected', () => {
    expect(validatePublishAt(NOW - HOUR, 'published', NOW)).toEqual({ ok: false, reason: 'publish_past' });
    // PL: Dokładnie „teraz” też jest już przeszłością.
    // EN: Exactly "now" is already the past too.
    expect(validatePublishAt(NOW, 'published', NOW)).toEqual({ ok: false, reason: 'publish_past' });
  });

  it('godzina dalej niż 30 dni jest odrzucana / a time more than 30 days ahead is rejected', () => {
    expect(validatePublishAt(NOW + MAX_PUBLISH_AHEAD_MS + 1, 'published', NOW)).toEqual({ ok: false, reason: 'publish_too_far' });
  });

  it('dokładnie 30 dni i godzina w przyszłości są przyjmowane / exactly 30 days and a time in the future are accepted', () => {
    expect(validatePublishAt(NOW + MAX_PUBLISH_AHEAD_MS, 'published', NOW)).toEqual({ ok: true, publishAt: new Date(NOW + MAX_PUBLISH_AHEAD_MS) });
    expect(validatePublishAt(NOW + HOUR, 'published', NOW)).toEqual({ ok: true, publishAt: new Date(NOW + HOUR) });
  });

  it('wartość inna niż liczba całkowita jest odrzucana / a value that is not a whole number is rejected', () => {
    expect(validatePublishAt('2026-10-14', 'published', NOW)).toEqual({ ok: false, reason: 'bad_publish_at' });
    expect(validatePublishAt(NOW + 0.5, 'published', NOW)).toEqual({ ok: false, reason: 'bad_publish_at' });
  });

  it('szkic nie przyjmuje godziny publikacji / a draft does not take a publication time', () => {
    expect(validatePublishAt(NOW + HOUR, 'draft', NOW)).toEqual({ ok: false, reason: 'bad_publish_at' });
    expect(validatePublishAt(null, 'draft', NOW)).toEqual({ ok: true, publishAt: null });
  });
});

describe('validateEntry: godzina publikacji w całym wpisie / publication time in the whole entry', () => {
  const entry = { type: 'news', title: 'Turniej', body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Treść' }] }] } };

  it('zaplanowany wpis przechodzi z godziną / a scheduled entry passes with its time', () => {
    const result = validateEntry({ ...entry, status: 'published', publishAt: NOW + HOUR }, NOW);
    expect(result).toMatchObject({ ok: true, entry: { publishAt: new Date(NOW + HOUR) } });
  });

  it('wpis bez godziny jest publikowany od razu / an entry without a time is published at once', () => {
    const result = validateEntry({ ...entry, status: 'published' }, NOW);
    expect(result).toMatchObject({ ok: true, entry: { publishAt: null } });
  });

  it('przeszła godzina daje powód publish_past / a past time gives the publish_past reason', () => {
    expect(validateEntry({ ...entry, status: 'published', publishAt: NOW - HOUR }, NOW)).toEqual({ ok: false, reason: 'publish_past' });
  });
});
