## Changelog

### Dodane

- Logowanie kluczem dostępu (passkey) obok kodu z maila, na instancji `/api/auth/email`. Logowanie kodem z maila nie zmienia się. Pakiet `@better-auth/passkey` w wersji 1.7.7 (dokładna wersja).
- Trasy pod `/api/auth/email/passkey/`: `GET generate-register-options` (wymaga sesji), `POST verify-registration` (wymaga sesji), `GET generate-authenticate-options`, `POST verify-authentication` (zakłada zwykłą sesję), `GET list-user-passkeys`, `POST delete-passkey` (tylko własne klucze). Trasy aktualizacji nazwy klucza nie są wystawione.
- Tabela `passkey` w `worker/db/schema/auth.ts`, z kluczem obcym do `user` i kasowaniem kaskadowym.
- Kasowanie konta usuwa klucze ucznia. Test sprawdza, że klucze drugiego ucznia zostają.
- Eksport RODO: `listPasskeysForExport` (w `worker/auth/index.ts`) podaje liczbę kluczy i ich nazwy, bez kluczy kryptograficznych. Podpięcie w `worker/profile/exportData.ts` należy do podtoru 7.
- `rpID` i `origin` są wyliczane z `BETTER_AUTH_URL`. Produkcja musi mieć tę zmienną ustawioną.
- Testy Vitest: rejestracja bez sesji daje 401, tabela `passkey` istnieje w bazie testów, eksport i kasowanie konta.
- ADR 0006 `docs/adr/0006-logowanie-kluczem-dostepu.md`.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | build/auth-passkey: logowanie kluczem dostępu | Dodaj opcjonalne logowanie kluczem dostępu obok kodu z maila: rejestracja tylko z sesją, kasowanie konta usuwa klucze, eksport RODO tylko liczba i nazwy; z testami i ADR. | Dodało wtyczkę passkey w `worker/auth/email/createAuth.ts` i `runtimeAuth.ts`, trasy w `worker/auth/email/routes.ts`, tabelę w `worker/db/schema/auth.ts`, `worker/auth/email/passkeys.ts`, testy `worker/auth/email/passkeys.test.ts`, ADR 0006 i ten plik. | do uzupełnienia | do uzupełnienia |
