## Changelog

### Zmienione

- Rama panelu Samorządu (`src/features/admin/AdminLayout.tsx`) nie rysuje już menu „Panel Samorządu”. Menu usunął podtor 8, a jego ekran główny (kafle części) prowadzi do części panelu. Rama jest bramką roli (`PanelGate`): uczeń bez roli widzi ekran 6.1d „Tylko dla Samorządu” na każdej części panelu, także na wpisach (3c), które wcześniej nie miały bramki.
- Usunięte style menu ramy (`.ad-menu`, `.ad-menu-link`) z `src/features/admin/admin.css`.
- Test `e2e/admin.spec.ts` ma nowy przypadek: uczeń bez roli na `/news/admin` widzi ekran 6.1d, a lista wpisów się nie pokazuje.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Issue #77, PR 2 z 3: rama panelu bez menu | Usuń menu z ramy panelu, zrób z niej bramkę roli i dodaj test ucznia bez roli na ekranie części. | Zmieniło `src/features/admin/AdminLayout.tsx`, `src/features/admin/admin.css`, `src/features/admin/index.ts`, `e2e/admin.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
