## Changelog

### Dodane

- Panel Samorządu: lista zgłoszeń ma przełącznik kolejności jako dwa przyciski obok siebie (nie lista rozwijana). Domyślnie „Najnowsze” (jak dotąd, od najnowszego), a „Najwięcej osób” ustawia najpierw zgłoszenia z największą liczbą osób, które dołączyły. Przy remisie wyżej jest nowsze zgłoszenie. Wybór żyje w ekranie i nie zapisuje się na serwerze. Teksty do uzgodnienia z zespołem: „Najnowsze”, „Najwięcej osób”, nazwa grupy „Kolejność”.
- Sortowanie działa w telefonie na pobranej liście, bo lista nie jest stronicowana. Serwer bez zmian.
- Testy Vitest (`src/features/reports/admin/reportView.test.ts`): domyślna kolejność od najnowszego, kolejność po liczbie osób, remis (nowsze wyżej), brak liczby dołączeń jako zero, brak zmiany wejścia.
- E2E w `e2e/reports-admin.spec.ts`: domyślnie wybrane „Najnowsze”, po kliknięciu „Najwięcej osób” zamienia się drugi i trzeci kafel.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 4b: sortowanie listy zgłoszeń w panelu Samorządu (gałąź `feat/4b-sortowanie`, baza `feat/4b-mnie-tez-w-panelu`) | Dodaj przełącznik kolejności listy zgłoszeń jako segmented buttons: „Najnowsze” (domyślnie) i „Najwięcej osób”, z testami Vitest i e2e. Teksty oznacz do uzgodnienia. | Dodało `sortReports` i typ `ReportOrder` w `reportView.ts`, stałe `ORDERS` w `reportLabels.ts`, nowy `SortPicker.tsx`, stan i podpięcie w `ReportsList.tsx`, testy w `reportView.test.ts`, przypadek w `e2e/reports-admin.spec.ts` oraz ten wpis. | do uzupełnienia | Szymon Sosnowski |
