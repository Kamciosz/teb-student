# Plan aplikacji TEB Student

Stan na 9.10.2026. Wersja do konsultacji w zespole.

## Jak używać tego planu

1. Każdy z zespołu czyta plan i zapisuje uwagi.
2. Na spotkaniu zespół rozstrzyga sprawy z części 8 i poprawia plan.
3. Gotowy plan Szymon daje agentowi orkiestrującemu razem z poleceniem z części 9.

Plan mówi, **co** budujemy, **w jakich granicach** i **kiedy funkcja jest gotowa**. Nie mówi, jak to zaprogramować. Kod, dane i podział na zadania projektuje agent orkiestrujący. Zespół zatwierdza jego projekt przed programowaniem.

## 1. Cel

Do 29.10.2026 uczniowie TEB korzystają z aplikacji TEB Student. W jednym miejscu dostają ważne informacje szkoły, zgłaszają problemy Samorządowi i odpowiadają na anonimowe ankiety.

Aplikacja to interwencja w projekcie społecznym (diagnoza → interwencja → pilotaż). Cel jest osiągnięty, gdy:

- pilotaż trwa co najmniej tydzień, od 29.10 do 5.11, w klasie 3TA albo szerzej,
- zbieramy z pilotażu dane do wniosków: ile osób się zalogowało, ile zgłoszeń wpłynęło i ile odpowiedzi dała ankieta,
- każda z pięciu osób w zespole umie obronić ustnie całość aplikacji.

## 2. Ramy

### Czas

| Data | Co musi być |
|---|---|
| 15.10 | Szkielet aplikacji działa na adresie testowym |
| 27.10 | Wszystkie funkcje fali 1 są gotowe do sprawdzenia |
| 29.10 | Punkt kontrolny i start pilotażu |
| 5.11 | Koniec pilotażu |
| 12.11 | Oddanie pracy (11.11 to święto) |
| 30.11 | Fala 2, portfolio |

Termin liczymy od 29.10, nie od 12.11. Funkcja, której nie ma w pilotażu, nie daje danych do wniosków.

### Zakres fali 1 (do 29.10)

1. **Logowanie.** Główna ścieżka to kod 6 cyfr wysłany na szkolny adres @teb.edu.pl, bez hasła. Druga ścieżka jest dla osób bez skrzynki: kod zaproszenia od Samorządu, a potem własny login i hasło.
2. **Pulpit.** To ekran startowy z kafelkami: „Ważne”, ankieta, moje zgłoszenia, wydarzenie i ostatnie ogłoszenia.
3. **Aktualności.** Wpisy w stylu mediów społecznościowych, nie bloga. Mają cztery typy: Ważne, News, Wydarzenie i Sport. Wpis może mieć zdjęcia albo film, opis i link. Wpisy publikuje Samorząd oraz redakcja gazetki szkolnej (kółko), która pisze dłuższe artykuły w rozbudowanym edytorze.
4. **Zgłoszenia problemów.** Trzy kroki: czego dotyczy, gdzie to jest, krótki opis. Domyślnie zgłoszenie jest anonimowe. Uczeń widzi etap swojego zgłoszenia: przyjęte, w trakcie, załatwione.
5. **Ankiety.** Jedno pytanie na ekranie. Odpowiedzi są anonimowe, a wyniki widzi tylko Samorząd.
6. **Licznik do dzwonka.** Pokazuje, ile minut zostało do końca lekcji. Nie wydaje dźwięku.
7. **Profil i ustawienia.** Dane konta, moje zgłoszenia, polityka prywatności, usunięcie konta, wybór szkoły (liceum albo technikum) i wybór kolorów.
8. **Panel Samorządu.** Służy do publikowania wpisów, zmiany etapu zgłoszeń, tworzenia ankiet i wyników oraz wydawania kodów zaproszeń.

### Fala 2 (po 12.11, do 30.11)

TEBtalk, Grupy, Re-Wear jako tablica ogłoszeń ze zdjęciami albo filmem oraz własny dziennik (zakres do ustalenia). Stara aplikacja ma te moduły, ale piszemy je od nowa, tak jak resztę. Przed każdym zadajemy pytanie: kto z klasy otworzy to w tym tygodniu?

### Poza zakresem

Librus w żadnej formie, bo nie udostępnia API. Poza tym TEB Gąbki i odznaki, płatności, powiadomienia push.

### Punkt wyjścia

