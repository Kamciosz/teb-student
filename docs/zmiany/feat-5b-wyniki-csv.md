## Changelog

### Dodane

- Pobieranie wyników ankiety jako plik CSV: przycisk „Pobierz CSV” pod wynikami (ekran 6.5d). Plik ma pytanie, odpowiedź, liczbę głosów i procent, bez danych osobowych. Plik otwiera się w Excelu z polskimi znakami. Przycisk pojawia się tylko od progu 5 odpowiedzi, a bez internetu jest nieaktywny.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 5b: wyniki ankiety jako CSV | Dodaj pobieranie wyników jako CSV dla roli Samorządu. Próg 5 odpowiedzi bez zmian, bez zmian w schemacie. | Trasa `GET /api/surveys/admin/:surveyId/results/csv` w `worker/surveys/admin/routes.ts` za tą samą bramką roli, 409 poniżej progu, `worker/surveys/admin/csv.ts` (escapowanie, BOM, CRLF), przycisk w `src/features/surveys/admin/ResultsScreen.tsx`, `fetchResultsCsv` w `src/features/surveys/admin/surveyApi.ts`, testy w `worker/surveys/admin/csv.test.ts`, `worker/surveys/admin/routes.test.ts` i `e2e/surveys-admin.spec.ts` | do uzupełnienia | Szymon Sosnowski |
