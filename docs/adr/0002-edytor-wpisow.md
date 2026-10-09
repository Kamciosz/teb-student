# ADR 0002: biblioteka edytora wpisów

- **Data:** 9.10.2026
- **Status:** Przyjęta 9.10.2026
- **Autor:** Szymon (projekt), Bohdan (decyzja)

## Kontekst

Podtor 3b (edytor wpisów, `news/editor`) czeka na wybór biblioteki. Samorząd i redakcja gazetki piszą w edytorze wpisy i artykuły. Wymagania pochodzą z `docs/PLAN_APLIKACJI.md` (część 2 i 7) oraz z `docs/TECHNOLOGIE.md`, sekcja „Zasady dla agentów”:

- elementy: nagłówki, pogrubienie, kursywa, podkreślenie, listy, cytat, linki, zdjęcie z podpisem, film z YouTube;
- treść zapisana jako JSON, a nie jako HTML wpisany przez użytkownika;
- serwer sprawdza treść według listy dozwolonych elementów;
- film z YouTube: serwer zapisuje tylko identyfikator, aplikacja pokazuje miniaturę, a `iframe` z `youtube-nocookie.com` wstawia dopiero po kliknięciu;
- linki tylko `https://`, w nowej karcie z `rel="noopener noreferrer"`;
- edytor działa na iPhonie z iOS 15 i przyjmuje wklejony tekst z Worda i Google Docs;
- React 19, bez płatnych usług (budżet 50 zł).

Edytor jest tylko w panelu Samorządu. Uczniowie czytają wpis, więc do jego wyświetlenia nie ładujemy edytora: ekran czytania rysuje JSON własnymi komponentami Reacta.

### Jak oznaczamy fakty

- **sprawdzone**: otwarta oficjalna strona, rejestr npm albo GitHub.
- **pomiar lokalny**: zmierzone na komputerze w Node.js 26 i esbuildzie, na pakietach z npm zainstalowanych poza repozytorium. To nie jest test na telefonie.
- **niesprawdzone**: wynik wyszukiwania albo ocena.

Wszystkie wersje i daty są z 9.10.2026.

## Rozważane opcje

Do porównania w szczegółach przeszły dwie biblioteki. Pozostałe odpadły z powodów poniżej.

| Biblioteka | Dlaczego odpada |
|---|---|
| ProseMirror bez nakładki | To silnik, na którym stoi Tiptap. Bez nakładki sami piszemy pasek narzędzi, powiązanie z Reactem i klawisze. Sam silnik waży około 65 KB po gzip (pomiar lokalny), ale tę pracę wykonuje Tiptap. Repozytorium przeniesiono z GitHuba na `code.haverbeke.berlin`, a w npm jest jeden opiekun (sprawdzone). Wydanie prosemirror-view 1.42.6 jest z 25.9.2026, więc projekt żyje. |
| BlockNote | Edytor blokowy w stylu Notion, a plan opisuje artykuł. Waży około 405 KB po gzip ponad React, czyli 3 razy więcej niż dwie wybrane biblioteki (pomiar lokalny). Rdzeń ma licencję MPL-2.0, a pakiety `@blocknote/xl-*` mają GPL-3.0 albo licencję komercyjną (sprawdzone). Wymaga też Mantine. |
| Slate | Wersja 0.132.0, czyli nadal przed 1.0. FAQ projektu pisze, że iOS jest wspierany, ale nie jest regularnie testowany (sprawdzone). To za słabe przy wymaganiu iOS 15. |
| Quill 2 | Ostatnie wydanie 30.11.2024 (sprawdzone). Własny format Delta zamiast JSON z listą elementów. Wsparcie React 19: niesprawdzone. |

## Dwie opcje końcowe

### Opcja A: Tiptap

Nakładka na ProseMirror z gotowymi rozszerzeniami i wiązaniem z Reactem.

### Opcja B: Lexical

Edytor z Mety, własny silnik, wiązanie z Reactem w `@lexical/react`.

### Porównanie