Piszemy od zera, w nowym repozytorium. Stara aplikacja TEB-App (`Kamciosz/teb-app-production`) to tylko inspiracja: pokazuje, jakie funkcje są potrzebne i jakich błędów unikać. Nie kopiujemy z niej kodu.

### Wygląd

- Układ C. Wzorem są ekrany w `docs/projekt/ekrany/` i makiety w `docs/projekt/referencje/`.
- Domyślne kolory to paleta CE Grafit. Akcent zależy od szkoły: liceum niebieski, technikum czerwony. W ustawieniach jest 8 palet do wyboru.
- Teksty na ekranach bierzemy z `docs/projekt/EKRANY.md`, bez zmyślania nowych.
- Aplikacja jest na telefon (PWA). Tekst musi być czytelny, przyciski duże, a obsługa z klawiatury możliwa.

## 3. Założenia

### Prywatność (RODO)

- Z ankiety nie da się ustalić, kto co odpowiedział. Nie da się tego zrobić nawet przy dostępie do serwera.
- Samorząd nie widzi autora zgłoszenia anonimowego.
- Wyniki ankiety pokazujemy dopiero od 5 odpowiedzi. Przy mniejszej liczbie łatwo rozpoznać osobę.
- Usunięcie konta usuwa dane osoby. Jej zgłoszenia i wpisy zostają, ale bez autora.
- W pilotażu i w dokumentacji nie ma imion ani nazwisk. Dane testowe są wymyślone.
- Polityka prywatności mówi prawdę o tym, co zbieramy.

### Bezpieczeństwo

- Kod logowania działa 10 minut. Po kilku złych próbach przepada.
- Aplikacja nie zdradza, czy dany adres e-mail ma konto.
- Na ekranach pełny e-mail jest ukryty (o***@teb.edu.pl).
- Wpisy, zgłoszenia i ankiety tworzą tylko osoby z odpowiednią rolą. Role to uczeń, redakcja gazetki, Samorząd i administrator. Redakcja publikuje tylko wpisy.

### Platforma

- Technologie zatwierdził Bohdan 9.10.2026. Pełna lista z wersjami, powodami i zasadami dla agentów jest w `docs/TECHNOLOGIE.md`. Agent ich nie zmienia sam.

| Część | Technologia |
|---|---|
| Ekrany | React 19 z React Compiler, TypeScript |
| Budowanie | Vite 8 z @vitejs/plugin-legacy, żeby działały też iOS 15 i starszy Android |
| PWA i nowe wersje | vite-plugin-pwa |
| Wygląd i palety | zwykły CSS ze zmiennymi kolorów |
| Nawigacja i dane | React Router tylko po stronie telefonu, TanStack Query |
| Serwer | Cloudflare Workers z Hono, plan płatny |
| Baza | Cloudflare D1 z Drizzle |
| Zdjęcia i filmy | Cloudflare R2, zdjęcia zmniejsza przeglądarka, a wyświetla Cloudflare Images (AVIF albo WebP), filmy Mediabunny |
| Logowanie i hasła | Better Auth |
| Maile z kodem | Cloudflare Email Service, Resend jako zapas |
| Testy | Vitest, @cloudflare/vitest-plugin, Playwright |

- Wszystko, co działa w aplikacji, stoi na Cloudflare: serwer, dane, pliki i maile. W OVH kupujemy tylko domenę .pl, bez hostingu. W panelu OVH zmieniamy serwery nazw (DNS) na serwery Cloudflare, a adres aplikacji i rekordy do maili ustawiamy już w Cloudflare.
- Bez własnej domeny maile z kodami nie dojdą do uczniów.

Wycena:

| Pozycja | Koszt | Skąd pieniądze |
|---|---|---|
| Cloudflare, plan płatny (5 USD miesięcznie, 2 miesiące) | około 37 zł | budżet projektu |
| Domena .pl w OVH, pierwszy rok | 20,53 zł | poza budżetem, załatwia zespół |
| Zmiana serwerów nazw na Cloudflare | 0 zł | — |
| Dane, pliki i maile w Cloudflare (w limitach planu) | 0 zł | — |
| Razem z budżetu 50 zł | około 37 zł, zostaje około 13 zł | |

