## Changelog

### Dodane

- Zgłoszenia w panelu Samorządu: lista od najnowszego z filtrem po etapie (Wszystkie, Przyjęte, W trakcie, Załatwione), szczegół zgłoszenia z historią etapów i zmiana etapu paskiem wyboru z przyciskiem „Zapisz etap” (ekrany 6.4a–6.4d z `docs/projekt/EKRANY.md`, teksty dosłownie stamtąd).
- Zgłoszenie anonimowe pokazuje „Zgłoszenie anonimowe” i „Samorząd nie widzi, kto je wysłał.”. Serwer nie wysyła numeru autora w żadnej odpowiedzi (lista, szczegół, zmiana etapu), także przy zgłoszeniu z autorem. Zgłoszenie z autorem pokazuje tylko „Autor zgłosił bez anonimowości.”, bo żaden moduł nie wystawia jeszcze imienia i klasy ucznia przez swoje drzwi.
- Serwer pod `/api/reports/admin`: `GET /` (lista), `GET /:id` (zgłoszenie z historią), `PATCH /:id` (zmiana etapu razem z wierszem historii i numerem osoby z sesji). Sprawdzanie roli stoi w jednej linii `use(...)` w `worker/reports/admin/routes.ts`.
- Przycisk „Zapisz etap” jest nieaktywny, dopóki etap się nie zmienił, i bez internetu (z napisem „Zmiana etapu wymaga internetu.”). Błąd zapisu zostawia przycisk aktywny. Bez internetu lista i szczegół pokazują ostatnio pobrane dane, a filtr działa.

### Uwaga

- Sprawdzanie roli jest tymczasową zaślepką (`worker/reports/admin/councilGuard.ts`), która odpowiada 403 każdemu zalogowanemu: ról jeszcze nie ma w bazie (podtor 8). Panel działa naprawdę dopiero po podmianie zaślepki na middleware podtoru 8.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-12 | #21, podtor 4b: zgłoszenia w panelu, zmiana etapu | Zbuduj w module reports/admin listę zgłoszeń z filtrem po etapie, szczegół i zmianę etapu. Anonimowy autor nie może wyjść z serwera. Rola w jednym miejscu, w testach zaślepka. | Dodało serwer w `worker/reports/admin/` (trasy, zapytania, zaślepka roli, testy Vitest z sprawdzeniem odpowiedzi HTTP), ekrany w `src/features/reports/admin/` (lista, szczegół, pasek wyboru, style, ikony, testy), test Playwright `e2e/reports-admin.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
