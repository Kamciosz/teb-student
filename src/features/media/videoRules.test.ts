/**
 * PL: Testy reguł filmu: limit rozmiaru i długości, polskie komunikaty oraz kolejność, w której rozmiar sprawdzamy przed odczytem długości.
 * EN: Tests of the video rules: the size and length limits, the Polish messages, and the order in which the size is checked before reading the length.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/videoRules.ts::checkVideoSize
 * @uses src/features/media/videoRules.ts::checkVideoDuration
 * @uses src/features/media/videoRules.ts::checkVideoFile
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it, vi } from 'vitest';
// PL: Reguły filmu, które sprawdzamy.
// EN: The video rules under test.
import { checkVideoDuration, checkVideoFile, checkVideoSize, VIDEO_MAX_BYTES } from './videoRules';

// PL: Grupa testów rozmiaru filmu.
// EN: A group of tests for the video size.
describe('checkVideoSize', () => {
  // PL: Film do 50 MB przechodzi, a odrobinę większy dostaje polski komunikat.
  // EN: A video up to 50 MB passes, and one slightly larger gets a Polish message.
  it('przepuszcza 50 MB i odrzuca więcej / passes 50 MB and rejects more', () => {
    expect(checkVideoSize(VIDEO_MAX_BYTES)).toEqual({ ok: true });
    const result = checkVideoSize(VIDEO_MAX_BYTES + 1);
    expect(result).toEqual({ ok: false, message: 'Film jest za duży. Można wysłać najwyżej 50 MB.' });
  });
});

// PL: Grupa testów długości filmu.
// EN: A group of tests for the video length.
describe('checkVideoDuration', () => {
  // PL: Do 30 sekund przechodzi, powyżej odrzucamy po polsku.
  // EN: Up to 30 seconds passes, above it we reject in Polish.
  it('przepuszcza 30 s i odrzuca dłuższy film / passes 30 s and rejects a longer video', () => {
    expect(checkVideoDuration(30)).toEqual({ ok: true });
    expect(checkVideoDuration(30.5)).toEqual({ ok: false, message: 'Film jest za długi. Może mieć najwyżej 30 sekund.' });
  });

  // PL: Gdy długości nie da się odczytać, film jest odrzucany.
  // EN: When the length cannot be read, the video is rejected.
  it('odrzuca film bez odczytanej długości / rejects a video whose length is unknown', () => {
    expect(checkVideoDuration(null)).toEqual({ ok: false, message: 'Nie udało się odczytać filmu. Spróbuj inny plik.' });
  });
});

// PL: Grupa testów kolejności sprawdzania.
// EN: A group of tests for the order of the checks.
describe('checkVideoFile', () => {
  // PL: Za duży film jest odrzucany bez odczytu długości.
  // EN: An oversized video is rejected without reading the length.
  it('za duży film nie trafia do odczytu długości / an oversized video never reaches the length read', async () => {
    const readDuration = vi.fn(async () => 10);
    const result = await checkVideoFile({ size: VIDEO_MAX_BYTES + 1 }, readDuration);
    expect(result.ok).toBe(false);
    expect(readDuration).not.toHaveBeenCalled();
  });

  // PL: Film w limicie rozmiaru jest sprawdzany pod kątem długości.
  // EN: A video within the size limit is checked for length.
  it('mieszczący się w limicie film sprawdza długość / a video within the size limit has its length checked', async () => {
    const readDuration = vi.fn(async () => 45);
    const result = await checkVideoFile({ size: 1024 }, readDuration);
    expect(readDuration).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
  });
});
