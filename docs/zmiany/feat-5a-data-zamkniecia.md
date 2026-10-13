## Changelog

### Dodane

- Data zamknięcia ankiety z godziną: opcjonalna kolumna `closes_at` w schemacie ankiet. Brak wartości (null) oznacza, że ankieta kończy się tylko dniem z `endsOn`. Bez migracji, bo repo nie ma migracji (schemat Drizzle).
- Serwer odrzuca głos po terminie czytelnym błędem `survey_ended` (410), a na liście aktywnych ankiet nie pokazuje zamkniętych.
- Telefon: przy ankiecie z godziną zamknięcia widać „Do D.MM, HH:mm” w czasie polskim (Europe/Warsaw).

### Zmienione

- Zakończona ankieta na liście pokazuje „Ankieta zamknięta · D.MM” zamiast „Zakończona D.MM”, a ekran blokady ma tytuł „Ankieta zamknięta”.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 5a: data zamknięcia ankiety (numer PR w opisie) | Dodaj opcjonalną datę zamknięcia z godziną: schemat, serwer (410), lista bez zamkniętych, telefon „Do …”, testy Vitest i e2e; panel 5b nie ruszać | Kolumna `closesAt` w `worker/db/schema/surveys.ts`, logika terminu w `worker/surveys/vote/` (deadline, lista, trasy, typy, testy), ekrany w `src/features/surveys/vote/` (format, lista, przepływ, typy, testy), `e2e/surveys-vote.spec.ts` | do uzupełnienia | Szymon Sosnowski |
