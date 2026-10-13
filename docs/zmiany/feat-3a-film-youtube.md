## Changelog

### Dodane

- Film z YouTube we wpisie u ucznia: najpierw miniatura z przyciskiem „Odtwórz film”, a po kliknięciu ramka z `youtube-nocookie.com` bez autoodtwarzania. Proporcja 16:9, ramka z tytułem dla czytników ekranu i pełnym ekranem.
- Bez internetu zamiast miniatury i ramki pojawia się napis „Film wymaga połączenia z internetem.” z linkiem „Obejrzyj na YouTube”, który otwiera film w nowej karcie.
- Zły identyfikator filmu nie daje nic na ekranie.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 3a, film z YouTube we wpisie (format węzła z PR #114) | Wyświetl film z YouTube we wpisie u ucznia zgodnie z ADR 0002: iframe tylko z youtube-nocookie.com, sprawdzony identyfikator, bez autoodtwarzania, leniwe ładowanie, napis z linkiem bez sieci. | Dopisało sprawdzenie identyfikatora w komponencie, usunęło autoodtwarzanie z ramki, dodało `loading="lazy"`, napis bez sieci i testy Vitest oraz jeden przypadek e2e. Pliki: `YouTubePlayer.tsx`, `YouTubePlayer.test.tsx`, `e2e/news-feed.spec.ts`, ten plik. | do uzupełnienia | do uzupełnienia |
