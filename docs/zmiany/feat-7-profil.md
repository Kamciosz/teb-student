## Changelog

### Dodane

- Ekran „Profil” (ekran 2.4): litera, imię, klasa i zasłonięty adres e-mail, wiersze „Moje zgłoszenia” i „Polityka prywatności”, „Wyloguj” oraz „Usuń konto i dane”. Wiersza „Regulamin” z projektu nie ma, bo nie ma treści regulaminu. Licznika zgłoszeń przy „Moich zgłoszeniach” też nie ma: wymagałby eksportu z `index.ts` modułu zgłoszeń.
- Ekran „Ustawienia”: zmiana imienia, klasy i szkoły (liceum albo technikum) oraz wybór jednej z 8 palet kolorów. Szkoła wybiera akcent: liceum niebieski, technikum czerwony. Akcent zależy od szkoły w paletach CE–CH, a palety CA–CD mają własny akcent.
- Wybrany wygląd zostaje po ponownym uruchomieniu aplikacji, także bez internetu: zapisuje się w telefonie i jest ustawiany przy starcie, na każdym ekranie. Serwer trzyma go przy koncie, więc nowy telefon dostaje ten sam wygląd po wejściu w profil.
- Usunięcie konta: ekran potwierdzenia, a na serwerze `DELETE /api/profile` wywołuje funkcje kasujące dane ze wszystkich modułów (lista z `worker/shared/accountDeletion.ts`). Konto i sesje kasuje na samym końcu, więc przy błędzie modułu uczeń może spróbować jeszcze raz. Po usunięciu stara sesja nie działa, a ten sam adres e-mail zakłada przy logowaniu nowe, puste konto. Zgłoszenia zostają bez autora.
- Polityka prywatności otwiera się bez logowania i bez internetu (treść jest w aplikacji). Treść to wersja robocza do zatwierdzenia przez zespół.
- Serwer profilu: `GET` i `PUT /api/profile` (sprawdzanie imienia, klasy, szkoły i palety), tabela `profiles` i dane testowe.
- Profil, ustawienia i usunięcie konta bez sesji odsyłają na ekran logowania.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-11 | #25, podtor 7: profil i ustawienia | Zbuduj profil: zmiana imienia, klasy i szkoły z akcentem, wybór palety trwały po restarcie, usunięcie konta z kasowaniem danych modułów, polityka prywatności bez logowania; z testami. | Dodało serwer w `worker/profile/` (router, walidacja, zapis, usuwanie konta), schemat i dane testowe w `worker/db/schema/profile.ts` i `worker/db/seed/profile.ts`, ekrany i logikę wyglądu w `src/features/profile/`, testy Vitest, test Playwright `e2e/profile.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
