/**
 * PL: Test ustawień serwera logowania kodem poza dev: bez BETTER_AUTH_URL serwer odmawia, a router odpowiada 503 (brak konfiguracji), tak jak przy braku sekretu.
 * EN: A test of the code sign-in server settings outside dev: without BETTER_AUTH_URL the server refuses, and the router answers 503 (missing configuration), as it does without the secret.
 *
 * @author Szymon
 * @since 2026-10-31
 * @uses worker/auth/email/runtimeAuth.ts::pickAppUrl
 * @used_by vitest.config.ts::include
 */

// PL: Typ środowiska Workera i wybór adresu aplikacji.
// EN: The Worker environment type and the app address picker.
import type { Env } from '../../shared';
import { describe, expect, it } from 'vitest';
import { AuthNotConfiguredError, pickAppUrl } from './runtimeAuth';

// PL: Grupa testów adresu aplikacji. Tryb przekazujemy jako parametr (false = produkcja), bo mock modułu nie działa w środowisku Workera.
// EN: A group of tests for the app address. The mode is passed as a parameter (false = production), because a module mock does not work in the Worker environment.
describe('BETTER_AUTH_URL poza dev / BETTER_AUTH_URL outside dev', () => {
  // PL: Sekret jest, adresu brak: serwer ma odmówić, zamiast zgadywać adres (localhost), którego w produkcji nie ma.
  // EN: The address is missing: the server must refuse instead of guessing an address (localhost), which production does not have.
  it('rzuca błąd ustawień zamiast zgadywać adres / throws a settings error instead of guessing the address', () => {
    const settings = { BETTER_AUTH_SECRET: 'sekret-testowy-sekret-testowy-00000' } as unknown as Env;
    expect(() => pickAppUrl(settings, false)).toThrow(AuthNotConfiguredError);
  });

  // PL: Adres jest ustawiony, więc zwracamy go bez zmian.
  // EN: The address is set, so it is returned unchanged.
  it('zwraca adres z BETTER_AUTH_URL / returns the address from BETTER_AUTH_URL', () => {
    const settings = { BETTER_AUTH_URL: 'https://uczen.example.pl' } as unknown as Env;
    expect(pickAppUrl(settings, false)).toBe('https://uczen.example.pl');
  });
});
