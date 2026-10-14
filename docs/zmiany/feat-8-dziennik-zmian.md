## Changelog

### Dodane

- Tabela `diary_entries` w `worker/db/schema/admin.ts` (id, kto wykonał działanie, rodzaj działania, opcjonalny cel jako identyfikator ucznia, czas). Nowa tabela trzeba wdrożyć na produkcji przed wypuszczeniem tej zmiany.
- Dziennik zapisuje wpisy przy wydaniu kodu zaproszenia (`POST /invites`), nadaniu i odebraniu roli Samorządu albo redakcji (`PUT /roles/:studentId`, tylko przy realnej zmianie) i pobraniu pliku z pilotażu (`GET /pilot`). Kod zaproszenia nigdy nie trafia do dziennika.
- Endpoint `GET /api/admin/diary?page=N` (`worker/admin/diaryRoutes.ts`): lista od najnowszych, po 50 na stronę, tylko dla Samorządu i administratora (bez sesji 401, bez wystarczającej roli 403).
- Ekran „Dziennik zmian” (`src/features/admin/DiaryScreen.tsx`) pod adresem `/admin/dziennik`, za bramką Samorządu. Wiersz w kaflu części panelu (`src/features/admin/panelView.ts`) widzi Samorząd i administrator.
- Ikona „historia” w `src/features/admin/icons.tsx`.

### Zmienione

- Usunięcie konta (`worker/admin/deleteStudentData.ts`) kasuje w tym samym `db.batch` także wpisy dziennika, w których uczeń jest wykonawcą albo celem. Decyzja, czy wpisy mają znikać razem z kontem, czeka na potwierdzenie.
- Kafel „Panel Samorządu” ma pięć części dla Samorządu (dziennik przed „Role”) i sześć dla administratora.
- Test `e2e/admin.spec.ts`: liczby wierszy kafla zmienione na 5 i 6, nowe przypadki: Samorząd czyta dziennik, redakcja dostaje ekran 6.1d na `/admin/dziennik`.
- Testy w `worker/admin/diary.test.ts` (uczeń 403, wpis przy wydaniu kodu, kolejność, stronicowanie, brak wpisu przy powtórnym zapisie roli) oraz `worker/admin/deleteStudentData.test.ts`.

### Nie zmieniono (kolejny PR)

- Wpisy z wpisów (`wpisy`) i zgłoszeń (`zgłoszenia`) nie są podpięte. Wymaga zmian w `worker/index.ts` i w tych modułach, więc idą osobnym PR.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Rozbudowa fali 1, dziennik zmian (część 1, podtór 8) | Dodaj tabelę dziennika, wpisy z modułu admin (kod, rola, pilotaż), listę od najnowszych dla Samorządu, ekran „Dziennik zmian” i testy. Nie podpinaj wpisów z innych modułów. | Zmieniło `worker/db/schema/admin.ts`, `worker/admin/` (diary, diaryRoutes, routes, roleRoutes, pilotRoutes, deleteStudentData, testSession i testy), `src/features/admin/` (DiaryScreen, AdminScreen, api, queries, panelView, icons i testy), `e2e/admin.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
