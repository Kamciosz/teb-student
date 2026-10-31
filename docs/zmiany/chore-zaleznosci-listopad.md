## Changelog

### Zmienione

- Podbite pakiety, które przechodzą bramkę: React i React DOM do 19.3.1, TanStack Query do 5.104.5, Better Auth i jego wtyczka passkey do 1.7.12, Tiptap do 3.32.0. Każda rodzina ma jedną wersję, bo pakiety jednej rodziny nie działają ze sobą w mieszanych wersjach.

### Bezpieczeństwo

- Usunięte luki o wysokiej wadze z `npm audit`: `zod` (przez Better Auth) i `undici` (przez Miniflare). Wymuszone wersje w sekcji `overrides` w `package.json`. `fast-uri` podbity do 3.1.9 (tylko zależność deweloperska).
- Pozostają luki o średniej i niskiej wadze w `workbox-build` i `vite-plugin-pwa`. Naprawa wymaga skoku major, więc zostają do osobnej zmiany.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | Podbicie zależności i usunięcie luk zod i undici (gałąź chore/zaleznosci-listopad) | Sprawdzić przyczyny błędów w PR Dependabota #204–#207, podbić rodziny pakietów razem, usunąć wysokie luki bez `--force` i bez skoku major, zachować tylko podbicia, które przechodzą bramkę. | Zmieniono package.json (wersje rodzin, overrides dla `@better-auth/core`, `zod`, `undici`, `fast-uri`) i package-lock.json. Dodano ten plik zmian. | do uzupełnienia | do uzupełnienia |
