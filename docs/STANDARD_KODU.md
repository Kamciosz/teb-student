# Standard kodu

Obowiązuje ludzi i agentów AI. Cel: każdy z zespołu otwiera dowolny plik, rozumie go bez pytania autora i umie go wyjaśnić na obronie.

## 1. Komentarze

Komentujemy wszędzie, po polsku. Nazwy w kodzie zostają po angielsku.

### Co musi mieć komentarz

| Miejsce | Co piszemy |
|---|---|
| Początek każdego pliku | co robi plik, `@author`, `@since`, `@uses` i `@used_by` |
| Każda funkcja, komponent, hook i typ, który eksportujemy | co robi, parametry, co zwraca, jakie błędy rzuca, co zmienia poza sobą (baza, pamięć telefonu, sieć) |
| Funkcja wewnętrzna | jedno zdanie: co robi |
| Każdy krok wewnątrz funkcji | krótki komentarz nad blokiem: co robi ten krok |
| Liczba albo warunek, którego sens nie wynika z kodu | dlaczego tak jest, skąd ta wartość |
| Obejście błędu przeglądarki albo biblioteki | co jest zepsute, na jakim telefonie, link do zgłoszenia |

Komentarz opisuje krok, nie linię. Nie piszemy `// zwiększ i` nad `i++`.

### Format

TSDoc (`/** ... */`), bo edytor pokazuje go po najechaniu na nazwę, a agenci AI go czytają.

Znaczniki, tylko te:

- `@author`: osoba z zespołu, która odpowiada za plik. Nie model AI.
- `@since`: data utworzenia pliku.
- `@uses`: z czego plik korzysta, w formie `ścieżka::nazwa`.
- `@used_by`: kto korzysta z pliku, w tej samej formie.
- `@invariant`: założenie o danych, którego nie wolno złamać.

Ścieżka w `@uses` albo `@used_by`, która nie istnieje, to błąd. Przed pull requestem sprawdź ją przez wyszukanie w repo.

### Czego nie robimy

- Nie zostawiamy wykomentowanego kodu. Usuwamy go, bo jest w historii gita.
- Nie piszemy `TODO` bez osoby i numeru zgłoszenia: `// TODO(Kacper, #12): ...`.
- Nie wpisujemy sekretów ani ich wartości. Najwyżej nazwę zmiennej, na przykład `RESEND_API_KEY`.
- Nie zmieniamy komentarzy w cudzym module bez zgody właściciela.
- Gdy zmieniasz kod, poprawiasz też komentarz. Nieaktualny komentarz jest gorszy niż żaden.

### Przykład

```ts
/**
 * Liczy, ile czasu zostało do najbliższego dzwonka.
 *
 * @author Kacper
 * @since 2026-10-20
 * @uses src/features/countdown/bellSchedule.ts::BELLS
 * @used_by src/features/countdown/CountdownCard.tsx::CountdownCard
 */
import { BELLS, type Bell } from './bellSchedule';

/** Wynik dla licznika: najbliższy dzwonek i liczba sekund do niego. */
export type NextBell = { bell: Bell; secondsLeft: number };

/**
 * Szuka najbliższego dzwonka po podanej chwili.
 *
 * @param now - bieżąca data i godzina z telefonu
 * @returns najbliższy dzwonek dzisiaj albo `null`, gdy lekcje się skończyły
 */
export function findNextBell(now: Date): NextBell | null {
  // Zamień godzinę na sekundy od północy, bo plan dzwonków trzyma czas w tej formie.
  const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // Weź pierwszy dzwonek, który jeszcze nie zadzwonił. Plan jest posortowany rosnąco.
  const bell = BELLS.find((item) => item.atSeconds > nowSeconds);
  if (!bell) return null;

  return { bell, secondsLeft: bell.atSeconds - nowSeconds };
}
```

## 2. Czytelny kod, bez spaghetti

Każdą zasadę da się sprawdzić. Szkielet (etap A) włącza je w linterze, więc CI odrzuci kod, który ich nie spełnia.

| Zasada | Limit | Reguła ESLint |
|---|---|---|
| Krótka funkcja | najwyżej 40 linii | `max-lines-per-function` |
| Krótki plik | najwyżej 300 linii | `max-lines` |
| Płytkie zagnieżdżenie | najwyżej 3 poziomy `if` i pętli | `max-depth` |
| Proste warunki | złożoność najwyżej 10 | `complexity` |
| Mało parametrów | najwyżej 3, więcej podajemy jako obiekt | `max-params` |
| Moduły nie zależą od siebie w kółko | 0 cykli | `import/no-cycle` |
| Opis każdej eksportowanej funkcji | wymagany | `jsdoc/require-jsdoc` |

Jak to osiągnąć:

