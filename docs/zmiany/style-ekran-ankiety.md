## Changelog

### Zmienione

- Ekrany ankiet w wyglądzie aplikacji systemowej. Lista ma nagłówek „Ankiety”, a termin każdej aktywnej ankiety stoi po prawej: „Dziś” wyróżnione kolorem akcentu, inaczej „za N dni”. Wypełniona ankieta pokazuje „Wypełniona” w kolorze sukcesu.
- Wypełnianie ankiety nie pokazuje dolnego menu. Ma pasek „Wstecz”, numer kroku „x z y” z paskiem postępu, pytanie w rozmiarze 1.25 rem i odpowiedzi jako wiersze, które się zaznaczają (co najmniej 44 px wysokości). Przycisk „Dalej” albo „Wyślij odpowiedzi” jest jeden, na pełną szerokość, przyklejony do dołu ekranu nad paskiem gestów iPhone'a.
- Ekran „Odpowiedzi wysłane” jest prosty: tekst na środku i jedna akcja „Wróć na pulpit”, bez ilustracji.
- Bez zmian dla użytkownika w działaniu: zapis głosów, walidacja, błędy i dane są takie same.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | Styl ekranów ankiety, gałąź `style/ekran-ankiety` (baza `09f36e8`) | Przerób ekrany ankiet ucznia (lista, wypełnianie, ekran „gotowe”) na wygląd z `docs/projekt/wyglad-ekranow.md`, bez zmian logiki i bez ruszania `shared`, `app`, `worker` i panelu | Lista i wiersze w `src/features/surveys/vote/SurveyListScreen.tsx`; górny pasek, stopka i ekran pytania w `FlowParts.tsx`, `SurveyFlowScreen.tsx`, `QuestionStep.tsx`; ekran „gotowe” w `SurveyDoneScreen.tsx`; ikony w `icons.tsx`; style w `vote.css`; selektory listy w `e2e/surveys-vote.spec.ts`; ten dokument | — | Szymon |
