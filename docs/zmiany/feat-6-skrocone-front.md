## Changelog

### Zmienione

- Ekran licznika (`/bell`) pokazuje osobie z rolą Samorządu przełącznik „Lekcje skrócone dziś”. Włączenie wysyła `POST /api/bell/shortened/:date`, wyłączenie `DELETE` tego samego adresu. Odmowa 403 pokazuje komunikat „Tylko Samorząd może zmienić dzień skrócony.”, inny błąd pokazuje ogólny komunikat zapisu. Uczeń przełącznika nie widzi. Napisy błędów są do potwierdzenia (TO_AGREE).
- Lista dni skróconych jest pobierana z `GET /api/bell/shortened` przez TanStack Query, z kluczem dnia i czasem świeżości 10 minut. Licznik dostaje tę listę i wybiera plan skrócony dla tych dni.
- `currentBellState` przeniesiono z `index.ts` do `bellState.ts`, żeby licznik nie importował drzwi podtoru (cykl importów). `index.ts` nadal go eksportuje, więc importy z drzwi nie zmieniły się.
- Bramka Samorządu opiera się na etykiecie wejścia do panelu „Panel Samorządu” z `usePanelEntry()`, bo `usePanelLevel` nie jest wyeksportowany z drzwi `admin/`. Rola, której nie udało się wczytać, nie pokazuje przełącznika.
- `e2e/bell.spec.ts`: stuby sesji, roli (`/api/admin/me`) i listy dni skróconych oraz przypadki: Samorząd włącza dzień, uczeń go nie widzi, licznik w dniu skróconym liczy według skróconego planu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 6: przełącznik dni skróconych (PR do uzupełnienia, baza `feat/6-dzien-skrocony`) | Pobranie listy dni skróconych, przełącznik tylko dla Samorządu, komunikat przy 403, licznik według skróconego planu, testy Vitest i e2e. | Zmieniło `src/features/bell/` (nowe `shortenedApi.ts`, `shortenedQueries.ts`, `ShortenedDaySwitch.tsx` i testy; zmienione `BellScreen.tsx`, `BellCountdown.tsx` i jego test, `bellState.ts`, `index.ts`, `bell.css`), `e2e/bell.spec.ts` oraz dodało ten plik. | do uzupełnienia | Szymon |
