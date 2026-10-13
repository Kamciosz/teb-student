## Changelog

### Dodane

- Bez zmian dla użytkownika. Ekran „Zdjęcia i filmy” dla redaktora przygotowuje zdjęcie (do 1600 px, JPEG bez EXIF) i sprawdza film (do 30 sekund, do 50 MB) przed wysyłką. Wysyłka zadziała po utworzeniu zasobnika R2 `teb-media` i konta Cloudflare.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #16 i #45 (podtor 2), wysyłka zdjęć i filmów | Zaimplementuj wysyłkę zdjęć i filmów z limitami, adresy miniatur i test e2e, bez konta Cloudflare. | Dodało `src/features/media/` (przygotowanie zdjęcia, reguły filmu, wysyłka, ekran, adresy miniatur, testy jednostkowe), `e2e/media.spec.ts` i ten wpis. Serwer `worker/media/` był w poprzednim commicie. | Do ustalenia | Szymon Sosnowski |
