## Changelog

### Dodane

- Panel Samorządu: w historii etapów szczegółu zgłoszenia pod wpisem zmiany etapu pokazuje się odpowiedź dla autora zapisana przy tej zmianie, na osobnym wierszu, z napisem „Odpowiedź dla autora:” (do uzgodnienia z zespołem). Wpis bez odpowiedzi wygląda jak dotąd.
- Serwer: `GET /api/reports/admin/:id` zwraca w każdym wierszu historii pole `note` (tekst albo `null`), razem z etapem i chwilą. Lista kluczy wiersza w testach jest dokładna (`changedAt`, `note`, `stage`), więc numer osoby z Samorządu (`changedBy`) nie może się tam dostać. Dla zgłoszenia anonimowego odpowiedź wraca bez danych autora.
- Testy: w `worker/reports/admin/routes.test.ts` odpowiedź w wierszu historii, wiersz bez odpowiedzi z `null`, zapis odpowiedzi przy PATCH oraz to, że odpowiedź anonimowego zgłoszenia nie ujawnia autora ani osoby z Samorządu; w `e2e/reports-admin.spec.ts` odpowiedź pod nowym wpisem i brak napisu przy starszym wpisie.

### Uwaga

- Ten PR zdejmuje ograniczenie opisane w PR #120 („historia etapów w panelu nie pokazuje odpowiedzi”). Baza tego PR to `feat/4b-odpowiedz-w-panelu`, więc PR jest w kolejce po #120 i pokaże się poprawnie dopiero po jego scaleniu.
- Napis „Odpowiedź dla autora:” w historii jest do uzgodnienia z zespołem, tak samo jak nazwa pola w formularzu.
- Pole `note` jest opcjonalne w wierszu historii. Wpisy zapisane przed tą zmianą (na przykład w pamięci telefonu) nie mają tego pola i nie pokazują nic.
- Odpowiedź w historii nie zmienia schematu bazy: kolumna `note` jest z podtoru 4a.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 4b: odpowiedź dla autora w historii zmian etapu w panelu Samorządu (gałąź `feat/4b-odpowiedz-w-historii`, baza `feat/4b-odpowiedz-w-panelu`, PR #120) | Pokaż w historii etapów w szczegółach zgłoszenia odpowiedź zapisaną przy danej zmianie, pod wpisem. Serwer zwraca `note` z historią bez danych autora. Bez zmian w schemacie. Testy Vitest i e2e. | Dodało `note` do typu `StageChange` i wyboru historii w `worker/reports/admin/reportsAdminRepository.ts`, komentarze do historii w `routes.ts`, testy w `worker/reports/admin/routes.test.ts`, typ `StageChange` w `src/features/reports/admin/api.ts`, wiersz z odpowiedzią w `ReportDetail.tsx`, styl `ra-history-note` w `reportsAdmin.css`, stub API i nowy przypadek w `e2e/reports-admin.spec.ts` oraz ten plik. | do uzupełnienia | Szymon Sosnowski |
