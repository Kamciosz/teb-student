## Changelog

### Dodane

- Opcjonalne pole „Zamknij ankietę (data i godzina)” przy tworzeniu ankiety w panelu Samorządu. Puste pole oznacza brak terminu, a ankieta kończy się wtedy ostatniego dnia.
- Serwer `POST /api/surveys/admin` przyjmuje `closesAt` jako tekst `RRRR-MM-DDTHH:mm` w czasie polskim (Europe/Warsaw) i zapisuje go w kolumnie `closes_at` jako chwilę UTC. Termin musi być w przyszłości i nie może przypadać po ostatnim dniu ankiety; inaczej serwer odpowiada 400 `invalid_survey`.
- Lista ankiet w panelu pokazuje termin przy trwającej ankiecie („do D.MM, HH:mm”), a ankieta zamknięta przez termin, przed ostatnim dniem, ma podpis „Zamknięta”.

### Zmienione

- Lista ankiet w panelu liczy ankietę z minionym terminem jako zakończoną, nawet gdy jej ostatni dzień jeszcze nie minął.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 5b: termin zamknięcia ankiety w panelu (numer PR w opisie) | Dodaj opcjonalne pole „Zamknij ankietę (data i godzina)” w tworzeniu ankiety: serwer (walidacja, zapis UTC, lista), formularz i lista w panelu, testy Vitest i e2e; schematu `closes_at` nie zmieniać | Walidacja i zamiana czasu polskiego w `worker/surveys/admin/` (validation, dates, routes, queries, typy, testy), formularz i lista w `src/features/surveys/admin/` (draft, format, useNewSurveyForm, NewSurveyScreen, SurveyListScreen, typy, testy), `e2e/surveys-admin.spec.ts` | do uzupełnienia | Szymon Sosnowski |