- Koszt Cloudflare zależy od kursu dolara. Plan włączamy dopiero wtedy, gdy zaczyna się praca nad szkieletem, żeby nie płacić za miesiące bez pracy.
- Odnowienie domeny w OVH kosztuje 72,56 zł rocznie. Ta opłata przypada po zakończeniu projektu.
- Wysyłka maili z Cloudflare jest w fazie beta. Jeśli test 20.10 nie przejdzie, wysyłamy przez Resend (plan darmowy, 100 maili dziennie).

- Według `01_PLAN.md` z folderu planu celem jest Cloudflare. Na punkcie kontrolnym 29.10 sprawdzamy, czy działa logowanie i aktualności. Jeśli nie, przechodzimy na Supabase i Vercel.
- Ekrany nie mogą zależeć od wyboru platformy. Gdy zmienimy platformę, ekrany zostają takie same.
- Logowania nie robimy przez Cloudflare Access. Darmowy plan ma limit 50 użytkowników, a pilotaż obejmie więcej osób.
- Edytor wpisów jest rozbudowany, bo korzysta z niego kółko gazetki szkolnej. Ma nagłówki, pogrubienie, kursywę, podkreślenie, listy, cytat, linki, zdjęcia w treści z podpisem i film w treści. Ostateczną listę ustala zespół z redakcją gazetki.
- Bibliotekę edytora wybiera Bohdan i zapisuje decyzję w `docs/adr/`. Edytor zapisuje treść jako dane (JSON), a nie jako HTML wpisany przez użytkownika. Serwer przyjmuje tylko dozwolone elementy i odrzuca resztę.

### Działanie bez internetu i aktualizacje

- Telefon zapisuje u siebie całą aplikację: ekrany, wygląd i kod. Bez internetu aplikacja się otwiera i działa.
- Telefon zapisuje też ostatnio pobrane dane: wpisy, ankiety, zgłoszenia i profil. Bez internetu uczeń widzi to, co pobrał ostatnio. Na górze ekranu jest napis, że nie ma internetu i od kiedy dane są stare.
- Bez internetu nie da się nic wysłać: zgłoszenia, odpowiedzi w ankiecie ani wpisu. Aplikacja mówi o tym wprost. Wpisany tekst zostaje w formularzu, więc po powrocie internetu wystarczy kliknąć „Wyślij”.
- Gdy internet wraca, aplikacja sama pobiera nowe dane.
- Gdy wgramy nową wersję (nowy wygląd, nowa funkcja, poprawka), telefon pobiera ją w tle. Nowa wersja włącza się przy następnym otwarciu aplikacji. Jeśli aplikacja jest otwarta, pokazuje pasek „Jest nowa wersja” z przyciskiem „Odśwież”. Uczeń nie musi nic instalować ani usuwać.
- Wylogowanie i usunięcie konta kasują z telefonu zapisane dane tej osoby.
- Technologie: vite-plugin-pwa zapisuje aplikację i pilnuje nowych wersji, a TanStack Query zapisuje dane w pamięci telefonu (IndexedDB).
- Przed pilotażem sprawdzamy na iPhonie i Androidzie: tryb samolotowy, powrót internetu i wgranie nowej wersji.

### Zdjęcia i filmy

Dotyczy aktualności i Re-Wear. Cel: jak najmniejsza waga pliku, bez różnicy widocznej na ekranie telefonu.

**Wysyłanie (telefon)**
- Zdjęcie: telefon zmniejsza je do 1600 px na dłuższym boku i zapisuje jako JPEG w jakości 0,8. Zdjęcie z aparatu waży 3–5 MB, po zmniejszeniu około 200–300 KB (ocena, do zmierzenia).
- Ze zdjęcia znikają dane EXIF, w tym miejsce zrobienia zdjęcia (GPS).
- Jeśli telefon nie odczyta zdjęcia, na przykład HEIC z iPhone'a, wysyła oryginał do 20 MB. Cloudflare Images przyjmuje HEIC i sam zrobi z niego zwykłe zdjęcie.
- Film: najwyżej 30 s, 720p, format MP4 z H.264. iPhone nagrywa w HEVC, którego część telefonów z Androidem nie odtworzy, więc telefon przekodowuje film przed wysłaniem.
- Jeśli telefon nie umie przekodować filmu, wysyła oryginał, gdy ma najwyżej 30 s i 50 MB. Większego pliku nie wysyła i mówi dlaczego.
- Po wysłaniu serwer sprawdza rozmiar pliku w R2 i usuwa plik za duży.

