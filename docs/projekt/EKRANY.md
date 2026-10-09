# Ekrany: treści i układ

Źródło tekstów na ekranach. Agent bierze stąd treści, kolejność elementów i odstępy. Nowych tekstów nie wymyśla.

Plik powstał z briefu do Figmy (`10_FIGMA_BRIEF/SPEC.md` w folderze planu). Nazwy funkcji w opisach (`cta`, `dock`, `flowTop`, `bars`, `note`, `tile`) i nazwy komponentów Figmy opisują elementy ekranu, a nie kod aplikacji. Liczba „y” w nagłówkach to tylko miejsce na kanwie projektu.

Wzory ekranów:
- `ekrany/1-logowanie.png` … `ekrany/5-panel.png`: gotowe przepływy, `ekrany/0-mapa.png`: mapa ekranów,
- `referencje/CC1_start.png`, `CC2_zgloszenie.png`, `CC3_ankieta.png`: makiety, z których odtworzono ekrany „Z referencji”,
- `referencje/uklad_C.html`: układ C w HTML ze zmiennymi wszystkich 8 palet (CA–CH); parametry `?paleta=CE&szkola=T` przełączają paletę i szkołę,
- `referencje/palety_CE-CH.png`: porównanie palet z akcentem szkoły.

Kolory: makiety i opisy niżej są w palecie CC Grafit (akcent `#FF8FB3`). W aplikacji domyślna jest paleta CE Grafit z akcentem szkoły, decyzja z 9.10.2026. Wartości CE są w `referencje/uklad_C.html`. Z tego pliku bierzemy układ i teksty, kolory bierzemy z CE.

Edytor wpisów (przepływ 5): decyzja z 9.10.2026 to edytor rozbudowany dla kółka gazetki szkolnej, a nie proste formatowanie. Lista funkcji jest w `docs/PLAN_APLIKACJI.md`, część 3. Ekran 5.2 pokazuje tylko pole „Opis”, więc pasek narzędzi edytora projektuje agent w tym samym stylu.

Wymiary: ekran 390 × 844 pt, kafle zaokrąglone 12 px, padding 16 px, odstępy 12 px. Dane na ekranach (Ola, 3TA, sala 204) są przykładowe.

---

## Przepływ „1 · Logowanie” + plansza tytułowa


Plansza tytułowa, ramka auto-layout pionowa „Plansza tytułowa” na x=0, y=0, szerokość 1300: H1 (rozmiar 56) „TEB Student: projekt aplikacji”; tekst Body ink-2 (szerokość 900): „Układ C, paleta CC Grafit. Ekrany 390 × 844 pt, jak telefon w referencji. Dane na ekranach są przykładowe.”; rząd znaczników-legendy: instancja `Znacznik` „Z referencji” + opis „ekran odtworzony z makiety C/CC”, instancja `Znacznik` „Nowy ekran” (ustaw fill `ink`, tekst `bg`) + opis „ekran dodany według planu, bez makiety”; rząd czterech próbek kolorów (kwadrat 56 r12, fill zmienna `bg`, `tile`, `ink`, `accent`, każdy z obrysem `line` 1, pod nim Caption: `tło #26282D`, `kafelki #303339`, `tekst #F1F2F4`, `przycisk #FF8FB3`).

Przepływ: `makeRow('1 · Logowanie','Kod 6 cyfr na szkolny adres @teb.edu.pl, bez hasła. Druga ścieżka, dla osób bez skrzynki: kod zaproszenia od Samorządu oraz login i hasło.', 400)`. Trzy ekrany, wszystkie tag „Nowy ekran”:

**1.1 „Logowanie: e-mail”** (opis: „Główna ścieżka: kod na szkolny adres, bez hasła.”): kontener Treść: odstęp 56; znak marki: ramka 56×56 fill `accent` r16 z tekstem „T” (styl Num L, kolor `on-accent`, wyśrodkowany); odstęp 24; H1 „TEB Student”; odstęp 8; Body ink-2 „Aktualności, zgłoszenia i ankiety szkoły w jednym miejscu.” (wrapT); odstęp 48; instancja `Pole tekstowe`: Etykieta „Szkolny e-mail”, Wartość „imie.nazwisko@teb.edu.pl” w kolorze ink-2; `note(c,'lock','Wyślemy sześciocyfrowy kod. Hasło nie jest potrzebne.')`. Nad CTA, absolutnie (layoutPositioning ABSOLUTE, x=16, y=692): `Przycisk/Obrys` o szerokości 358 (resize(358,48)), etykieta „Mam kod zaproszenia”. Na dole `cta(s,'Wyślij kod','send',false)`.

