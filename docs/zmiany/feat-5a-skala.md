## Changelog

### Dodane

- Pytanie „skala 1–5” w ankiecie: uczeń wybiera jedną z pięciu odpowiedzi „1”…„5”, które w rzędzie pokazują się jako przyciski (cel dotyku co najmniej 44 px), z opisami skrajnych wartości pod spodem. Opisy („wcale” / „bardzo”) są do uzgodnienia.
- Serwer przyjmuje na pytaniu skali dokładnie jedną odpowiedź, tak jak przy jednokrotnym wyborze. Odpowiedź spoza pytania jest odrzucana jak dotąd.
- Dane przykładowe bez zmian. Panel 5b musi dodać typ `scale_1_5` przy tworzeniu pytań.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 5a, skala 1–5 (gałąź `feat/5a-skala`, baza `feat/5a-wielokrotny-wybor`) | Dodaj typ pytania „skala 1–5” po stronie głosowania ucznia: pięć zwykłych odpowiedzi, przyciski z opisami skrajnymi, serwer przyjmuje jedną odpowiedź, testy i e2e | `QUESTION_TYPES` w `worker/db/schema/surveys.ts`; sprawdzanie odpowiedzi w `worker/surveys/vote/validation.ts`; typy w `worker/surveys/vote/types.ts` i `src/features/surveys/vote/types.ts`; testy w `validation.test.ts` i `vote.test.ts`; ekran w `src/features/surveys/vote/` (`ScaleOptions.tsx`, `texts.ts`, `QuestionStep.tsx`, `vote.css`); `e2e/surveys-vote.spec.ts`; ten dokument | do uzupełnienia | Szymon |
