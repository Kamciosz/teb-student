## Changelog

### Dodane

- W ustawieniach profilu jest nowy wiersz „Moje urządzenia” (do uzgodnienia z zespołem). Prowadzi do adresu `/auth/email/urzadzenia`, a wiersz ma co najmniej 44 px wysokości do dotknięcia.
- Na main zalogowanego ucznia adres `/auth/email/urzadzenia` nadal przekierowuje na pulpit, bo ekran listy urządzeń pochodzi z PR #108 (podtor 1a). Pełne przejście zadziała po scaleniu #108, dlatego merge tego PR ma być po #108.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 7: link do urządzeń (PR do uzupełnienia, zależy od #108) | Dodaj w ustawieniach profilu wiersz „Moje urządzenia” prowadzący do `/auth/email/urzadzenia`, w stylu wierszy ustawień, z celem dotyku min. 44 px, i test e2e sprawdzający adres po kliknięciu. | Dodało wiersz w `SettingsScreen.tsx` (link z ikoną `smartphone` w `icons.tsx`), test w `e2e/profile.spec.ts` i ten plik. Nie ruszało `src/features/auth` (blokada przekierowania to podtor 1a). | do uzupełnienia | Szymon |