**1.2 „Logowanie: kod z maila”** (opis: „Sześć pól na cyfry, kod ważny 10 minut. Przycisk aktywny po wpisaniu wszystkich cyfr.”): `flowTop(c,'Logowanie',null,'arrow-left')`; odstęp 24; H1 „Wpisz kod”; odstęp 8; Body ink-2 „Wysłaliśmy sześć cyfr na o***@teb.edu.pl. Kod działa 10 minut.” (wrapT); odstęp 32; rząd poziomy 6 pól (gap 8, każde FILL poziomo, wysokość 64, fill `tile`, r12, treść wyśrodkowana): cyfry „4”, „8”, „2”, „1” w stylu `Num L` (ink), piąte puste z obrysem `ink` 1.5, szóste puste; odstęp 16; Small ink-2 „Nie dotarł? Wyślij ponownie za 0:42”. Na dole `cta(s,'Zaloguj','arrow-right',true,true)` (nieaktywny).

**1.3 „Logowanie: kod zaproszenia”** (opis: „Druga ścieżka dla osób bez skrzynki @teb.edu.pl: kod od Samorządu, własny login i hasło.”): `flowTop(c,'Kod zaproszenia',null,'arrow-left')`; odstęp 24; H1 „Masz kod od Samorządu?”; odstęp 8; Body ink-2 „Użyj go, jeśli nie masz szkolnej skrzynki. Ustawisz własny login i hasło.”; odstęp 24; trzy `Pole tekstowe` rozdzielone odstępami 16: („Kod zaproszenia”, „TEB-7K4Q-92”), („Login”, „np. ola3ta” jako placeholder ink-2), („Hasło”, „••••••••” ink-2); `note(c,'lock','Kod zaproszenia działa tylko jeden raz.')`. Na dole `cta(s,'Załóż konto','arrow-right',true)`.

---

## Przepływ „2 · Pulpit, aktualności i profil” (y=1520)

`makeRow('2 · Pulpit, aktualności i profil','Pulpit z kafelkami jest ekranem startowym. Z kafelka Ogłoszenia wchodzi się do aktualności, z nich do wpisu. Profil zawiera usuwanie konta (RODO).', 1520)`. Cztery ekrany.

