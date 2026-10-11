## Changelog

### Dodane

- Pulpit zamiast ekranu „W budowie”: powitanie z datą i cztery kafelki. „Ważne” pokazuje najnowszy wpis typu „Ważne”, „Ankieta” aktywną ankietę z liczbą dni do końca i przyciskiem „Wypełnij”, „Zgłoszenia” zgłoszenie ucznia z paskiem etapu, „Ogłoszenia” trzy ostatnie wpisy z datami.
- Każdy kafelek prowadzi do właściwego ekranu: wpis, ankieta, „Moje zgłoszenia”, lista aktualności.
- Pusty kafelek mówi, że nic nie ma, zamiast znikać. Licznik do dzwonka pokazuje pusty stan, bo podtor 6 jeszcze nie istnieje.
- Serwer pulpitu `GET /api/dashboard`: jedno zapytanie zbiera dane z routerów aktualności, zgłoszeń i ankiet (tylko przez ich `index.ts`). Aktualności są publiczne, a ankieta i zgłoszenia bez sesji dają pusty kafelek. Awaria jednego modułu nie psuje reszty pulpitu.
- Pulpit zapisuje się w telefonie: bez internetu widać ostatnio pobrane dane, a po nieudanym odświeżeniu napis „Nie udało się odświeżyć pulpitu. Pokazujemy zapisane dane.”.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-12 | #27, podtor 9: pulpit | Zbuduj pulpit z kafelkami Ważne, Ankieta, Zgłoszenia, Ogłoszenia i pustym stanem dzwonka, dane tylko przez `index.ts` modułów 3a, 4a, 5a, z testami. | Dodało serwer w `worker/dashboard/` (zbieranie danych, skracanie odpowiedzi, testy Vitest na prawdziwej bazie D1), ekran i kafelki w `src/features/dashboard/` (style, formatowanie, testy Vitest), przepisało `e2e/dashboard.spec.ts` oraz dodało ten plik. | do uzupełnienia | Kacper |
