## Changelog

### Dodane

- Pytania wielokrotnego wyboru w ankiecie: uczeń zaznacza kilka odpowiedzi polami wyboru, a „Wyślij odpowiedzi” jest aktywne po zaznaczeniu co najmniej jednej.
- Serwer przyjmuje kilka odpowiedzi w jednym pytaniu, odrzuca pustą odpowiedź, obcą odpowiedź z innego pytania i powtórzoną odpowiedź. Jeden głos na ucznia bez zmian.
- Dane przykładowe: ankieta „Dni po lekcjach (kilka odpowiedzi)” z pytaniem wielokrotnego wyboru.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 5a, wielokrotny wybór (gałąź `feat/5a-wielokrotny-wybor`) | Dodaj typ pytania „wielokrotny wybór” po stronie głosowania ucznia: serwer, ekran, dane przykładowe, testy | `QUESTION_TYPES` w `worker/db/schema/surveys.ts`; sprawdzanie odpowiedzi w `worker/surveys/vote/validation.ts` i trasa w `routes.ts`; testy w `validation.test.ts` i `vote.test.ts`; ekran w `src/features/surveys/vote/` (`QuestionStep.tsx`, `SurveyFlowScreen.tsx`, `surveyApi.ts`, `types.ts`); dane w `worker/db/seed/surveys.ts`; `e2e/surveys-vote.spec.ts` | do uzupełnienia | Szymon |
