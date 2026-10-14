## Changelog

### Dodane

- Zdjęcia w treści wpisu. Zdjęcie z podpisem pokazuje się w treści, ale tylko wtedy, gdy adres prowadzi do zdjęcia z naszego serwera (zaczyna się od `/api/media/`). Obce adresy znikają. Zdjęcia ładują się leniwie, a podpis pojawia się pod zdjęciem, jeśli jest.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | zdjęcie w treści wpisu (podtor 3a, część #45) | Pokaż zdjęcia w treści wpisu. Czyść tylko adresy `/api/media/`, rysuj `figure` z `img` (lazy, wymiary, alt) i podpisem. Bez zmian w edytorze i innych modułach. | Dodało wariant `image` do `sanitize.ts` z walidacją adresu, nowy komponent `NewsImage.tsx`, podpięcie w `RichContent.tsx`, style w `feed.css` i testy w `sanitize.test.tsx` oraz `NewsImage.test.tsx`. | do uzupełnienia | do uzupełnienia |
