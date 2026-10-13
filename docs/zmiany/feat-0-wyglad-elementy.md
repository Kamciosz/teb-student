## Changelog

### Dodane

- Wspólne elementy ekranów w `src/shared/ui/`, dostępne z `src/shared/index.ts`: przycisk (warianty accent, soft, outline), znacznik do wyboru, pole tekstowe z etykietą i błędem, kafelek, etykieta statusu, pasek postępu z `clampPercent`, arkusz wysuwany z dołu, pusty stan.
- Dolny pasek w wyglądzie z makiety: przycisk „+” pośrodku, bieżący ekran podkreślony, cele dotyku co najmniej 44 px.

Moduły nie zmieniają się przez ten wpis. Ekrany przejdą na nowe elementy w swoich podtorach.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | etap A, podtor 0: wspólny wygląd i elementy ekranów | Zrób wspólne elementy w `src/shared/ui/` (przycisk, znacznik, pole, kafelek, etykieta, pasek postępu, arkusz, pusty stan, dolny pasek) z testami na klawiaturę, wyłączenie i fokus, bez zmian w innych modułach. | Dodało pliki komponentów, arkuszy stylów i testów w `src/shared/ui/`, dopisało eksporty w `src/shared/index.ts`, linię w `docs/ARCHITECTURE.md` i test `e2e/shared-wyglad.spec.ts`. Zmieniło `vitest.config.ts` (przepuszczenie CSS dla testów `?raw`). | do uzupełnienia | Kacper, Bohdan |
