# Architektura

<!-- code-docs: lang=PL map=docs/ARCHITECTURE.md tags=@author,@since,@uses,@used_by,@invariant -->

To jest mapa projektu. Zasady komentarzy w kodzie: `docs/STANDARD_KODU.md`.

Stan na 9.10.2026: kodu jeszcze nie ma. Ten plik opisuje układ wynikający z technologii zatwierdzonych przez Bohdana (`docs/TECHNOLOGIE.md`, `docs/adr/0001-technologie.md`). Agent orkiestrujący uzupełni go w projekcie technicznym, a zespół zatwierdzi przed programowaniem.

## Części aplikacji

| Część | Co robi | Technologia |
|---|---|---|
| Aplikacja w telefonie | ekrany, nawigacja, dane zapisane na czas bez internetu, zmniejszanie zdjęć i filmów przed wysłaniem | React, React Router (tylko w przeglądarce), TanStack Query, vite-plugin-pwa |
| Serwer | jeden Worker: wysyła pliki aplikacji i odpowiada na zapytania o dane | Cloudflare Workers, Hono |
| Baza | konta, sesje, wpisy, zgłoszenia, ankiety | Cloudflare D1, Drizzle |
| Pliki | zdjęcia i filmy wysyłane prosto z telefonu | Cloudflare R2 |
| Wyświetlanie zdjęć | miniatury i pełne zdjęcia w AVIF albo WebP | Cloudflare Images |
| Logowanie | kod na mail, kod zaproszenia z loginem i hasłem | Better Auth, Cloudflare Email Service, Resend jako zapas |

## Moduły fali 1

| Moduł | Właściciel | Uwagi |
|---|---|---|
| Logowanie | do ustalenia | |
| Pulpit | Kacper | |
| Aktualności | do ustalenia | |
| Zgłoszenia | do ustalenia | |
| Ankiety | Jakub | wyniki od 5 odpowiedzi |
| Licznik do dzwonka | Kacper | czeka na plan dzwonków |
| Profil i ustawienia | Jakub | |
| Panel Samorządu | do ustalenia | |

Katalogi i nazwy modułów w kodzie ustali projekt techniczny.

## Najważniejsze przepływy

- **Logowanie kodem:** adres @teb.edu.pl → serwer wysyła kod 6 cyfr → uczeń wpisuje kod → sesja w D1.
- **Wysłanie zdjęcia:** telefon zmniejsza zdjęcie → serwer daje podpisany adres R2 → telefon wysyła plik prosto do R2 → serwer sprawdza rozmiar.
- **Bez internetu:** aplikacja otwiera się z pamięci telefonu i pokazuje ostatnio pobrane dane z napisem o braku internetu.
- **Nowa wersja:** telefon pobiera ją w tle i włącza przy następnym otwarciu albo po kliknięciu „Odśwież”.

## Czego świadomie nie robimy

- Librus w żadnej formie: nie ma API.
- Powiadomienia push, płatności, TEB Gąbki i odznaki.
- Kod ze starej aplikacji `Kamciosz/teb-app-production`: tylko inspiracja.
- Zapas na punkt kontrolny 29.10: jeśli logowanie albo aktualności nie działają, przechodzimy na Supabase i Vercel. Ekrany nie mogą zależeć od platformy.
