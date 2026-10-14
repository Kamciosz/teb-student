## Changelog

### Dodane

- Znacznik „Zaplanowany na D.MM, HH:mm” przy opublikowanym wpisie w panelu Samorządu (`/news/admin`), gdy chwila startu (`publishAt`) jest w przyszłości. Godzina idzie w strefie Europe/Warsaw, więc przy zmianie czasu (25.10.2026) pokazuje się czas polski, a nie UTC.
- Serwer pod `/api/news/admin` zwraca w liście pole `publishAt` (ISO albo `null`). Schemat bazy bez zmian.
- Logika znacznika w `src/features/news/admin/schedule.ts`: funkcje dostają „teraz” jako parametr, więc testy nie zależą od zegaru ani strefy komputera.

### Uwaga

- Teksty znacznika („Zaplanowany na …”) są w grupie `TO_AGREE` w `texts.ts`, bo EKRANY.md nie ma ekranu listy wpisów. Do uzgodnienia z zespołem.
- Format daty w znaczniku to „D.MM” jak w zadaniu: „5.03, 08:30” (dzień bez zera, miesiąc z zerem). Kafel już pokazuje datę publikacji jako „9.10” (miesiąc bez zera). Oba formaty są spójne tylko po decyzji zespołu, którą wybrać.
- Wpis z chwilą startu w przeszłości nie dostaje znacznika, bo jest już widoczny dla uczniów. Szkic z przyszłą chwilą też go nie dostaje, bo szkic nie jest publikowany.
- Znacznik nie zmienia listy ucznia (podtor 3a) ani sortowania panelu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | 3c, znacznik zaplanowanych wpisów (draft, część #122) | Podtor 3c: na liście panelu opublikowany wpis z `publishAt` w przyszłości ma znacznik „Zaplanowany na D.MM, HH:mm” w Europe/Warsaw; testy Vitest (DST, strefa, udawany zegar) i e2e. | Dodało pole `publishAt` do listy w `worker/news/admin/queries.ts` i testu w `routes.test.ts`, pole w typie `PanelEntry` w `api.ts`, tekst `TO_AGREE.scheduled` w `texts.ts`, funkcje `formatScheduled`, `isScheduled`, `scheduledLabel` w nowym `schedule.ts`, znacznik w `EntryTile.tsx`, testy w `schedule.test.ts` i `EntryTile.test.tsx`, przypadek w `e2e/news-admin.spec.ts` oraz ten plik. | — | do uzupełnienia |
