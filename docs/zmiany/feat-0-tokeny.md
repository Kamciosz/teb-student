## Changelog

### Dodane

- Wspólne zmienne wyglądu w `src/shared/styles/tokens.css`: kolory ośmiu palet (CA–CH) z akcentem szkoły (`data-szkola` L albo T), skala tekstu, zaokrąglenia i krój pisma. Wartości są przeniesione z makiety `docs/projekt/referencje/uklad_C.html`. Domyślna jest paleta CE Grafit z akcentem liceum.
- Podstawowe style w `src/shared/styles/base.css`: tło, krój, rozmiary tekstu, widoczny fokus z klawiatury, bezpieczne marginesy telefonu i wyłączenie przejść przy `prefers-reduced-motion`. Wszystkie kolory biorą się ze zmiennych.

Bez zmian dla użytkownika: pliki nie są jeszcze podłączone do aplikacji.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | etap A, podtor 0: tokeny i style bazowe | Przenieś zmienne kolorów ośmiu palet i podstawowe style z `uklad_C.html` do zwykłych plików CSS, bez kolorów poza `tokens.css`. | Dodało `src/shared/styles/tokens.css` i `src/shared/styles/base.css`. Sprawdziło grepem brak kolorów w `base.css` oraz brak `color-mix()`, `@property` i zagnieżdżeń. Porównało skryptem wartości z makietą. | do uzupełnienia | Kacper |
