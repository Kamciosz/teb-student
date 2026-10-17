## Changelog

### Zmienione

- Komentarze w `src` i `worker` (poza `src/features/bell`): usunięte dopiski „do ustalenia z zespołem”, „do uzgodnienia”, „do ustalenia z właścicielem”, „to be agreed” i „czeka na akceptację”. Teksty zatwierdził właściciel 14.10.2026, więc komentarze mówią, że są zatwierdzone. PL i EN mówią to samo.
- `worker/auth/invite/settings.ts`: zasady loginu i długość hasła opisane jako przyjęte wartości, a nie propozycja do ustalenia.
- `src/features/news/editor/document/limits.ts`: komentarz przy wartościach limitów oznaczony jako „Przyjęta wartość.”.
- `worker/news/editor/routes.ts`: usunięte zdanie „Do ustalenia z Samorządem.” przy przyszłej etykiecie roli.
- `src/features/media/MediaScreen.tsx`: pusty komentarz JSX zamieniony na opis elementu, bez zmiany renderowania.

Zmiany dotyczą wyłącznie komentarzy. Nie zmieniono tekstów UI ani logiki.

### Bez zmian

- `src/features/dashboard/DashboardHeader.tsx`: dopisku nie ma już w kodzie, więc nic nie zmieniano.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | komentarze do ustalenia (PR do uzupełnienia) | Usunąć z komentarzy w `src` i `worker` dopiski o ustalaniu z zespołem, PL i EN spójnie, zasady loginu i hasła opisać jako przyjęte wartości. | Zmieniło komentarze w 20 plikach `src` i `worker` (lista w PR), dodało ten plik. Sprawdzono grep bramki, dowód że diff dotyczy tylko komentarzy, lint, build i Vitest. | Zatwierdził teksty aplikacji 14.10.2026. | Szymon |
