## Changelog

### Dodane

- Bez zmian dla użytkownika. Drzwi modułu media (`src/features/media/index.ts`) wystawiają `uploadReportPhoto` i `ReportPhotoUnreadableError`. Formularz zgłoszeń użyje ich do wysłania zdjęcia. Zdjęcie idzie do `POST /api/media/report-photo`; gdy telefon nie odczyta pliku (np. HEIC), nic nie wysyła, bo zgłoszenie anonimowe nie może nieść oryginału z GPS.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | Część #47 (zdjęcie w zgłoszeniu), front modułu media, gałąź build/media-zdjecie-zgloszenia-front | Wystaw w drzwiach media funkcję wysyłki zdjęcia do zgłoszenia, bez zapasowej wysyłki oryginału, z testami Vitest. | Dodało `src/features/media/reportPhoto.ts` (wysyłka i `ReportPhotoUnreadableError`), `src/features/media/reportPhoto.test.ts`, wyeksportowało je w `src/features/media/index.ts`, wyeksportowało `resizeOnCanvas` w `src/features/media/imagePipeline.ts` i ten wpis. | Do ustalenia | Szymon Sosnowski |
