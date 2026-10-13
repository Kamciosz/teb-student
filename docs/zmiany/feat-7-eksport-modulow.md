## Changelog

### Dodane

- „Pobierz moje dane” zawiera teraz zgłoszenia ucznia i ankiety, w których wziął udział (bez treści odpowiedzi). Konto w pliku ma też chwilę założenia.
- Dane biorą się tylko z drzwi (`index.ts`) modułów auth, reports i surveys, a każde zapytanie dostaje numer ucznia z sesji.
- Pole `missing` jest puste, bo każdy potrzebny moduł wystawia już swój eksport.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 7: eksport modułów | Podpiąć do „Pobierz moje dane” eksporty już wystawione w `index.ts` modułów (konto, zgłoszenia, ankiety), usunąć podpięte z `missing`, importować tylko z drzwi, dodać testy Vitest i przypadek e2e. | Zmieniło `worker/profile/exportData.ts` (pięć odczytów przez drzwi auth, reports, surveys i profilu, `missing` pusty), `worker/profile/routes.ts` (opis w komentarzu), `worker/profile/exportData.test.ts` (zgłoszenia, ankiety, brak wycieku danych Anny), `e2e/profile.spec.ts` (plik z zgłoszeniami i ankietami) oraz ten plik. | do uzupełnienia | Szymon Sosnowski |
