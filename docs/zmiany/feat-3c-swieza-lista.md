# Świeża lista wpisów po powrocie z edycji

## Changelog

### Naprawione

- Lista wpisów w panelu Samorządu pokazuje po powrocie z edycji szkicu jego aktualny tytuł. Wcześniej, przez 30 sekund po wejściu na listę, mógł pokazać stary tytuł z pamięci podręcznej.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #19, świeża lista po powrocie z edycji (podtor 3c) | Po powrocie z edycji szkicu lista w panelu ma pokazać nowy tytuł; test e2e lista → Edytuj → zmiana tytułu → powrót | Dodano `refetchOnMount: 'always'` w `queries.ts` (lista pobierana przy każdym wejściu na ekran), zaktualizowano komentarze, dodano test w `e2e/news-admin.spec.ts`; test padał przed poprawką | | |
