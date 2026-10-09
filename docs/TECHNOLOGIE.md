# Technologie

Zatwierdził: Bohdan, 9.10.2026. Potem 4 agenty sprawdziły, czy dla każdej technologii jest coś lepszego. Szukały według trzech warunków:
- aplikacja działa szybko na słabym telefonie,
- zużywa mało pracy procesora w telefonie i na serwerze,
- działa na jak największej liczbie urządzeń, także na iPhonie z iOS 15 i starszym Androidzie.

Wynik: żadna technologia nie zmienia się na inną. Zmiany po przeglądzie są oznaczone **[zmiana]**.

„Sprawdzone” oznacza, że agent otworzył oficjalną stronę albo rejestr npm. „Niesprawdzone” oznacza wynik wyszukiwania albo ocenę agenta.

## Lista

| Część | Technologia | Wersja 9.10.2026 |
|---|---|---|
| Ekrany | React 19 z React Compiler **[zmiana: dodany Compiler]** | react 19.3.0, babel-plugin-react-compiler 1.0.0 |
| Budowanie | Vite 8 z @vitejs/plugin-legacy **[zmiana: dodana wtyczka]** | vite 8.3.4, plugin-legacy 8.2.3 |
| Język | TypeScript | 7.0.2 |
| Wygląd i 8 palet | zwykły CSS ze zmiennymi kolorów | — |
| Nawigacja | React Router, tylko po stronie telefonu **[zmiana]** | 8.4.0 |
| Dane w aplikacji | TanStack Query z zapisem danych w telefonie | 5.104.1 |
| PWA i nowe wersje | vite-plugin-pwa | 2.0.0 |
| Zdjęcia przed wysłaniem | funkcje przeglądarki, bez biblioteki **[zmiana]** | — |
| Filmy przed wysłaniem | Mediabunny, z zapasem bez przekodowania **[zmiana: dodany zapas]** | 1.61.3 |
| Serwer | Hono, jeden Worker z plikami aplikacji | 4.13.13 |
| Baza | Cloudflare D1 | — |
| Zapytania do bazy | Drizzle ORM | 0.45.4 |
| Pliki | Cloudflare R2, wysyłka prosto z telefonu | — |
| Wyświetlanie zdjęć | Cloudflare Images, format sam dobrany: AVIF albo WebP **[zmiana: dodane]** | — |
| Maile z kodem | Cloudflare Email Service, Resend jako zapas | — |
| Logowanie | Better Auth: kod na mail, login i hasło z kodu zaproszenia | 1.7.7 |
| Sesje | w D1 | — |
| Hasła | wbudowane w Better Auth (scrypt) **[zmiana: zamiast PBKDF2]** | — |
| Testy | Vitest, @cloudflare/vitest-plugin, Playwright **[zmiana: nowa nazwa pakietu]** | vitest-plugin 1.4.0 |
| Domena | .pl w OVH, serwery nazw w Cloudflare | — |
| Node.js na komputerach i w CI | 22.22 lub nowszy **[zmiana]** | — |

Wersje pochodzą z rejestru npm. Przy starcie projektu przypinamy dokładne wersje.

## Co zmieniło się po przeglądzie i dlaczego

1. **React Compiler.** Oficjalne narzędzie Reacta, stabilna wersja 1.0. Sam przyspiesza odświeżanie ekranów: u Mety ładowanie do 12% szybciej, niektóre kliknięcia ponad 2,5 raza szybciej (sprawdzone). Nie wymaga pisania innego kodu.
2. **@vitejs/plugin-legacy.** Vite domyślnie buduje aplikację dla Safari 16.4+ i Chrome 111+ (sprawdzone). Bez wtyczki iPhone z iOS 15 i starszy Android nie otworzą aplikacji. Wtyczka robi drugą wersję plików dla starszych telefonów. Nowe telefony dalej dostają zwykłą, lżejszą wersję (sprawdzone w dokumentacji wtyczki).
3. **React Router tylko po stronie telefonu.** Serwer nie buduje ekranów, wysyła tylko gotowe pliki i dane. Dzięki temu Worker zużywa mniej pracy procesora.
4. **Zdjęcia bez biblioteki.** browser-image-compression nie ma nowej wersji od 6.03.2023 (sprawdzone), więc odpada. Przeglądarka sama zmniejsza zdjęcie: `createImageBitmap` obraca je zgodnie z danymi z aparatu, a `canvas.toBlob` zapisuje JPEG bez danych GPS. Biblioteki pica i @jsquash dają więcej pracy procesora i więcej do pobrania.
   - Zapas 1: gdy `createImageBitmap` nie zadziała, aplikacja rysuje zdjęcie przez zwykły element obrazka.
   - Zapas 2: gdy telefon nie odczyta zdjęcia, aplikacja prosi o inne zdjęcie.
