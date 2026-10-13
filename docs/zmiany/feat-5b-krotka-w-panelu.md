## Changelog

### Dodane

- Czwarty typ pytania w panelu tworzenia ankiety: „Krótka odpowiedź” (przycisk segmentowy obok jednokrotnego wyboru, wielokrotnego wyboru i skali 1–5). Dla tego typu nie ma pól odpowiedzi, a panel wysyła pustą listę odpowiedzi. Tekst przycisku jest do uzgodnienia.
- Serwer przyjmuje typ `short_text` i zapisuje go bez odpowiedzi do wyboru, nawet gdy telefon je przysłał.
- Wyniki pytania krótkiej odpowiedzi pokazują listę treści odpowiedzi, a tylko od progu 5 odpowiedzi (`MIN_RESPONSES`). Treści są w porządku alfabetycznym (sortowanie polskie), nigdy w kolejności wpisania, i bez danych autora. Dopisek „Odpowiedzi są w kolejności alfabetycznej. Nie widać, kto je napisał.” jest do uzgodnienia.
- Poniżej progu treści odpowiedzi nie trafiają do odpowiedzi HTTP.
- Bez zmian w schemacie bazy danych. Eksport CSV nie zawiera krótkich odpowiedzi.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 5b, krótka odpowiedź w panelu (gałąź `feat/5b-krotka-w-panelu`, baza `feat/5b-skala-w-panelu`, zawiera też #146) | Dodaj w panelu tworzenia ankiety typ „Krótka odpowiedź”, serwer zapisuje go bez opcji, wyniki pokazują treści alfabetycznie od 5 odpowiedzi bez autorów, testy Vitest (w tym na prawdziwej D1) i e2e | `worker/surveys/admin/validation.ts` (`short_text`), `worker/surveys/admin/results.ts` (`sortTexts`, `toQuestionResult`), `worker/surveys/admin/queries.ts` (zapis bez opcji, odczyt treści od progu), `worker/surveys/admin/types.ts`; testy w `validation.test.ts`, `results.test.ts`, `routes.test.ts`; `src/features/surveys/admin/` (`types.ts`, `texts.ts`, `draft.ts`, `draft.test.ts`, `QuestionEditor.tsx`, `ResultsScreen.tsx`); `e2e/surveys-admin.spec.ts`; ten dokument | do uzupełnienia | Szymon |
