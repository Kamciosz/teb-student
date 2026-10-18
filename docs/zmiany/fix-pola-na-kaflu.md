## Changelog

### Naprawione

- Pola tekstowe w grupowanych listach (np. „Imię” i „Klasa” w Ustawieniach profilu) mają szare tło kafla wtórnego, jak pola w aplikacjach systemowych. Wcześniej pole miało ten sam kolor co kafel grupy i nie było go widać. Zmiana dotyczy każdego pola `TextField` wewnątrz `ListGroup`. Pola w okienkach adresu i podpisu w edytorze wpisów nie zmieniły wyglądu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | fix/pola-na-kaflu | Pola tekstowe na kaflu grupy mają być widoczne. Dopisz regułę dla `.ui-list-group .ui-field input` z tłem `--tile-2`, zrób zrzuty przed i po w obu motywach. | Dopisało regułę i komentarz w `src/shared/ui/TextField.css`, wyjątek dla okienek edytora w `src/features/news/editor/editor.css` oraz ten plik. | — | Szymon |
