## Changelog

### Dodane

- Aplikację można dodać do ekranu głównego telefonu: ma nazwę „TEB Student”, ikonę ze znakiem marki (kwadrat z literą „T”) i otwiera się bez paska adresu. Ikony: 192, 512, maskable (Android) i 180 (iPhone).
- Telefon zapisuje pliki aplikacji (service worker). Dzięki temu aplikacja otwiera się bez internetu. Dane z `/api/` nie są zapisywane, bo obsłuży je później TanStack Query.
- Nowa wersja pobiera się w tle i włącza sama. Pasek „Jest nowa wersja” czeka na decyzję zespołu (pytanie w pull requeście).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | build/pwa, konfiguracja vite-plugin-pwa | Skonfiguruj vite-plugin-pwa: manifest, ikony, service worker bez cache `/api/`, meta tagi iOS i test Playwright. | Dodało `VitePWA` w `vite.config.ts`, meta tagi w `index.html`, ikony PNG w `public/`, test `e2e/pwa.spec.ts`, drugi serwer (podgląd zbudowanej aplikacji) w `playwright.config.ts` i ten plik. | do uzupełnienia | do uzupełnienia |