- **Jedna funkcja robi jedną rzecz.** Gdy w nazwie jest „i” (`loadAndSave`), dziel ją na dwie.
- **Wcześnie wychodzimy z funkcji.** Najpierw `if (!user) return`, potem właściwa praca. Bez `else` po `return`.
- **Wygląd osobno, logika osobno.** Komponent React tylko rysuje. Pobieranie danych i obliczenia są w hooku (`useSurvey`) albo w zwykłej funkcji.
- **Moduł ma jedne drzwi.** Inne moduły importują tylko z jego `index.ts`, nigdy z plików w środku.
- **Nazwy mówią, co to jest.** `secondsLeft`, nie `s` ani `data2`. Wartość logiczna zaczyna się od `is`, `has` albo `can`.
- **Liczby mają nazwy.** `const MAX_PHOTO_MB = 5`, nie `5` w środku warunku.
- **Bez stanu globalnego.** Dane serwera trzyma TanStack Query, a stan ekranu trzyma komponent.
- **Bez kopiowania.** Ten sam kod w trzecim miejscu wydzielamy do funkcji. W drugim jeszcze nie.
- **Bez sprytnych skrótów.** Zwykła pętla jest lepsza niż łańcuch pięciu metod, którego nikt nie przeczyta.

## 3. Dokumentacja

- Dokumentacja zmienia się w tym samym pull requeście co kod.
- Każdą komendę i ścieżkę z dokumentu sprawdzamy, zanim ją zapiszemy.
- Czego nie wiemy, oznaczamy „nie wiadomo” albo „do ustalenia”. Nie zgadujemy.
- Mapą projektu jest `docs/ARCHITECTURE.md`: moduł, ścieżka, co robi, właściciel, od czego zależy. Opisujemy moduły, nie pojedyncze funkcje.
- Decyzje zapisujemy w `docs/adr/`, a zmiany w `CHANGELOG.md`.
- README jest dla ludzi, `AGENTS.md` dla agentów. Nie kopiujemy jednego do drugiego, tylko linkujemy.

## 4. Testy

- Test ma dowodzić, że zmiana działa. Liczba testów nie jest celem.
- Poprawka błędu: najpierw test, który pokazuje błąd i nie przechodzi. Potem poprawka, po której przechodzi.
- Sprawdzamy przypadki brzegowe: pusta lista, brak internetu, ostatnia lekcja, 5 odpowiedzi w ankiecie, szerokość 320 px.
- W raporcie piszemy, czego nie sprawdziliśmy.

## 5. Gdy coś nie działa

1. Powtórz błąd i zapisz, jak to zrobić.
2. Zapisz, co według Ciebie jest przyczyną i czego się spodziewasz po sprawdzeniu.
3. Sprawdź. Gdy przewidywanie się nie sprawdziło, napisz to i szukaj dalej.
4. Popraw przyczynę najmniejszą zmianą, nie objaw.
5. Dodaj test, który pilnuje, żeby błąd nie wrócił.

## 6. Bezpieczeństwo

- Uprawnienia sprawdza serwer. To, że aplikacja ukrywa przycisk, nikogo nie chroni.
- Serwer sprawdza każde dane od telefonu: typ, długość, rozmiar pliku.
- Sekrety są tylko w `.dev.vars` i w ustawieniach Cloudflare.
- Nowa biblioteka: sprawdź, kto ją utrzymuje i kiedy wyszła ostatnia wersja. Dependabot pilnuje znanych luk.

## 7. Baza i wymiana danych

- Każda zmiana bazy to nowa migracja Drizzle. Starej migracji nie zmieniamy.
- Zapytanie, które kasuje dane, ma warunek `WHERE` i test.
- Serwer zwraca czytelny błąd z kodem HTTP. Telefon pokazuje uczniowi komunikat po polsku, a nie treść błędu.
- Nie powtarzamy automatycznie zapytań, które coś zapisują, bo mogą zapisać się dwa razy.

## 8. Git

- Mały commit robi jedną rzecz i da się go opisać jednym zdaniem.
- Nie zmieniamy formatowania całego pliku przy okazji, bo recenzent nie zobaczy prawdziwej zmiany.

## Lista przed pull requestem

- [ ] każdy nowy plik ma nagłówek, każda eksportowana funkcja ma opis
- [ ] każdy krok w dłuższej funkcji ma komentarz
- [ ] ścieżki w `@uses` i `@used_by` istnieją
- [ ] limity z tabeli w części 2 są spełnione, lint przechodzi
- [ ] dokumentacja i `docs/ARCHITECTURE.md` zgadzają się z kodem
- [ ] jest test, który by nie przeszedł bez tej zmiany

Źródło: wnioski z umiejętności agentów `code-docs-master`, `docs-master`, `test-master`, `debug-master`, `security-master`, `api-master`, `database-master` i `git-master`, dopasowane do tego projektu.
