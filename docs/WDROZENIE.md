# Pierwsze wdrożenie TEB Student

Ta instrukcja prowadzi przez pierwsze wdrożenie aplikacji na Cloudflare: od konta do działającego panelu z pierwszym administratorem. Kroki są w kolejności, w jakiej je wykonać. Polecenia kopiuj w katalogu repozytorium.

Wartości w `<nawiasach ostrych>` podstawiasz sam. Hasła i sekrety nigdy nie wklejaj do pliku, czatu ani historii poleceń.

## Zanim zaczniesz

- Node.js 22.22 albo nowszy (`node --version`), zgodnie z polem `engines` w `package.json`.
- Konto Cloudflare z planem płatnym Workers. Tylko on daje cofanie bazy D1 (Time Travel) przez 30 dni, patrz „Wycofanie”.
- Decyzje właściciela: adres aplikacji (domena albo `*.workers.dev`), plan płatny, dostawca poczty.

## 1. Konto Cloudflare

Załóż konto na https://dash.cloudflare.com/sign-up i włącz plan płatny Workers w panelu „Plans”. Zapisz identyfikator konta z panelu (nie wklejaj go do repozytorium).

## 2. Zależności i logowanie do Cloudflare

Jeśli w powłoce jest ustawiona zmienna `CLOUDFLARE_API_TOKEN`, wrangler używa jej zamiast logowania w przeglądarce. Usuń ją przed logowaniem.

```bash
npm ci
unset CLOUDFLARE_API_TOKEN
npx wrangler login
npx wrangler whoami
```

`wrangler login` otwiera przeglądarkę. Po zalogowaniu `wrangler whoami` pokazuje nazwę konta.

## 3. Baza D1

Zakładasz bazę `teb-student` tym poleceniem. Krok 5 potrzebuje istniejącej bazy, więc robisz to ręcznie, przed schematem.

```bash
npx wrangler d1 create teb-student
```

Wrangler wypisze `database_id`. Plik `wrangler.jsonc` celowo go nie ma. Wpisz go tam dopiero po zgodzie właściciela, jako osobną zmianę w repozytorium.

## 4. Sekrety Workera

Sekrety wpisujesz w prompt, nie w poleceniu. Wartość `BETTER_AUTH_SECRET` wygeneruj lokalnie i nie zapisuj jej w pliku.

```bash
npx wrangler secret put BETTER_AUTH_SECRET
# wklej wynik polecenia: openssl rand -base64 32

npx wrangler secret put BETTER_AUTH_URL
# wpisz adres aplikacji, na przykład: https://<adres-aplikacji>
```

`BETTER_AUTH_URL` jest potrzebny także do logowania Face ID, bo z niego wyliczany jest identyfikator klucza (`rpID`). Musi być dokładnie adresem, pod którym działa aplikacja.

Jeśli `wrangler secret put` zgłosi, że Worker nie istnieje, wykonaj najpierw krok 6 (wdrożenie kodu), a potem wróć do tego kroku. Do czasu ustawienia sekretów aplikacja odpowie błędem konfiguracji, bez danych.

## 5. Schemat bazy na produkcji

Schemat jest w pliku SQL generowanym z kodu. Polecenie nic nie wysyła do Cloudflare, tylko zapisuje `dist-sql/schema.sql`.

```bash
npm run db:prod-sql
npx wrangler d1 execute teb-student --remote --file=dist-sql/schema.sql
```

Wdrożenie kodu nie zakłada tabel. Robi to ten krok, dlatego wykonuj go przed krokiem 6.

Schemat tworzy tabele bez `IF NOT EXISTS`. Uruchom go raz, na pustej bazie. Drugie uruchomienie zgłosi, że tabele już istnieją, i niczego nie usunie.

## 6. Wdrożenie kodu

```bash
npm run build
npx wrangler deploy
```

Po wdrożeniu Wrangler wypisze adres Workera. Ten adres wpisz jako `BETTER_AUTH_URL`, jeśli jeszcze go nie ustawiłeś w kroku 4 (albo zmień sekret poleceniem `npx wrangler secret put BETTER_AUTH_URL`).

Jeśli `wrangler deploy` zgłosi konflikt z bazą, wpisz `database_id` z kroku 3 do `wrangler.jsonc` jako osobną zmianę, po zgodzie właściciela.

## 7. Pierwszy administrator

Pierwsze konto dostaje rolę `admin` ręcznie, z bazy. W aplikacji nie da się nadać tej roli. Zanim zaczniesz, wybierz login (3–30 znaków: małe litery, cyfry, kropka, podkreślnik, myślnik).

