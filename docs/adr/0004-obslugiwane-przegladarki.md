# ADR 0004: obsługiwane przeglądarki i cele budowania

- **Data:** 9.10.2026
- **Status:** Propozycja, czeka na Bohdana
- **Autor:** Szymon (projekt), Bohdan (decyzja)

## Kontekst

Aplikacja ma działać na iPhonie z iOS 15 i na starszym Androidzie. Wymagają tego `ACCESSIBILITY.md` (iPhone z iOS 15 lub nowszym, Android z Chrome), `AGENTS.md` (wspierane telefony zostają wspierane) i ADR 0001 (`@vitejs/plugin-legacy`). Nigdzie nie ma jednak zapisanej listy przeglądarek. Szkielet ma w `vite.config.ts` wartości wpisane tymczasowo: `targets: ['defaults', 'iOS >= 15']` i `modernTargets` z obejściem błędu „'es2020' is already specified”. Ten ADR zapisuje listę i zastępuje „tymczasowo” decyzją.

### Jak oznaczamy fakty

- **sprawdzone**: otwarta oficjalna strona, repozytorium albo kod pakietu w wersji z `package-lock.json`.
- **pomiar lokalny**: zmierzone na komputerze, w katalogu poza repozytorium, na pakietach w tych samych wersjach co w `package-lock.json` (browserslist 4.29.3, caniuse-lite 1.0.30001815). To nie jest test na telefonie.
- **niesprawdzone**: wynik wyszukiwania, pamięć albo ocena.

Wszystkie wersje i daty są z 9.10.2026.

### Jak wtyczka dzieli telefony na dwie grupy (sprawdzone w kodzie @vitejs/plugin-legacy 8.2.3)

Wtyczka buduje dwa zestawy plików. Przeglądarka sama wybiera jeden. Nowoczesny dostają te przeglądarki, które znają `import.meta.resolve`. Resztę obsługuje zestaw dla starszych telefonów (SystemJS i uzupełnienia core-js).

| Przeglądarka | Zestaw | Skąd wersja |
|---|---|---|
| Safari na iPhonie i iPadzie, iOS 15.0 do 16.3 | dla starszych telefonów | `import.meta.resolve` od iOS 16.4 (MDN) |
| iOS 16.4 i nowszy | nowoczesny | j.w. |
| Chrome i Edge do wersji 104 | dla starszych telefonów | od Chrome 105 (MDN) |
| Chrome i Edge 105 i nowsze | nowoczesny | j.w. |
| Firefox do 105 / od 106 | dla starszych / nowoczesny | od Firefox 106 (MDN) |
| Samsung Internet 15 do 19 / od 20 | dla starszych / nowoczesny | od Samsung Internet 20 (MDN) |

Dane MDN: pakiet `@mdn/browser-compat-data`, pozycja `javascript.operators.import_meta.resolve` (pomiar lokalny). Wartości domyślne wtyczki to dokładnie te wersje: `edge>=105, firefox>=106, chrome>=105, safari>=16.4, chromeAndroid>=105, iOS>=16.4`.

Dwie opcje `legacy({...})` znaczą więc:

- **`targets`**: dla jakich przeglądarek kompilujemy zestaw dla starszych telefonów. To jest nasza lista „najstarsza obsługiwana wersja”.
- **`modernTargets`**: dla jakich przeglądarek kompilujemy zestaw nowoczesny. Musi zgadzać się z testem `import.meta.resolve`.

