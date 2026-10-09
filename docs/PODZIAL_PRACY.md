# Podział pracy między agentów

Cel: kilku agentów AI pracuje naraz, każdy w swoim module, i nie psuje pracy innych. Ten dokument mówi, kto rusza które pliki, w jakiej kolejności i co robić przy konflikcie.

Stan na 9.10.2026: kodu jeszcze nie ma. Ścieżki w tym dokumencie są planowane i jeszcze nie istnieją. Nazwy katalogów to propozycja do zatwierdzenia przez Bohdana w projekcie technicznym. Gdy Bohdan zmieni nazwę, zmieniamy ją tutaj, a zasady zostają.

## 1. Zasada główna

Aplikację dzielimy na **tory**. Tor to jeden moduł i jego pliki. W torze pracuje jeden agent naraz, a jego pull requesty wchodzą po kolei. Różne tory pracują równolegle.

Agent zmienia tylko pliki swojego toru i swój plik w `docs/zmiany/`. Każdy inny plik należy do kogoś innego.

## 2. Gdzie agenci by się zderzyli i jak tego unikamy

| Miejsce zderzenia | Co by się stało | Jak unikamy |
|---|---|---|
| Lista ekranów (router), lista adresów serwera, dolny pasek, menu panelu | każdy agent dopisuje swoją linię w tym samym miejscu | Etap A wpisuje tam od razu wszystkie moduły z części 3. Każdy wpis prowadzi do `index.ts` modułu, który na początku pokazuje „W budowie”. Agent modułu tych plików nie zmienia. |
| `package.json` i `package-lock.json` | dwie gałęzie dodają pakiety i plik blokady się nie scala | Etap A instaluje wszystkie pakiety z `docs/TECHNOLOGIE.md`. Agent modułu nie dodaje pakietów. Gdy pakietu brakuje, agent pyta Bohdana, a pakiet wchodzi osobnym pull requestem. |
| Schemat bazy | wszyscy zmieniają jeden plik | Każdy moduł ma swój plik schematu. Plik, który je zbiera, tworzy etap A i nikt go potem nie zmienia. Tak samo dane testowe: jeden plik na moduł. |
| `CHANGELOG.md` i `docs/LOG_AI.md` | każdy pull request dopisuje linię na końcu, więc gałęzie się kłócą | Agent nie zmienia tych plików. Pisze jeden plik `docs/zmiany/<gałąź>.md`. Szymon przenosi wpisy do `CHANGELOG.md` i `docs/LOG_AI.md`. Szczegóły: `docs/zmiany/README.md`. |
| Panel Samorządu | panel rusza wpisy, zgłoszenia, ankiety i konta | Ekran panelu dla danego modułu leży w katalogu tego modułu. Tor panelu robi tylko ramę panelu, kody zaproszeń i nadawanie ról. |
| Pulpit | pulpit pokazuje dane z czterech modułów | Pulpit bierze dane tylko z `index.ts` innych modułów. Nie zagląda do ich plików ani tabel. |
| Wysyłka zdjęć | potrzebują jej aktualności, a w rozbudowie też zgłoszenia | Wysyłka zdjęć i filmów to osobny tor. Inne moduły używają jej przez `index.ts`. |
| Usunięcie konta | profil kasuje dane z wielu modułów | Każdy moduł z danymi ucznia daje w swoim `index.ts` funkcję, która kasuje te dane. Listę tych funkcji tworzy etap A, a profil ją wywołuje. |
| Wspólne elementy ekranów (`src/shared/`) | dwa moduły zmieniają ten sam przycisk | Wspólne elementy robi etap A. Potem zmienia je tylko tor 0, jeden pull request naraz. Agent modułu, któremu czegoś brakuje, zakłada zgłoszenie na GitHubie. |
| Serwer na komputerze | dwóch agentów uruchamia aplikację na tym samym porcie | Każdy tor ma swój port (część 3). Serwer i testy Playwright biorą go ze zmiennej `PORT`. |
| Lokalna baza | dwóch agentów nadpisuje sobie dane | Każdy agent pracuje w osobnej kopii repozytorium (`git worktree`), więc ma osobną bazę w swoim katalogu `.wrangler`. |

