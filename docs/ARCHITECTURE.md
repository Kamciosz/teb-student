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
- `src/shared/navigation/items.ts`: wpisy dolnego paska i menu panelu.

Wpis w rejestrze prowadzi do `index.ts` podtoru. Podtor zmienia tylko swój katalog. Dzięki temu dwa podtory nigdy nie zmieniają tego samego pliku.

### Adresy

Telefon: `/<moduł>/<część>/*`. Pulpit ma adres `/`. Serwer: `/api/<moduł>/<część>`. Wszystko pod `/api/` obsługuje Worker (`run_worker_first` w `wrangler.jsonc`). Reszta to ekrany aplikacji. Ekrany 3c, 4b, 5b i 8 leżą w ramie panelu Samorządu z menu (`src/features/admin/AdminLayout.tsx`).

### Kasowanie danych ucznia

Każdy moduł z danymi ucznia ma w swoim `index.ts` funkcję `delete<Moduł>StudentData`. Dziś każda nic nie robi i ma test. Podtor, który dodaje dane, wypełnia swoją funkcję. Lista siedmiu modułów jest w `worker/shared/accountDeletion.ts`. Usunięcie konta wywoła je po kolei. D1 nie ma transakcji między zapytaniami, więc kasowanie w różnych modułach nie jest jedną całością. Wewnątrz modułu używaj `db.batch`. Pulpit i licznik do dzwonka nie mają własnych danych ucznia, więc nie mają funkcji kasującej.

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