```bash
# a) Przygotuj SQL. Kod zaproszenia pojawi się tylko na ekranie.
npm run db:prod-sql -- --first-admin <login>

# b) Wpisz kod do bazy, PRZED rejestracją.
npx wrangler d1 execute teb-student --remote --file=dist-sql/first-admin-invite.sql
```

Potem w aplikacji załóż konto: wpisz kod z ekranu, wybrany login i hasło (8–128 znaków). Kod działa jeden raz i wygasa po 14 dniach.

```bash
# c) Po rejestracji nadaj rolę admin temu kontu.
npx wrangler d1 execute teb-student --remote --file=dist-sql/first-admin-grant.sql

# d) Usuń plik z kodem, kod jest już zużyty.
rm dist-sql/first-admin-invite.sql
```

Wynik polecenia c) powinien pokazać jeden zmieniony wiersz. Wynik zero znaczy, że konto o tym loginie jeszcze nie istnieje, czyli rejestracja się nie odbyła i rola nie została nadana. Wtedy dokończ rejestrację i powtórz c).

Rolę możesz sprawdzić w bazie:

```bash
npx wrangler d1 execute teb-student --remote --command="SELECT role FROM panel_roles JOIN user ON user.id = panel_roles.user_id WHERE user.email = '<login>@login.invalid'"
```

Oczekiwany wynik: jeden wiersz z `admin`. Pusty wynik znaczy, że konto o tym loginie nie istnieje albo login się nie zgadza.

Jeśli kod nie działa (na przykład rejestracja się nie udała), wykonaj ponownie a) i b) i zarejestruj się nowym kodem. Plik z kodem usuń dopiero po udanej rejestracji, czyli po c).

## 8. Poczta (czeka na decyzję o dostawcy)

Wysyłka poczty (na przykład kod logowania z e-maila) wymaga dostawcy poczty. Ta część nie jest częścią pierwszego wdrożenia i nie blokuje logowania loginem i hasłem z kodem zaproszenia.

- Wybór dostawcy poczty: czeka na decyzję o dostawcy.
- Domena nadawcy i rekordy DNS: czeka na decyzję o dostawcy.
- Sekrety dostawcy w Workerze (`wrangler secret put`): czeka na decyzję o dostawcy.

## 9. Sprawdzenie po wdrożeniu

```bash
# Aplikacja odpowiada (oczekiwany wynik: 200)
curl -s -o /dev/null -w '%{http_code}\n' https://<adres-aplikacji>/api/health

# Bez zalogowania panel nie wydaje kodów (oczekiwany wynik: nie 200)
curl -s -o /dev/null -w '%{http_code}\n' https://<adres-aplikacji>/api/admin/invites
```

Potem zaloguj się w przeglądarce loginem administratora i sprawdź, że panel Samorządu się otwiera. Podczas tego wejścia można podejrzeć logi: `npx wrangler tail`.

## Wycofanie

**Kod.** Wraca poprzednia wersja Workera:

```bash
npx wrangler rollback
```

Przy pierwszym wdrożeniu nie ma poprzedniej wersji. Wtedy usuń Workera poleceniem `npx wrangler delete`. Dane w bazie D1 zostają.

**Baza.** Time Travel cofa całą bazę do wskazanej chwili, w ciągu 30 dni, na planie płatnym. Cofnięcie kasuje dane zapisane po tej chwili, więc decyzja należy do właściciela. Składnię sprawdź przed użyciem:

```bash
npx wrangler d1 time-travel --help
npx wrangler d1 time-travel info teb-student
npx wrangler d1 time-travel restore teb-student --timestamp=<RFC3339, na przykład 2026-11-01T08:00:00Z>
```

## Sprawdzenie lokalne zbudowanego Workera (bez Cloudflare)

Ta sekcja pokazuje, jak sprawdzić zbudowany kod na własnym komputerze, bez konta. Wrangler czyta `.dev.vars` z katalogu zbudowanego configu, więc plik zapisujesz właśnie tam. Sekret jest losowany i zapisywany do pliku od razu, nie pokazuje się na ekranie.

```bash
npm run build
printf 'BETTER_AUTH_SECRET="%s"\nBETTER_AUTH_URL="http://localhost:6500"\n' "$(openssl rand -base64 32)" > dist/teb_student/.dev.vars
chmod 600 dist/teb_student/.dev.vars
npx wrangler dev -c dist/teb_student/wrangler.json --port 6500 --persist-to .wrangler/state
```

Plik `dist/teb_student/.dev.vars` zawiera `BETTER_AUTH_SECRET` i `BETTER_AUTH_URL=http://localhost:6500`. Katalog `dist/` jest w `.gitignore`. Nie trzymaj tego pliku w katalogu głównym repozytorium: kopia tam zmieniła wynik testów Vitest, bo testy w `worker/reports` padały z 401.
