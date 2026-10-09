# Architektura

<!-- code-docs: lang=PL+EN map=docs/ARCHITECTURE.md tags=@author,@since,@uses,@used_by,@invariant -->

To jest mapa projektu. Zasady komentarzy w kodzie: `docs/STANDARD_KODU.md`. Założenia architektury: `AGENTS.md`, część „Założenia architektury”.

Stan po etapie A (rejestracja podtorów): każdy z 15 podtorów ma swój katalog, wpis w routerze, wpis w serwerze i ekran „W budowie”. Prawdziwych funkcji jeszcze nie ma. Układ wynika z technologii zatwierdzonych przez Bohdana (`docs/TECHNOLOGIE.md`, `docs/adr/0001-technologie.md`) i z adresów z `docs/adr/0003-adresy-podtorow.md`.

## Części aplikacji

| Część | Co robi | Technologia |
|---|---|---|
| Aplikacja w telefonie | ekrany, nawigacja, dane zapisane na czas bez internetu, zmniejszanie zdjęć i filmów przed wysłaniem | React, React Router (tylko w przeglądarce), TanStack Query, vite-plugin-pwa |
| Serwer | jeden Worker: wysyła pliki aplikacji i odpowiada na zapytania o dane | Cloudflare Workers, Hono |
| Baza | konta, sesje, wpisy, zgłoszenia, ankiety | Cloudflare D1, Drizzle |
| Pliki | zdjęcia i filmy wysyłane prosto z telefonu | Cloudflare R2 |
| Wyświetlanie zdjęć | miniatury i pełne zdjęcia w AVIF albo WebP | Cloudflare Images |
| Logowanie | kod na mail, kod zaproszenia z loginem i hasłem | Better Auth, Cloudflare Email Service, Resend jako zapas |

## Moduły i podtory

Podtor to jedna część modułu. Numery podtorów i właściciele: `docs/PODZIAL_PRACY.md`, część 3. Ekran w telefonie leży w `src/features/<moduł>/<część>/`, serwer w `worker/<moduł>/<część>/`. Moduł bez części ma jeden katalog `<moduł>/`.

| Podtor | Moduł i część | Adres w telefonie | Adres serwera | Właściciel | Tabele bazy | Kasowanie danych ucznia |
|---|---|---|---|---|---|---|
| 0 | wspólne | brak | brak | Bohdan, Kacper | brak | lista w `worker/shared/accountDeletion.ts` |
| 1a | `auth/email` | `/auth/email/*` | `/api/auth/email` | do ustalenia | `schema/auth.ts` | tak |
| 1b | `auth/invite` | `/auth/invite/*` | `/api/auth/invite` | do ustalenia | tabele z 1a | przez 1a |
| 2 | `media` | `/media/*` | `/api/media` | do ustalenia | `schema/media.ts` | tak |
| 3a | `news/feed` | `/news/feed/*` | `/api/news/feed` | do ustalenia | `schema/news.ts` | tak |
| 3b | `news/editor` | `/news/editor/*` | `/api/news/editor` | do ustalenia | tabele z 3a | przez 3a |
| 3c | `news/admin` | `/news/admin/*` | `/api/news/admin` | do ustalenia | tabele z 3a | przez 3a |
| 4a | `reports/student` | `/reports/student/*` | `/api/reports/student` | do ustalenia | `schema/reports.ts` | tak |
| 4b | `reports/admin` | `/reports/admin/*` | `/api/reports/admin` | do ustalenia | tabele z 4a | przez 4a |
| 5a | `surveys/vote` | `/surveys/vote/*` | `/api/surveys/vote` | Jakub | `schema/surveys.ts` | tak |
| 5b | `surveys/admin` | `/surveys/admin/*` | `/api/surveys/admin` | Jakub | tabele z 5a | przez 5a |
| 6 | `bell` | `/bell/*` | `/api/bell` | Kacper | `schema/bell.ts` | nie, brak danych ucznia |
| 7 | `profile` | `/profile/*` | `/api/profile` | Jakub | `schema/profile.ts` | tak |
| 8 | `admin` | `/admin/*` | `/api/admin` | do ustalenia | `schema/admin.ts` | tak |
| 9 | `dashboard` | `/` | `/api/dashboard` | Kacper | brak | nie, brak danych ucznia |

