## Changelog

### Dodane

- Krok „Ktoś już to zgłosił?” między miejscem a opisem: lista otwartych zgłoszeń tej samej kategorii i miejsca, bez zamkniętych (załatwionych) i bez własnych. Uczeń może dołączyć „Mnie też” zamiast wysyłać duplikat albo przejść dalej i wysłać nowe zgłoszenie („Wyślę nowe zgłoszenie”).
- Jeden głos na ucznia: dołączenie zapisuje się w tabeli `report_joins` z kluczem złożonym (zgłoszenie, uczeń), więc kolejne kliknięcie nic nie dodaje. Licznik „Liczba „Mnie też”” jest widoczny na każdej karcie; po dołączeniu przycisk pokazuje „Dołączyłeś”.
- Anonimowość: lista nie pokazuje autora zgłoszenia ani tego, kto dołączył. Odpowiedź serwera nie zawiera numerów uczniów.
- Gdy listy nie ma do pokazania (pusta lista, błąd, brak sieci), uczeń od razu przechodzi do opisu; błąd listy nie blokuje wysyłania.
- Serwer: `GET /api/reports/student/similar` (kategoria i miejsce, inaczej `400`) oraz `POST /api/reports/student/:id/join` (nieznane albo załatwione zgłoszenie `404`, własne `409`, dołączenie `200` z licznikiem).
- Usuwanie konta: dołączenia ucznia znikają razem z kontem, dołączenia do cudzych zgłoszeń zostają.
- Schemat: tabela `report_joins` w `worker/db/schema/reports.ts`. Repo nie ma katalogu migracji, więc tabela powstaje z schematu przy `npm run db:reset`; dane testowe mają dwa dołączenia w `REPORT_JOINS_SEED`.
- Testy Vitest serwera (lista podobnych, dołączanie, kasowanie danych) i e2e w `e2e/reports-student.spec.ts` (krok podobnych, licznik, dołączenie, pusta lista, błąd listy, 320 px).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 4a: „Mnie też to dotyczy” (gałąź `feat/4a-mnie-tez`) | Dodaj krok z listą otwartych podobnych zgłoszeń przed wysłaniem, dołączanie „Mnie też” z jednym głosem na ucznia, anonimowość, usuwanie danych przy koncie i testy Vitest oraz e2e. | Dodało tabelę `report_joins` (`worker/db/schema/reports.ts`, dane w `worker/db/seed/reports.ts`), serwer listy i dołączania (`worker/reports/student/similarReports.ts`, `joinReport.ts`, trasy w `routes.ts`, kasowanie w `deleteStudentData.ts`), krok `SimilarReports.tsx` w `ReportForm.tsx`, hooki i API w `queries.ts` oraz `api.ts`, style `rs-similar-*`, testy serwera i rozszerzony `e2e/reports-student.spec.ts`. | do uzupełnienia | Szymon Sosnowski |
