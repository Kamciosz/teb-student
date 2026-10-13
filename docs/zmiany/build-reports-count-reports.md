## Changelog

### Zmienione

- Bez zmian dla użytkownika. Drzwi modułu `worker/reports/index.ts` wystawiają `countReports(env.DB)` z podtoru 4a: liczbę wszystkich zgłoszeń, także anonimowych. Panel Samorządu (podtor 8, #26) pokaże ją na ekranie „Dane z pilotażu” jako „Ile zgłoszeń wpłynęło”, importując tylko z `worker/reports`. Funkcja zwraca samą liczbę, bez numerów zgłoszeń i autorów.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #74, podtor 4a: eksport `countReports` | Dodaj `countReports(db)` (liczba wszystkich zgłoszeń, także anonimowych, bez danych autora), wystaw przez `worker/reports/student/index.ts` i `worker/reports/index.ts`, dodaj test importujący z drzwi modułu. | Dodało funkcję i komentarz w `worker/reports/student/countReports.ts`, test w `worker/reports/student/countReports.test.ts`, eksport w `worker/reports/student/index.ts` i `worker/reports/index.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
