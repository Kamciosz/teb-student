## Changelog

### Zmienione

- Bez zmian dla użytkownika. Drzwi modułów wystawiają trzy eksporty dla podtoru 7 („Pobierz moje dane”, RODO), który podpina je w `worker/profile/exportData.ts` w polu `missing`:
  - `listReportsByAuthor` i typ `MyReport` z `worker/reports/index.ts`: zgłoszenia ucznia (id, kategoria, miejsce, opis, etap, daty w milisekundach), bez numeru autora.
  - `listParticipatedSurveys` i typ `ParticipatedSurvey` z `worker/surveys/index.ts`: ankiety, w których uczeń brał udział (id, temat, tytuł, ostatni dzień), bez treści odpowiedzi i liczników. Tabela udziałów nie ma czasu, więc data udziału nie jest dostępna.
  - `getAccountCreatedAt` z `worker/auth/index.ts`: data założenia konta ucznia w milisekundach albo `null`.
- Każdy eksport ma test Vitest na bazie D1 testów.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | build/drzwi-moje-dane, eksporty dla podtoru 7 | Wystaw w drzwiach modułów `listReportsByAuthor` (reports), `listParticipatedSurveys` (surveys) i `getAccountCreatedAt` (auth) z testami Vitest; nie zmieniaj `worker/profile`. | Dodało funkcje i testy w `worker/surveys/vote/`, `worker/auth/email/`, `worker/reports/listMyReports.test.ts`, zaktualizowało drzwi `worker/reports/`, `worker/surveys/`, `worker/auth/` oraz ten plik. | do uzupełnienia | do uzupełnienia |