**Wyświetlanie (Cloudflare Images)**
- Zdjęcie leży w R2 jako JPEG. Cloudflare Images przy wyświetlaniu sam wybiera format, który telefon obsługuje: AVIF, a gdy go nie ma, WebP albo JPEG. AVIF i WebP ważą o 30–50% mniej niż JPEG przy tym samym wyglądzie (ocena, do zmierzenia).
- Dwa rozmiary: miniatura na liście około 400 px (około 20–40 KB) i pełne zdjęcie po kliknięciu około 1290 px, czyli szerokość ekranu dużego telefonu.
- Pierwsze 5000 przeróbek zdjęć w miesiącu jest za darmo. To wystarczy na około 2500 zdjęć miesięcznie w dwóch rozmiarach.
- JPEG XL nie używamy. Pokazuje go 17% przeglądarek, Chrome na Androidzie ma go domyślnie wyłączony, a Cloudflare go nie robi. Wracamy do tego, gdy Chrome na Androidzie go włączy.

**Ładowanie na ekranie**
- Lazy loading: zdjęcie pobiera się dopiero wtedy, gdy uczeń przewinie do niego ekran (`loading="lazy"`, bez biblioteki).
- Każde zdjęcie ma z góry podany rozmiar, więc ekran nie skacze podczas ładowania.
- Film pokazuje najpierw tylko obrazek podglądu. Pobiera się dopiero po kliknięciu „odtwórz” i nie gra sam.

**Test przed pracą nad tą częścią** na prawdziwym iPhonie i Androidzie: zdjęcie HEIC, zdjęcie obrócone, film z iPhone'a na Androidzie, waga zdjęć przed i po.

### Zasady pracy roju agentów

1. Najpierw fundament, potem praca równoległa. Szkielet i wygląd robi jeden agent po drugim. Każdy moduł fali 1 może potem robić osobny agent.
2. Jeden agent to jedno zadanie i jeden pull request. Agent rusza tylko swój moduł.
3. Wspólne ustalenia, czyli technologie, nazwy, wygląd i sposób wymiany danych, zapisujemy przed pracą równoległą. Agent ich nie zmienia sam. Pyta Bohdana.
4. Zadanie jest gotowe, gdy działa i przechodzą testy. Sam napisany kod tego nie oznacza.
5. Każde zadanie ma właściciela z zespołu. Właściciel czyta wynik, poprawia go i umie go wyjaśnić.
6. Kod do repozytorium wrzuca Adam: zatwierdza i scala pull requesty. Nikt nie wrzuca zmian prosto do `main`.

### Wymogi PZO

- Commity podpisuje osoba z zespołu, bez dopisków o AI.
- Szymon prowadzi log użycia AI dla każdego zadania: prompt, co zrobił agent i co zmienił człowiek (`docs/LOG_AI.md`).
- Praca wygenerowana bezrefleksyjnie dostaje 0 pkt. Dlatego właściciel każdego modułu uczy się go na obronę.

## 4. Role

| Osoba | Odpowiada za |
|---|---|
| Szymon | Spina całość: dokumentacja, wizualizacje, organizacja pracy z AI (polecenia dla agentów, log AI), punkt kontrolny 29.10 |
| Bohdan | Założenia techniczne: technologie, struktura aplikacji, wspólne ustalenia w kodzie |
| Adam | Repozytorium: dostęp, gałęzie, przegląd i scalanie pull requestów, wdrożenie |
| Kacper | Wygląd, pulpit, licznik do dzwonka |
| Jakub | Ankiety, profil i prywatność, dane z pilotażu |

Każda funkcja ma właściciela, który czyta wynik agenta i umie go obronić. Logowanie, aktualności, zgłoszenia i panel Samorządu nie mają jeszcze właściciela. Zespół ustala to na spotkaniu (część 8).

## 5. Co muszą dać ludzie (agent tego nie zrobi)

| Co | Kto | Do kiedy |
|---|---|---|
| Nowe repozytorium i dostęp dla 5 osób | Adam | 10.10 |
| Założenia techniczne i wybór technologii | Bohdan | 12.10 |
| Konto Cloudflare i domena zespołu do maili z kodami | Szymon | 13.10 |
| Plan dzwonków TEB (godziny lekcji) | Kacper | 17.10 |
| Pisemna zgoda dyrekcji | Szymon | 15.10 |
| Test maili z kodem na 5–10 kontach szkolnych | Szymon, Jakub | 20.10 |
| Pytania pierwszej ankiety pilotażowej | Jakub | 27.10 |

