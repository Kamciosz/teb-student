# Stan prac

Stan na 18.10.2026. `main` po scaleniu #200. Ten plik mówi, co jest zrobione, co jest następne i jak kontynuować w nowym wątku albo przez inną osobę. Aktualizuj go po każdej większej turze pracy.

Wszystkie teksty aplikacji zatwierdził Szymon 14.10.2026 (#175, #179).

## Co jest w `main`

Do #61 (stan z 12.10): szkielet, PWA i baza D1, logowanie kodem (1a), aktualności (3a), zgłoszenia (4a), głosowanie w ankiecie (5a), pulpit (9). Od #62 do #156 weszło:

| Podtor | Co | Pull requesty |
|---|---|---|
| 0 | wspólne elementy ekranów i dolny pasek, paczka edytora poza zapisem w telefonie | #95, #99 |
| 1a, 1b | kody zaproszeń, login i hasło, lista urządzeń i wylogowanie z innych | #62, #67, #84, #86, #108 |
| 2 | zdjęcia i filmy dla redaktora, zasobnik R2 `MEDIA` | #93, #98 |
| 3a | wyszukiwanie, film z YouTube, przypięte wpisy na górze, ukrywanie zaplanowanych, podpis autora, stan „in_review” | #90, #105, #117, #118, #126, #138 |
| 3b | edytor w trzech krokach (Tiptap), rola redakcji, edycja szkicu, zaplanowana publikacja, zapis autora, wysyłka do korekty i zatwierdzenie | #65, #79, #85, #91, #97, #114, #123, #128, #141 |
| 3c | lista wpisów w panelu, publikacja, usuwanie, „Edytuj”, przypinanie (najwyżej 3), znacznik zaplanowanych, wpisy w korekcie | #82, #96, #101, #115, #122, #140, #144, #147, #152 |
| 4a | „Mnie też to dotyczy”, odpowiedź Samorządu przy zmianie etapu | #109, #113, #137 |
| 4b | zgłoszenia w panelu, zmiana etapu z odpowiedzią dla autora, imię i klasa autora, liczba „Mnie też”, sortowanie | #71, #83, #87, #92, #120, #132, #151, #154 |
| 5a | data zamknięcia, wielokrotny wybór, skala 1–5, krótka odpowiedź z podpowiedzią o anonimowości | #107, #125, #135, #146, #155 |
| 5b | ankiety w panelu, wyniki od 5 odpowiedzi, CSV, termin, typ pytania, skala, krótka odpowiedź | #78, #88, #106, #121, #131, #143, #150, #156 |
| 6 | licznik do dzwonka, następna lekcja, pusty plan, stan dnia | #94, #103, #129, #133, #139, #145 |
| 7 | profil i ustawienia, usunięcie konta, wiersz panelu, pobieranie moich danych ze wszystkich modułów, „Moje urządzenia” | #63, #89, #104, #110, #119, #124 |
| 8 | panel Samorządu, role, kody zaproszeń, pilotaż, dziennik zmian (publikacja, usunięcie, zmiana etapu) | #68, #69, #100, #111, #134, #148 |
| 9 | kafelek dzwonka, kolejność kafelków, minuty do dzwonka, stan dnia w nagłówku | #102, #116, #136, #142, #149, #153 |

Dni skróconych nie ma (decyzja Szymona 14.10). Funkcja usunięta.

Od #157 do #170 weszły zdjęcia w zgłoszeniach i we wpisach:

| Podtor | Co | Pull requesty |
|---|---|---|
| 2 | blokada zdjęć HEIC bez wysyłania oryginału, wysyłka zdjęcia do zgłoszenia i do treści wpisu | #130, #158, #159, #165 |
| 3a | zdjęcia w treści wpisu (tylko adresy `/api/media/`), sekcja „Źródła”, karty linków do mediów społecznościowych | #160, #161, #162 |
| 3b | zdjęcie w dokumencie wpisu (serwer), przycisk „Zdjęcie” w pasku edytora, opis i podpis zdjęcia | #164, #168, #170 |
| 4a | kolumna `photo_id`, pole „Dodaj zdjęcie” w formularzu, serwer sprawdza, czy plik należy do ucznia | #127, #167 |
| 4b | zdjęcie w szczegółach zgłoszenia w panelu | #166 |
| — | skrypt różnic schematu bazy, ten plik | #157, #163, #169 |

Od #172 do #179 weszły plan dzwonków, logowanie kluczem dostępu jako opcja, zatwierdzone teksty i poprawki dostępu do zdjęć. #172 został zamknięty bez scalenia i zastąpiony przez #176.

| PR | Tytuł | Co daje uczniowi lub zespołowi |
|---|---|---|
| #172 | feat(bell): wpisz prawdziwy plan dzwonków szkoły | Zamknięty bez scalenia, zastąpiony przez #176. |
| #173 | fix(news): stopka redakcji tylko przy autorze z rolą redakcji | Stopka „Redakcja gazetki” pojawia się tylko pod wpisami autorów z rolą redakcji. |
| #174 | feat(auth): logowanie kluczem dostępu (passkey) | Serwer obsługuje logowanie Face ID, odciskiem palca lub kluczem dostępu jako opcję obok kodu z maila. |
| #175 | fix: wdraża zatwierdzone teksty i usuwa kafel bez działania | Teksty zatwierdzone przez Szymona trafiają do aplikacji, a martwy kafel „Dodaj zdjęcie albo wideo” znika z edytora. |
| #176 | feat(bell): prawdziwy plan dzwonków szkoły | Plan dzwonków szkoły (lekcje 0–12, pon.–pt., 07:10–18:20) zamiast pustego planu. Zastępuje #172. |
| #177 | fix(media): zdjęcie zgłoszenia widzi tylko autor i administracja | Zdjęcie zgłoszenia widzi tylko autor i administracja, inni uczniowie dostają 404. |
| #178 | feat(profil): klucze Face ID i odcisk palca w ustawieniach | W profilu można dodać, nazwać i usunąć klucz Face ID lub odcisk palca, a na ekranie logowania jest przycisk logowania kluczem. |
| #179 | fix(komentarze): usuń dopiski „do ustalenia” z komentarzy | Dopiski „do ustalenia” znikają z komentarzy w kodzie; teksty dla ucznia bez zmian. |
| #180 | build: usuń dni skrócone z licznika dzwonka | Licznik zawsze liczy według zwykłego planu; przełącznik, trasy i tabela dnia skróconego zniknęły. |

Od #181 do #200 wszedł nowy wygląd ekranów: jak aplikacja systemowa (duże tytuły, grupy wierszy, pasek z powrotem). Zasady są w `docs/projekt/wyglad-ekranow.md`. #185 został zamknięty bez scalenia i zastąpiony przez #186.

| PR | Tytuł | Co daje uczniowi lub zespołowi |
|---|---|---|
| #181 | build(deps-dev): bump the babel group with 2 updates | Aktualizacja narzędzi budowania (Dependabot), bez zmian dla ucznia. |
| #182 | docs: stan prac po scaleniu #179 | Ten plik po scaleniu #179. |
| #183 | fix(news): nie zabieraj fokusu polu opisu zdjęcia po otwarciu okienka | Opis zdjęcia w edytorze da się wpisać od razu po otwarciu okienka. |
| #184 | fix(nawigacja): wyrównaj dolny pasek i usuń przycisk „+” | Dolny pasek ma pięć równych pozycji, bez przycisku „+” na środku. |
| #186 | feat(wyglad): wygląd aplikacji systemowej | Wspólne elementy: `ScreenHeader` (duży tytuł albo pasek z powrotem), `ListGroup`, `ListRow`, przyciski, segmenty, kolory i rozmiary tekstu. |
| #187 | style(profil): ekran Profil w wyglądzie ustawień systemu | Profil i ustawienia jako grupy wierszy, segmenty szkoły i motywu, przełącznik większego tekstu. |
| #188 | style(aktualnosci): ekran aktualności w wyglądzie systemowym | Lista i wpis z dużym tytułem, spokojne znaczniki, akcent tylko przy „Ważne”. |
| #189 | style(pulpit): pulpit w stylu aplikacji systemowej | Najbliższa lekcja na górze, reszta jako sekcje z wierszami. |
| #190 | style(logowanie): ekrany logowania w wyglądzie systemowym | Logowanie i kod zaproszenia bez podwójnych marginesów. |
| #191 | style(ankiety): odpowiedzi jako wiersze i wygląd ekranów ankiety | Odpowiedzi jako wiersze listy z ✓, w pasku „Pytanie 1 z 3”, tytuł ankiety nad pytaniem. |
| #192 | style(panel): lista zamiast kafli | Panel Samorządu jako lista, powrót do profilu, pola bez ramki. |
| #193 | style(zgloszenia): wiersze listy zamiast kart | Moje zgłoszenia jako wiersze, szczegóły zgłoszenia, kreator z „Anuluj” i przełącznikiem po prawej. |
| #194 | style(redakcja): ekrany redakcji w nowym wyglądzie | Lista wpisów i kreator z jednym paskiem nagłówka we wszystkich krokach. |
| #195 | style(samorzad): ekrany zgłoszeń i ankiet w wyglądzie systemowym | Zgłoszenia i ankiety w panelu: pola bez podwójnego kafla, segmenty jak w ustawieniach, przycisk na całą szerokość. |
| #196 | docs: stan prac po scaleniu #195 | Ten plik po scaleniu #195. |
| #197 | fix(ui): zmień tytuł pustego stanu na nagłówek h2 | Tytuł pustego stanu („Nie ma ankiet” itd.) czytnik ekranu czyta jako nagłówek. |
| #198 | style(redakcja): ułóż pasek edytora w jednym rzędzie | Pasek edytora ma jeden rząd przewijany w bok, a „Cofnij” i „Ponów” stoją stale po prawej. |
| #199 | style(profil): równe segmenty przy wąskim ekranie | Szkoła i motyw mieszczą się w jednym rzędzie, a przy 320 px z większym tekstem motywy idą jeden pod drugim. |
| #200 | style(ui): widoczne pola tekstowe na kaflu grupy | Pola „Imię” i „Klasa” (i inne pola w grupie) mają szare tło, więc widać, gdzie pisać. |

Każdy ekran z paskiem pokazuje w powrocie nazwę poprzedniego ekranu („Panel”, „Wpisy”, „Ankiety”, „Zgłoszenia”, „Profil”), a nie „Wróć”. Wyjątek: „Wstecz” cofa o krok w kreatorze.

Testy na `main`: lint, Vitest, build, e2e, CodeQL i granice torów przechodzą (sprawdzone na #191). Usuwanie danych ucznia w modułach aktualności, mediów i panelu nie jest już atrapą.

## Otwarte pull requesty

Brak. Wszystkie pull requesty do #195 są scalone.

Do poprawy w wyglądzie: nic znanego. Trzy rzeczy z listy po #195 poprawiły #197, #198 i #199, a #200 dodał widoczne pola. `.editor-screen` dostał wysokość zapasową `100vh` dla iOS 15.0–15.3, które nie znają `100dvh` (#202).

Do sprawdzenia po wdrożeniu: Face ID na prawdziwym telefonie.

## Przed pierwszym wdrożeniem

Baza nie ma migracji. Lokalnie schemat zakłada `db:reset`. Na produkcji trzeba ręcznie dodać nowe tabele (m.in. `diary_entries`, `media_files`, `passkey`) i kolumny (m.in. `author_user_id`, `pinned_at`, `publish_at` w aktualnościach). Tabela `bell_shortened_days` nie jest już potrzebna. Może zostać na produkcji, bo nic jej nie czyta; usunięcie danych wymaga osobnej decyzji. Logowanie Face ID wymaga `BETTER_AUTH_URL` na produkcji, bo z niego wyliczany jest `rpID` klucza. Pełną listę daje `node scripts/dbDiff.ts`: porównuje `scripts/schemaSql.ts` z bazą i wypisuje brakujące `CREATE` i `ALTER` (#163). Zapis wpisu w dzienniku nie jest w jednej transakcji z publikacją. Poprawić przy wdrożeniu.

## Jak uruchomić agenta podtoru

1. Polecenie dla agenta jest w `docs/PODZIAL_PRACY.md`, część 9. Wstaw podtor, port i numer zgłoszenia.
2. Każdy agent ma swoją kopię: `git worktree add ../teb-<podtor> -b feat/<podtor>-<krótko> origin/main`.
3. Jeden agent robi jedną funkcję albo jeden ekran i oddaje jeden pull request. Duże zadanie dziel na małe.
4. Agent nie scala. Scala Szymon (albo osoba prowadząca rój), dopiero gdy wszystkie sprawdzenia na ostatnim commicie są zielone.

## Jak scalać

`main` wymaga gałęzi aktualnej względem `main` i jednego zatwierdzenia. Po każdym scaleniu kolejny pull request trzeba więc odświeżyć:

```bash
gh pr update-branch <numer>
gh pr checks <numer> --watch
gh pr merge <numer> --merge --admin
```

Pull request zbudowany na innym (piętrowy) ma czerwone „Granice torów”, dopóki jego baza nie wejdzie do `main`. Potem zmień bazę na `main` i odśwież gałąź.

Po scaleniu usuń kopię roboczą (`git worktree remove ../teb-<podtor>`) i gałąź.

## Na co uważać

- Skrypty `db:reset` i `db:seed` potrzebują Node 22.18 albo nowszego. Kasują `.wrangler/state/v3/d1`, więc najpierw zatrzymaj `npm run dev`.
- Logowanie lokalnie działa na porcie z `BETTER_AUTH_URL` w `.dev.vars` (wzór: `.dev.vars.example`, port 5173). Na innym porcie serwer odpowiada 403.
- Agent zatrzymuje tylko proces na swoim porcie (`lsof -ti tcp:<port> | xargs kill`), nigdy `pkill -f vite`.
- Playwright w CI ma swoją przeglądarkę. Lokalnie agenci uruchamiali e2e przez systemowy Chrome.
- Test serwera zgłoszeń (4a) importuje `worker/auth/email/testRuntime.ts` wprost, z pominięciem drzwi modułu. Działa, ale przy porządkach warto wystawić pomocnika testowego przez drzwi auth.
- Gdy agenci trafią na limit API, ich zmiany zostają na dysku w `../teb-<podtor>`. Po odnowieniu limitu wznów tego samego agenta albo daj nowemu agentowi ten katalog.

- Plik `.dev.vars` psuje lokalnie testy Workera z sesją (401, bo `BETTER_AUTH_URL` nie pasuje do adresu testu). CI go nie ma. Lokalnie uruchamiaj Vitest bez `.dev.vars`.
- Podtor 1b wymaga `BETTER_AUTH_SECRET` także lokalnie (bez niego 503). Seed nie ma kodu zaproszenia.
- `index.ts` modułów 3a, 4a i 5a nie wystawiają typów ani funkcji pobierania, więc pulpit czyta ich odpowiedzi HTTP. Moduł logowania nie wystawia imienia ucznia.

## Decyzje Szymona z 14–15.10.2026

- Plan dzwonków szkoły jest wpisany: lekcje 0–12, pon.–pt., 07:10–18:20 (#176).
- Dni skróconych nie ma. Funkcja usunięta (#180).
- Face ID, Touch ID i odcisk palca (klucz dostępu, passkey) to opcja w profilu i na ekranie logowania, nie wymóg (#174 serwer, #178 ekran). Produkcja potrzebuje `BETTER_AUTH_URL`.
- Wszystkie teksty aplikacji zatwierdzone (#175, #179).
- Stopka „Redakcja gazetki” tylko pod wpisami autorów z rolą redakcji (#173).
- Zdjęcie zgłoszenia widzi tylko autor i administracja (#177).
- `AGENTS.md` i `CLAUDE.md` nie trafiają do `.gitignore`.

## Decyzje do podjęcia

- **Zespół:** `PLAN_APLIKACJI.md` i `TECHNOLOGIE.md` nadal mówią, że telefon wysyła oryginał HEIC, gdy go nie odczyta. Po #130 telefon tego nie robi: pokazuje błąd. Trzeba poprawić dokumenty albo wrócić do wysyłania oryginału.
- **Zespół:** karta linku z adresem spoza listy serwisów społecznościowych znika z wpisu bez komunikatu w czytniku.
- **Zespół:** zdjęcie w edytorze bez sieci nie czeka w kolejce, tylko pokazuje błąd.
- **Szymon:** Face ID przez `@better-auth/passkey`, czas świeżej sesji 24 h (#108).
- **Zespół:** wpisy dziennika ucznia znikają razem z kontem. Czy tak ma zostać?
- **Zespół:** krótka odpowiedź w ankiecie może zdradzić autora w małej grupie. Pod polem jest podpowiedź, ale wyniki pokazujemy dopiero od 5 odpowiedzi.

- **Bohdan:** ADR 0003 (adresy podtorów), 0004 (przeglądarki), 0005 (krój pisma).
- **Adam:** czy wyłączyć wymóg aktualnej gałęzi przed scaleniem. Przez niego każde scalenie czeka na CI dwa razy.
- **Zespół:** parametry logowania: 3 próby kodu, 3 wysyłki na minutę, sesja 7 dni.
- **Zespół:** sprzeczność: `EKRANY.md` 2.4 mówi „Usuniemy zgłoszenia i odpowiedzi.”, a plan mówi, że zgłoszenia zostają bez autora.
- **Bohdan:** czas hashowania hasła (scrypt) w Workerze, podtor 1b.
- **Zespół:** PWA: pasek „Jest nowa wersja”, krótka nazwa aplikacji, ikona technikum.
- **Wszyscy:** loginy GitHub w `docs/OWNERS.md`. Bez nich nie ma pliku CODEOWNERS.
- **Szymon:** przenieść wpisy z `docs/zmiany/` do `CHANGELOG.md` i `docs/LOG_AI.md`.
