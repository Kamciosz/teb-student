## Changelog

### Dodane

- Pytanie „krótka odpowiedź” w ankiecie: uczeń wpisuje tekst w polu pod pytaniem. Pole ma licznik „x / 200 znaków” liczony tak jak na serwerze (znaki, nie bajty ani jednostki kodowe UTF-16, więc polskie litery i emoji liczą się po jednym). „Dalej” / „Wyślij” działa dopiero po tekście od 1 do 200 znaków po przycięciu spacji z obu stron. Za długi tekst pokazuje podpowiedź „Za dużo znaków. Skróć odpowiedź.”. Teksty „Twoja odpowiedź” i podpowiedź są do uzgodnienia (`TO_AGREE`).
- Serwer przyjmuje krótką odpowiedź jako tekst przy pytaniu bez wyborów. Pusty tekst, tekst dłuższy niż 200 znaków i tekst przy pytaniu innego typu są odrzucane. Tekst jest zapisywany w nowej tabeli `survey_text_answers` (numer pytania i treść, bez numeru ucznia i bez czasu). W tej samej transakcji zapisywany jest licznik głosu i wiersz „kto już głosował”. Drugi głos daje 409 i wycofuje całą transakcję, łącznie z tekstami.
- Wyniki dla ucznia nigdy nie zawierają tekstów. Teksty nie są widoczne w żadnym ekranie ani odpowiedzi serwera dla ucznia; pokazuje je tylko panel Samorządu (5b), który tej zmiany nie dotyka.

### Uwagi o prywatności (otwarte, nie blokują)

- **Kolejność wierszy.** Wiersze tekstów i wiersz „kto już głosował” są zapisywane w jednej transakcji. Bez dostępu do bazy surowej (np. przez numery wierszy `rowid`) da się więc zgadać, który tekst należy do którego ucznia. Panel tego nie pokazuje. Do decyzji: zapisywać teksty w osobnej transakcji albo losować kolejność przy odczycie.
- **Dane osobowe w wolnym tekście.** Uczeń może wpisać imię, nazwisko albo klasę. Przy małej klasie taka odpowiedź może wskazać autora. Samorząd powinien to widzieć, dlatego panel 5b ma pokazać ostrzeżenie (patrz niżej).
- **Usuwanie danych ucznia.** `deleteStudentData` nie usuwa tekstów, bo tabela nie ma numeru ucznia. Do decyzji, czy takie teksty mają znikać razem z kontem.

### Wymagania dla panelu Samorządu (5b, osobny podtor, tu nie zaimplementowane)

- Odczyt tekstów per pytanie, nie zbiorczo dla całej ankiety.
- Teksty pokazuje się dopiero po co najmniej 5 odpowiedziach na pytanie. Mniej odpowiedzi to komunikat zamiast treści.
- Kolejność losowa albo alfabetyczna, bez numerów odpowiedzi i bez czasu zapisu.
- Eksporty (CSV, PDF) bez numerów wierszy i bez identyfikatorów; sama treść tekstu.
- Ostrzeżenie o możliwej identyfikacji przy każdym pytaniu tekstowym.
- Nowe teksty panelu do `TO_AGREE`.
- Przy tworzeniu pytań w panelu dodać typ `short_text` do listy typów.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 5a, krótka odpowiedź (gałąź `feat/5a-krotka-odpowiedz`, baza `feat/5a-skala`) | Dodaj typ pytania „krótka odpowiedź” po stronie głosowania ucznia: pole tekstowe z licznikiem 1–200 znaków, zapis w osobnej tabeli, teksty nigdy w wynikach dla ucznia, testy i e2e; panel 5b tylko opisać | `QUESTION_TYPES` i tabela `survey_text_answers` w `worker/db/schema/surveys.ts`; sprawdzanie i zapis w `worker/surveys/vote/` (`validation.ts`, `queries.ts`, `routes.ts`, `types.ts`) i testy `validation.test.ts`, `vote.test.ts`, `schema.test.ts`; ekran i logika w `src/features/surveys/vote/` (`shortText.ts`, `QuestionStep.tsx`, `SurveyFlowScreen.tsx`, `useVoteSubmit.ts`, `surveyApi.ts`, `texts.ts`, `vote.css`); `e2e/surveys-vote.spec.ts`; ten dokument | do uzupełnienia | Szymon |