| Cecha | A: Tiptap | B: Lexical |
|---|---|---|
| Ostatnie wydanie | 3.31.4, 30.9.2026 (sprawdzone) | 0.52.0, 28.9.2026 (sprawdzone) |
| Numer wersji | 3.x, od 17.6 do 1.9 wyszło 5 wydań 3.27–3.31 (sprawdzone) | 0.x, od 28.5 do 28.9 wyszło 8 wydań 0.45–0.52. Słowo „breaking” jest w opisach 7 z 8 ostatnich wydań (pomiar lokalny) |
| Licencja | MIT (sprawdzone) | MIT (sprawdzone) |
| Kto utrzymuje | Firma Tiptap, organizacja `ueberdosis` na GitHubie. Sprzedaje też płatne plany i rozszerzenia (sprawdzone). Ostatni zapis w repozytorium 9.10.2026 | Meta oraz wolontariusze z innych firm (sprawdzone). Ostatni zapis w repozytorium 9.10.2026 |
| React 19 | tak, `react ^17 \|\| ^18 \|\| ^19` (sprawdzone). React Compiler i TypeScript 7: niesprawdzone | tak, `react >=18` (sprawdzone). React Compiler i TypeScript 7: niesprawdzone |
| Waga po gzip, ponad React i React DOM (69 KB) | około 130 KB z StarterKit, około 135 KB z filmem i zdjęciem (pomiar lokalny) | około 130 KB z listami i linkami (pomiar lokalny) |
| iOS 15 / Safari 15 | Brak oficjalnej tabeli przeglądarek: niesprawdzone. Silnik ProseMirror ma w dzienniku zmian 46 wzmianek o iOS lub Safari, głównie poprawki Entera (pomiar lokalny) | Oficjalnie Safari 15+, w tym iOS i iPadOS 15+ (sprawdzone) |
| Zapis | JSON dokumentu ProseMirror: węzły i znaczniki (`marks`), czytelny dla własnego rysowania (pomiar lokalny) | Własny JSON Lexical. Formatowanie tekstu to liczba bitowa (1 pogrubienie, 2 kursywa, 8 podkreślenie), więcej pracy przy własnym rysowaniu (pomiar lokalny) |
| Serwer sprawdza listę dozwolonych elementów | `getSchema` i `Node.fromJSON(...).check()` działają bez przeglądarki. Odrzuciły nieznany węzeł i `listItem` poza listą (pomiar lokalny) | `createEditor` i `parseEditorState` działają bez przeglądarki. Odrzuciły nieznany typ, ale przyjęły `listitem` poza listą (pomiar lokalny) |
| Wklejanie z Google Docs | Uproszczony fragment HTML: nagłówek, pogrubienie, kursywa, podkreślenie, link i lista przeszły poprawnie (pomiar lokalny, nie prawdziwy schowek) | To samo, wynik identyczny (pomiar lokalny, nie prawdziwy schowek) |
| Wklejanie z Worda | Uproszczony fragment HTML: listy z Worda stały się zwykłymi akapitami ze znakiem „·” (pomiar lokalny, nie prawdziwy schowek). Gotowy dodatek `@tiptap-pro/extension-paste-handler` jest płatny, więc odpada (sprawdzone: pakiet w zakresie `@tiptap-pro`, plany od 49 USD miesięcznie, który plan go zawiera: niesprawdzone). Zostaje własny kod w `transformPastedHTML` (dostępny od rdzenia 3.20) | Domyślne wklejanie dało ten sam błąd co u Tiptapa. Dodatek `WordListImportExtension` w `@lexical/list` poprawnie zamienił te same listy na listę (pomiar lokalny, uproszczony fragment). Opiera się na API oznaczonym jako eksperymentalne, które „może się zmienić między dowolnymi dwoma wydaniami” (sprawdzone) |
| Film z YouTube | `@tiptap/extension-youtube` (MIT) zapisuje cały adres `src`, domyślnie bez `nocookie` i od razu wstawia `iframe` (sprawdzone w kodzie). Nie spełnia naszej zasady, trzeba własnego węzła | Brak gotowego węzła w pakietach `@lexical/*`: nie znaleziono (pomiar lokalny). Trzeba własnego węzła |
| Zdjęcie z podpisem | `@tiptap/extension-image` nie ma podpisu. Trzeba własnego węzła | Trzeba własnego węzła |

### Co wynika z pomiarów

