## Changelog

### Dodane

- Szkielet aplikacji: ekran startowy React z napisem „W budowie” i Worker Hono z adresem `/api/health`.
- Skrypty `npm run dev`, `build`, `test`, `lint` i `test:e2e`. Serwer deweloperski i Playwright biorą port ze zmiennej `PORT`.
- Test Vitest adresu `/api/health` (w środowisku Cloudflare) i test Playwright ekranu startowego.
- Pakiety z `docs/TECHNOLOGIE.md` w dokładnych wersjach.

### Zmienione

- `npm run lint` sprawdza na razie tylko typy (TypeScript 7). ESLint z cyklami, `jsdoc` i limitami z `docs/STANDARD_KODU.md` czeka na wersję typescript-eslint, która obsługuje TypeScript 7.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | etap A, szkielet (`build/szkielet`) | Zainstaluj pakiety w przypiętych wersjach, zrób minimalny szkielet z portem z `PORT` i skryptami, wpisz komendy do `AGENTS.md`. Lint z limitami odłożony do obsługi TypeScript 7. | Dodało `package.json` z pakietami, `index.html`, `src/`, `worker/`, `e2e/`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `wrangler.jsonc`, cztery pliki `tsconfig`. Zmieniło blok komend w `AGENTS.md` i listę „Do sprawdzenia przed startem” w `docs/TECHNOLOGIE.md`. | | |