Planu dzwonków nie zgadujemy. Bez niego licznik się nie pokaże.

## 6. Kolejność prac

**Etap A, fundament (10–15.10).** Robiony po kolei, przez jednego agenta naraz, bo każdy krok rusza wspólne części aplikacji.
1. Założenia techniczne Bohdana są zapisane w repozytorium.
2. Szkielet: aplikacja się buduje, działa na adresie testowym, ma pierwsze testy, a ekran logowania da się otworzyć.
3. Wygląd: kolory, czcionki, dolny pasek nawigacji i wspólne elementy ekranów.

**Etap B, funkcje (15–27.10).** Funkcje 1–8 z części 2 robią agenci równolegle, każdy osobno. Ankiety i licznik mogą skończyć najpóźniej 31.10, bo `01_PLAN.md` z folderu planu daje je na krok 3.

**Punkt kontrolny (29.10).** Sprawdzamy na adresie testowym:
- logowanie kodem działa na prawdziwych kontach szkolnych,
- aktualności można opublikować i przeczytać,
- zgłoszenie dochodzi do Samorządu.

Jeśli coś z tej listy nie działa, zostajemy na Supabase i Vercelu.

**Etap C, pilotaż (29.10–5.11).** Wdrożenie dla uczniów, testy na prawdziwych telefonach, zbieranie danych do wniosków.

## 7. Kiedy funkcja jest gotowa

Funkcja jest gotowa, gdy wszystkie jej punkty da się pokazać na telefonie. Sam napisany kod tego nie oznacza.

**Logowanie**
- Wpisuję adres @teb.edu.pl i w ciągu 2 minut dostaję maila z kodem.
- Po wpisaniu kodu jestem na pulpicie. Kod starszy niż 10 minut nie działa.
- Adres spoza @teb.edu.pl dostaje czytelny komunikat.
- Kodem zaproszenia zakładam konto z loginem i hasłem, a potem się nim loguję.
- Po zamknięciu i otwarciu aplikacji nadal jestem zalogowany.

**Pulpit**
- Widzę najnowszy wpis „Ważne”, aktywną ankietę, etap mojego zgłoszenia i trzy ostatnie ogłoszenia.
- Kafelek prowadzi do właściwego ekranu.
- Pusty kafelek mówi, że nic nie ma, zamiast znikać bez słowa.

**Aktualności**
- Lista wpisów z filtrem: Wszystkie, Ważne, News, Wydarzenie, Sport.
- Wpis ma zdjęcia albo film, opis i link.
- Samorząd albo redakcja gazetki tworzy wpis w trzech krokach: typ i zdjęcia, treść w rozbudowanym edytorze, podgląd. Podgląd wygląda tak samo jak wpis u ucznia. Może go zapisać jako szkic albo opublikować.
- Uczeń nie widzi szkiców i nie może dodać wpisu.

**Zgłoszenia**
- Zgłaszam problem w trzech krokach i widzę potwierdzenie.
- W „Moich zgłoszeniach” widzę etap: przyjęte, w trakcie, załatwione.
- Samorząd zmienia etap. Przy zgłoszeniu anonimowym nie widzi autora.

**Ankiety**
- Widzę listę aktywnych ankiet i liczbę dni do końca.
- Odpowiadam na jedno pytanie na ekranie. „Dalej” działa dopiero po wyborze odpowiedzi.
- Drugi raz tej samej ankiety nie wypełnię.
- Samorząd tworzy ankietę i widzi wyniki, gdy jest co najmniej 5 odpowiedzi.

**Licznik do dzwonka**
- W czasie lekcji pokazuje minuty do dzwonka, w czasie przerwy minuty do lekcji.
- Poza godzinami lekcji i w weekend się nie pokazuje.

**Profil i ustawienia**
- Zmieniam imię, klasę i szkołę. Akcent zmienia się na niebieski albo czerwony.
- Wybieram jedną z 8 palet i wybór zostaje po ponownym uruchomieniu.
- Usuwam konto. Po tym nie da się na nie zalogować.
- Polityka prywatności otwiera się bez logowania.

**Panel Samorządu**
- Widzi go tylko osoba z rolą Samorządu albo administratora.
- Wydaje kody zaproszeń, ważne 14 dni.
- Administrator nadaje rolę Samorządu i redakcji gazetki.
- Pobiera dane z pilotażu bez imion, nazwisk i adresów.

