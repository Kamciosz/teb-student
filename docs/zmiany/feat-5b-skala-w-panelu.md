## Changelog

### Dodane

- Trzeci typ pytania w panelu tworzenia ankiety: „Skala 1–5” (przycisk segmentowy obok jednokrotnego i wielokrotnego wyboru). Dla tego typu nie ma pól opcji, panel wysyła pięć odpowiedzi „1”…„5”. Tekst przycisku jest do uzgodnienia.
- Serwer przyjmuje typ `scale_1_5` i sam tworzy pięć opcji „1”…„5”, ignorując opcje z body żądania.
- Wyniki pytania skali pokazują średnią z jednym miejscem po przecinku. Średnia pojawia się dopiero od progu 5 odpowiedzi (`MIN_RESPONSES`). Tekst „Średnia: …” jest do uzgodnienia.
- Bez zmian w schemacie bazy danych.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 5b, skala 1–5 w panelu (gałąź `feat/5b-skala-w-panelu`, baza `feat/5b-typ-pytania`, zawiera też #135) | Dodaj w panelu tworzenia ankiety typ „Skala 1–5” z pięcioma odpowiedziami „1”…„5”, serwer tworzy te same opcje, wyniki ze średnią od 5 odpowiedzi, testy Vitest i e2e | `worker/surveys/admin/validation.ts` (`SCALE_LABELS`, obsługa `scale_1_5`), `worker/surveys/admin/results.ts` (`scaleAverage`), `worker/surveys/admin/types.ts`, testy w `validation.test.ts` i `results.test.ts`; `src/features/surveys/admin/` (`types.ts`, `texts.ts`, `draft.ts`, `draft.test.ts`, `QuestionEditor.tsx`, `ResultsScreen.tsx`); `e2e/surveys-admin.spec.ts`; ten dokument | do uzupełnienia | Szymon |
