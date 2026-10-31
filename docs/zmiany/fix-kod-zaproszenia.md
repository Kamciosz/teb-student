## Changelog

### Poprawione

- Nieudana rejestracja nie zużywa kodu zaproszenia: gdy dwie rejestracje naraz biorą ten sam login, przegrana dostaje z powrotem swój kod.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | Kod zaproszenia po nieudanej rejestracji (gałąź fix/kod-zaproszenia) | Nieudana rejestracja nie może zużyć kodu zaproszenia: dodać hak po rejestracji, który oddaje kod, gdy Better Auth zwróci błąd. | Dodano hak „after” i przekazywanie zużycia kodu z haka „before” w worker/auth/invite/createInviteAuth.ts. Dodano test współbieżnej przegranej rejestracji i liczenie kont w teście dwóch rejestracji w worker/auth/invite/routes.test.ts. Zaktualizowano komentarze PL/EN. Dodano ten plik. | do uzupełnienia | do uzupełnienia |
