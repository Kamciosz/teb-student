## Changelog

### Dodane

- Logowanie kodem ze szkolnej poczty (`@teb.edu.pl`): uczeń wpisuje adres, dostaje sześciocyfrowy kod ważny 10 minut, wpisuje go i ma sesję zapisaną w bazie D1. Wylogowanie kasuje sesję.
- Ekrany 1.1 i 1.2 (adres i kod) pod adresem `/auth/email`, z komunikatami błędów i ponowną wysyłką kodu.
- Tabele Better Auth (`user`, `session`, `account`, `verification`) w `worker/db/schema/auth.ts`.
- Dla innych podtorów: `requireStudent` po stronie serwera i `useAuthSession` w telefonie.
- Kasowanie konta, sesji i oczekującego kodu ucznia w `deleteAuthStudentData`.

### Zmienione

- Kod logowania jest na razie drukowany w terminalu serwera deweloperskiego. W zbudowanym Workerze nadawca kodu nie powstaje, a serwer odpowiada 503. Prawdziwe maile dojdą po założeniu konta Cloudflare.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | #14, logowanie kodem z maila (podtor 1a) | Cienka ścieżka: adres szkolny, kod, sesja w D1, wylogowanie, z testami | Napisało `worker/auth/email/`, `src/features/auth/email/`, tabele w `worker/db/schema/auth.ts`, dane w `worker/db/seed/auth.ts`, testy Vitest i `e2e/auth-email.spec.ts` | do uzupełnienia | do uzupełnienia |
