## Changelog

### Zmienione

- Bez zmian dla użytkownika. Drzwi modułu `worker/auth/index.ts` wystawiają `listInviteCodes(env.DB)` z podtoru 1b: lista kodów zaproszeń, które jeszcze działają (niezużyte, niewygasłe), od najkrócej ważnego. Panel Samorządu (podtor 8, #26) pokaże ją na ekranie „Kody zaproszeń”, importując tylko z `worker/auth`. Lista zawiera tylko kody i terminy, bez danych uczniów.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #73, podtor 1b: eksport `listInviteCodes` | Dodaj `listInviteCodes` (niezużyte, niewygasłe, od najkrótszego terminu), wystaw przez `worker/auth/invite/index.ts` i `worker/auth/index.ts`, dodaj test importujący z drzwi modułu. | Dodało funkcję i komentarz w `worker/auth/invite/inviteCodes.ts`, eksport w `worker/auth/invite/index.ts` i `worker/auth/index.ts`, trzy testy w `worker/auth/invite/inviteCodes.test.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
