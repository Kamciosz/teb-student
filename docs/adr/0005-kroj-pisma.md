# ADR 0005: skąd ładujemy krój pisma Archivo

- **Data:** 9.10.2026
- **Status:** Propozycja, czeka na Bohdana
- **Autor:** Szymon (projekt), Bohdan (decyzja)

## Kontekst

Projekt graficzny używa kroju Archivo. `src/shared/styles/tokens.css` ma już zmienną `--font: 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif`, ale w kodzie nie ma jeszcze żadnego `@font-face` ani pliku z krojem. Plik wzorcowy `docs/projekt/referencje/uklad_C.html` ładuje Archivo z Google Fonts. Dla makiety to wystarcza. Aplikacja ma jednak działać na słabych telefonach, offline (PWA) i przy uczniach niepełnoletnich, więc trzeba zdecydować, skąd bierze się plik z krojem.

### Jak oznaczamy fakty

- **sprawdzone**: otwarta oficjalna strona, repozytorium albo plik w podanej wersji.
- **pomiar lokalny**: zmierzone na komputerze, w katalogu poza repozytorium. To nie jest test na telefonie.
- **niesprawdzone**: wynik wyszukiwania, pamięć albo ocena.

Wszystkie wersje i daty są z 9.10.2026.

### Czego projekt wymaga od kroju (sprawdzone w `uklad_C.html`)

- Wagi od 400 do 800.
- Szerokość 62% dla dużych liczb (`font-stretch: 62%`), 75% i 100% w pozostałych miejscach. Archivo ma oś szerokości i dlatego te liczby są wąskie.
- Cyfry o równej szerokości (`font-variant-numeric: tabular-nums`).
- Brak kursywy.
- Polskie litery: ą ć ę ł ń ó ś ź ż i duże odpowiedniki.

### Archivo: licencja i zakres (sprawdzone)

