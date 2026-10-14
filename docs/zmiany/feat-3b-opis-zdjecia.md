## Changelog

### Zmienione

- Po wstawieniu zdjęcia (albo gdy zdjęcie jest zaznaczone) na pasku edytora pojawia się przycisk „Opis i podpis” (44 × 44 px, `aria-label` z `TO_AGREE`).
- Przycisk otwiera okienko z polami „Opis zdjęcia (dla osób niewidomych)” (`alt`) i „Podpis” (`caption`) oraz przyciskami „Zapisz” i „Anuluj”. Pola są wypełnione obecnymi wartościami zdjęcia. Escape zamyka okienko bez zapisu.
- Zapis wywołuje `editor.chain().focus().updateAttributes('image', { alt, caption }).run()`. Tekst jest przycinany ze spacji na końcach i do 300 znaków (`MAX_CAPTION_CHARS`, liczone jak na serwerze, w znakach UTF-16). Przycinanie nie rozcina pary znaków (np. emoji).
- Po wstawieniu zdjęcia kursor zostaje za nim, a nie na zdjęciu. Wcześniej zaznaczone zdjęcie zamieniało się w tekst przy pierwszym wpisanym znaku.
- Nowe pliki: `photoCaption.ts` (czysta logika: przycinanie, atrybuty, odczyt zaznaczonego zdjęcia, szukanie zdjęcia), `photoCaption.test.ts` (testy Vitest) i `PhotoCaptionPanel.tsx` (okienko).
- Teksty przycisku i okienka są w `texts.ts`, w grupie `TO_AGREE` (do uzgodnienia przez zespół).
- E2E (`e2e/news-editor.spec.ts`): wpisanie opisu i podpisu po wstawieniu zdjęcia, zapis przycięty do węzła, podpis w podglądzie (`figcaption`), `alt` w podglądzie i w opublikowanym JSON, Escape bez zapisu oraz okienko przy 320 px bez wychodzenia poza ekran.

### Otwarte

- Teksty z grupy `TO_AGREE` („Opis i podpis”, „Opis zdjęcia (dla osób niewidomych)”, „Podpis”, „Zapisz”) nie są w `docs/projekt/EKRANY.md`. Zespół musi je zatwierdzić.
- Gdy w dokumencie są dwa zdjęcia o tym samym adresie, okienko otwiera się dla pierwszego z nich. Adresy zdjęć są unikalne (każdy upload dostaje własny identyfikator), więc to zdarza się rzadko.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | podtor 3b: opis i podpis zdjęcia | Przycisk „Opis i podpis” przy zdjęciu: okienko z `alt` i `caption`, zapis przez `updateAttributes`, przycinanie do 300 znaków, testy Vitest i e2e. | Zmieniło `EditorToolbar.tsx`, `PhotoButton.tsx`, `texts.ts`, `e2e/news-editor.spec.ts` oraz ten plik. Dodało `photoCaption.ts`, `photoCaption.test.ts` i `PhotoCaptionPanel.tsx`. | do uzupełnienia | Szymon |