**Dla każdej funkcji**
- Działa na telefonie, przy szerokości 320 px nic nie wychodzi poza ekran.
- Teksty są po polsku, z polskimi znakami, zgodne z projektem ekranów.
- Bez internetu ekran pokazuje ostatnio pobrane dane i napis o braku internetu, a nie biały ekran. Błąd serwera daje komunikat.
- Po wgraniu nowej wersji telefon dostaje ją bez reinstalacji.
- Testy automatyczne przechodzą, a Adam zatwierdził zmianę.

## 8. Do decyzji zespołu

Przy każdej sprawie jest propozycja i decyzja z 9.10.2026.

| Sprawa | Propozycja | Decyzja zespołu |
|---|---|---|
| Logowanie bez Cloudflare Access | Tak: kod 6 cyfr na mail i kod zaproszenia | Przyjęte |
| Edytor wpisów | Tylko pogrubienie, kursywa, link i lista | Zmienione: rozbudowany edytor dla kółka gazetki szkolnej, nowa rola redakcji (część 3) |
| Domyślne kolory | CE Grafit z akcentem szkoły, 8 palet w ustawieniach | Przyjęte: CE Grafit. Makiety w `docs/projekt/` są w CC Grafit, kolory bierzemy z CE |
| Czy każdy ma skrzynkę @teb.edu.pl | Sprawdzić testem na 5–10 kontach do 20.10 | Przyjęte, test do 20.10 |
| Kto z Samorządu publikuje wpisy | Do ustalenia z Samorządem | Otwarte, ustala Szymon z Samorządem i redakcją gazetki |
| Zasięg pilotażu | 3TA, szerzej tylko za zgodą dyrekcji | Przyjęte |
| TEBtalk, Grupy, Re-Wear w fali 1 | Wyłączone do 12.11 | Przyjęte |
| Właściciele logowania, aktualności, zgłoszeń i panelu | Do ustalenia; Kacper i Jakub mają już po trzy funkcje | Otwarte. Co robi właściciel: `docs/OWNERS.md` |

## 9. Polecenie dla agenta orkiestrującego

Ten tekst wklejacie agentowi uruchomionemu w tym repozytorium.

> Jesteś agentem orkiestrującym budowę aplikacji TEB Student. Pracujesz w tym repozytorium. Plan zespołu jest w `docs/PLAN_APLIKACJI.md`, a technologie w `docs/TECHNOLOGIE.md`. Zasady pracy są w `AGENTS.md`. Piszemy od zera. Starą aplikację `Kamciosz/teb-app-production` możesz czytać jako inspirację, ale nie kopiuj z niej kodu.
>
> 1. Przeczytaj plan, założenia techniczne Bohdana i starą aplikację. Nie zmieniaj jeszcze niczego.
> 2. Przygotuj projekt techniczny zgodny z założeniami Bohdana: strukturę aplikacji, dane, sposób wymiany danych między ekranami a serwerem i wspólne ustalenia dla agentów. Przygotuj też listę zadań z kolejnością, właścicielem z części 4 i sprawdzeniem z części 7.
> 3. Pokaż projekt i listę zadań Szymonowi i Bohdanowi. Zacznij programować dopiero po ich akceptacji.
> 4. Etap A rób po kolei. Zadania etapu B dawaj agentom równolegle, każdemu tylko jego moduł.
> 5. Każde zadanie to osobna gałąź i pull request. Nie wrzucaj zmian do `main`. Pull request zatwierdza i scala Adam.
> 6. Commity podpisuje właściciel zadania. Nie dopisuj modelu AI jako autora.
> 7. Do każdego zadania zapisz log AI dla Szymona: polecenie, co zrobił agent i jakie pliki zmienił. Właściciel dopisze, co zmienił sam.
> 8. Zadanie jest gotowe, gdy przechodzą testy i punkty z części 7. Testów nie osłabiaj, żeby przeszły.
> 9. Gdy czegoś brakuje albo plan sam sobie przeczy, zatrzymaj się i zapytaj Szymona, a w sprawach technicznych Bohdana. Nie zgaduj. Dotyczy to zwłaszcza planu dzwonków, danych osobowych i treści ekranów.

## Źródła

- [Cloudflare Zero Trust: plany i ceny](https://www.cloudflare.com/plans/zero-trust-services/), limit 50 użytkowników w planie darmowym
- [Zero Trust For Everyone, blog Cloudflare](https://blog.cloudflare.com/teams-plans/)
