## Changelog

### Dodane

- Generator SQL pierwszego wdrożenia: `npm run db:prod-sql` zapisuje schemat do `dist-sql/schema.sql`, a z `-- --first-admin <login>` dwa pliki SQL pierwszego administratora. Kod zaproszenia pojawia się tylko na ekranie. Żadne polecenie nie łączy się z Cloudflare.
- Jednorazowy kod zaproszenia dla pierwszego administratora, w tym samym formacie i miejscu zapisu co kody z panelu (`TEB-XXXX-XX`, ważny 14 dni). Konto dostaje rolę `admin` poleceniem SQL po rejestracji, nie w aplikacji.
- Wspólny generator kodów zaproszeń `generateInviteCode`, używany przez serwer, skrypt i testy.
- Instrukcja pierwszego wdrożenia `docs/WDROZENIE.md`: konto, sekrety, schemat, pierwszy administrator, sprawdzenie po wdrożeniu i wycofanie.

### Zmienione

- `wrangler.jsonc` i `docs/STAN_PRAC.md` (sekcja „Przed pierwszym wdrożeniem”) wskazują na `docs/WDROZENIE.md` zamiast na `docs/ARCHITECTURE.md`.
- `dist-sql/` jest w `.gitignore`, bo plik z kodem zaproszenia nie może trafić do repozytorium.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | Start bazy produkcyjnej (gałąź chore/start-bazy-prod) | Przygotować bez wdrażania: skrypt SQL, tryb pierwszego administratora z jednorazowym kodem, instrukcję `docs/WDROZENIE.md`, poprawić wskaźniki w `wrangler.jsonc` i `docs/STAN_PRAC.md`, dodać test generatora. | Dodano scripts/prodSql.ts, worker/auth/invite/generateInviteCode.ts, worker/auth/invite/firstAdminSql.ts i ich test, docs/WDROZENIE.md. Zmieniono worker/auth/invite/inviteCodes.ts (generator wyciągnięty bez zmiany działania), package.json (`db:prod-sql`), .gitignore (`dist-sql/`), wrangler.jsonc i docs/STAN_PRAC.md (wskaźniki). | do uzupełnienia | do uzupełnienia |
