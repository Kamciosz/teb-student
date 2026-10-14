## Changelog

### Dodane

- W kroku opisu formularza zgłoszenia uczeń może dodać nieobowiązkowe zdjęcie: przycisk „Dodaj zdjęcie”, nazwę wybranego pliku i „Usuń zdjęcie”. Gdy wysyłanie się nie uda, pokazuje się komunikat i „Spróbuj ponownie” (przy nieczytelnym zdjęciu bez ponawiania, bo potrzebny jest inny plik).
- Zgłoszenie z zdjęciem zapisuje numer zdjęcia z modułu media. Serwer sprawdza, że zdjęcie istnieje i należy do tego samego ucznia; inaczej odrzuca zgłoszenie (400 albo 403).

### Zmienione

- Trasa wysyłania zgłoszenia przyjmuje opcjonalne pole `photoId` (format: litery, cyfry, `_` i `-`, najwyżej 64 znaki).
- Wysyłanie zgłoszenia jest zablokowane, gdy zdjęcie jest w trakcie wysyłania albo po jego błędzie, dopóki uczeń go nie usunie lub nie wyśle ponownie.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | Zdjęcie w zgłoszeniu ucznia (podtor 4a, część 2) | Dodaj opcjonalne zdjęcie do formularza zgłoszenia, sprawdzaj właściciela po stronie serwera, dopisz testy i dokument | Dodano `checkReportPhoto.ts` i `useReportPhoto.ts`, pole `ReportPhotoField.tsx`, sprawdzanie `photoId` w `validation.ts` i `routes.ts`, pole w `api.ts` i `ReportForm.tsx`, style w `reportsStudent.css`, testy Vitest i Playwright oraz ten plik | | Szymon Sosnowski |
