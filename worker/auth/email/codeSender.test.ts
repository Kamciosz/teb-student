/**
 * PL: Testy nadawcy kodu: kod jest drukowany tylko w dev, a poza dev nadawca w ogóle nie powstaje.
 * EN: Tests of the code sender: the code is printed in dev only, and outside dev the sender is not created at all.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/codeSender.ts::createCodeSender
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { createCodeSender, isDevRuntime } from './codeSender';

// PL: Grupa testów nadawcy kodu.
// EN: A group of code sender tests.
describe('createCodeSender', () => {
  // PL: Poza dev nadawcy nie ma, więc nic nie może wydrukować kodu.
  // EN: Outside dev there is no sender, so nothing can print a code.
  it('poza dev nie tworzy nadawcy / creates no sender outside dev', () => {
    const printed: string[] = [];
    const sender = createCodeSender({ isDev: false, print: (line) => printed.push(line) });
    expect(sender).toBeNull();
    expect(printed).toEqual([]);
  });

  // PL: W dev kod trafia do terminala razem z adresem.
  // EN: In dev the code goes to the terminal together with the address.
  it('w dev drukuje kod z adresem / prints the code with the address in dev', async () => {
    const printed: string[] = [];
    const sender = createCodeSender({ isDev: true, print: (line) => printed.push(line) });
    await sender?.({ email: 'jan.test@teb.edu.pl', code: '123456' });
    expect(printed).toEqual(['[auth/email] Kod logowania dla jan.test@teb.edu.pl: 123456']);
  });
});

// PL: Grupa testów rozpoznania środowiska.
// EN: A group of environment detection tests.
describe('isDevRuntime', () => {
  // PL: Vitest działa w trybie dev, więc Vite musi podstawić prawdę. Zapis literalny jest wtedy poprawny.
  // EN: Vitest runs in dev mode, so Vite must substitute true. The literal form is then correct.
  it('w testach zwraca prawdę / returns true in tests', () => {
    expect(isDevRuntime()).toBe(true);
  });
});