## 3. Tory

Właściciel z `docs/OWNERS.md`. Port to port serwera na komputerze agenta.

| Tor | Moduł | Katalog w kodzie (propozycja) | Właściciel | Port | Na co czeka |
|---|---|---|---|---|---|
| 0 | wspólne: wygląd, układ, elementy ekranów | `src/shared/`, `worker/shared/` | Bohdan (technika), Kacper (wygląd) | 5170 | nie działa równolegle sam ze sobą |
| 1 | logowanie i kody zaproszeń | `auth` | do ustalenia | 5171 | wysyłka prawdziwych maili czeka na konto Cloudflare i test 20.10. Do tego czasu kod pokazuje terminal. |
| 2 | wysyłka zdjęć i filmów | `media` | do ustalenia | 5172 | Cloudflare Images na adresie testowym potrzebuje konta Cloudflare |
| 3 | aktualności i edytor | `news` | do ustalenia | 5173 | edytor czeka na decyzję Bohdana o bibliotece (`docs/adr/`). Zdjęcia we wpisach czekają na tor 2. Tekst może iść od razu. |
| 4 | zgłoszenia | `reports` | do ustalenia | 5174 | — |
| 5 | ankiety | `surveys` | Jakub | 5175 | pytania pierwszej ankiety (27.10) potrzebne do pilotażu, nie do kodu |
| 6 | licznik do dzwonka | `bell` | Kacper | 5176 | plan dzwonków od Kacpra (17.10). Bez niego licznik się nie pokazuje. |
| 7 | profil i ustawienia | `profile` | Jakub | 5177 | usunięcie konta czeka na pierwszy pull request toru 1 |
| 8 | panel Samorządu | `admin` | do ustalenia | 5178 | kody zaproszeń i role czekają na pierwszy pull request toru 1 |
| 9 | pulpit | `dashboard` | Kacper | 5179 | kafelki czekają na pierwsze pull requesty torów 3–6. Do tego czasu pokazują pusty stan. |

Pliki toru o nazwie `<moduł>`:

- ekrany i logika w telefonie: `src/features/<moduł>/`
- serwer: `worker/<moduł>/`
- schemat bazy: `worker/db/schema/<moduł>.ts`
- dane testowe: `worker/db/seed/<moduł>.ts`
- testy całych ścieżek: `e2e/<moduł>.spec.ts`

Tabele kont i sesji tworzy Better Auth swoim generatorem schematu. Należą do toru 1.

Ankiety i licznik mogą skończyć najpóźniej 31.10 (`docs/PLAN_APLIKACJI.md`, część 6).

## 4. Co musi zrobić etap A, żeby tory nie zderzały się

Etap A robi jeden agent po drugim. Praca równoległa zaczyna się dopiero, gdy każdy punkt jest scalony w `main`:

1. Wszystkie pakiety z `docs/TECHNOLOGIE.md` są zainstalowane.
2. Router, adresy serwera, dolny pasek i menu panelu mają wpisy dla torów 1–9. Każdy wpis prowadzi do `index.ts` modułu z ekranem „W budowie”.
3. Schemat bazy i dane testowe mają osobny plik dla każdego modułu i jeden plik, który je zbiera.
4. Lista funkcji, które kasują dane ucznia przy usunięciu konta, ma wpis dla każdego modułu z danymi ucznia.
5. Serwer i Playwright biorą port ze zmiennej `PORT`.
6. Lint pozwala importować moduł tylko przez jego `index.ts` i zabrania cykli (`docs/STANDARD_KODU.md`, część 2).
7. CI ma sprawdzenie „Granice torów”: gałąź `feat/<moduł>-…` zmienia tylko pliki swojego toru i `docs/zmiany/`.
8. Wspólne elementy ekranów i wygląd są gotowe (tor 0).

