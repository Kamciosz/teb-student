## Changelog

### Dodane

- Karta linku do mediów społecznościowych we wpisie w czytniku (`LinkCard.tsx`): Instagram, TikTok, Facebook i X pokazane jako karta z nazwą serwisu i adresem. Cała karta jest linkiem z `target="_blank"` i `rel="noopener noreferrer"`. Nie ma osadzania: bez ramki, obrazka, ikony i czegokolwiek ładowanego z serwisu.
- `socialNetwork.ts`: nazwa serwisu wyliczana z domeny adresu w czytniku. Subdomeny (na przykład `www.`) pasują, a `fakeinstagram.com` nie. X działa pod `x.com` i `twitter.com`.
- Sanityzacja karty w `sanitize.ts`: karta przechodzi tylko z adresem https z jedną z czterech domen. Inne adresy (http, `javascript:`, adres względny, login i hasło w adresie, obca domena) odpadają razem z kartą.
- Style `.news-link-card` w `feed.css`. Nazwa klasy jest inna niż `.news-card`, bo ta jest już kaflem wpisu na liście.
- Testy Vitest w `LinkCard.test.tsx`: karta dla każdego z czterech serwisów, nazwa z domeny, odrzucone adresy i brak `iframe`, `script`, `img`, `embed` i `object`.

### Zmienione

- `RichContent.tsx`: nowa gałąź dla węzła `linkCard`.
- `sanitize.ts`: typ `SafeBlock` ma wariant `linkCard`, a `sanitizeBlock` przekazuje węzeł do `sanitizeLinkCard`.

### Otwarte

- Decyzja do potwierdzenia: wpis z kartą z obcej domeny nie pokaże tej karty, bo czytnik odrzuca ją tak samo jak serwer (`worker/news/editor/validateBody.ts`, kod `bad_card`).
- Lista domen w `socialNetwork.ts` jest kopią listy z `src/features/news/editor/document/urls.ts`, bo czytnik nie importuje z edytora. Przy zmianie listy trzeba zmienić obie.
- Brak testu e2e karty linku w przeglądarce. Istniejący spec 3a (`e2e/news-feed.spec.ts`) nie ma wpisu z kartą linku.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | podtor 3a: karta linku do mediów społecznościowych (PR do `main`) | Uczeń ma widzieć karty linków Instagram, TikTok, Facebook i X jako kartę z nazwą serwisu i adresem, bez osadzania. Sanityzacja tylko https. Nazwa z domeny w feed, bez importu z editor. Testy Vitest. Edytora nie zmieniać. | Dodało `feed/content/LinkCard.tsx`, `feed/content/socialNetwork.ts`, `feed/content/LinkCard.test.tsx` i ten plik. Zmieniło `feed/content/sanitize.ts` (wariant `linkCard`, `sanitizeLinkCard`), `feed/content/RichContent.tsx` (gałąź `linkCard`) i `feed/feed.css` (`.news-link-card`). Edytor, `news/index.ts` i serwer bez zmian. | do uzupełnienia | Szymon |
