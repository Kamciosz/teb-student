## Changelog

### Dodane

- Ekran „Wpisy” w panelu Samorządu (`/news/admin`): lista wszystkich wpisów ze szkicami (szkice pierwsze), znacznik typu i stanu, przycisk „Opublikuj” przy szkicu, przycisk „Usuń” z arkuszem potwierdzenia (wzór: ekran 6.3c) i przycisk „Nowy wpis”, który otwiera kreator z podtoru 3b (`/news/editor`, ekrany 5.1–5.3).
- Serwer pod `/api/news/admin`: `GET /` (lista bez treści), `POST /:id/publish` (jedno zapytanie warunkowe, więc ponowna publikacja nie przesuwa wpisu na liście ucznia: 409), `DELETE /:id`. Cały router stoi za `requireNewsAuthor` z podtoru 3b, także odczyt, bo lista zawiera szkice.
- Bez internetu lista zostaje z ostatnich danych, a „Opublikuj” i „Usuń” są nieaktywne z napisem „Publikacja i usuwanie wymagają internetu.”.
- Test Vitest na prawdziwym D1 sprawdza odpowiedzi HTTP: uczeń (router podtoru 3a) nie widzi szkicu, widzi go dopiero po publikacji i nie widzi po usunięciu; bez sesji jest 401, a zalogowany uczeń bez roli dostaje 403 na każdym adresie bez zmian w bazie. Test Playwright sprawdza listę, publikację, usuwanie z anulowaniem, pusty stan, odmowę serwera, błąd publikacji, szerokość 320 px i brak internetu.

### Uwaga

- Role: zapis i odczyt w panelu odpowiadają dziś 403 każdemu, bo `requireNewsAuthor` (podtor 3b, `worker/news/editor/author.ts`) zamyka drzwi do czasu ról z podtoru 8. Po scaleniu podtoru 8 zmienia się tylko ten plik, w 3c nic. Redakcja widzi tylko wpisy, bo router 3c nie ma innych adresów.
- Kafelek „dodaj” z ekranu 5.1 i podgląd identyczny z kartą ucznia (5.3) leżą w plikach podtoru 3b i wymagają eksportu z podtoru 3a: zgłoszenia #81 i #80. Zdjęcia (podtor 2) nie istnieją, więc nic się nie wysyła.
- Edytor (3b) nie otwiera zapisanego szkicu, więc panel nie ma przycisku „Edytuj”. Wpisy w bazie nie mają chwili utworzenia, więc kolejność szkiców między sobą nie jest ustalona.
- `deleteNewsStudentData` leży w podtorze 3a, a tabela wpisów nie ma kolumny z numerem ucznia, więc nie ma czego kasować.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-12 | #19, podtor 3c: wpisy w panelu, publikacja i usuwanie | Zbuduj w module news/admin listę wpisów ze szkicami, publikację szkicu i usuwanie z potwierdzeniem. Rola przez `requireNewsAuthor` z 3b, w testach zaślepka. Uczeń nie widzi szkiców (test HTTP). | Dodało serwer w `worker/news/admin/` (trasy, zapytania, test Vitest), ekran w `src/features/news/admin/` (lista, kafel, arkusz usuwania, teksty, style), przepisało `e2e/news-admin.spec.ts` na ścieżkę wpisów oraz dodało ten plik | do uzupełnienia | do uzupełnienia |
