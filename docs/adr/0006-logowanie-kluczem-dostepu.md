# ADR 0006: logowanie kluczem dostępu (passkey)

- **Data:** 14.10.2026
- **Status:** do zatwierdzenia przez Bohdana
- **Autor:** Szymon (propozycja)

## Kontekst

Uczeń loguje się kodem z maila (podtor 1a). Chcemy, żeby mógł też wejść kluczem dostępu (WebAuthn) ze swojego telefonu albo komputera, bez czekania na maila. Logowanie kodem z maila zostaje bez zmian i nadal jest jedyną drogą, która zakłada konto.

## Rozważane opcje

1. Własna implementacja WebAuthn w Workerze. Dużo kodu kryptograficznego do utrzymania, a błąd w weryfikacji podpisu łatwo przeoczyć.
2. Wtyczka `passkey` z Better Auth w pakiecie `@better-auth/passkey` w wersji 1.7.7. Wtyczki nie ma w `better-auth/plugins` w wersji 1.7.7, więc to osobny pakiet.
3. Brak logowania kluczem. Zostaje sam kod z maila.

## Decyzja

Opcja 2. Wtyczka działa na instancji `/api/auth/email`, czyli na tej samej bazie i z tym samym sekretem co kod z maila. Rejestracja klucza wymaga sesji (bez niej odpowiedź 401). Logowanie kluczem tworzy zwykłą sesję, taką samą jak po kodzie. Identyfikator RP (`rpID`) i `origin` są wyliczane z `BETTER_AUTH_URL`, nigdy nie są wpisane na sztywno. Instancja `/api/auth/invite` (login i hasło) nie zmienia się. Kasowanie konta usuwa klucze ucznia.

## Konsekwencje

- Klucze leżą w tabeli `passkey` z kluczem obcym do `user` i kasowaniem kaskadowym.
- Eksport RODO (podtor 7) dostaje tylko liczbę i nazwy kluczy (`listPasskeysForExport`), bez kluczy kryptograficznych.
- Produkcja musi mieć ustawione `BETTER_AUTH_URL`. Bez tego wtyczka przyjmie `localhost` i klucze nie będą działać.
- Rejestracja wymaga świeżej sesji (domyślnie do 24 godzin, `freshAge` w Better Auth). Starszą sesją nie da się dodać klucza; uczeń loguje się wtedy ponownie kodem.
- Pakiet `@better-auth/passkey` 1.7.7 wymaga innej wersji `@better-auth/utils` niż ta, której używa reszta Better Auth. Zwykłe `npm install` kończy się błędem ERESOLVE, a `npm ci` na zatwierdzonym pliku blokady przechodzi. Instalacja z `--legacy-peer-deps` jest więc potrzebna. Nie dodajemy wpisu `overrides` ani zmiany w `.npmrc`: wymusiłyby wersję `@better-auth/utils`, z którą te pakiety nie zostały wydane, a to wykracza poza ten zakres. Decyzja o zależności należy do zespołu.
- Ekran rejestracji i logowania kluczem robi front-end. Testy w CI nie sprawdzają podpisu WebAuthn, bo nie ma urządzenia.
