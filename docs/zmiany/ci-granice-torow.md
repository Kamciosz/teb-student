## Changelog

### Dodane

- Sprawdzenie „Granice torów” w CI. Gałąź `feat/<podtor>-…` może zmieniać tylko pliki swojego podtoru i `docs/zmiany/`. Gałęzie spoza `feat/` są pomijane, a nieznany podtor kończy się błędem z opisem po polsku.
- Samotest mapowania podtorów. Czyta też tabelę z `docs/PODZIAL_PRACY.md`, więc oblewa, gdy skrypt i dokument się rozjadą.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | etap A, punkt 7: „Granice torów” | Dodaj do CI sprawdzenie „Granice torów” według `docs/PODZIAL_PRACY.md`, z samotestem, który oblewa przy złym mapowaniu. | Dodało `.github/workflows/granice-torow.yml`, `.github/scripts/granice-torow.sh` i `.github/scripts/granice-torow.test.sh`. Dopisało zdanie w `docs/PODZIAL_PRACY.md`, część 4, punkt 7. | do uzupełnienia | Adam |
