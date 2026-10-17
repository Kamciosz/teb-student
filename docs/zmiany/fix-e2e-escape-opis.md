## Changelog

### Naprawione

- Okienko „Opis i podpis” w edytorze wpisu: po otwarciu fokus zostaje w polu opisu. Wcześniej edytor w następnej klatce zabierał fokus, więc na wolniejszym urządzeniu pisanie i Escape mogły trafić do treści wpisu zamiast do okienka. Escape zamyka okienko bez zapisu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-17 | fix, test e2e „Escape zamyka okienko opisu” | Znajdź przyczynę niestabilnego testu (CI co jakiś czas). Popraw komponent, nie test ani asercje. Bez sztywnych opóźnień. | Przyczyna: `openPhotoPanel` w `EditorToolbar.tsx` wołał `focus()` Tiptapa, które oddaje fokus edytorowi w `requestAnimationFrame`, więc zabierało fokus polu okienka. Zmiana: usunięto `focus()` z tego wywołania (dwa wiersze i komentarz). Sprawdzono: test pada na kodzie bez zmiany pod obciążeniem CPU (4/30, potem 12/90), a po zmianie 0 błędów (90/90 pod obciążeniem, 30/30 przy 300 ms oczekiwania przed Escape). | | Szymon |
