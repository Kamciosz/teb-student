## Changelog

### Zmienione

- Ekrany ankiet w wyglądzie aplikacji systemowej. Lista ma nagłówek „Ankiety”, a termin każdej aktywnej ankiety stoi po prawej: „Dziś” wyróżnione kolorem akcentu, inaczej „za N dni”. Wypełniona ankieta pokazuje „Wypełniona” w kolorze sukcesu.
- Wypełnianie ankiety nie pokazuje dolnego menu. Ma pasek „Wstecz”, tytuł w jednej linii, numer kroku „x z y” z paskiem postępu i pytanie w rozmiarze 1.25 rem. Odpowiedzi to jeden blok listy na tle kafla, z cienkimi liniami między wierszami i znacznikiem ✓ w kolorze akcentu po prawej przy wybranej odpowiedzi (bez czarnej ramki i bez zmiany tła; wiersz ma co najmniej 44 px wysokości, tekst 1.0625 rem, bez liter A–D). Ten sam blok jest w skali 1–5, a pole krótkiej odpowiedzi jest na tle kafla. Przycisk „Dalej” albo „Wyślij odpowiedzi” jest jeden, na pełną szerokość, przyklejony do dołu ekranu nad paskiem gestów iPhone'a.
- Ekran „Odpowiedzi wysłane” jest prosty: tekst na środku i jedna akcja „Wróć na pulpit”, bez ilustracji.
- Bez zmian dla użytkownika w działaniu: zapis głosów, walidacja, błędy i dane są takie same.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | Styl ekranów ankiety, gałąź `style/ekran-ankiety` (baza `09f36e8`) | Przerób ekrany ankiet ucznia (lista, wypełnianie, ekran „gotowe”) na wygląd z `docs/projekt/wyglad-ekranow.md`, bez zmian logiki i bez ruszania `shared`, `app`, `worker` i panelu | Lista i wiersze w `src/features/surveys/vote/SurveyListScreen.tsx`; górny pasek, stopka i ekran pytania w `FlowParts.tsx`, `SurveyFlowScreen.tsx`, `QuestionStep.tsx`; ekran „gotowe” w `SurveyDoneScreen.tsx`; ikony w `icons.tsx`; style w `vote.css`; selektory listy w `e2e/surveys-vote.spec.ts`; ten dokument | — | Szymon |
