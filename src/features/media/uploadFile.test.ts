/**
 * PL: Testy komunikatów błędów wysyłki: każdy kod odpowiedzi serwera ma zrozumiały polski tekst, a nieznany kod dostaje ogólny komunikat.
 * EN: Tests of the upload error messages: every server response code has a clear Polish text, and an unknown code gets a general message.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/uploadFile.ts::uploadErrorMessage
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { uploadErrorMessage } from './uploadFile';

// PL: Grupa testów komunikatów dla kodów odpowiedzi.
// EN: A group of tests for the messages of the response codes.
describe('uploadErrorMessage', () => {
  // PL: Znane kody mają własne polskie komunikaty.
  // EN: Known codes have their own Polish messages.
  it('podaje polski komunikat dla każdego znanego kodu / gives a Polish message for each known code', () => {
    expect(uploadErrorMessage(401)).toBe('Zaloguj się, aby wysłać plik.');
    expect(uploadErrorMessage(403)).toBe('Nie masz uprawnień do wysyłania zdjęć i filmów.');
    expect(uploadErrorMessage(413)).toBe('Plik jest za duży.');
    expect(uploadErrorMessage(415)).toBe('Ten typ pliku nie jest obsługiwany.');
  });

  // PL: Nieznany kod (np. 500) dostaje ogólny komunikat z możliwością ponowienia.
  // EN: An unknown code (e.g. 500) gets a general message with a chance to retry.
  it('nieznany kod daje ogólny komunikat / an unknown code gives a general message', () => {
    expect(uploadErrorMessage(500)).toBe('Nie udało się wysłać pliku. Spróbuj ponownie.');
  });
});
