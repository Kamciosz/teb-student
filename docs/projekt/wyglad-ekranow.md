# Wygląd ekranów: jak aplikacja systemowa

Zasady dla każdego ekranu. Decyzja i powody: `docs/adr/0007-wyglad-aplikacji-systemowej.md`.

Decyzja właściciela (17.10): obecny wygląd (ciemne kafle na wszystkim, ogromne liczby, pływający pasek) jest odrzucony.
Aplikacja ma wyglądać i zachowywać się jak natywna aplikacja iPhone'a (wzór: Ustawienia, Przypomnienia, Wiadomości),
i dobrze na Androidzie. Uczeń otwiera ją na przerwie na kilka sekund: co dziś, co nowego, co wymaga ode mnie akcji.

## Zasady
1. Hierarchię robi tekst (rozmiar, grubość, kolor drugorzędny), nie kafle i cienie. Zero cieni (poza arkuszem/Sheet).
2. Treść to **grupowane listy** (iOS "inset grouped"): białe (ciemny: #1C1C1E) bloki z zaokrągleniem 10 px na szarym tle,
   wiersze min. 44 px, cienkie linie między wierszami wcięte 16 px od lewej, strzałka „›” przy wierszu, który otwiera ekran.
   Nad blokiem mały nagłówek sekcji (13 px, kolor --ink-2, wielkie litery NIE — zwykły tekst), pod blokiem opcjonalny przypis 13 px.
3. Każdy ekran ma u góry **duży tytuł** (34 px, grubość 700) wyrównany do lewej, 16 px marginesu. Ekrany podrzędne: przycisk „‹ Wstecz”
   jako tekst w kolorze akcentu, tytuł 17 px/600 na środku paska.
4. Jeden akcent na ekran = kolor szkoły. Tylko główna akcja ma wypełniony przycisk. Reszta: przyciski tekstowe w kolorze akcentu.
5. Tekst rośnie razem z ustawieniem rozmiaru tekstu w telefonie: rozmiary w rem, na iOS `font: -apple-system-body` na html.
6. Jasny i ciemny motyw według telefonu (prefers-color-scheme), z możliwością wymuszenia w Ustawieniach.
7. Nic nie zasłania treści: dolny pasek ma swoją wysokość w zmiennej, treść ma pod sobą tyle odstępu; safe-area góra i dół.
8. Liczby normalnej wielkości. Żadnych 64 px. Licznik dzwonka może być większy (najwyżej 2.125rem), reszta liczb w treści wiersza.

## Hierarchia: ważne większe, mniej ważne mniejsze (decyzja właściciela 17.10)
Nie wszystko musi być równe i symetryczne. Wielkość elementu = jego ważność TERAZ dla ucznia. Układ jest dynamiczny:
kolejność i wielkość zależą od stanu (czas, termin, nowa odpowiedź), a nie od stałej siatki kafli 2×2.

Ocena wizualizacji z OpenPencil (op/out/demo/ekrany), od najważniejszego:
1. **Bohater (jeden na ekran, największy):** to, co zmienia plan dnia ucznia.
   - Trwa lekcja / przerwa → licznik do dzwonka i następna lekcja (sala, przedmiot, jeśli są). Duży, u góry.
   - Jest wpis „Ważne” z ostatnich 24 h (np. „Jutro 3TA zaczyna o 9:50”) → bohater obok lub pod licznikiem, pełna szerokość, tytuł 20 px+.
   - Brak lekcji (weekend, po lekcjach) → licznik znika albo zostaje jedną linią tekstu w nagłówku („Dziś nie ma lekcji”). NIE pokazuj dużej kreski „—”.
2. **Do zrobienia (średnie):** rzeczy, które wymagają akcji ucznia — ankieta do wypełnienia (termin), nowa odpowiedź Samorządu na moje zgłoszenie.
   Jedna lista „Do zrobienia” z wierszami, termin po prawej („jeszcze 3 dni”, „dziś do 15:00” — wtedy kolor akcentu). Ankieta zamykająca się dziś idzie na górę.
   Gdy nie ma nic do zrobienia — sekcja znika (bez pustego kafla „Nie ma ankiet”).
3. **Informacje (małe, zwarta lista):** ogłoszenia i wydarzenia — wiersz: data mała po lewej, tytuł; 3 ostatnie + „Wszystkie aktualności ›”.
   Wydarzenie za 10 dni NIE dostaje ogromnej liczby „10 dni” — to najmniej pilna rzecz na ekranie, wystarczy „za 10 dni” małym tekstem.
4. **Najmniej ważne:** powitanie („Cześć, Ola”) i data — mały tekst nad tytułem albo wcale; tytuł ekranu to „Dzisiaj”.
   „Zmień układ” to rzadka akcja → mały przycisk tekstowy „Edytuj” w prawym górnym rogu, nie duży przycisk w nagłówku.
   Status „Etap 2 z 3” zgłoszenia — w wierszu „Do zrobienia”/„Moje zgłoszenia” jako tekst („W trakcie”), pasek postępu tylko w szczegółach zgłoszenia.

Inne ekrany:
- Aktualności (lista): pierwszy wpis „Ważne” lub przypięty może być większy (tytuł 20 px, 2 linie opisu), reszta to zwarte wiersze (tytuł 17 px, 1 linia, autor i czas 13 px). Filtry jako kontrolka segmentowa przewijana w bok, jedna linia — nie dwie linie chipów.
- Aktualność (szczegóły): tekst czytelny 17 px, interlinia 1.5, szerokość pełna; zdjęcie tylko gdy jest (bez szarego placeholdera z ikoną); przycisk akcji tylko jeśli wpis ma link.
- Moje zgłoszenia: wiersz listy = tytuł + kategoria i data małym tekstem + status po prawej („Przyjęte / W trakcie / Załatwione”, kolor tylko dla „Załatwione” = --success). Trzy paski postępu w każdym wierszu to szum — usuń z listy.
- Zgłoś problem (kreator): 4 kategorie jako lista wierszy z ikoną (nie 4 wielkie puste kafle), przycisk „Dalej” przyklejony na dole.
- Ankiety: ankieta z najbliższym terminem na górze; pytanie w kreatorze duże (20 px), odpowiedzi jako wiersze listy z zaznaczeniem.
- Profil: lista grupowana jak Ustawienia iOS (konto, urządzenia, klucze, motyw, prywatność, usuń konto na czerwono na dole osobno).
- Panel Samorządu: lista grupowana z liczbami po prawej (np. „Zgłoszenia  3 nowe ›”), bez kafli.

Asymetria jest dozwolona i pożądana: bohater pełnej szerokości, pod nim listy. Siatka 2×2 równych kafli jest zakazana.

## Tokeny (src/shared/styles/tokens.css) — jedyne miejsce z kolorami
Jasny:  --bg #F2F2F7 · --bg-deep #F2F2F7 · --tile #FFFFFF · --tile-2 #E5E5EA · --line #C6C6C8 · --ink #000000 · --ink-2 #6C6C70
Ciemny: --bg #000000 · --bg-deep #000000 · --tile #1C1C1E · --tile-2 #2C2C2E · --line #38383A · --ink #FFFFFF · --ink-2 #98989F
Akcent liceum (L, domyślny): jasny #0062CC, ciemny #4C9DFF.  Akcent technikum (T): jasny #C42B2B, ciemny #FF6B6B.
--on-accent: #FFFFFF w jasnym, #000000 w ciemnym. --focus = --accent. --danger: jasny #D70015, ciemny #FF453A. --success: jasny #248A3D, ciemny #30D158.
Kontrast: tekst na tle ≥ 4.5:1 — policz dla --ink-2 i --accent na --tile i --bg w obu motywach, popraw wartość, jeśli nie przechodzi.

Krój: `--font: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;` (usuń Archivo i jego ładowanie).
Skala (rem): --t-xs .8125rem (13) · --t-sm .9375rem (15) · --t-md 1.0625rem (17) · --t-lg 1.25rem (20) · --t-xl 1.75rem (28) ·
--t-title 2.125rem (34) · --t-num-sm 1.375rem · --t-num 2.125rem.
Promienie: --r-sm 8px · --r 10px · --r-lg 14px. Odstępy wielokrotności 8 px (4 px dozwolone wewnątrz wiersza).
--shadow: none (zostaw zmienną, żeby nic się nie zepsuło; Sheet może mieć własny delikatny cień).

Palety CA–CH znikają: zostaje tylko motyw (Automatyczny / Jasny / Ciemny, atrybut data-motyw="auto|jasny|ciemny" na <html>)
i szkoła (data-szkola L/T, zmienia akcent). Stara wartość w localStorage z paletą ma się wczytać bez błędu (traktuj jako „auto”).

## Wzorce komponentów (src/shared/ui)
- Lista grupowana: komponent `ListGroup` (nagłówek, przypis, dzieci) i `ListRow` (ikona opcjonalna, tytuł, podtytuł, wartość po prawej, „›”, link albo przycisk).
  Jeśli Tile robi to samo — przerób Tile na te wzorce i zostaw eksport Tile jako alias tylko gdy wiele miejsc go używa.
- Button: wariant `filled` (akcent, biały tekst, 50 px wysokości, pełna szerokość w formularzach), `plain` (tekst akcentu, bez tła), `destructive` (tekst --danger).
- Chip/filtry: kontrolka segmentowa (szare tło --tile-2, wybrany segment --tile), przewijana w bok gdy > 4 opcje.
- Badge: mały tekst 13 px, bez obwódki, tło --tile-2 albo akcent dla „Ważne”.
- TextField: pole w wierszu listy albo samodzielne z tłem --tile, bez ramki, zaokrąglenie --r.
- EmptyState: wyśrodkowany tekst --ink-2 i jedna akcja tekstowa. Bez ilustracji.
- Dolny pasek: pełna szerokość, przyklejony do dołu, tło --tile z lekką przezroczystością i backdrop-filter blur, cienka linia u góry,
  5 równych pozycji: ikona 24 px nad napisem 10–11 px, aktywna w kolorze akcentu, reszta --ink-2.

## Efekty i wydajność (research 17.10)
Dozwolone:
- Przejścia 150–250 ms tylko na `transform` i `opacity` (wciśnięcie wiersza, otwarcie arkusza, zmiana ekranu). Nigdy animacja width/height/top/left/margin.
- `@media (prefers-reduced-motion: reduce)`: ruch zamieniony na samo przenikanie albo brak.
- `backdrop-filter: blur()` TYLKO na dolnym pasku (i ewentualnie górnym pasku tytułu), z kolorem zapasowym przez `@supports not (backdrop-filter: blur(1px))`.
- Wciśnięcie: zmiana tła wiersza na --tile-2 (`:active`), bez skalowania całych kart.
Zakazane (slop albo koszt na telefonie):
- Gradienty dekoracyjne, glow, glassmorphism na kartach, `filter: blur` na treści, duże `box-shadow` (cień tylko arkusz/Sheet, jeden, mały).
- Animowane gradienty, pulsujące elementy, animacje w pętli (wyjątek: wskaźnik ładowania).
- `will-change` na stałe w CSS (najwyżej na czas animacji).
- Fonty webowe — krój systemowy, zero pobierania fontów.
- Emoji jako ikony, ozdobne ilustracje w pustych stanach, placeholdery zdjęć z ikoną.
Kolor:
- Jeden akcent (kolor szkoły). Kolory semantyczne (--danger, --success) tylko dla znaczenia, nie dla ozdoby.
- Kontrast tekstu ≥ 4.5:1, duży tekst i elementy UI/fokus ≥ 3:1 (WCAG 2.2).
- Ciemny motyw: tło #000000 (wzór iOS), bloki #1C1C1E, wyżej #2C2C2E; separacja przez jaśniejsze tło, nie cień.

## Gotowe klocki (src/shared, import z `../../shared` albo `src/shared/index.ts`)
- `ScreenHeader` — `title`, `eyebrow?` (mały tekst nad dużym tytułem), `action?` (np. `<Button variant="plain">Edytuj</Button>`), `backTo?` (adres ekranu nadrzędnego: wtedy pasek „‹ Wstecz” i mały tytuł), `backLabel?`.
- `ListGroup` — `header?`, `footer?`, dzieci to `ListRow`.
- `ListRow` — `title`, `subtitle?`, `value?` (tekst po prawej), `icon?`, `to?` (link routera ze strzałką), `onClick?` (przycisk), `chevron?`, `destructive?`.
- `Button` — `variant`: `filled` (jedna główna akcja na ekranie), `plain`, `destructive`.
- `Dock` — dolny pasek. Wstaw `<Dock />` na każdym ekranie zakładki: Pulpit `/`, Aktualności `/news/feed`, Zgłoszenia `/reports/student`, Ankiety `/surveys/vote`, Profil `/profile`. Ekrany podrzędne i panel Samorządu go nie mają.
- `Icon` — ikony liniowe (`src/shared/ui/Icon.tsx`). Nowy kształt dodaj tam, nie emoji.

## Teksty
Po polsku, poprawne, z polskimi znakami. Nie zmieniaj tekstów zatwierdzonych przez Szymona, chyba że element znika.
Komentarze w kodzie dwujęzyczne „PL: … EN: …” jak w reszcie repo.

## Sprawdzenie (każdy agent)
- `npm run lint && npx vitest run && npm run build` bez pliku .dev.vars.
- Zrzuty swoich ekranów przy 320, 390 i 1280 px, jasny i ciemny motyw (Playwright headless, własny port). Obejrzyj je (Read na PNG po `sips -Z 1200`).
  Sprawdź: nic nie ucięte, nic nie wychodzi w bok, dolny pasek nie zasłania ostatniego elementu, tekst czytelny, jeden akcent.
- e2e swoich ekranów: `PORT=<twój port> npm run test:e2e -- <pliki>`. Testy poprawiasz na nowy układ, nie osłabiasz asercji.