- Licencja SIL Open Font License 1.1 ([OFL.txt w repozytorium google/fonts](https://github.com/google/fonts/blob/main/ofl/archivo/OFL.txt)). Autor: Omnibus-Type. Nagłówek licencji nie ma zastrzeżonej nazwy kroju (Reserved Font Name), więc po przycięciu pliku nazwa kroju może zostać ta sama. Wymóg to dołączenie tekstu licencji do plików, które rozdajemy.
- Plik źródłowy: jeden krój zmienny `Archivo[wdth,wght].ttf`. Osie: szerokość 62 do 125, waga 100 do 900. Ostatnia zmiana pliku w repozytorium: 4.2.2021, commit `6c70c829f09ea345d3590406693220ea35c6553f`. Skrót SHA-256 pliku zaczyna się od `0e094a7d3c7c4c25`.
- Zakres znaków według [METADATA.pb](https://github.com/google/fonts/blob/main/ofl/archivo/METADATA.pb): latin, latin-ext i vietnamese. **Cyrylicy nie ma.** Polskie litery są w latin-ext.
- Google zezwala na własny hosting: instrukcja [Self-hosting web fonts](https://fonts.google.com/knowledge/using_type/self_hosting_web_fonts) opisuje to jako zwykłą ścieżkę, a [FAQ](https://fonts.google.com/faq) potwierdza użycie i redystrybucję zgodnie z licencją.

### Co dostaje Google, gdy ładujemy krój z jego serwerów (sprawdzone w FAQ Google Fonts)

Przeglądarka ucznia wysyła do Google zapytanie HTTP, które zawiera adres IP, adres żądanego pliku oraz nagłówki: przeglądarkę, system i stronę, na której krój ma się pokazać (referer). Google pisze, że nie używa tych danych do profili ani reklam. Nie zmienia to faktu, że adres IP ucznia trafia do podmiotu spoza szkoły i spoza Polski. Czy to wymaga podstawy prawnej i wzmianki w polityce prywatności, powinien ocenić ktoś od RODO. Ja tego nie oceniam (niesprawdzone).

## Waga plików

| Wariant | Pliki | Bajty (pomiar lokalny) |
|---|---|---|
| Google Fonts, oś szerokości i wagi w pełnym zakresie, `latin` + `latin-ext` | 2 pliki WOFF2 z `fonts.gstatic.com` (90 096 + 85 856 B) | 175 952 |
| Własny podzbiór, pełne osie (62 do 125, 100 do 900), zestaw „szeroki” | 1 plik WOFF2 | 107 372 |
| Własny podzbiór, pełne osie, zestaw „minimalny” | 1 plik WOFF2 | 57 736 |
| **Własny podzbiór, osie z projektu (waga 400 do 800, szerokość 62 do 100), zestaw „szeroki”** | 1 plik WOFF2 | **67 768** |
| Własny podzbiór, osie z projektu, zestaw „minimalny” | 1 plik WOFF2 | **35 952** |
| Krój systemowy | brak | 0 |

Zestawy znaków:

- **Minimalny** (128 znaków): ASCII, polskie litery, `° · × „ ” – — … € −` i kilka znaków interpunkcji.
- **Szeroki** (330 znaków): ASCII, cały Latin-1 i Latin Extended-A, czyli także niemieckie, czeskie, słowackie, litewskie i węgierskie litery, plus ta sama interpunkcja.

Oba zestawy zachowują kerning, ligatury, `tnum` i `pnum` (pomiar lokalny: odczyt tabel GSUB i GPOS z gotowego pliku). Pomiar: fonttools 4.66.1.

Ile z tego trafia do uczniów, zależy od buforowania. W `vite.config.ts` `workbox.globPatterns` zawiera już `woff2`, więc własny plik trafi do pamięci offline razem z resztą aplikacji (sprawdzone w pliku). Dla Google Fonts nie ma żadnego `runtimeCaching`, więc po utracie sieci krój znika, a przeglądarka bierze krój systemowy (sprawdzone w pliku, że takiej reguły brak).

## Rozważane opcje

### Odrzucone: ładowanie z Google Fonts

- Największa waga (176 KB wobec 36 do 68 KB) i dwa dodatkowe adresy do połączenia (`fonts.googleapis.com`, `fonts.gstatic.com`).
- Adres IP ucznia trafia do Google przy każdej nowej wizycie bez pliku w pamięci.
- Brak kroju offline, jeśli nie dopiszemy ręcznie reguły w Workboxie (więcej kodu, ten sam adres IP przy pierwszym wejściu).
- Przyszła polityka CSP musiałaby przepuszczać dwa obce adresy.
- Jedyna zaleta: zero pracy. Przy własnym podzbiorze praca jest jednorazowa i opisana niżej.

### Opcja A: własny plik WOFF2 z podzbiorem znaków, zestaw „szeroki” (rekomendowana)

Plik `Archivo[wdth,wght].ttf` przycinamy do osi i znaków, których aplikacja używa, i zapisujemy jako jeden WOFF2 w repozytorium. Zalety: 68 KB, zero zapytań poza naszą domeną, krój działa offline, licencja na to pozwala. Wada: dodatkowy plik w repozytorium i polecenie do powtórzenia, gdy projekt zmieni zakres.

Rekomenduję zestaw „szeroki” zamiast „minimalnego”. Różnica to 32 KB, pobierane raz i potem z pamięci offline. W zamian aplikacja pokazuje poprawnie także imiona i nazwiska z niemieckimi i czeskimi literami, które uczeń wpisze w zgłoszeniu. W zestawie minimalnym taka litera przełączyłaby się na krój systemowy tylko w jednym znaku. Jeśli Bohdan woli najmniejszy plik, zestaw minimalny jest dozwolony i nie zmienia reszty opcji.

Powtarzalne polecenie (osobno od repozytorium, w pustym katalogu, wymaga Pythona z pakietami `fonttools` i `brotli`):

```sh
curl -L "https://raw.githubusercontent.com/google/fonts/6c70c829f09ea345d3590406693220ea35c6553f/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf" -o Archivo.ttf
fonttools varLib.instancer Archivo.ttf wght=400:800 wdth=62:100 -o instance.ttf
pyftsubset instance.ttf \
  --unicodes="U+0020-007E,U+00A0-017F,U+2013-2014,U+2018-2019,U+201C-201E,U+2022,U+2026,U+20AC,U+2212" \
  --flavor=woff2 --layout-features='kern,liga,ccmp,locl,lnum,pnum,tnum' \
  --name-IDs='*' --output-file=archivo-latin.woff2
```

Zestaw „minimalny” to te same polecenia z `--unicodes="U+0020-007E,U+00A0,U+00B0,U+00B7,U+00D3,U+00D7,U+00F3,U+0104-0107,U+0118-0119,U+0141-0144,U+015A-015B,U+0179-017C,U+2013-2014,U+2018-2019,U+201C-201E,U+2022,U+2026,U+20AC,U+2212"`. Opcja `--name-IDs='*'` zostawia w pliku tekst licencji (nazwy 13 i 14), czego wymaga OFL (pomiar lokalny: odczyt z gotowego pliku).

Uwaga: przycięcie osi to decyzja projektowa. Jeśli projekt zacznie używać wagi 900, szerokości 125 albo kursywy, plik trzeba zbudować od nowa.

### Opcja B: tylko krój systemowy

Zero bajtów, zero zapytań, zero pracy. `--font` zostaje listą krojów systemowych. Wada: znika charakter projektu. Wąskie, ciężkie liczby w kafelkach i na dzwonku (`font-stretch: 62%`) wymagają osi szerokości, której kroje systemowe zwykle nie udostępniają (niesprawdzone, bez testu na telefonie). Wygląd różniłby się też między iPhonem a Androidem. Nie rekomenduję tego, ale to jedyna opcja, w której nie dochodzi nic do utrzymania.

### Porównanie

| Kryterium | Google Fonts (odrzucone) | A: własny podzbiór | B: krój systemowy |
|---|---|---|---|
| Waga | 176 KB | 68 KB (36 KB w zestawie minimalnym) | 0 |
| Szybkość na słabym telefonie | dwa dodatkowe połączenia | jeden plik z własnej domeny, brak dodatkowych połączeń | najszybciej |
| Offline (PWA) | nie bez dopisania reguły | tak, już w precache | tak |
| Adres IP ucznia do Google | tak | nie | nie |
| Licencja | OFL, dozwolone | OFL, dozwolone, tekst licencji w pliku | bez ograniczeń |
| Wygląd zgodny z projektem | tak | tak | nie |
| Praca | zerowa | jednorazowa, polecenie wyżej | zerowa |

## Rekomendacja

**Opcja A, zestaw „szeroki”.** Jest szybsza i lżejsza niż Google Fonts, działa offline i nie wysyła adresów IP uczniów poza naszą domenę. Kosztuje jedno polecenie i jeden plik. Opcja B jest uczciwą alternatywą, jeśli Bohdan uzna, że wygląd nie jest wart utrzymywania pliku.

## Decyzja

Do uzupełnienia przez Bohdana po przeczytaniu. Do wpisania: opcja (A albo B), zestaw znaków (szeroki albo minimalny) i data.

## Konsekwencje

Jeśli Bohdan przyjmie opcję A:

- Osobny pull request dodaje plik WOFF2 do `src/shared/fonts/` (Vite nada mu skrót w nazwie, a Workbox go zbuforuje), kopię `OFL.txt` obok pliku i `@font-face` w `src/shared/styles/base.css` z `font-weight: 400 800`, `font-stretch: 62% 100%`, `font-display: swap`. Ten ADR niczego z tego nie zmienia.
- W `index.html` dochodzi `<link rel="preload" as="font" type="font/woff2" crossorigin>` dla tego pliku, żeby zmniejszyć błysk kroju systemowego na słabym telefonie.
- Zasada dla agentów: żadnych krojów ani skryptów z obcych domen. Nowy krój albo oś wymaga wpisu w tym ADR albo nowego.
- `docs/TECHNOLOGIE.md` dostaje wiersz o kroju i linkuje ten ADR. Robi to osobny pull request po decyzji.

Jeśli Bohdan wybierze opcję B: pull request usuwa `'Archivo'` z początku listy `--font` w `tokens.css`. Projekt graficzny trzeba wtedy poprawić tam, gdzie liczby w kafelkach i na dzwonku mają być wąskie.

## Do sprawdzenia przed pilotażem

- iPhone z iOS 15: czy `font-stretch: 62%` na kroju zmiennym naprawdę zwęża liczby w WOFF2. Obsługa krojów zmiennych w Safari 15 jest mi znana z pamięci (niesprawdzone).
- Słaby telefon przy wolnej sieci: ile trwa błysk kroju systemowego i czy zamiana kroju przesuwa układ strony. Jeśli tak, dopisujemy dopasowanie rozmiaru kroju zastępczego (`size-adjust`).
- Tryb samolotowy po pierwszym wejściu: czy aplikacja pokazuje Archivo bez sieci. Spodziewane po `globPatterns`, ale to hipoteza, dopóki nie sprawdzi tego telefon.
- Cyrylica: Archivo jej nie ma, więc litery cyrylicy pokaże krój systemowy. Czy w szkole są uczniowie, którzy piszą cyrylicą, i czy ten wygląd wystarczy, nie wiemy (niesprawdzone).
- Rzeczywista liczba bajtów pobranych z serwera po zbudowaniu aplikacji. Wagi z tabeli to rozmiary plików na dysku.

## Źródła

- [Archivo, repozytorium google/fonts: OFL.txt](https://github.com/google/fonts/blob/main/ofl/archivo/OFL.txt) i [METADATA.pb](https://github.com/google/fonts/blob/main/ofl/archivo/METADATA.pb)
- [Archivo, repozytorium autora (Omnibus-Type)](https://github.com/Omnibus-Type/Archivo)
- [Google Fonts: FAQ (licencja, dane odbiorców)](https://fonts.google.com/faq)
- [Google Fonts: własny hosting](https://fonts.google.com/knowledge/using_type/self_hosting_web_fonts)
- [fonttools: pyftsubset i varLib.instancer](https://fonttools.readthedocs.io/)
- Pliki w repozytorium: `src/shared/styles/tokens.css`, `docs/projekt/referencje/uklad_C.html`, `vite.config.ts` (`globPatterns`)
