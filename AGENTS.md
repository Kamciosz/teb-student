# Zasady pracy w repozytorium TEB Student

Dla ludzi i agentów AI. Czytaj w całości przed pierwszą zmianą.

## Najpierw przeczytaj

1. `docs/PLAN_APLIKACJI.md`: zakres, terminy, warunki „gotowe” (część 7), polecenie dla agenta orkiestrującego (część 9).
2. `docs/TECHNOLOGIE.md`: technologie i wersje. Agent ich nie zmienia sam. W sprawach technicznych pyta Bohdana.
3. `docs/projekt/EKRANY.md`: teksty na ekranach. Nowych tekstów nie wymyślamy.
4. `docs/ARCHITECTURE.md` i `docs/adr/`: jak zbudowana jest aplikacja i dlaczego.
5. `docs/STANDARD_KODU.md`: komentarze, czytelny kod, testy. Obowiązuje w każdym pliku.

## Kiedy zadanie jest gotowe

- Działa na telefonie i spełnia punkty z części 7 planu.
- Przechodzą build, testy i lint. Komendy dopisuje szkielet (etap A):

```bash
# build:  (dopisze szkielet)
# testy:  (dopisze szkielet)
# lint:   (dopisze szkielet)
```

- CI na pull requeście jest zielone, a Adam zatwierdził zmianę.
- Testów nie osłabiamy, żeby przeszły. Gdy test jest zły, piszemy to w pull requeście.

Sam napisany kod nie oznacza „gotowe”.

## Praca agentów

- Jeden agent to jedno zadanie, jedna gałąź i jeden pull request. Agent rusza tylko swój moduł.
- Podtory, pliki każdego podtoru, porty i postępowanie przy konflikcie: `docs/PODZIAL_PRACY.md`.
- Etap A (szkielet, wygląd) robi jeden agent po drugim. Moduły fali 1 mogą potem robić agenci równolegle.
- Wspólne ustalenia (technologie, nazwy, wygląd, wymiana danych) zapisujemy przed pracą równoległą w `docs/adr/`.
- Gdy czegoś brakuje albo plan sam sobie przeczy, agent się zatrzymuje i pyta Szymona, a w sprawach technicznych Bohdana. Dotyczy to zwłaszcza planu dzwonków, danych osobowych i treści ekranów.
- Do każdego zadania agent zapisuje wpis do changelogu i logu AI w pliku `docs/zmiany/<gałąź>.md`. Nie zmienia `CHANGELOG.md` ani `docs/LOG_AI.md`.

## Założenia architektury

1. **Nie trzymamy starego kodu.** Przestarzałą rzecz usuwamy w całości: bez warstw zgodności, bez kodu, który obsługuje stary i nowy format naraz, bez zapasowych ścieżek dla starego zachowania. Co to nie znaczy:
   - Wspierane telefony zostają wspierane (iOS 15, starszy Android, `@vitejs/plugin-legacy`). To wymaganie, a nie stary kod.
   - Baza: do pilotażu nie ma danych uczniów, a aplikacja nie jest publiczna, więc nie piszemy migracji. Zmieniamy schemat Drizzle i tworzymy bazę testową od nowa. Sposób zmian bazy po starcie pilotażu ustala zespół przed 29.10.
   - Działanie bez internetu i zapas Resend dla maili to funkcje z planu, a nie stary kod.
2. **Najprostsze rozwiązanie bieżącej potrzeby.** Bez abstrakcji „na zapas” i bez ustawień, których nikt dziś nie zmienia.
3. **Najpierw cienka ścieżka od ekranu do bazy, potem rozbudowa.** Funkcja najpierw działa od początku do końca w najprostszej formie. Warstwy dokładamy stopniowo. Nie psujemy działającej rzeczy dla niedokończonej.
4. **Moduły z jedną odpowiedzialnością.** Moduł ma jedne drzwi (`index.ts`). Wygląd, logika i dostęp do danych są w osobnych plikach.
5. **Dojrzałe biblioteki zamiast pisania od zera.** Wybieramy biblioteki aktywnie utrzymywane. Własny kod piszemy tylko z konkretnym powodem, zapisanym w pull requeście.
6. **Najpierw sprawdź, co już mamy.** Zanim dodasz pakiet albo napiszesz własny kod, sprawdź w dokumentacji, co umieją zależności z `docs/TECHNOLOGIE.md` (na przykład wtyczki Better Auth, funkcje TanStack Query, Drizzle i Hono).
7. **Decyzje z myślą o przyszłości.** Nie przyjmujemy prowizorki „na razie tak, potem zmienimy”. Jeśli rozwiązanie jest złe, nie wchodzi. Plan rozbudowy jest w `docs/PLAN_APLIKACJI.md`, część 2, i fala 1 musi go umożliwiać.
8. **Wzorce z dojrzałych produktów.** Przed projektem funkcji sprawdź, jak ten sam problem rozwiązują znane produkty, i użyj sprawdzonego wzorca. W pull requeście napisz, skąd jest wzorzec.

