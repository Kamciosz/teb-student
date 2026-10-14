## Changelog

### Naprawione

- Zdjęcie, którego przeglądarka nie potrafi odczytać (HEIC z iPhone'a), nie jest już wysyłane w oryginale. Oryginał niesie dane EXIF, w tym lokalizację. Uczeń dostaje komunikat, żeby wysłał zdjęcie w formacie JPG albo PNG.
- Serwer odrzuca HEIC i HEIF kodem 415 i niczego nie zapisuje.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #2, EXIF w HEIC | Sprawdzić ścieżkę zapasową zdjęć w `src/features/media/`: czy oryginał z EXIF nie idzie na serwer. Test najpierw, potem poprawka po stronie telefonu i serwera. | Test `imagePipeline.test.ts` padał na starym kodzie. `preparePhoto` nie wysyła już oryginału, zwraca komunikat (`imagePipeline.ts`). `worker/media/rules.ts` nie przyjmuje HEIC/HEIF, a testy w `rules.test.ts` i `routes.test.ts` to sprawdzają. | | Szymon |