Blokada: plik `.github/CODEOWNERS`, który sam prosi właściciela o przegląd, wymaga loginów GitHub. W `docs/OWNERS.md` brakuje loginów czterech osób. Dopisze je Adam.

## 5. Jak agent bierze zadanie

1. Każde zadanie to zgłoszenie na GitHubie z etykietą `tor:<moduł>` i osobą przypisaną (właściciel toru).
2. Agent bierze tylko zadanie ze zgłoszenia. W torze jest najwyżej jedno zadanie „w toku” naraz.
3. Agent pracuje w osobnej kopii repozytorium:

   ```bash
   git fetch origin
   git worktree add ../teb-<moduł> -b feat/<moduł>-<krótko> origin/main
   ```

4. Agent uruchamia aplikację na porcie swojego toru: `PORT=517X`.
5. Przed pull requestem agent przenosi swoje zmiany na najnowszy `main` (`git rebase origin/main`) i jeszcze raz uruchamia build, testy i lint.
6. Pull request zamyka zgłoszenie (`Closes #<numer>`). Scala go Adam po zielonym CI.

## 6. Co robić przy konflikcie

- Konflikt w pliku swojego toru: agent go rozwiązuje i jeszcze raz uruchamia testy.
- Konflikt w pliku spoza toru: agent się zatrzymuje i pyta Bohdana. Nie rozwiązuje go sam.
- Brakuje czegoś w innym module: agent zakłada zgłoszenie dla tamtego toru i pracuje dalej na tym, co jest. Nie zmienia cudzego modułu.
- Brakuje czegoś w części wspólnej: zgłoszenie dla toru 0.
- Agent nigdy nie robi `git push --force` do cudzej gałęzi i nie scala pull requestów.

## 7. Ilu agentów naraz

Najwyżej 4 tory naraz z otwartym pull requestem. Ogranicza nas nie komputer, tylko ludzie: Adam przegląda każdy pull request, a właściciel sprawdza moduł na swoim telefonie. Więcej otwartych pull requestów niż ludzie zdążą przeczytać to kod, którego nikt nie umie wyjaśnić na obronie.

## 8. Przed uruchomieniem roju agentów

- [ ] etap A scalony, każdy punkt z części 4
- [ ] dla każdego toru, który rusza, jest zgłoszenie z właścicielem
- [ ] właściciel toru wie, że ma przeczytać i sprawdzić wynik
- [ ] każdy agent dostał polecenie z części 9 z wpisanym torem
- [ ] najwyżej 4 tory naraz

## 9. Polecenie dla agenta toru

Wpisz numer toru, moduł i numer zgłoszenia.

> Jesteś agentem toru `<numer>` (`<moduł>`) w repozytorium TEB Student. Zadanie jest w zgłoszeniu `#<numer>`. Zasady pracy są w `AGENTS.md`, a podział pracy w `docs/PODZIAL_PRACY.md`.
>
> 1. Pracuj w osobnej kopii repozytorium na gałęzi `feat/<moduł>-<krótko>` i na porcie swojego toru.
> 2. Zmieniaj tylko pliki swojego toru (część 3) i swój plik w `docs/zmiany/`. Nie dodawaj pakietów.
> 3. Inne moduły używaj tylko przez ich `index.ts`. Gdy czegoś brakuje, załóż zgłoszenie dla tamtego toru.
> 4. Konflikt w pliku spoza toru: zatrzymaj się i zapytaj Bohdana.
> 5. Przed pull requestem przenieś zmiany na najnowszy `main` i uruchom build, testy i lint.
> 6. Gotowe znaczy: przechodzą testy i punkty z części 7 planu dla tego modułu.