- **Serwer musi mieć własne sprawdzanie przy obu opcjach.** Oba sprawdzacze przyjęły link `javascript:` w polu `href`. Serwer dodaje więc własne sprawdzenie `https://` oraz identyfikatora YouTube, niezależnie od wyboru.
- **Struktura:** schemat Tiptapa pilnuje, co może być w czym. Przy Lexicalu serwer musiałby mieć jeszcze własny sprawdzacz całej struktury. To jest główna różnica na korzyść A.
- **iOS 15:** w obu zbudowanych paczkach jest wywołanie `findLast`, a w Tiptapie także `.at()`. Obie funkcje działają dopiero od iOS 15.4 (sprawdzone w danych MDN). `Object.hasOwn` też wymaga 15.4, ale kod ma na nią zapas (pomiar lokalny). Oficjalne „Safari 15+” Lexicala tego nie zmienia. `@vitejs/plugin-legacy` ma dla iOS 15 osobną wersję z uzupełnieniami, ale czy iOS 15.0–15.3 ją dostaje i czy to wystarcza, jest niesprawdzone. Rozstrzyga test na iPhonie (pozycja w „Do sprawdzenia” poniżej).
- **Wklejanie z Worda:** u B jest gotowe, ale eksperymentalne. U A trzeba napisać własną przeróbkę listy z Worda. Test był na uproszczonym fragmencie HTML, a prawdziwy schowek Worda na Windows i macOS jest inny.

## Rekomendacja

**Opcja A, Tiptap.**

Powody:

1. Schemat sam pilnuje struktury treści. To najmocniej wspiera zasadę „serwer przyjmuje tylko dozwolone elementy”. Przy Lexicalu ten sprawdzacz piszemy sami.
2. Wersja 3.x jest spokojniejsza niż Lexical 0.x, w którego opisach wydań prawie zawsze jest mowa o zmianach niezgodnych z poprzednią wersją (słowo „breaking”, pomiar lokalny). Zasada 5 z `AGENTS.md` wymaga dojrzałych, aktywnie utrzymywanych bibliotek.
3. Zapis jako węzły i znaczniki jest prosty do narysowania własnym kodem w ekranie czytania. Ten ekran nie ładuje edytora.
4. Waga taka sama jak u Lexicala (około 130 KB po gzip), a edytor ładuje się tylko w panelu.

Co przemawia za B: oficjalna obietnica Safari 15+ i gotowa, choć eksperymentalna, obsługa list z Worda. Te dwie przewagi są słabsze, niż wyglądają. Oficjalne „Safari 15+” nie usuwa kłopotu z funkcjami od iOS 15.4, a eksperymentalne API wymaga przypięcia wersji i pilnowania każdej aktualizacji.

Ryzyka rekomendacji A:

- Tiptap nie podaje oficjalnie wspieranych przeglądarek. Podstawą jest silnik ProseMirror i test na iPhonie z iOS 15.
- Własna przeróbka list z Worda to kod do napisania i do sprawdzenia na prawdziwym schowku.

**Warunek wycofania:** jeśli przed scaleniem pierwszego pull requesta podtoru 3b test na iPhonie z iOS 15 nie przejdzie (pisanie, Enter, wklejanie), wracamy do tej decyzji i bierzemy opcję B.

## Decyzja

Bohdan wybrał opcję A, Tiptap, 9.10.2026. Warunek wycofania zostaje: gdy edytor nie zadziała na iPhonie z iOS 15, przechodzimy na opcję B, Lexical.

## Konsekwencje

Jeśli Bohdan przyjmie opcję A:

