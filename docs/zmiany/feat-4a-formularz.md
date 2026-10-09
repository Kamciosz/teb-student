## Changelog

### Dodane

- Formularz „Zgłoś problem” w trzech krokach (czego dotyczy, gdzie to jest, opis), z przełącznikiem „Wyślij anonimowo” (domyślnie włączony), ekran „Wysłane” i ekran „Moje zgłoszenia” z paskiem etapu: przyjęte, w trakcie, załatwione. Bez internetu lista pokazuje ostatnio zapisaną wersję (zapis i pasek „Brak internetu” są wspólne dla aplikacji); wysłanie bez internetu kończy się czytelnym błędem, a wpisany opis zostaje.
- Na ekranie „Wysłane” jest dodatkowy przycisk „Moje zgłoszenia”, którego nie ma w makiecie 3.4: uczeń musi mieć jak zobaczyć etap, a pulpit jeszcze go nie pokazuje. Na starcie żadna kategoria ani miejsce nie jest wybrane (makieta ma wybraną pierwszą), żeby uczeń zdecydował sam.
- Serwer zgłoszeń ucznia: zapis nowego zgłoszenia (`POST /api/reports/student`) z pierwszym etapem w historii i odczyt własnych zgłoszeń (`GET /api/reports/student`). Serwer sprawdza kategorię, miejsce i długość pól, a numeru autora nie bierze z telefonu.
- Tabele `reports` i `report_stage_changes` oraz dane testowe. Zgłoszenie zapisuje autora także przy opcji „anonimowo” (uczeń widzi je w „Moje zgłoszenia”); widok Samorządu ma ukrywać autora anonimowych zgłoszeń.
- Przy usunięciu konta zgłoszenia ucznia zostają bez autora.
- Do czasu scalenia logowania moduł używa jednego tymczasowego numeru ucznia (`worker/reports/student/currentStudent.ts`). Potem przejdzie na `requireStudent`.
- Zestaw `REPORTS_SEED_SETS` w `worker/db/seed/reports.ts` dla `npm run db:seed`. Testy serwera idą na prawdziwej bazie D1 z tabelami ze schematu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | #20, podtor 4a: zgłoszenie, formularz i „moje zgłoszenia” | Zbuduj formularz zgłoszenia w 3 krokach, zapis do D1 i listę „Moje zgłoszenia” w module reports/student, z testami. | Dodało serwer w `worker/reports/student/` (walidacja, zapis, odczyt, kasowanie danych), schemat i dane testowe w `worker/db/`, ekrany w `src/features/reports/student/` (formularz, potwierdzenie, lista, style, ikony), testy Vitest, test Playwright `e2e/reports-student.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
