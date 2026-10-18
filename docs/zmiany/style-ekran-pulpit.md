## Changelog

### Zmienione

- Pulpit w stylu aplikacji systemowej: u góry nagłówek „Dzisiaj” z powitaniem i datą, a pod nim karta z licznikiem do dzwonka, następną lekcją i blokiem „Ważne”.
- Kafelki z siatki 2×2 zastąpiły dwie sekcje na liście: „Do zrobienia” (ankieta i zgłoszenie) oraz „Informacje” (trzy ostatnie ogłoszenia i link do wszystkich aktualności). Sekcja „Do zrobienia” znika, gdy nie ma ankiety ani zgłoszenia.
- Liczba minut do dzwonka jest większa, a napis o następnej lekcji jest taki sam na pulpicie i w liczniku.
- Przyciski „Wyżej” i „Niżej” przy układaniu sekcji mają co najmniej 44 px wysokości. Dawna zapisana kolejność kafelków nie jest już używana, pulpit wraca do domyślnej.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | Wygląd pulpitu, gałąź style/ekran-pulpit | Przerobić pulpit (trasa /) i licznik dzwonka w stylu aplikacji systemowej wg docs/projekt/wyglad-ekranow.md, „Hierarchia” pkt 1–4 | Przebudowano nagłówek, górę z licznikiem i blokiem „Ważne” oraz sekcje „Do zrobienia” i „Informacje” (src/features/dashboard/*, dashboard.css); dodano nextLessonLabel.ts i jego test (src/features/bell/*); zaktualizowano e2e/dashboard.spec.ts i e2e/bell.spec.ts; usunięto kafelki, ikony i ich testy | — | Szymon |
