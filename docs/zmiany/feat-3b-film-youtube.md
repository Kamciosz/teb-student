## Changelog

### Dodane

- Film z YouTube we wpisie: redaktor wkleja adres (`youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`) i w treści zostaje sam 11-znakowy identyfikator. Węzeł `youtube` jest własny, bez `@tiptap/extension-youtube`.
- Podgląd filmu w edytorze to miniatura `i.ytimg.com` z napisem „Film z YouTube”, bez ramki iframe.
- Wklejony HTML z obcym adresem filmu (`data-youtube-video`) nie trafia do treści, bo sprawdza go schemat, a nie tylko wklejanie.
- Serwer (`validateBody`) przyjmuje film tylko z poprawnym identyfikatorem (wzór `[A-Za-z0-9_-]{11}`). Pusty identyfikator (`null`), liczba i zły znak dają 422 `bad_video`.
- Testy Vitest: formy adresu filmu, odrzucenia identyfikatora i film w cytacie oraz na liście. Testy e2e: wstawienie filmu, zły adres, adres shorts z parametrem, wklejony HTML.

### Zmienione

- `validateBody` sprawdza identyfikator przez `YOUTUBE_ID_PATTERN` zamiast porównania z `parseYouTubeId`. Dawny warunek przepuszczał `null` (sprawdzone testem).
- Węzeł `youtube` odrzuca w `parseHTML` wartości spoza wzoru, zamiast przyjmować je do dokumentu.

### Dla podtoru 3a (wyświetlanie u ucznia, poza tym PR)

Węzeł w JSON treści ma postać `{ "type": "youtube", "attrs": { "videoId": "<11 znaków>" } }`. Jest blokowy (`group: block`), atomowy i może stać w cytacie oraz na liście. Podtor 3a dodaje iframe `https://www.youtube-nocookie.com/embed/<videoId>` dopiero po kliknięciu, zgodnie z ADR 0002 i CSP `frame-src` z `docs/TECHNOLOGIE.md`.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Część #18, film z YouTube we wpisie (podtor 3b) | Domknij film z YouTube: węzeł bez nowego pakietu, ID zamiast adresu, walidacja ID na serwerze, miniatura z napisem bez iframe, testy Vitest i e2e | Zmieniło `src/features/news/editor/document/nodes.ts`, `urls.test.ts`, `editor.css`, `worker/news/editor/validateBody.ts`, `validateBody.test.ts`, `e2e/news-editor.spec.ts` i ten plik | do uzupełnienia | do uzupełnienia |