## Jak pracujemy

- **Gotowe znaczy gotowe.** Nie „prawie”, nie „bez części, którą pominąłem”, nie opis tego, jak to zrobić. Zadanie z pięcioma punktami ma pięć zrobionych punktów.
- **Blokada ma nazwę.** Gdy jeden punkt jest naprawdę zablokowany, zrób resztę i opisz blokadę jednym zdaniem: co konkretnie blokuje. Zdanie „trzeba to jeszcze zbadać” nie jest blokadą.
- **Tanie i odwracalne: zrób, potem powiedz.** Dotyczy researchu, szkiców, analiz, refaktoru w zakresie zadania i testów API.
- **Najpierw zapytaj tylko wtedy, gdy działanie:** trafi do uczniów albo innych ludzi, jest nieodwracalne albo kosztuje pieniądze.
- **Zepsute na Twojej drodze: napraw.** Nie zgłaszaj problemu, który sam możesz naprawić w zakresie zadania.
- **Pytanie to pytanie.** „Czy użyć X?” nie znaczy „przejdź na X”. Najpierw odpowiedz. Zmieniaj dopiero po poleceniu. Gdy nie wiesz, czy to pytanie, traktuj je jak pytanie.
- **Raport:** co zrobione, czy działa i jaki jest dowód, co ma zrobić człowiek. Przy decyzji najwyżej 2 opcje i Twój wybór.

## Kod

- Kolejność wyboru: to, co już jest w projekcie, potem funkcje przeglądarki, potem nowa dojrzała biblioteka. Nowa biblioteka wymaga wpisu w `docs/adr/` i zgody Bohdana.
- Nazwy w kodzie po angielsku. Teksty dla ucznia po polsku, z polskimi znakami.
- Nowa funkcja to nowy moduł, nie doklejka do istniejącego pliku.
- Bez martwego kodu, wykomentowanych bloków i `console.log` w kodzie produkcyjnym.
- Komentarze wszędzie, po polsku i po angielsku (`PL:`, potem `EN:`): plik, każda funkcja, typ, stała i każdy krok w funkcji. Kodu bez komentarza nie scalamy. Szczegóły i przykład: `docs/STANDARD_KODU.md`, część 1.
- Limity długości i zagnieżdżenia funkcji: `docs/STANDARD_KODU.md`, część 2.
- Zasady techniczne (kolory, CSS, zdjęcia, filmy, R2, dane w telefonie) są w `docs/TECHNOLOGIE.md`, sekcja „Zasady dla agentów”.

## Prywatność

- Bez prawdziwych imion, nazwisk i adresów e-mail w kodzie, testach, zrzutach i dokumentacji. Dane testowe są wymyślone.
- Z ankiety nie da się ustalić, kto co odpowiedział. Samorząd nie widzi autora zgłoszenia anonimowego.
- Sekrety (klucze Cloudflare, Resend, hasła) nie trafiają do repozytorium. Lokalnie są w `.dev.vars`, który jest w `.gitignore`. Sekret wrzucony do historii trzeba unieważnić, samo usunięcie pliku nie wystarczy.

## Git

- Nikt nie wrzuca zmian prosto do `main`. Pull request zatwierdza i scala Adam.
- Gałęzie: `feat/opis`, `fix/opis`, `docs/opis`, `refactor/opis`, `test/opis`, `chore/opis`.
- Commity w formacie Conventional Commits, temat po polsku w trybie rozkazującym, na przykład `feat(zgloszenia): dodaj wybór miejsca`. Hook i CI to sprawdzają.
- Commit podpisuje osoba z zespołu, właściciel zadania. Bez dopisków o AI: żadnego `Co-Authored-By` z modelem, `Generated with` ani emoji robota. To wymóg PZO.
- Przed pull requestem: `git fetch && git rebase origin/main`. Bez `--force` na wspólnych gałęziach, na własnej tylko `--force-with-lease`.

## Dokumentacja

- Zmiana zachowania aplikacji: wpis w `docs/zmiany/<gałąź>.md`. Szymon przenosi go do `CHANGELOG.md`.
- Decyzja techniczna: nowy plik `docs/adr/NNNN-tytul.md`.
- Nowy moduł: wiersz w `docs/ARCHITECTURE.md`.
