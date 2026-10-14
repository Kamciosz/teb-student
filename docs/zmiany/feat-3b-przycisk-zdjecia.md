## Changelog

### Zmienione

- Na pasku edytora wpisów jest przycisk „Zdjęcie”. Po wyborze pliku zdjęcie idzie przez `uploadEditorPhoto` z modułu media (`src/features/media/index.ts`), a po wysłaniu jest wstawiane do treści jako węzeł `image` z adresem `/api/media/<id>`.
- Podczas wysyłki przycisk jest zablokowany, a pod paskiem pojawia się informacja „Wysyłam zdjęcie…” (`role="status"`).
- Błędy pokazują się po polsku pod paskiem (`role="alert"`). Dla pliku, którego przeglądarka nie czyta, pokazuje się prośba o JPG albo PNG. Inne błędy dostają ogólny komunikat z `TO_AGREE`, a nie angielski tekst z przeglądarki.
- Nowe pliki: `PhotoButton.tsx` (przycisk, wysyłka, stan), `photoNode.ts` (budowa węzła i wybór komunikatu błędu) oraz `photoNode.test.ts` (testy Vitest).
- Teksty przycisku i komunikatów są w `texts.ts`, w grupie `TO_AGREE` (do uzgodnienia przez zespół).
- Komentarz przy węźle zdjęcia w `document/nodes.ts` (PL i EN) mówi teraz o adresie `/api/media/<id>`, a nie o https.
- E2E (`e2e/news-editor.spec.ts`): wstawienie zdjęcia ze stubem `/api/media/upload`, stan wysyłania, odmowa 403 i plik nieczytelny.

### Otwarte

- Okienko z podpisem i tekstem alternatywnym (alt) przy zdjęciu nie jest zrobione. Węzeł ma puste `alt` i `caption`. Okienko ma limit 300 znaków (`MAX_CAPTION_CHARS`) i zostaje do osobnego zadania.
- Teksty z grupy `TO_AGREE` (przycisk „Zdjęcie”, „Wysyłam zdjęcie…”, komunikat o błędzie) nie są w `docs/projekt/EKRANY.md`. Zespół musi je zatwierdzić.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | podtor 3b: przycisk Zdjęcie w pasku edytora, część #45 | Przycisk „Zdjęcie” na pasku edytora: wysyłka przez `uploadEditorPhoto`, wstawienie węzła `image`, stan wysyłania, błędy po polsku, testy Vitest i e2e. | Zmieniło `EditorToolbar.tsx` (jedna linia i opis), `texts.ts` (grupa `photo` i przycisk), `editor.css` (komunikat pod paskiem), `document/nodes.ts` (komentarz PL i EN) oraz `e2e/news-editor.spec.ts`. Dodało `PhotoButton.tsx`, `photoNode.ts`, `photoNode.test.ts` i ten plik. | do uzupełnienia | Szymon |
