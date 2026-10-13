## Changelog

### Dodane

- Kolejność kafelków pulpitu, jak widżety w iPhonie: przycisk „Zmień układ” w nagłówku włącza tryb edycji. Przy każdym kafelku stoją przyciski „Wyżej” i „Niżej” (pole dotyku 44×44 px, z opisem dla czytnika ekranu). „Gotowe” kończy tryb.
- Wybrana kolejność zapisuje się w pamięci telefonu i wraca po odświeżeniu. Zapis, który się nie czyta albo ma nieznany kafelek, nie psuje pulpitu: nieznane kafelki są pomijane, brakujące wracają na koniec w domyślnej kolejności.
- Ankieta i zgłoszenia stoją obok siebie tylko wtedy, gdy są jedno przy drugim. Po zmianie kolejności każdy z nich może mieć cały rząd.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 9: kolejność kafelków pulpitu (gałąź feat/9-kolejnosc-kafelkow) | Dodaj tryb edycji kafelków („Zmień układ”, „Wyżej”, „Niżej”, „Gotowe”) z zapisem kolejności w localStorage, testami Vitest i testem e2e przeładowania. | Dodało `src/features/dashboard/tileOrder.ts` (sortowanie, zapis i odczyt z try/catch, przesunięcia, grupowanie pary) i `TileRows.tsx` (rzędy i przyciski w trybie edycji). Zmieniło `DashboardScreen.tsx` (stan kolejności i trybu), `DashboardHeader.tsx` (przycisk układu), `dashboard.css` (style trybu edycji), `tiles.test.tsx` (nowe propsy nagłówka) oraz dodało `tileOrder.test.ts`, rozszerzyło `e2e/dashboard.spec.ts` i dodało ten plik. | do uzupełnienia | Szymon Sosnowski |
