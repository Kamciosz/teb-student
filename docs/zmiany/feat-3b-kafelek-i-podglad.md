## Changelog

### Dodane

- Krok 1 kreatora: sekcja „Zdjęcia i wideo” z kafelkiem „dodaj” (ekran 5.1 z `docs/projekt/EKRANY.md`): przerywany obrys, plus i podpis „Pliki są zmniejszane przed wysłaniem. Zdjęcie przytniesz klikając ikonę kadrowania.”. Kafelek tylko wygląda jak przycisk: kliknięcie nic nie robi, nie otwiera wyboru plików i nic nie wysyła (`aria-disabled="true"`). Wysyłka zdjęć to podtor 2.
- Krok 3 kreatora (ekran 5.3): podgląd pokazuje wpis tak, jak uczeń zobaczy go na liście (`EntryCard`) i w treści (`RichContent`) z podtoru 3a. Kliknięcie kafla w podglądzie nie otwiera wpisu, bo wpisu jeszcze nie ma na serwerze.
- `src/features/news/editor/previewEntry.ts`: składa dane kafla z wpisu w edytorze. Opis wycina tak samo jak serwer (`worker/news/feed/excerpt.ts`), bo aplikacja nie importuje kodu serwera. Test `previewEntry.test.ts` pilnuje tych samych danych co test serwera.
- Teksty kroku 1 w `texts.ts` (sekcja „Zdjęcia i wideo” i opis kafla w `TO_AGREE`).

### Zmienione

- Podgląd nie używa już Tiptapa: `LazyEditor` ładuje tylko edytor, a podgląd idzie w zwykłej paczce. Usunięto `RichPreview.tsx` i styl `.editor-entry`.
- Typografia treści w `editor.css` działa tylko w polu edytora (`.editor-surface`). Wygląd podglądu idzie ze `feed.css` z podtoru 3a.

### Testy

- e2e `e2e/news-editor.spec.ts`: kafelek „dodaj” nic nie robi w kroku 1 (brak wyboru pliku, brak żądań do `/api/`); kafel w podglądzie wygląda jak na liście i jego kliknięcie nie zmienia adresu.
- Vitest `previewEntry.test.ts`: opis krótki, długi (ucinany na granicy słowa), pomijanie bloku z samym filmem, kształt wpisu.

### Do rozstrzygnięcia

- EKRANY 5.3 pokazuje „Samorząd · teraz”, a `formatRelative` z podtoru 3a zwraca „przed chwilą”. Podgląd używa wyniku z 3a. Plik 3a nie został zmieniony, rozbieżność czeka na decyzję.
- Lista tekstów w `TO_AGREE` (kafelek, podpis) do zatwierdzenia przez zespół.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | zgłoszenie #81, kafelek „dodaj” i podgląd (podtor 3b, krok 1/3) | Dodaj kafelek „dodaj” w kroku 1 bez wysyłki plików, a w podglądzie pokaż `EntryCard` i `RichContent` z podtoru 3a, tylko w plikach podtoru 3b | Zmieniło `src/features/news/editor/` (TypeStep, PreviewStep, LazyEditor, texts, editor.css, icons, previewEntry i test), usunęło `RichPreview.tsx`, zmieniło `e2e/news-editor.spec.ts` i dodało ten plik | do uzupełnienia | do uzupełnienia |
