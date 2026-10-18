## Changelog

### Zmienione

- Lista aktualności ma nagłówek „Aktualności” w stylu aplikacji systemowej, dolny pasek z zakładkami i zwarte wiersze. Pierwszy wpis przypięty albo ważny jest wyróżniony większym kaflem.
- Filtr typu to jedna linia chipów przewijana w bok, zamiast zawijanych przycisków. Przy 320 px nic nie wychodzi poza ekran.
- Szczegóły wpisu mają pasek z powrotem do listy, treść 17 px z interlinią 1,5 i bez dolnego paska zakładek.

### Usunięte

- Plik `src/features/news/feed/ScreenTop.tsx` i jego stare style (górny pasek, chipy, wyróżnienie ważnego wpisu).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | Ekran aktualności w nowym wyglądzie (podtor 3a, gałąź `style/ekran-aktualnosci`) | Przebuduj listę i szczegóły aktualności wg `docs/projekt/wyglad-ekranow.md`, użyj wspólnych `ScreenHeader`, `Dock` i `Chip`, usuń `ScreenTop`. | Zmieniło `EntryCard.tsx`, `EntryScreen.tsx`, `FeedListScreen.tsx`, `TypeFilter.tsx`, `feed.css` i `index.test.tsx` (test klasy wyróżnienia). Usunęło `ScreenTop.tsx`. Dodało ten plik. | do uzupełnienia | do uzupełnienia |
