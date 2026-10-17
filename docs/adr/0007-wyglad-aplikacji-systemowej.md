# ADR 0007: wygląd aplikacji systemowej (iPhone)

- **Data:** 17.10.2026
- **Status:** zaakceptowana (decyzja właściciela z 17.10)
- **Autor:** Szymon

## Kontekst

Aplikacja ma wyglądać jak aplikacja systemowa na telefonie: jasne tło z kaflami, czcionka systemu, duże tytuły, listy grupowane i jeden wyraźny kolor akcji. Dotychczasowe style miały osiem palet kolorów do wyboru w ustawieniach, cienie, przejścia na szerokości i własny krój pisma. To mnożyło miejsca, w których trzeba było pilnować kontrastu i wyglądu.

Decyzja właściciela z 17.10 ustala wzór: iPhone w trybie jasnym i ciemnym, bez gradientów, bez cieni (poza jednym arkuszem), bez czcionek z sieci.

## Rozważane opcje

1. Zostawić osiem palet i poprawiać je pojedynczo. Każda paleta to osobny zestaw kolorów do sprawdzenia, a wybór palety nie mówi nic o motywie telefonu.
2. Jeden zestaw zmiennych w `tokens.css` z dwoma motywami (jasny, ciemny) i osobnym akcentem szkoły. Motyw wybiera telefon albo użytkownik, akcent wybiera szkoła.
3. Biblioteka komponentów z gotowym motywem (np. Ionic). Dodaje zależność i styl, który trzeba nadpisywać.

## Decyzja

Opcja 2.

- Kolory są tylko w `src/shared/styles/tokens.css`. Reszta aplikacji używa `var(--...)`.
- Motyw: domyślnie idzie za telefonem (`prefers-color-scheme`). Atrybut `data-motyw="jasny"` albo `"ciemny"` na `<html>` wymusza wybór. Brak atrybutu oznacza Automatyczny.
- Akcent szkoły: atrybut `data-szkola="L"` (liceum, niebieski) albo `"T"` (technikum, czerwony). Akcent ma prywatne zmienne dla każdego motywu, więc szkoła i motyw łączą się bez zdublowanych selektorów.
- Motyw jest tylko w tym urządzeniu (`localStorage`, klucz `teb-student-look`). Nie idzie na serwer. Szkoła nadal zapisuje się w profilu.
- Krój pisma: czcionka systemu (`system-ui`, San Francisco na iPhonie, Roboto na Androidzie). Nic nie jest ładowane z sieci. Rozmiary tekstu są w `rem`.
- Hierarchia: zero cieni, z wyjątkiem jednego małego cienia arkusza (`--shadow-sheet`). Bez gradientów. Przejścia tylko przez `transform` i `opacity`, 150–250 ms. Przy `prefers-reduced-motion` przejścia są wyłączone.
- Kontrast tekstu min. 4,5:1, kontrast elementów interfejsu i fokusu min. 3:1. Wartości policzone skryptem; wyjątek opisany w `tokens.css` (`--success` w jasnym motywie).
- Wspólne komponenty (`Button`, `Chip`, `Badge`, `TextField`, `EmptyState`, `ProgressBar`, `Sheet`) dostają nowy wygląd. Nowe: `ListGroup` i `ListRow` do grupowanych list.
- Paleta z serwera zostaje w bazie i w walidacji (podtor 7). Strona jej nie używa.

## Konsekwencje

- Osiem palet znika z ustawień. Użytkownicy, którzy mieli zapisaną paletę, dostają motyw Automatyczny. Stary zapis (`{palette, school}`) jest wczytywany bez błędu.
- `--shadow: none` wyłącza cień w miejscach, które go jeszcze używają, w tym w pasku dolnym (Dock). Dock nie był przerabiany w tym zakresie, bo należy do innego podtoru.
- Ekrany funkcjonalne (panel administratora, ogłoszenia, zgłoszenia, ankiety) nadal mają własne style z przejściami i cieniami. Przerobienie ich to osobne zadania, nie ten PR.
- Testy e2e dla ustawień sprawdzają motyw zamiast palety. Asercje nie zostały osłabione, zmieniono tylko wybór w ustawieniach.
- Pasek przeglądarki (`theme-color`) ma dwa wpisy z `media`, więc idzie za telefonem, a nie za wyborem w ustawieniach. Manifest PWA ma jasne kolory.
