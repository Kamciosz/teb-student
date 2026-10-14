## Changelog

### Dodane

- Szczegół zgłoszenia w panelu Samorządu pokazuje zdjęcie dołączone do zgłoszenia. Podgląd ładuje się leniwie i nie wychodzi poza szerokość ekranu. Kliknięcie otwiera pełny plik w nowej karcie (`/api/media/<id>`). Bez zdjęcia nie pokazujemy nic.
- Zgłoszenie anonimowe też pokazuje zdjęcie, ale bez danych autora, tak jak dotąd.
- Serwer zwraca `photoId` (tekst albo `null`) w liście i w szczególe zgłoszeń panelu (`worker/reports/admin/reportsAdminRepository.ts`, `COUNCIL_FIELDS`). Numer autora nadal nie wychodzi w odpowiedzi.

### Otwarte

- Podgląd zdjęcia w panelu wymaga sesji ucznia, bo `GET /api/media/:id` używa `requireStudent`. Członek Samorządu jest uczniem, więc powinien przejść, ale w testach e2e zdjęcie jest podstawione. Sprawdzenie na prawdziwym koncie z rolą Samorządu zostaje do ręcznego testu po wdrożeniu.
- Napisy: alt zdjęcia „Zdjęcie dołączone do zgłoszenia” są do uzgodnienia z zespołem (TO_AGREE).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | podtor 4b: zdjęcie w zgłoszeniu w panelu | Dodanie `photoId` do szczegółów i listy zgłoszeń panelu, zdjęcie w `ReportDetail.tsx` z linkiem w nowej karcie, testy Vitest i scenariusz e2e. | Zmieniło `reportsAdminRepository.ts` (pole `photoId` w `COUNCIL_FIELDS` i typie `CouncilReport`), `routes.test.ts` (test `photoId` bez numeru autora), `api.ts` (typ `AdminReport`), `ReportDetail.tsx` (komponent `ReportPhoto`), `reportsAdmin.css` (klasa `ra-photo`), `reports-admin.spec.ts` (stuby `photoId` i scenariusz zdjęcia) oraz dodało ten plik. | do uzupełnienia | Szymon |
