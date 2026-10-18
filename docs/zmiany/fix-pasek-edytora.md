## Changelog

### Zmienione

- Pasek narzędzi edytora w jednym rzędzie (`src/features/news/editor/editor.css`, `EditorToolbar.tsx`). Na telefonie 375 px pasek nie zajmuje już trzech rzędów i pół ekranu.
- Formatowanie, adresy, zdjęcie i opis przewijają się w bok palcem w obszarze `.editor-toolbar__scroll`. Pasek przewijania jest ukryty.
- „Cofnij” i „Ponów” (↶ ↷) stoją stale po prawej, oddzielone cienką linią, w bloku `.editor-toolbar__history`. Strzałki są większe, a pole dotyku ma 44 × 44 px.
- Komunikaty wysyłki zdjęcia i błędy są pod paskiem, poza jego przewijanym rzędem. Stan wysyłki trzyma `EditorToolbar.tsx` i przekazuje go do `PhotoButton.tsx` (typ `PhotoStatus`).
- Kolory tylko z tokenów `var(--…)`. Bez `color-mix()`, zagnieżdżania CSS, `:has()` i `100dvh`.

### Usunięte

- Zawijanie paska do kolejnych wierszy (`flex-wrap: wrap`) oraz `flex-basis: 100%` przy komunikatach.

### Uwagi

- Zmiana wyglądu paska, bez zmian logiki: przyciski, `aria-label`, `aria-pressed`, `disabled` i kolejność zostały takie same. Wysyłka zdjęcia, wstawianie do treści i komunikaty działają tak samo.
- Testy nie były osłabiane. Asercja 320 px sprawdza, że strona nie ma poziomego przewijania, ale nie sprawdza, czy strzałki są w całości widoczne. Dlatego przy weryfikacji sprawdzono zrzut ekranu.
- Luka, poza zakresem tego zadania: `.editor-screen` w `editor.css` używa `min-height: 100dvh`, co łamie regułę pliku o braku `100dvh` (iOS 15). Do osobnego zadania.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | pasek edytora w jednym rzędzie, gałąź `fix/pasek-edytora` | Pasek narzędzi edytora ma mieścić się w jednym rzędzie na 375 px. Formatowanie i adresy przewijają się w bok, „Cofnij” i „Ponów” stoją po prawej. Komunikaty poza rzędem. Zrób testy i zrzut przy 375 i 320 px. | Zmieniło `src/features/news/editor/editor.css` (`.editor-toolbar` bez zawijania, nowe `.editor-toolbar__scroll` i `.editor-toolbar__history`), `EditorToolbar.tsx` (stan wysyłki i komunikaty pod paskiem), `PhotoButton.tsx` (stan przekazany z zewnątrz) oraz ten plik. Zrzut sprawdzono tymczasowym testem, usuniętym przed commitem. | — | Szymon |