5. **Film z zapasem.** Przekodowanie przez WebCodecs nie działa na około 4% urządzeń, na przykład w Firefoksie na Androidzie (sprawdzone). Wtedy aplikacja wysyła oryginał, jeśli ma najwyżej 30 s i 50 MB. Ryzyko: film z iPhone'a w HEVC może nie zagrać na części telefonów z Androidem.
6. **Hasła w Better Auth.** Better Auth domyślnie szyfruje hasła metodą scrypt (sprawdzone). Własny PBKDF2 to dodatkowy kod bez korzyści. Czas szyfrowania na Workers trzeba zmierzyć, ale plan płatny daje 30 s pracy procesora na zapytanie (sprawdzone).
7. **@cloudflare/vitest-plugin.** Stary pakiet `@cloudflare/vitest-pool-workers` zmienił nazwę. Rejestr npm pisze, że stara nazwa nie dostanie już aktualizacji (sprawdzone).
8. **Node.js 22.22+.** React Router 8 wymaga Node 22.22 lub nowszego (sprawdzone).
9. **Cloudflare Images przy wyświetlaniu.** Zdjęcie leży w R2 jako JPEG. Cloudflare z ustawieniem `format=auto` wysyła AVIF albo WebP, zależnie od telefonu (sprawdzone), i zmniejsza je do potrzebnego rozmiaru. Przyjmuje też HEIC (sprawdzone), więc jest zapasem dla zdjęć, których telefon nie odczyta. Pierwsze 5000 przeróbek w miesiącu jest za darmo (sprawdzone).
10. **Lazy loading bez biblioteki.** Przeglądarka sama pobiera zdjęcie, gdy uczeń do niego przewinie (`loading="lazy"`).

## Co zostaje i dlaczego

- **React zamiast Preact, Svelte, Solid.** Preact waży 4 KB zamiast około 40 KB, ale nie ma potwierdzenia, że działa z React Router 8, i traci React Compiler. Svelte i Solid agenty znają gorzej. Aplikacja i tak pobiera się raz i potem jest zapisana w telefonie.
- **Zwykły CSS zamiast Tailwind v4.** Tailwind v4 wymaga Safari 16.4+ i Chrome 111+ (sprawdzone), więc odcina starsze telefony. Zmienne CSS działają od iOS 10 (sprawdzone). Warunek: nie używamy `color-mix()`, `@property` ani zagnieżdżania CSS.
- **React Router zamiast wouter i TanStack Router.** wouter jest mniejszy, ale zmiana teraz to przepisywanie nawigacji w trakcie terminu.
- **TanStack Query zamiast SWR.** Tylko TanStack Query ma oficjalny zapis danych w telefonie do działania bez internetu.
- **vite-plugin-pwa zamiast Serwist.** Oba są aktywne. Serwist nic nie daje na iPhonie. vite-plugin-pwa ma najnowsze wydanie (2.0.0).
- **Hono zamiast itty-router.** W pomiarze routerów na Workers Hono jest najszybszy: 402 820 operacji na sekundę, itty-router 212 598 (sprawdzone, ale pomiar publikuje autor Hono).
- **Jeden Worker zamiast Cloudflare Pages.** Cloudflare zaleca Workers dla nowych projektów (sprawdzone).
- **D1 zamiast Durable Objects, Turso, Neon.** Limity D1 dla 500 osób to ogromny zapas: 10 GB na bazę, 1000 zapytań na wywołanie (sprawdzone). Inne opcje to drugi dostawca albo niepotrzebna złożoność.
- **Drizzle zamiast Kysely i Prisma.** Prisma jest za duża dla Workera. Dodatek kysely-d1 jest w wersji 0.4 i rzadko aktualizowany.
- **Sesje w D1 zamiast Workers KV.** KV pozwala na 1 zapis na sekundę do tego samego klucza (sprawdzone), a zmiany dochodzą z opóźnieniem.
- **R2 z wysyłką z telefonu zamiast wysyłki przez Worker.** Worker przyjmie najwyżej 100 MB i zużyje pracę procesora (sprawdzone).
- **Better Auth zamiast OpenAuth i Auth.js.** OpenAuth jest w becie (sprawdzone). Auth.js przejął zespół Better Auth.
- **Maile przez Cloudflare.** 3000 maili miesięcznie w cenie planu (sprawdzone). Resend za darmo daje tylko 100 dziennie, więc służy jako zapas. Amazon SES jest tańszy przy dużej liczbie maili, ale wymaga konta AWS.
- **AVIF i WebP zamiast JPEG XL.** JPEG XL daje trochę mniejsze pliki, ale pokazuje go 17% przeglądarek, a AVIF 96% (sprawdzone). Chrome na Androidzie ma go domyślnie wyłączony, Samsung Internet go nie obsługuje, a Cloudflare Images nie umie go ani przyjąć, ani zapisać (sprawdzone). Sprawdzamy ponownie, gdy Chrome na Androidzie go włączy.
- **Domena w OVH.** Odnowienie w innym rejestratorze daje najwyżej około 11 zł oszczędności rocznie. Cena odnowienia w rejestrze NASK to 50 zł netto (sprawdzone).

## Zasady dla agentów

