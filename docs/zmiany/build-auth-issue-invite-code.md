## Changelog

### Zmienione

- Bez zmian dla użytkownika. Drzwi modułu `worker/auth/index.ts` wystawiają `issueInviteCode(env.DB)` z podtoru 1b, żeby panel Samorządu (podtor 8, #26) mógł wydawać kody zaproszeń, importując tylko z `worker/auth`.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-12 | #26, podtor 1b: eksport `issueInviteCode` | Wystaw `issueInviteCode` w `worker/auth/index.ts` z komentarzem PL/EN i `@uses`. | Dodało eksport i komentarz w `worker/auth/index.ts`, `@used_by` w `worker/auth/invite/index.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
