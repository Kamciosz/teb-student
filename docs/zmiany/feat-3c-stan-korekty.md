## Changelog

### Dodane

- Panel Samorządu pokazuje wpisy w korekcie. Taki wpis ma znacznik „Do korekty” i przycisk „Otwórz korektę”, który prowadzi do podglądu w kreatorze, gdzie zatwierdza go inny redaktor.
- Usunięcie wpisu w korekcie pyta o potwierdzenie z podpisem, że uczniowie go nie widzieli.

### Zmienione

- Kafel wpisu ma czynności zależne od stanu: szkic – „Edytuj” i „Opublikuj”, w korekcie – „Otwórz korektę”, opublikowany – bez czynności. „Usuń” jest zawsze.
- Wpis w korekcie nie ma już znacznika „Opublikowany” ani przycisku „Opublikuj”.

### Do ustalenia przez zespół

- Panel nie zatwierdza wpisu w korekcie, tylko otwiera kreator (podtor 3b). Czy panel ma mieć własny przycisk zatwierdzania, wymaga decyzji produktu.
- Nowe teksty („Do korekty”, „Otwórz korektę”, podpis przy usuwaniu wpisu w korekcie) są w `src/features/news/admin/texts.ts` w grupie „TO_AGREE”, bo EKRANY.md ich nie ma.
- Serwer przy publikacji wpisu w korekcie zwraca 409 „already_published”, choć wpis nie jest opublikowany (`publishDraft` zmienia tylko szkic). Poprawka leży poza tym podtorem.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 3c, stan korekty w panelu, część #126, baza PR #141 | Dodaj wpisy w korekcie do listy panelu: znacznik „Do korekty”, link „Otwórz korektę”, testy Vitest i e2e. | Zmieniło `src/features/news/admin/` (`api.ts`, `texts.ts`, `DeleteSheet.tsx`, `EntryTile.tsx`, nowy `EntryTile.test.tsx`), nowy przypadek w `worker/news/admin/routes.test.ts` i `e2e/news-admin.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