- Kolory tylko ze zmiennych w jednym pliku. Żadnego koloru wpisanego na sztywno.
- W CSS nie używamy `color-mix()`, `@property` ani zagnieżdżania.
- Zdjęcia: dłuższy bok najwyżej 1600 px, JPEG o jakości 0,8, bez danych GPS. Gdy telefon nie odczyta zdjęcia, wysyła oryginał do 20 MB.
- Wyświetlanie zdjęć tylko przez Cloudflare Images z `format=auto`: miniatura około 400 px, pełne zdjęcie około 1290 px.
- Każdy obrazek ma `loading="lazy"` oraz podaną szerokość i wysokość. Film ma obrazek podglądu, pobiera się dopiero po kliknięciu i nie gra sam.
- Film: najwyżej 30 s. Po przekodowaniu 720p i MP4 z H.264. Bez przekodowania najwyżej 50 MB.
- Podpisany adres do R2 zawiera typ pliku. CORS w R2 dopuszcza tylko adres naszej aplikacji. Po wysłaniu serwer sprawdza rozmiar pliku i usuwa za duży.
- Zapis danych w telefonie ma numer wersji. Wylogowanie kasuje te dane.

## Do sprawdzenia przed startem

- czy aplikacja z @vitejs/plugin-legacy otwiera się na iPhonie z iOS 15;
- zdjęcie HEIC, zdjęcie obrócone i przekodowanie filmu na prawdziwym iPhonie;
- waga zdjęć przed i po zmniejszeniu oraz po Cloudflare Images;
- czy Cloudflare Images usuwa GPS ze zdjęcia HEIC wysłanego bez zmniejszania;
- film z iPhone'a wysłany bez przekodowania: czy gra na telefonie z Androidem;
- czas szyfrowania hasła w Better Auth na Workers;
- CORS dla wysyłki plików do R2;
- czy szkoła używa Microsoft 365 czy Google (rekord MX domeny teb.edu.pl);
- maile z kodem na 5–10 skrzynkach @teb.edu.pl (20.10);
- tryb samolotowy, powrót internetu i wgranie nowej wersji na iPhonie i Androidzie.

## Koszt

| Pozycja | Koszt |
|---|---|
| Cloudflare, plan płatny, 2 miesiące | około 37 zł z budżetu |
| Domena .pl w OVH, pierwszy rok | 20,53 zł poza budżetem |
| Reszta technologii | 0 zł |

## Źródła

- [Cennik Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/)
- [Limity Cloudflare Workers](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Pages: nowe projekty na Workers](https://developers.cloudflare.com/pages/)
- [Limity D1](https://developers.cloudflare.com/d1/platform/limits/)
- [Limity Workers KV](https://developers.cloudflare.com/kv/platform/limits/)
- [Limity R2](https://developers.cloudflare.com/r2/platform/limits/)
- [Podpisane adresy R2](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [Cennik Cloudflare Email Service](https://developers.cloudflare.com/email-service/platform/pricing/)
- [Cennik Resend](https://resend.com/pricing)
- [Cennik Amazon SES](https://aws.amazon.com/ses/pricing/)
- [Cennik NASK dla rejestratorów](https://dns.pl/en/price_list_for_registrars)
- [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- [Vite: docelowe przeglądarki](https://vite.dev/guide/build)
- [@vitejs/plugin-legacy](https://cdn.jsdelivr.net/npm/@vitejs/plugin-legacy/README.md)
- [Tailwind: zgodność z przeglądarkami](https://tailwindcss.com/docs/compatibility)
- [Zmienne CSS w przeglądarkach](https://caniuse.com/css-variables)
- [Preact: przeglądarki](https://preactjs.com/about/browser-support)
- [Hono: pomiary](https://hono.dev/docs/concepts/benchmarks)
- [Better Auth: hasła](https://better-auth.com/docs/authentication/email-password)
- [Better Auth: kod na mail](https://better-auth.com/docs/plugins/email-otp)
- [OpenAuth](https://github.com/openauthjs/openauth)
- [Cloudflare: zmiana nazwy pakietu do testów](https://developers.cloudflare.com/changelog/post/2026-08-19-vitest-plugin/)
- [Drizzle z D1](https://orm.drizzle.team/docs/connect-cloudflare-d1)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/guide/)
- [createImageBitmap w przeglądarkach](https://caniuse.com/createimagebitmap)
- [WebP z canvas w przeglądarkach](https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp)
- [WebCodecs w przeglądarkach](https://caniuse.com/webcodecs)
- [HEVC w przeglądarkach](https://caniuse.com/hevc)
- [Mediabunny](https://github.com/Vanilagy/mediabunny)
- [Cloudflare Images: formaty i limity](https://developers.cloudflare.com/images/get-started/limits/)
- [Cloudflare Images: przeróbka przez adres](https://developers.cloudflare.com/images/transform-images/transform-via-url/)
- [Cennik Cloudflare Images](https://developers.cloudflare.com/images/pricing/)
- [JPEG XL w przeglądarkach](https://caniuse.com/jpegxl)
- [AVIF w przeglądarkach](https://caniuse.com/avif)
- [JPEG XL w Chrome](https://developer.chrome.com/blog/jpeg-xl-in-chrome)
- [Cennik Cloudflare Stream](https://developers.cloudflare.com/stream/pricing/)
- [Powiadomienia web na iOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