Tabele leżą w `worker/db/schema/`, dane testowe w `worker/db/seed/`. Każdy plik należy do podtoru „a” modułu, a plik `index.ts` w tych katalogach zbiera je wszystkie. Tabel Better Auth tu jeszcze nie ma. Wygeneruje je podtor 1a.

### Gdzie jest rejestr

Te pliki zbierają podtory. Zmienia je tylko etap A albo Bohdan, nie podtor:

- `src/app/routes.ts`: lista ekranów w telefonie (React Router). Importuje tylko `index.ts` modułów.
- `worker/mounts.ts`: lista routerów serwera (Hono). `worker/index.ts` podpina każdy wpis pod jego adres.
- `src/features/<moduł>/index.ts` i `worker/<moduł>/index.ts`: zbierają `index.ts` podtorów.
- `worker/db/schema/index.ts` i `worker/db/seed/index.ts`: zbierają pliki modułów.
- `worker/shared/accountDeletion.ts`: lista funkcji, które kasują dane ucznia przy usunięciu konta.
- `worker/shared/index.ts`: typ `Env` (binding `DB`) i `DeleteStudentDataInput`; `worker/shared/seed.ts`: typ `SeedSet`.
- `src/shared/navigation/items.ts`: wpisy dolnego paska i menu panelu.

Wpis w rejestrze prowadzi do `index.ts` podtoru. Podtor zmienia tylko swój katalog. Dzięki temu dwa podtory nigdy nie zmieniają tego samego pliku.

### Adresy

Telefon: `/<moduł>/<część>/*`. Pulpit ma adres `/`. Serwer: `/api/<moduł>/<część>`. Wszystko pod `/api/` obsługuje Worker (`run_worker_first` w `wrangler.jsonc`). Reszta to ekrany aplikacji. Ekrany 3c, 4b, 5b i 8 leżą w ramie panelu Samorządu z menu (`src/features/admin/AdminLayout.tsx`).

### Kasowanie danych ucznia

Każdy moduł z danymi ucznia ma w swoim `index.ts` funkcję `delete<Moduł>StudentData`. Dziś każda nic nie robi i ma test. Podtor, który dodaje dane, wypełnia swoją funkcję. Lista siedmiu modułów jest w `worker/shared/accountDeletion.ts`. Usunięcie konta wywoła je po kolei. D1 nie ma transakcji między zapytaniami, więc kasowanie w różnych modułach nie jest jedną całością. Wewnątrz modułu używaj `db.batch`. Pulpit i licznik do dzwonka nie mają własnych danych ucznia, więc nie mają funkcji kasującej.

### Baza danych

Baza to Cloudflare D1 z bindingiem `DB` (`wrangler.jsonc`). Nie ma migracji: bazę lokalną i testową tworzymy od nowa ze schematu Drizzle (`AGENTS.md`, `docs/STANDARD_KODU.md`, część 7).

**Jak podtor dodaje tabelę**

1. Tabela idzie do `worker/db/schema/<moduł>.ts` (tylko podtor „a” modułu). Plik zbierający `worker/db/schema/index.ts` już ją wczyta.
2. Dane testowe idą do `worker/db/seed/<moduł>.ts` jako lista zestawów o nazwie `<MODUŁ>_SEED_SETS` (typ `SeedSet` z `worker/shared`): `export const REPORTS_SEED_SETS: SeedSet[] = [{ table: reports, rows: REPORTS_SEED }];`. Kolejność zestawów nie ma znaczenia, klucze obce są sprawdzane na końcu.
3. Router, który czyta bazę, jest typu `new Hono<{ Bindings: Env }>()` (`Env` z `worker/shared`). W obsłudze zapytania baza jest w `context.env.DB`, a drizzle: `drizzle(context.env.DB)`.
4. Funkcja kasująca dane ucznia dostaje bazę w `input.db`.