Wszystkie przeglądarki na iPhonie (także Chrome dla iPhone'a, 10,2% wejść z telefonów i tabletów w Polsce) używają silnika Safari, więc granica dla iOS obejmuje je wszystkie. Zasada Apple jest znana, ale nie sprawdziłem jej w źródle (niesprawdzone).

## Dane o udziale przeglądarek w Polsce

Źródło: StatCounter, wrzesień 2026, pobrane 9.10.2026 (sprawdzone). StatCounter liczy odsłony stron, nie osoby, i dotyczy całej Polski, nie uczniów TEB. Traktujemy to jako przybliżenie.

- Strony: [przeglądarki na telefonach](https://gs.statcounter.com/browser-market-share/mobile/poland), [wersje iOS](https://gs.statcounter.com/ios-version-market-share/mobile-tablet/poland), [wersje Androida](https://gs.statcounter.com/android-version-market-share/mobile-tablet/poland), [systemy](https://gs.statcounter.com/os-market-share/mobile/poland).
- Pełne tabele pobrane jako CSV z tych samych wykresów (przycisk „Download Data”), bo strona pokazuje tylko kilka pierwszych wierszy.

| Co | Udział |
|---|---|
| Przeglądarki na telefonach: Chrome | 66,57% |
| Safari | 25,31% |
| Samsung Internet | 3,82% |
| Opera | 1,70% |
| Firefox | 1,00% |
| Yandex Browser | 0,69% |
| System na telefonach i tabletach: Android | 63,62% |
| iOS | 36,32% |

**iOS (udział w wejściach z iOS):**

| Wersja | Udział |
|---|---|
| iOS 16.4 i nowsze | około 99,2% |
| iOS 16.0 do 16.3 | 0,18% |
| iOS 15.x (najczęściej 15.8: 0,38%) | 0,50% |
| iOS 14 i starsze | 0,13% |

iOS poniżej 16.4 to razem 0,81% wejść z iOS, czyli około 0,3% wszystkich wejść z telefonów i tabletów (0,81% razy 36,32%). Sam iOS 15 to około 0,18%. StatCounter pisze na swojej stronie, że po zmianie w Safari część wersji iOS 26 była zgłaszana jako 18.x, a poprawka z 19.1.2026 to naprawiła. Starych wersji to nie dotyczy.

**Android (udział w wejściach z Androida):** Android 10 i nowsze około 97,3%. Android 9: 1,12%. Android 8.x: 0,73%. Android 7 i starsze: 0,80%.

Co wiadomo o Chrome na starszych Androidach:

- Chrome 138 to ostatnia wersja dla Androida 8 i 9. Chrome 139 wymaga Androida 10 (sprawdzone, [ogłoszenie Google z 23.6.2025](https://support.google.com/chrome/thread/352616098/sunsetting-chrome-support-for-android-8-0-oreo-and-android-9-0-pie?hl=en)). Telefon z Androidem 8 lub 9 z aktualizowanym Chrome ma więc wersję między 105 a 138, czyli dostaje zestaw nowoczesny.
- Chrome 119 to ostatnia wersja dla Androida 7: niesprawdzone (wynik wyszukiwania). Granice dla Androida 5 i 6: niesprawdzone.
- Samsung Internet: strona wydań wspomina minimum Android 8.0, ale dla wersji 23 z 2023 roku. Dla wersji 30 niesprawdzone.
- StatCounter nie podaje wersji Chrome na Androidzie (wszystko jest pod jedną pozycją „Chrome for Android”: 55,76% wejść), więc wersji Chrome nie da się policzyć. Wniosek: zestaw dla starszych telefonów dostają na Androidzie tylko telefony, na których Chrome nie był aktualizowany od sierpnia 2022 (Chrome 105). Ile ich jest: niesprawdzone.

Zestaw dla starszych telefonów służy więc w praktyce głównie starszym iPhone'om (iOS 15.0 do 16.3).

## Rozważane opcje

### Odrzucone

| Opcja | Dlaczego odpada |
|---|---|
| Zrezygnować z iOS 15 i z wtyczki (domyślny cel Vite: Safari 16.4, Chrome 111) | `AGENTS.md`, `ACCESSIBILITY.md` i ADR 0001 wymagają iOS 15. Zysk byłby mały: iOS poniżej 16.4 to około 0,3% wejść. Bohdan może to jednak otworzyć na nowo, bo to najprostsze rozwiązanie, a obejście błędu przestałoby być potrzebne. |
| Schodzić poniżej iOS 15 | iOS 14 i starsze to 0,13% wejść z iOS. Wymagałoby osobnych testów i dodatkowych uzupełnień, bez uzasadnienia w planie. |

### Opcja A: jawna lista najstarszych wersji

```ts
legacy({
  targets: ['iOS >= 15', 'chrome >= 90', 'Samsung >= 15'],
  modernTargets: 'edge>=105, firefox>=106, chrome>=105, safari>=16.4, chromeAndroid>=105, iOS>=16.4',
})
```

Obsługiwane (pierwsza wersja, którą sprawdzamy na telefonie):

- iPhone i iPad: iOS 15.0 lub nowszy, każda przeglądarka.
- Android: Chrome 90 lub nowszy (kwiecień 2021), Samsung Internet 15 lub nowszy (sierpień 2021).
- Komputer (panel Samorządu): aktualny Chrome, Edge, Firefox i Safari.
- Przeglądarki spoza listy (Opera, Yandex, UC, Firefox na Androidzie poniżej 106) dostają ten sam kod. Zwykle działa, ale nie obiecujemy tego i nie testujemy.

Uwaga: w browserslist wpis `ChromeAndroid >= 90` nie działa. Baza caniuse zna tylko najnowszą wersję Chrome na Androidzie, więc ten wpis oznacza tylko wersję 154 (pomiar lokalny). Dlatego jest `chrome >= 90`, a wersje Chrome na Androidzie i na komputerze mają tę samą numerację.

### Opcja B: zostaje obecny wpis

```ts
legacy({
  targets: ['defaults', 'iOS >= 15'],
  modernTargets: 'edge>=105, firefox>=106, chrome>=105, safari>=16.4, chromeAndroid>=105, iOS>=16.4',
})
```

`defaults` to lista browserslist: ponad 0,5% użytkowników na świecie, dwie ostatnie wersje, Firefox ESR i bez przeglądarek porzuconych.

### Porównanie

| Cecha | A: jawna lista | B: `defaults` i iOS 15 |
|---|---|---|
| Lista obsługiwanych przeglądarek | zapisana w kodzie i w tym ADR | wynika z danych caniuse, trzeba ją odczytać komendą |
| Co się zmienia po aktualizacji bazy caniuse-lite | nic | zmienia się lista. Dziś `defaults` zawiera m.in. Opera Mini, KaiOS, UC Browser, QQ i Opera Mobile 80 (pomiar lokalny, caniuse-lite 1.0.30001815), których nie testujemy |
| Wpływ na wagę pliku | 23 wtyczki Babel i 232 moduły core-js | 22 wtyczki i 229 modułów core-js (pomiar lokalny, @babel/preset-env 7.29.7, core-js-compat 3.50.0) |
| Android | granica Chrome 90 i Samsung Internet 15 | brak granicy, zależy od `defaults` |

Waga prawie się nie zmienia, bo granicę wyznacza iOS 15. Dla samego iOS 15 jest 22 wtyczki i 228 modułów (pomiar lokalny). To nie jest pomiar wagi gotowych plików, tylko liczba przeróbek i uzupełnień, które wtyczka dodałaby do kodu. Prawdziwa różnica to czytelność: przy A lista obsługiwanych przeglądarek jest decyzją zapisaną w repozytorium, a przy B wynikiem zmieniających się danych.

## Obejście błędu „'es2020' is already specified”

Obecne `modernTargets` w `vite.config.ts` istnieje po to, żeby budowanie Workera się nie zatrzymywało. Fakty:

- **Dokumentacja wtyczki (sprawdzone, README 8.2.3):** opcja `modernTargets` „nie powinna być ustawiana, dopóki `renderLegacyChunks` nie jest wyłączone”. U nas `renderLegacyChunks` jest włączone, więc używamy opcji poza jej opisanym zastosowaniem. Wtyczka przy każdym budowaniu wypisuje ostrzeżenie, że `modernTargets` nadpisuje wbudowane cele.
- **Kod wtyczki (sprawdzone):** bez `modernTargets` wtyczka ustawia `build.target` na listę `es2020, edge105, firefox106, chrome105, safari16.4, ios16.4`. Z `modernTargets` bierze wynik `browserslist-to-esbuild` 2.1.1: `chrome105, edge105, firefox106, ios16.4, safari16.4` (pomiar lokalny). To ta sama lista bez „es2020”.
- **Kod wtyczki Cloudflare 1.63.1 (sprawdzone):** środowisko Workera ma `target = "es2026"`.
- **Przyczyna błędu (hipoteza):** w jednej tablicy celów są razem „es2020” i „es2026”. Opisuje to komentarz w `vite.config.ts`. Błędu nie odtworzyłem, bo nie instalowałem pakietów projektu, a w zgłoszeniach Vite i wtyczek nie znalazłem tego komunikatu (niesprawdzone).

Dlaczego obejście jest bezpieczne:

- Wartość `modernTargets` jest taka sama jak wbudowana lista Babel wtyczki. Zmienia się tylko lista dla esbuild: znika „es2020”, który i tak wynika z wersji Chrome 105.
- Granica nowoczesny / dla starszych telefonów jest w czasie działania, w teście `import.meta.resolve`, a nie w `modernTargets`. Niższe `modernTargets` nic nie daje: przeglądarki poniżej Chrome 105 i Safari 16.4 i tak dostają zestaw dla starszych telefonów, a nowoczesny byłby tylko większy. Wyższe `modernTargets` tworzy lukę: przeglądarka z wersji pośredniej dostałaby kod przygotowany dla nowszej.

**Obie opcje, A i B, zostawiają `modernTargets` bez zmian.** Dwa warunki:

1. Przy każdej aktualizacji `@vitejs/plugin-legacy` porównujemy wartość z `modernTargetsBabel` w `dist/index.js` wtyczki. Różnica oznacza zmianę w `vite.config.ts`.
2. Gdy błąd zniknie po aktualizacji Vite, wtyczki Cloudflare albo wtyczki legacy, usuwamy `modernTargets` (to jest martwy ciężar). Sprawdzamy to, zdejmując opcję i budując projekt.

## Rekomendacja

**Opcja A: jawna lista.**

Powody:

1. Lista obsługiwanych przeglądarek staje się decyzją zapisaną w repozytorium. Testerzy wiedzą, na czym sprawdzać, a agenci nie zgadują.
2. Wynik budowania nie zależy od zmian w danych caniuse. Przy B każde `npm update` może zmienić pakiet dla starszych telefonów.
3. Nie kosztuje to nic w wadze: różnica to 3 moduły core-js.

Ryzyka rekomendacji A:

- Granice Chrome 90 i Samsung Internet 15 to moja decyzja projektowa, a nie wynik pomiaru. Bohdan może je zmienić. Skutek jest mały, bo granicę wyznacza iOS 15.
- Telefony z Chrome starszym niż 90 nie mają obsługi. Ich liczby nie znamy (niesprawdzone).

## Decyzja

Do wypełnienia przez Bohdana: wybrana opcja (A albo B), data i ewentualne uwagi.

## Konsekwencje

Jeśli Bohdan przyjmie opcję A:

- Osobny pull request zmienia w `vite.config.ts` jedną linię `targets` i komentarz nad nią. `modernTargets` zostaje. Ten ADR niczego tam nie zmienia.
- Lista obsługiwanych przeglądarek z opcji A trafia do `ACCESSIBILITY.md`, część „Na czym sprawdzamy”, razem z granicą iOS 16.4 (dwa zestawy plików). Robi to osobny pull request po decyzji.
- Zasada dla agentów: nowa funkcja przeglądarki, której nie ma w iOS 15 i Chrome 90, wymaga zapasu albo wpisu w tym ADR. Dotyczy to zwłaszcza `Array.prototype.at`, `findLast` i `Object.hasOwn` (iOS od 15.4).
- ADR 0002 (edytor wpisów, [PR #30](https://github.com/Kamciosz/teb-student/pull/30)) pisze, że w paczkach edytora są funkcje dostępne dopiero od iOS 15.4. iOS 15.0 do 16.3 dostaje zestaw dla starszych telefonów. Dla `iOS >= 15` core-js dodaje uzupełnienia `es.array.at`, `es.array.find-last` i `es.object.has-own` (pomiar lokalny). Czy trafiają one do zbudowanego edytora, nie sprawdziłem. Rozstrzyga test na iPhonie.

Jeśli Bohdan wybierze opcję B: bez zmian w kodzie. Lista obsługiwanych przeglądarek to wynik `npx browserslist "defaults, iOS >= 15"` z bazą z `package-lock.json`. ADR zostaje jako opis obecnego stanu.

## Do sprawdzenia przed pilotażem

- iPhone z iOS 15.0 i 15.8 oraz z iOS 16.3: otwarcie aplikacji, logowanie, tryb samolotowy. To jest też test, czy wtyczka wybiera zestaw dla starszych telefonów. W kodzie wtyczki jest komentarz o błędzie Safari 15, który ma obejście ([vitejs/vite#22008](https://github.com/vitejs/vite/issues/22008)). Czy działa na prawdziwym iPhonie, niesprawdzone.
- Android z Chrome 90 do 104 (emulator wystarczy) i telefon z aktualnym Chrome: czy dostają właściwy zestaw.
- Czy `build.target` z wtyczki legacy trafia też do środowiska Workera obok „es2026” (hipoteza z sekcji o obejściu). Jeśli tak, Worker dostaje cele przeglądarek, które mu nie są potrzebne.
- Telefony z Androidem bez usług Google (na przykład Huawei): wersja ich przeglądarki jest niesprawdzona.
- Ile wejść w pilotażu to starsze telefony: plan nie zbiera danych o przeglądarkach, więc dziś nie da się tego sprawdzić.

## Źródła

- [@vitejs/plugin-legacy 8.2.3, README](https://cdn.jsdelivr.net/npm/@vitejs/plugin-legacy@8.2.3/README.md) i [kod wtyczki](https://cdn.jsdelivr.net/npm/@vitejs/plugin-legacy@8.2.3/dist/index.js)
- [Vite: docelowe przeglądarki](https://vite.dev/guide/build)
- [Kod @cloudflare/vite-plugin 1.63.1](https://cdn.jsdelivr.net/npm/@cloudflare/vite-plugin@1.63.1/dist/index.mjs)
- [MDN: import.meta.resolve](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import.meta/resolve)
- [Browserslist: zapytania](https://github.com/browserslist/browserslist#queries)
- StatCounter, Polska, wrzesień 2026: [przeglądarki](https://gs.statcounter.com/browser-market-share/mobile/poland), [iOS](https://gs.statcounter.com/ios-version-market-share/mobile-tablet/poland), [Android](https://gs.statcounter.com/android-version-market-share/mobile-tablet/poland), [system](https://gs.statcounter.com/os-market-share/mobile/poland)
- [Google: Chrome 138 ostatni dla Androida 8 i 9](https://support.google.com/chrome/thread/352616098/sunsetting-chrome-support-for-android-8-0-oreo-and-android-9-0-pie?hl=en)
- [Samsung Internet: wydania](https://developer.samsung.com/internet/release-note.html)
