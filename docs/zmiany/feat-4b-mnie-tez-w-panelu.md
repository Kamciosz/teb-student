## Changelog

### Dodane

- Panel Samorządu pokazuje, ile osób dołączyło do zgłoszenia przyciskiem „Mnie też”: na kaflu listy i w nagłówku szczegółu, np. „+3 osoby”. Odmiana wg reguł polskich: 1 → „osoba”, 2–4 → „osoby”, 5 i więcej → „osób”. Tekst do uzgodnienia z zespołem.
- Przy zerze dołączeń (albo gdy serwer nie wysłał liczby) nic nie pokazujemy.
- Anonimowość: panel dostaje tylko liczbę. Odpowiedź serwera nie zawiera numerów osób, które dołączyły.
- Serwer: `GET /api/reports/admin` i `GET /api/reports/admin/:id` (oraz odpowiedź `PATCH`) zwracają pole `joinCount`, liczone z tabeli `report_joins` przez `count(userId)` z `leftJoin` i `groupBy`.
- Dane testowe: dołączenia z `REPORT_JOINS_SEED` są czyszczone i wpisywane razem ze zgłoszeniami, a numer ucznia z seedu zamieniany na numer zalogowanego ucznia.
- Testy Vitest: liczby 0, 1, 2 i 5 na prawdziwej bazie, brak numerów osób w odpowiedzi (`worker/reports/admin/joinCount.test.ts`), odmiana i brak danych (`src/features/reports/admin/reportView.test.ts`). E2E w `e2e/reports-admin.spec.ts`: kafel „+3 osoby”, zero bez plusa, szczegół z tą samą liczbą.
- Nie dodano sortowania ani filtra „najwięcej osób”, bo lista w panelu nie ma sortowania.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 4b: „Mnie też” w panelu Samorządu (gałąź `feat/4b-mnie-tez-w-panelu`) | Pokaż w panelu liczbę osób, które dołączyły do zgłoszenia, na liście i w szczególe, z odmianą po polsku i testami Vitest oraz e2e. | Dodało `joinCount` w `worker/reports/admin/reportsAdminRepository.ts`, dane testowe w `worker/reports/admin/testDatabase.ts`, test serwera `joinCount.test.ts`, funkcję `joinText` w `reportView.ts` i jej testy, pole w `api.ts`, napisy w `ReportsList.tsx` i `ReportDetail.tsx`, przypadek w `e2e/reports-admin.spec.ts` oraz ten wpis. | do uzupełnienia | Szymon Sosnowski |
