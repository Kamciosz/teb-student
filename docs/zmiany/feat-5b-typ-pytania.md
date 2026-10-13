## Changelog

### Dodane

- Przy każdym pytaniu tworzonej ankiety w panelu Samorządu można wybrać rodzaj: „Jeden wybór” (domyślnie) albo „Wiele wyborów”. Przełącznik wygląda jak wybór czasu trwania.
- Serwer `POST /api/surveys/admin` przyjmuje `type` przy każdym pytaniu, tylko `single_choice` albo `multiple_choice`. Brak `type` oznacza `single_choice`, a inna wartość daje 400 `invalid_survey`.
- Wyniki pytania z wielokrotnym wyborem pokazują liczbę zaznaczeń („Zaznaczeń: N”) i dopisek „Uczeń mógł zaznaczyć kilka odpowiedzi.”. Teksty są w `src/features/surveys/admin/texts.ts` (grupa TO_AGREE, do zatwierdzenia przez zespół).

### Zmienione

- Udziały procentowe w wynikach liczone są od sumy głosów danego pytania. Przy jednokrotnym wyborze to ta sama liczba co wcześniej.
- Przy ankiecie złożonej wyłącznie z pytań wielokrotnego wyboru liczbę osób (odpowiedzi) w liście i wynikach bierze się z udziału w ankiecie, a nie z sumy zaznaczeń.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 5b: typ pytania w ankiecie (numer PR w opisie) | Dodaj wybór „Jeden wybór” / „Wiele wyborów” przy każdym pytaniu (przyciski jak czas trwania), walidację typu na serwerze, wyniki dla wielokrotnego wyboru z liczbą zaznaczeń i dopiskiem; schematu nie zmieniać | Typ pytania w `worker/surveys/admin/` (validation, types, results, queries, testy), przełącznik i wyniki w `src/features/surveys/admin/` (QuestionEditor, ResultsScreen, draft, types, texts, admin.css, testy), `e2e/surveys-admin.spec.ts`, ten plik | do uzupełnienia | Szymon Sosnowski |
