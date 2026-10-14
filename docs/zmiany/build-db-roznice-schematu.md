## Changelog

### Dodane

- Bez zmian dla użytkownika. Skrypt `scripts/dbDiff.ts` porównuje bazę D1 z schematem z `scripts/schemaSql.ts` i wypisuje SQL, który dopisze brakujące tabele i kolumny. Nic nie wykonuje w bazie.

## Instrukcja użycia

Skrypt tylko czyta bazę i wypisuje wynik na ekran. Niczego w bazie nie zmienia.

1. Porównaj lokalną bazę: `node scripts/dbDiff.ts --local`. Bez opcji działa tak samo jak `--local`.
2. Porównaj bazę w Cloudflare: `node scripts/dbDiff.ts --remote`. Wymaga zalogowanego `wrangler` z dostępem do bazy `teb-student`.
3. Zapisz wynik do pliku, jeśli chcesz go przejrzeć: `node scripts/dbDiff.ts --remote > wynik.sql`.
4. Przejrzyj plik, a dopiero potem go zastosuj: `npx wrangler d1 execute teb-student --remote --file wynik.sql` (dla lokalnej bazy zamiast `--remote` podaj `--local`).

Co znaczy wynik:

- `-- brak różnic: ...` oznacza, że baza zgadza się ze schematem.
- `CREATE TABLE` dodaje brakującą tabelę razem z jej indeksami.
- `ALTER TABLE ... ADD COLUMN` dodaje brakującą kolumnę.
- Linia `-- UWAGA: ...` z poprzedzającym `-- ALTER TABLE ...` nie zostanie wykonana. SQLite nie dopisze kolumny `NOT NULL` bez `DEFAULT`, więc tabelę trzeba przebudować ręcznie.
- Klucz obcy z poziomu tabeli nie zostanie dopisany przez `ALTER TABLE`. Skrypt ostrzega o tym osobną linią `-- UWAGA: ...`.

Skrypt nie porównuje indeksów istniejących tabel, typów kolumn ani kluczy obcych istniejących tabel. Przed wdrożeniem sprawdź te rzeczy ręcznie.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | build: różnice schematu D1 (`scripts/dbDiff.ts`) | Napisz `scripts/dbDiff.ts`: porównanie bazy D1 ze schematem, wypisuje SQL i niczego nie wykonuje. Testy ręczne, opis w PR. | Dodało `scripts/dbDiff.ts` i ten plik. | do uzupełnienia | do uzupełnienia |
