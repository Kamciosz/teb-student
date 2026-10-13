## Changelog

### Dodane

- Wpis `runtimeCaching` w `vite.config.ts`: paczki JavaScript z `assets/` spoza listy zapisu zapisują się w osobnej pamięci `lazy-js` przy pierwszym użyciu (strategia CacheFirst, limit 40 wpisów).

### Zmienione

- Lista zapisu w telefonie (`workbox.globIgnores`) pomija paczkę `RichEditor-*`, także wersję „-legacy-”. Zapis przy instalacji na `origin/main` (750c145): 16 wpisów (2030,34 KiB) przed zmianą, 14 wpisów (1238,62 KiB) po zmianie.
- Test „edytor otwiera się i działa bez internetu” czeka teraz, aż service worker przejmie stronę, otwiera krok edytora online i dopiero potem czeka na paczkę `RichEditor` w pamięci. Asercje po wyłączeniu sieci nie zmieniły się.
- Edytor wpisów działa bez sieci po pierwszym otwarciu kroku edytora przy połączeniu. Wcześniej działał od razu po zapisaniu aplikacji w telefonie.

### Otwarte

- Panele (`admin`, `reports/admin`, `surveys/admin`, `news/admin`) nie są osobnymi paczkami. Są w `index-*.js`, więc tej zmianą nie da się ich wyłączyć z zapisu. Trzeba by je ładować leniwie w `src/App.tsx`, a to należy do innych torów.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 0, zapis PWA bez paczek edytora (`build/pwa-precache`) | Wyłącz paczki Tiptapa z zapisu przy instalacji, dodaj zapis przy pierwszym użyciu, zmierz zapis przed i po, zaktualizuj test edytora offline tak, by tylko przygotowanie się zmieniło. | Zmieniło `vite.config.ts` (`globIgnores`, `runtimeCaching`) i przygotowanie testu w `e2e/news-editor.spec.ts`. Dodało ten plik. | | |