**Jak uruchomić bazę**

```bash
npm run db:reset   # kasuje bazę lokalną i zakłada wszystkie tabele ze schematu (wyłącz najpierw npm run dev)
npm run db:seed    # wpisuje dane testowe wszystkich modułów (raz po db:reset)
npm run dev        # serwer deweloperski używa tej samej bazy lokalnej (.wrangler/state)
```

`npm run test:e2e` robi `db:reset` i `db:seed` sam. Po każdej zmianie schematu uruchom `db:reset` i `db:seed` jeszcze raz.

**Jak test używa bazy.** Przed każdym plikiem testów `worker/shared/testSetup.ts` zakłada w `env.DB` wszystkie tabele ze schematu. Test podtoru niczego nie zakłada: importuje tabelę ze `worker/db/schema/` i używa `env` z `cloudflare:workers`:

```ts
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import { reports } from '../../db/schema/reports';

await drizzle(env.DB).insert(reports).values({ /* … */ });
```

Baza testowa jest osobna dla każdego pliku testów, więc testy nie psują sobie danych. Dane testowe (seed) nie są wpisywane do bazy testowej: test wpisuje te wiersze, których potrzebuje.

**Skąd SQL.** Jedyne miejsce, które zamienia schemat na SQL, to `scripts/schemaSql.ts` (`drizzle-kit export`, ustawienia w `drizzle.config.ts`). Używają go `db:reset` i testy, więc baza lokalna i testowa mają te same tabele. Katalogu migracji nie ma i nie powstaje.

**Sekrety i ustawienia.** Lokalne ustawienia serwera (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`) są w `.dev.vars`, którego nie ma w repozytorium. Wzór bez prawdziwych wartości to `.dev.vars.example`: `cp .dev.vars.example .dev.vars`. Na produkcji sekret ustawia się przez `wrangler secret put BETTER_AUTH_SECRET`. Pola są opisane w typie `Env`.

**Wdrożenie.** `wrangler.jsonc` nie ma `database_id`, bo konta Cloudflare jeszcze nie ma. Pierwsze `wrangler deploy` założy bazę `teb-student` i zapisze jej identyfikator. Tabel nie zakłada: na bazie w chmurze trzeba wykonać SQL ze schematu (`node node_modules/drizzle-kit/bin.cjs export --config drizzle.config.ts`) w `wrangler d1 execute teb-student --remote --file=…`. Zespół ustala to przed pilotażem, razem ze sposobem zmian bazy po jego starcie.

## Najważniejsze przepływy

- **Logowanie kodem:** adres @teb.edu.pl → serwer wysyła kod 6 cyfr → uczeń wpisuje kod → sesja w D1.
- **Wysłanie zdjęcia:** telefon zmniejsza zdjęcie → serwer daje podpisany adres R2 → telefon wysyła plik prosto do R2 → serwer sprawdza rozmiar.
- **Bez internetu:** aplikacja otwiera się z pamięci telefonu i pokazuje ostatnio pobrane dane z napisem o braku internetu.
- **Nowa wersja:** telefon pobiera ją w tle i włącza przy następnym otwarciu albo po kliknięciu „Odśwież”.

## Czego świadomie nie robimy

- Librus w żadnej formie: nie ma API.
- Powiadomienia push, płatności, TEB Gąbki i odznaki.
- Kod ze starej aplikacji `Kamciosz/teb-app-production`: tylko inspiracja.
- Zapas na punkt kontrolny 29.10: jeśli logowanie albo aktualności nie działają, przechodzimy na Supabase i Vercel. Ekrany nie mogą zależeć od platformy.
