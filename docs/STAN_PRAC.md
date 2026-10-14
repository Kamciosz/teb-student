# Stan prac

Stan na 14.10.2026. `main` po scaleniu #168. Ten plik mówi, co jest zrobione, co jest następne i jak kontynuować w nowym wątku albo przez inną osobę. Aktualizuj go po każdej większej turze pracy.

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
| 6 | licznik do dzwonka, następna lekcja, dni skrócone (serwer i przełącznik), pusty plan, stan dnia | #94, #103, #129, #133, #139, #145 |
| 7 | profil i ustawienia, usunięcie konta, wiersz panelu, pobieranie moich danych ze wszystkich modułów, „Moje urządzenia” | #63, #89, #104, #110, #119, #124 |
| 8 | panel Samorządu, role, kody zaproszeń, pilotaż, dziennik zmian (publikacja, usunięcie, zmiana etapu) | #68, #69, #100, #111, #134, #148 |
| 9 | kafelek dzwonka, kolejność kafelków, minuty do dzwonka, stan dnia w nagłówku | #102, #116, #136, #142, #149, #153 |

Od #157 do #168 weszły zdjęcia w zgłoszeniach i we wpisach:

| Podtor | Co | Pull requesty |
|---|---|---|
| 2 | blokada zdjęć HEIC bez wysyłania oryginału, wysyłka zdjęcia do zgłoszenia i do treści wpisu | #130, #158, #159, #165 |
| 3a | zdjęcia w treści wpisu (tylko adresy `/api/media/`), sekcja „Źródła”, karty linków do mediów społecznościowych | #160, #161, #162 |
| 3b | zdjęcie w dokumencie wpisu (serwer), przycisk „Zdjęcie” w pasku edytora | #164, #168 |
| 4a | kolumna `photo_id`, pole „Dodaj zdjęcie” w formularzu, serwer sprawdza, czy plik należy do ucznia | #127, #167 |
| 4b | zdjęcie w szczegółach zgłoszenia w panelu | #166 |
| — | skrypt różnic schematu bazy, ten plik | #163, #157 |

Testy na `main`: lint, Vitest, build, e2e, CodeQL i granice torów przechodzą (sprawdzone na #168). Usuwanie danych ucznia w modułach aktualności, mediów i panelu nie jest już atrapą.

## Otwarte pull requesty

- W pracy (podtor 3b): pola „Opis zdjęcia” i „Podpis” dla zdjęcia w treści wpisu.

## Przed pierwszym wdrożeniem

Baza nie ma migracji. Lokalnie schemat zakłada `db:reset`. Na produkcji trzeba ręcznie dodać nowe tabele (m.in. `diary_entries`, `bell_shortened_days`, `media_files`) i kolumny (m.in. `author_user_id`, `pinned_at`, `publish_at` w aktualnościach). Pełną listę daje `node scripts/dbDiff.ts`: porównuje `scripts/schemaSql.ts` z bazą i wypisuje brakujące `CREATE` i `ALTER` (#163). Zapis wpisu w dzienniku nie jest w jednej transakcji z publikacją. Poprawić przy wdrożeniu.

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

## Decyzje do podjęcia

- **Zespół:** `PLAN_APLIKACJI.md` i `TECHNOLOGIE.md` nadal mówią, że telefon wysyła oryginał HEIC, gdy go nie odczyta. Po #130 telefon tego nie robi: pokazuje błąd. Trzeba poprawić dokumenty albo wrócić do wysyłania oryginału.
- **Zespół:** plik z `GET /api/media/<id>` dostaje każdy zalogowany uczeń, który zna numer pliku. Dotyczy to też zdjęć ze zgłoszeń anonimowych. Czy zostawić tak, czy ograniczyć zdjęcia zgłoszeń do autora i Samorządu?
- **Zespół:** karta linku z adresem spoza listy serwisów społecznościowych znika z wpisu bez komunikatu w czytniku.
- **Zespół:** zdjęcie w edytorze bez sieci nie czeka w kolejce, tylko pokazuje błąd.
- **Szymon:** Face ID przez `@better-auth/passkey`, czas świeżej sesji 24 h (#108).
- **Kacper:** plan dzwonków, zwykły i skrócony.
- **Zespół:** czy `AGENTS.md` i `CLAUDE.md` mają trafić do `.gitignore`.
- **Zespół:** wpisy dziennika ucznia znikają razem z kontem. Czy tak ma zostać?
- **Zespół:** krótka odpowiedź w ankiecie może zdradzić autora w małej grupie. Pod polem jest podpowiedź, ale wyniki pokazujemy dopiero od 5 odpowiedzi.
- **Zespół:** teksty oznaczone `TO_AGREE` w nowych ekranach.

- **Bohdan:** ADR 0003 (adresy podtorów), 0004 (przeglądarki), 0005 (krój pisma).
- **Adam:** czy wyłączyć wymóg aktualnej gałęzi przed scaleniem. Przez niego każde scalenie czeka na CI dwa razy.
- **Zespół:** teksty, których nie ma w `docs/projekt/EKRANY.md`: ekrany logowania, aktualności, zgłoszeń i ankiet, pasek „Brak internetu”. Parametry logowania: 3 próby kodu, 3 wysyłki na minutę, sesja 7 dni.
- **Zespół:** teksty z pull requestów #61, #62 i #63 oznaczone „do ustalenia” (logowanie loginem, ustawienia, puste stany pulpitu). Sprzeczność: `EKRANY.md` 2.4 mówi „Usuniemy zgłoszenia i odpowiedzi.”, a plan mówi, że zgłoszenia zostają bez autora.
- **Bohdan:** czas hashowania hasła (scrypt) w Workerze, podtor 1b.
- **Zespół:** PWA: pasek „Jest nowa wersja”, krótka nazwa aplikacji, ikona technikum.
- **Wszyscy:** loginy GitHub w `docs/OWNERS.md`. Bez nich nie ma pliku CODEOWNERS.
- **Szymon:** przenieść wpisy z `docs/zmiany/` do `CHANGELOG.md` i `docs/LOG_AI.md`.
