## Changelog

### Dodane

- Funkcja `uploadEditorPhoto(file)` w `src/features/media/editorPhoto.ts`, wystawiona przez drzwi modułu (`src/features/media/index.ts`) wraz z typem `EditorPhoto`. Przygotowuje zdjęcie (dłuższy bok do 1600 px, JPEG 0,8, bez EXIF), wysyła na `POST /api/media/upload` i zwraca numer pliku, adres `/api/media/<id>` oraz wymiary po zmniejszeniu. Błąd rzuca wyjątek z polskim komunikatem.
- Testy Vitest w `src/features/media/editorPhoto.test.ts`: wysyłka na `/api/media/upload` z wymiarami, wynik z adresem i wymiarami, błąd 403 i 500 oraz HEIC bez wysyłki.

### Otwarte

- Oryginału nie wysyłamy, nawet gdy przeglądarka nie czyta zdjęcia (HEIC). Oryginał niesie EXIF z lokalizacją, a zdjęcia redaktora trafiają do uczniów. Plan (`docs/PLAN_APLIKACJI.md`, linia o HEIC) i `docs/TECHNOLOGIE.md` nadal opisują wysyłkę oryginału do 20 MB. Do zmiany w dokumentach przez właściciela.
- Brak interfejsu: funkcja jest tylko w drzwiach modułu. Wstawianie zdjęcia do treści robi edytor podtoru 3b.
- `uploadReportPhoto` nie został dodany, bo nie ma go w `main`.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | build, część #45: zdjęcie dla edytora | Wystaw `uploadEditorPhoto` w drzwiach modułu media, użyj istniejącej ścieżki zdjęcia i `POST /api/media/upload`. Bez UI i bez zmian poza `src/features/media/`. | Dodało `editorPhoto.ts` i `editorPhoto.test.ts`, wpis w `index.ts` i ten plik. Testy: wysyłka i wymiary, 403, 500, HEIC bez wysyłki. Bez oryginału jako zapasu, zgodnie z #130. | | Szymon |
