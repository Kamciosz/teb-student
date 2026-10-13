## Changelog

### Dodane

- Funkcja `recordDiaryEntry` wystawiona w drzwiach modułu admin (`worker/admin/index.ts`, implementacja w `worker/admin/diary.ts`). Trasy innych modułów zapisują wpis dziennika wyłącznie przez te drzwi, a nie przez wewnętrzne pliki admina.
- Nowe działania dziennika w `worker/db/schema/admin.ts`: `news_published`, `news_deleted`, `report_stage_changed`. Enum jest ograniczeniem tylko w TypeScript (bez `CHECK` w SQL), więc nowe działania nie wymagają migracji.
- Wpis przy publikacji wpisu w Samorządzie (`POST /:id/publish` w `worker/news/admin/routes.ts`), przy usunięciu wpisu (`DELETE /:id`) i przy zmianie etapu zgłoszenia (`PATCH /:id` w `worker/reports/admin/routes.ts`).
- Nazwy nowych działań w `ACTION_NAMES` na ekranie „Dziennik zmian” (`src/features/admin/DiaryScreen.tsx`), oznaczone `TO_AGREE` do uzgodnienia z Samorządem. Typ `DiaryAction` po stronie klienta (`src/features/admin/api.ts`) rozszerzony o te same działania.

### Zmienione

- Wpis dziennika zapisywany jest tylko przy realnej zmianie. Przy publikacji i usunięciu nieudana operacja (404, 409) nic nie dopisuje. Przy zmianie etapu ten sam etap, błąd walidacji i brak zgłoszenia też nic nie dopisują.
- W dzienniku zapisywany jest wyłącznie identyfikator celu (id wpisu albo id zgłoszenia). Treść wpisu i treść zgłoszenia nie trafiają do dziennika.
- Testy: `worker/news/admin/routes.test.ts` i `worker/reports/admin/routes.test.ts` sprawdzają, że każda udana trasa dopisuje dokładnie jeden wpis z właściwym działaniem, aktorem i celem, a każda nieudana nie dopisuje nic. `worker/reports/admin/testDatabase.ts` czyści także tabelę dziennika przed każdym testem.

### Nie zmieniono (do decyzji przed wdrożeniem)

- Operacja i zapis wpisu to dwa osobne zapytania do D1, bez wspólnej transakcji. Jeśli zmiana się uda, a zapis wpisu nie, odpowiedź to 500, mimo że dane już się zmieniły.
- Tabela `diary_entries` musi być wdrożona na produkcji razem z PR #134, zanim wypuści się tę zmianę.
- Teksty `ACTION_NAMES` dla nowych działań czekają na uzgodnienie z Samorządem.
- Pytanie o RODO (czy wpisy mają znikać razem z kontem) pozostaje otwarte, zgodnie z PR #134.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Rozbudowa fali 1, dziennik zmian (część 2, wpisy przy publikacji, usunięciu i zmianie etapu, podtor 8) | Dodaj wpisy dziennika przy publikacji i usunięciu wpisu w Samorządzie oraz przy zmianie etapu zgłoszenia, przez jedną funkcję w drzwiach modułu admin. Nie zmieniaj ekranów poza nazwami działań. Dodaj testy, że każda trasa dopisuje dokładnie jeden wpis. | Zmieniło `worker/admin/index.ts`, `worker/db/schema/admin.ts`, `worker/news/admin/routes.ts` i `routes.test.ts`, `worker/reports/admin/routes.ts`, `routes.test.ts` i `testDatabase.ts`, `src/features/admin/api.ts`, `src/features/admin/DiaryScreen.tsx` oraz ten plik. | do uzupełnienia | do uzupełnienia |