- Pakiety w szkielecie: `@tiptap/core`, `@tiptap/pm`, `@tiptap/react` i potrzebne rozszerzenia (nagłówki, pogrubienie, kursywa, podkreślenie, listy, cytat, link, historia zmian). Dokładne wersje przypina szkielet. Wersje wszystkich pakietów `@tiptap/*` muszą być takie same.
- Nie włączamy: bloku kodu, kodu w linii, przekreślenia ani linii poziomej. Lista dozwolonych elementów jest jednym modułem, z którego korzystają telefon i serwer.
- Własne węzły: film z YouTube (zapisuje sam identyfikator), zdjęcie z podpisem. Link przyjmuje tylko `https://`.
- Serwer w `worker/news/editor/` buduje schemat z tej samej listy, wykonuje `Node.fromJSON(...).check()` i do tego własne sprawdzenie `href`, identyfikatora YouTube i adresów zdjęć. Sama paczka sprawdzania waży w Workerze około 116 KB po gzip (pomiar lokalny, z całym StarterKit). Czy mieści się w limicie Workera, trzeba sprawdzić przy zadaniu.
- Wersja czytelnika: komponenty Reacta rysują JSON bez edytora. Nie wstawiamy HTML z bazy.
- Edytor ładuje się leniwie, tylko w panelu Samorządu. Pliki edytora nie wchodzą do zapisu offline dla uczniów (ustawienie `vite-plugin-pwa`), żeby uczniowie nie pobierali około 130 KB, którego nie użyją.
- Wklejanie: własna przeróbka w `transformPastedHTML` zamienia listy z Worda na listy, czyści style `mso-*` i znaczniki `o:p`. Sprawdzenie na prawdziwym Wordzie i Google Docs.
- Wpis w `docs/TECHNOLOGIE.md` (tabela „Lista”, sekcja „Zasady dla agentów”) robi osobny pull request po decyzji Bohdana. Ten ADR niczego tam nie zmienia.
- Zgodnie z ADR 0001 nowa biblioteka wymaga zgody Bohdana. Do tego czasu podtor 3b nie dodaje pakietów edytora.

Jeśli Bohdan wybierze opcję B: te same zasady, ale serwer dostaje własny sprawdzacz struktury, `@lexical/*` przypinamy w tej samej wersji i nie aktualizujemy bez przeczytania opisu zmian, a obsługę list z Worda budujemy na eksperymentalnym API.

## Do sprawdzenia przed scaleniem podtoru 3b

- pisanie, Enter, zaznaczanie, wklejanie z Worda i Google Docs na iPhonie z iOS 15 (najlepiej 15.0–15.3 i 15.8);
- film z YouTube w treści wpisu: miniatura, kliknięcie, `iframe` z `youtube-nocookie.com`;
- czy edytor działa z React Compiler i TypeScript 7;
- waga edytora w zbudowanej aplikacji i w Workerze.

## Źródła

- [Tiptap, repozytorium](https://github.com/ueberdosis/tiptap)
- [Tiptap, pakiet @tiptap/react w npm](https://www.npmjs.com/package/@tiptap/react)
- [Tiptap, pakiet @tiptap/extension-youtube w npm](https://www.npmjs.com/package/@tiptap/extension-youtube)
- [Tiptap, wprowadzenie](https://tiptap.dev/docs/editor/getting-started/overview)
- [Tiptap, Paste Handler](https://tiptap.dev/docs/editor/extensions/functionality/paste-handler)
- [Tiptap, cennik](https://tiptap.dev/pricing)
- [Lexical, repozytorium](https://github.com/facebook/lexical)
- [Lexical, pakiet lexical w npm](https://www.npmjs.com/package/lexical)
- [Lexical, obsługiwane przeglądarki](https://lexical.dev/docs/getting-started/supported-browsers)
- [Lexical, import z DOM](https://lexical.dev/docs/serialization/dom-import)
- [Lexical, wydania](https://github.com/facebook/lexical/releases)
- [ProseMirror, przewodnik](https://prosemirror.net/docs/guide/)
- [ProseMirror, repozytorium prosemirror-view](https://code.haverbeke.berlin/prosemirror/prosemirror-view)
- [prosemirror-view w npm](https://www.npmjs.com/package/prosemirror-view)
- [BlockNote, README z licencjami](https://github.com/TypeCellOS/BlockNote#license-)
- [Slate, FAQ o przeglądarkach](https://github.com/ianstormtaylor/slate/blob/main/docs/general/faq.md)
- [Quill w npm](https://www.npmjs.com/package/quill)
- [Dane przeglądarek MDN: Array.findLast, Object.hasOwn, Array.at](https://github.com/mdn/browser-compat-data)
- [@vitejs/plugin-legacy](https://cdn.jsdelivr.net/npm/@vitejs/plugin-legacy/README.md)