**2.1 „Pulpit”**, tag „Z referencji”, opis „Najważniejsze sprawy w kafelkach na jednym ekranie. Licznik do dzwonka bez dźwięku.”. Dokładnie jak `CC1_start.png` (przyjrzyj się obrazkowi!). Kontener Treść: 
- Rząd powitania (poziomy, padding 0 4, `main:'SPACE_BETWEEN'`, align końca/dół `MAX`), lewa kolumna: „Wtorek, 6.10 · 1. lekcja” (Small ink-2) nad H1 „Cześć, Ola”; prawa kolumna wyrównana do prawej: wiersz (align BASELINE) „30” w stylu Num L + „min” (Label ink), pod nim „do dzwonka” (Label ink-2). Odstęp 16.
- Kafel „Ważne” (fill `tile-2`, `tileLabel(t,'Ważne · Sekretariat','20 min','triangle-alert')`; potem H2 „Jutro 3TA zaczyna o 9:50” (odstęp 8 nad), Small ink-2 „Dwie pierwsze lekcje przeniesione na piątek.” (odstęp 4). Odstęp 12.
- Rząd dwóch kafli (poziomy, gap 12, każdy kafel FILL poziomo i FILL pionowo; rząd HUG pionowo), każdy kafel: góra: etykieta, potem Num XL (kolor ink, odstęp 12) i Label ink (odstęp 4); dół (kolumna, wyrównana do dołu, odstęp 12 od góry; kafel `main:'SPACE_BETWEEN'`): kafel „Ankieta”: „3”, „dni do końca”, dół: Small ink-2 „Zajęcia dodatkowe w II semestrze” + instancja `Przycisk/Obrys` „Wypełnij” (FILL poziomo, odstęp 12 nad). Kafel „Zgłoszenia”: „1”, „w trakcie”, dół: Small ink-2 „Nie działa projektor w sali 204”, pasek 3 segmentów (rząd gap 4, segmenty FILL, wysokość 4, r999: dwa fill `ink`, trzeci `line`) odstęp 12, Caption ink „Etap 2 z 3” odstęp 8. Odstęp 12.
- Kafel szeroki: rząd poziomy (gap 16, align CENTER): lewa kolumna FILL (label „Wydarzenie”, H2 „Turniej e-sportowy klas” odstęp 8, Small ink-2 „Zapisy drużyn do piątku 16.10” odstęp 4), prawa kolumna wyrównana do prawej: Num XL „10” + Label ink „dni”. Odstęp 12.
- Kafel „Ogłoszenia” (`tileLabel(t,'Ogłoszenia','3 nowe')`) + trzy instancje `Wiersz aktualności` (odstęp 8 nad pierwszym): („12.10”,„Biblioteka: nowe godziny otwarcia”), („22.10”,„Próbny egzamin zawodowy INF.04”), („14.11”,„Dzień otwarty: szukamy 20 osób”); pierwszy wiersz `strokeTopWeight=0`.
- `dock(s,'Pulpit')`.

**2.2 „Aktualności”**, tag „Nowy ekran”, opis „Lista wpisów w stylu mediów społecznościowych, z filtrem po typie: Ważne, News, Wydarzenie, Sport.”: `flowTop(c,'Aktualności',null,'arrow-left')`; odstęp 16; rząd chipów zawijany (`layoutWrap='WRAP'`, gap 8, szerokość FILL): `Chip` „Wszystkie” (Stan=Wybrany), „Ważne”, „News”, „Wydarzenie”, „Sport” (Stan=Domyślny); odstęp 16; kolumna wpisów (gap 12) złożona z kafli: (a) kafel fill `tile-2`: rząd [`Znacznik` „Ważne” (fill `ink`, tekst `bg`) + Small ink-2 „Sekretariat · 20 min temu”], H2 „Jutro 3TA zaczyna o 9:50” (odstęp 8), Small ink-2 „Dwie pierwsze lekcje przeniesione na piątek.”; (b) kafel `tile` bez paddingu (padding 0, `clipsContent=true`): prostokąt-miejsce na zdjęcie 358×160 fill `tile-2` z ikoną `image` 28 `ink-2` na środku (ramka auto-layout wyśrodkowana, wysokość 160), pod nim ramka z paddingiem 16 (gap 8): rząd [`Znacznik` „Wydarzenie” + Small ink-2 „Samorząd · 2 dni temu”], H2 „Turniej e-sportowy klas”, Small ink-2 „Zapisy drużyn do piątku 16.10.”; (c) kafel `tile` z paddingiem 16: rząd [`Znacznik` „News” + Small ink-2 „Biblioteka · 5 dni temu”], H2 „Nowe godziny otwarcia biblioteki”, Small ink-2 „Od poniedziałku czynna do 17:00.”. Bez docka.

**2.3 „Aktualność: szczegóły”**, tag „Nowy ekran”, opis „Wpis z jednym albo kilkoma zdjęciami lub filmem, opisem i linkiem.”: `flowTop(c,'Aktualność',null,'arrow-left')`; odstęp 16; miejsce na zdjęcie 358×220 (fill `tile-2`, r12, ikona `image` 28 ink-2 wyśrodkowana, `clipsContent`); pod nim rząd 3 kropek strony (gap 6, wyśrodkowany, średnice 6: pierwsza `ink`, reszta `line`), odstęp 12; rząd [`Znacznik` „Wydarzenie” + Small ink-2 „Samorząd · 12.10”], odstęp 12; H1 „Turniej e-sportowy klas”; odstęp 12; Body ink „Zapisy drużyn trwają do piątku 16.10. W drużynie jest pięć osób z jednej klasy. Mecze gramy w sali 204 po lekcjach.” (wrapT); odstęp 16; instancja `Przycisk/Obrys` (FILL poziomo) „Zobacz regulamin turnieju” (ikona link nie jest potrzebna). Bez docka.

**2.4 „Profil”**, tag „Nowy ekran”, opis „Dane konta, zgłoszenia, dokumenty i usunięcie konta wraz z danymi.”: `flowTop(c,'Profil',null,'arrow-left')`; odstęp 24; rząd [koło 72×72 fill `tile-2` z literą „O” (Num L, ink) + kolumna: H2 „Ola”, Small ink-2 „3TA · o***@teb.edu.pl”]; odstęp 24; kafel (padding 0, `clipsContent`) z trzema wierszami (każdy: rząd padding 16, gap 12, align CENTER, górna kreska `line` 1 poza pierwszym): ikona 20 ink-2 + Body „Moje zgłoszenia” + po prawej Label ink „1” + ikona `chevron-right` 20 ink-2; „Polityka prywatności” (ikona `file-text`), „Regulamin” (ikona `file-text`); odstęp 12; kafel z dwoma wierszami: „Wyloguj” (ikona `log-out`), „Usuń konto i dane” (ikona `trash-2`) + pod nim w tym samym wierszu Small ink-2 „Usuniemy zgłoszenia i odpowiedzi.” (kolumna: Body + Small); odstęp 24; Caption ink-2 „TEB Student · wersja przykładowa”, wyśrodkowany. Bez docka.

---

## Przepływ „3 · Zgłoszenie problemu” (y=2640)

`makeRow('3 · Zgłoszenie problemu','Trzy kroki: czego dotyczy, gdzie to jest, krótki opis. Zgłoszenie można wysłać anonimowo. Status widać na pulpicie i w liście zgłoszeń.', 2640)`. Pięć ekranów. Odtwórz dokładnie z `CC2_zgloszenie.png` i kodu HTML (sekcja `#s-zglos`).

**3.1 „Zgłoszenie 1/3: czego dotyczy”**, tag „Z referencji”, opis „Cztery duże karty, wybór jednej.”: `flowTop(c,'Zgłoś problem','1/3')`; odstęp 16 (to margin-bottom 16 w CSS); `bars(c,1)`; odstęp 24; H1 „Czego dotyczy?”; odstęp 8; Body ink-2 „Wybierz jedno. W następnych krokach dodasz miejsce i opis.” (wrapT); odstęp 24; siatka 2×2 kart (dwa rzędy poziome gap 12, karty FILL poziomo): `Karta wyboru` Stan=Wybrany „Sala lub sprzęt” (ikona wrench), Stan=Domyślny „Bezpieczeństwo” (shield-alert), „Pomysł” (lightbulb), „Inne” (circle-help); w kartach domyślnych kolor ikony `ink`, w wybranej `bg`, stroke 1.75, rozmiar 28. `cta(s,'Dalej','arrow-right',false)`.

**3.2 „Zgłoszenie 2/3: gdzie to jest”**, tag „Z referencji”, opis „Miejsce wybierasz z listy i dopisujesz dokładnie.”: `flowTop(...,'2/3')`, `bars(c,2)`, odstęp 24, H1 „Gdzie to jest?”, odstęp 8, lead „Zaznacz miejsce i dopisz szczegóły.”, odstęp 24; rząd chipów zawijany (gap 8): `Chip` „Sala” (Wybrany), „Korytarz”, „Toaleta”, „Szatnia”, „Sala gimnastyczna”, „Boisko”; odstęp 20; `Pole tekstowe` Etykieta „Dokładne miejsce”, Wartość „Sala 112”. `cta(s,'Dalej','arrow-right',true)`.

**3.3 „Zgłoszenie 3/3: opis”**, tag „Z referencji”, opis „Jeden albo dwa zdania. Przełącznik anonimowości domyślnie włączony.”: `flowTop(...,'3/3')`, `bars(c,3)`, odstęp 24, H1 „Opisz krótko”, odstęp 8, lead „Wystarczą jedno lub dwa zdania.”, odstęp 24; pole tekstowe wielowierszowe (komponent `Pole tekstowe`, Etykieta „Opis”, Wartość „Okno się nie domyka, w sali jest zimno.”, a ramce pola ustaw minimalną wysokość 112: `minHeight`, tekst wyrównany do góry); odstęp 12; instancja `Przełącznik` (domyślne teksty „Wyślij anonimowo” / „Samorząd nie zobaczy, kto zgłosił.” są poprawne). `cta(s,'Wyślij zgłoszenie','send',true)`.

**3.4 „Zgłoszenie wysłane”**, tag „Z referencji”, opis „Potwierdzenie i informacja, gdzie zobaczyć status.”: `newScreen`; treść wyśrodkowana pionowo i poziomo, odstęp od góry 80: koło 88×88 fill `ink` z ikoną `check` 44 w kolorze `bg` stroke 2.5; odstęp 24; H1 „Wysłane” (wyśrodkowany); Body ink-2 „Zgłoszenie trafiło do Samorządu Uczniowskiego. Status zobaczysz na pulpicie.” (wyśrodkowany, wrapT, `textAlignHorizontal='CENTER'`). Na dole `cta(s,'Wróć na pulpit','arrow-right',false)`.

**3.5 „Moje zgłoszenia”**, tag „Nowy ekran”, opis „Lista zgłoszeń z etapem: przyjęte, w trakcie, załatwione.”: `flowTop(c,'Moje zgłoszenia',null,'arrow-left')`; odstęp 16; dwa kafle (gap 12): (a) `tile` z gap 12: rząd [`Znacznik` „Sala lub sprzęt” + Small ink-2 „6.10”], H2 „Nie działa projektor w sali 204”, pasek 3 segmentów (jak na pulpicie: dwa `ink`, jeden `line`), rząd trzech podpisów Caption (SPACE_BETWEEN, FILL): „Przyjęte” ink-2, „W trakcie” ink, „Załatwione” ink-2; (b) kafel `tile` z gap 12: rząd [`Znacznik` „Sala lub sprzęt” + Small ink-2 „29.09”], H2 „Okno się nie domyka w sali 112”, pasek 3 segmentów wszystkie `ink`, podpisy: „Przyjęte” ink-2, „W trakcie” ink-2, „Załatwione” ink; Small ink-2 „Załatwione 2.10”. Bez docka.

---

## Przepływ „4 · Ankiety” (y=3760)

`makeRow('4 · Ankiety','Lista ankiet, potem jedno pytanie na ekranie. Odpowiedzi są anonimowe, a wyniki widzi tylko Samorząd.', 3760)`. Cztery ekrany. Odtwórz z `CC3_ankieta.png` i kodu HTML (sekcja `#s-ankieta`).

**4.1 „Lista ankiet”**, tag „Nowy ekran”, opis „Aktywne ankiety z liczbą dni do końca. Wypełniona ankieta jest oznaczona.”: kontener Treść; H1 „Ankiety”; odstęp 16; Label ink-2 „Aktywne” (odstęp 8 pod); dwa kafle (gap 12): (a) `tile` poziomy: kolumna FILL [Label ink-2 „Zajęcia dodatkowe”, H2 „Zajęcia dodatkowe w II semestrze” (odstęp 4), Small ink-2 „3 pytania · 1 minuta” (odstęp 4), `Przycisk/Obrys` „Wypełnij” (odstęp 12, bez FILL)] + prawa kolumna wyrównana do prawej [Num XL „3” + Label „dni”]; (b) `tile`: rząd [ikona `circle-check` 20 ink + Label ink „Wypełniona”], H2 „Obiad w stołówce” (odstęp 8), Small ink-2 „Dziękujemy za głos. Wyniki widzi Samorząd.” (odstęp 4); odstęp 24; Label ink-2 „Zakończone” + kafel `tile`: H2 „Plan dzwonków”, Small ink-2 „Zakończona 30.09” . `dock(s,'Ankiety')`.

**4.2 „Ankieta 1/3”**, tag „Z referencji”, opis „Jedno pytanie na ekranie, odpowiedzi z literami A–D.”: `flowTop(c,'Zajęcia dodatkowe','1/3')`, `bars(c,1)`, odstęp 24, Label ink-2 „Pytanie 1” (odstęp 8 pod), H1 „Jakie zajęcia dodatkowe chcesz w drugim semestrze?” (wrapT), odstęp 24, cztery `Odpowiedź ankiety` (kolumna gap 12; Etykieta i Litera nadpisz; Litera A–D): A „Koło programowania gier” (Domyślny), B „Siatkówka” (Wybrany), C „Przygotowanie do matury z matematyki” (Domyślny), D „Fotografia” (Domyślny); `note(c,'lock','Odpowiedzi są anonimowe. Wyniki widzi tylko Samorząd.')`. `cta(s,'Dalej','arrow-right',false)`.

**4.3 „Ankieta 2/3”**, tag „Z referencji”, opis „Przycisk Dalej jest szary, dopóki nie zaznaczysz odpowiedzi.”: jak 4.2 ale krok „2/3”, `bars(c,2)`, Label „Pytanie 2”, H1 „Ile razy w tygodniu możesz zostać po lekcjach?”, cztery odpowiedzi wszystkie Domyślne: A „Raz”, B „Dwa razy”, C „Trzy razy lub więcej”, D „Nie mogę zostawać”; ta sama notatka; `cta(s,'Dalej','arrow-right',true,true)` (nieaktywny).

**4.4 „Ankieta wysłana”**, tag „Z referencji”, opis „Potwierdzenie po ostatnim pytaniu.”: jak ekran „Zgłoszenie wysłane” w przepływie 3: koło 88 z `check`, H1 „Odpowiedzi wysłane”, Body ink-2 „Wyniki widzi Samorząd Uczniowski. Dziękujemy za głos.” wyśrodkowane; `cta(s,'Wróć na pulpit','arrow-right',false)`.

---

## Przepływ „5 · Panel Samorządu: nowy wpis” (y=4880)

`makeRow('5 · Panel Samorządu: nowy wpis','Edytor aktualności: wzór to Instagram i TikTok, nie blog. Zdjęcia i wideo w jednym wpisie, przycinanie, opis z formatowaniem i linkami, typ wpisu, podgląd, szkic albo publikacja. Edytor wymaga jeszcze decyzji zespołu.', 4880)`. Trzy ekrany, wszystkie tag „Nowy ekran”. Używaj komponentu `Pasek postępu` (3 kroki).

**5.1 „Nowy wpis 1/3: typ i zdjęcia”** (opis: „Typ wpisu oraz zdjęcia i wideo w jednym wpisie. Zdjęcia można przycinać.”): `flowTop(c,'Nowy wpis','1/3')`, `bars(c,1)`, odstęp 24; H1 „Jaki to wpis?”; odstęp 16; rząd chipów (WRAP, gap 8): `Chip` „Ważne” (Wybrany), „News”, „Wydarzenie”, „Sport”; odstęp 24; Label ink-2 „Zdjęcia i wideo” (odstęp 8 pod); rząd trzech kafelków 110×110 (gap 12): dwa miniatury (fill `tile-2`, r12, ikony `image` i `video` 28 ink-2 wyśrodkowane, w prawym górnym rogu mały znacznik 28×28 koło fill `bg` z ikoną `crop` 16 ink absolutnie x=78,y=4 tylko na pierwszej miniaturze) i kafelek „dodaj” (obrys przerywany: `dashPattern=[6,6]`, stroke `ink-2` 1.5, r12, ikona `plus` 28 ink-2 wyśrodkowana); odstęp 12; Small ink-2 „Pliki są zmniejszane przed wysłaniem. Zdjęcie przytniesz klikając ikonę kadrowania.” (wrapT). `cta(s,'Dalej','arrow-right',false)`.

**5.2 „Nowy wpis 2/3: treść”** (opis: „Tytuł, opis z prostym formatowaniem i linkiem.”): `flowTop(...,'2/3')`, `bars(c,2)`, odstęp 24, H1 „Co chcesz napisać?”, odstęp 24; `Pole tekstowe` Etykieta „Tytuł”, Wartość „Turniej e-sportowy klas”; odstęp 16; Label ink-2 „Opis” (odstęp 8 pod); kafel-edytor (fill `tile`, stroke `line`, r12, bez paddingu, clipsContent): pasek narzędzi (rząd padding 8, gap 4, dolna kreska `line` 1) z czterema przyciskami 44×44 (r8; pierwszy fill `tile-2`): ikony `bold`, `italic`, `link`, `list` 20 ink; pod nim obszar tekstu (padding 16, minHeight 140): Body ink „Zapisy drużyn trwają do piątku 16.10. W drużynie jest pięć osób z jednej klasy.” + niżej Body ink-2 „Mecze gramy w sali 204 po lekcjach.”; odstęp 8; Small ink-2 wyrównany do prawej „82 / 500 znaków”. `cta(s,'Dalej','arrow-right',true)`.

**5.3 „Nowy wpis 3/3: podgląd”** (opis: „Podgląd dokładnie tak, jak zobaczą uczniowie. Szkic można dokończyć później, publikacja pokazuje wpis uczniom.”): `flowTop(...,'3/3')`, `bars(c,3)`, odstęp 24, H1 „Podgląd”, odstęp 16; kafel wpisu jak na liście aktualności (kafel `tile` padding 0, clipsContent): miejsce na zdjęcie 358×160 fill `tile-2` z ikoną `image` 28 ink-2, pod nim padding 16 gap 8: rząd [`Znacznik` „Ważne” (fill `ink`, tekst `bg`) + Small ink-2 „Samorząd · teraz”], H2 „Turniej e-sportowy klas”, Small ink-2 „Zapisy drużyn trwają do piątku 16.10. W drużynie jest pięć osób z jednej klasy.”; odstęp 12; `Przycisk/Obrys` FILL „Zapisz szkic i dokończ później” (ikona nie jest potrzebna). `cta(s,'Opublikuj','send',true)`.
