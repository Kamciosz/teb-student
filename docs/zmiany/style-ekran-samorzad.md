## Changelog

### Zmienione

- Panel Samorządu: ekrany zgłoszeń i ankiet mają wygląd systemowy (iOS i Android), w jasnym i ciemnym motywie. Listy grupują wiersze, a przyciski i pola są w jednym stylu.
- Wyniki ankiety pokazują udziały jako cienkie paski zamiast wykresów z gradientem.
- Link powrotu na podekranach to „‹ Wstecz”, a na ekranie ankiety jest jeden wypełniony przycisk.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | Wygląd ekranów Samorządu (gałąź style/ekran-samorzad) | Przerobić ekrany zgłoszeń i ankiet w panelu Samorządu na wygląd systemowy wg docs/projekt/wyglad-ekranow.md, bez zmiany logiki. | Zmieniono src/features/reports/admin (ReportsList, ReportDetail, icons, reportsAdmin.css; usunięto PanelTop.tsx) i src/features/surveys/admin (SurveyListScreen, NewSurveyScreen, QuestionEditor, ResultsScreen, PanelParts, icons, admin.css). W e2e/reports-admin.spec.ts „Wróć” zmieniono na „Wstecz”. | — | Szymon |
