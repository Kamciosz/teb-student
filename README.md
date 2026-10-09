# TEB Student

Aplikacja na telefon (PWA) dla uczniów TEB. W jednym miejscu są ważne informacje szkoły, zgłoszenia problemów do Samorządu i anonimowe ankiety. Projekt społeczny klasy 3TA: pilotaż od 29.10 do 5.11.2026, oddanie 12.11.2026.

## Stan

Repozytorium ma dokumentację i zasady pracy. Kodu aplikacji jeszcze nie ma. Pierwszy krok to projekt techniczny agenta orkiestrującego (część 9 planu), potem szkielet (etap A).

## Od czego zacząć

1. [`docs/PLAN_APLIKACJI.md`](docs/PLAN_APLIKACJI.md): co budujemy, terminy, kiedy funkcja jest gotowa.
2. [`docs/TECHNOLOGIE.md`](docs/TECHNOLOGIE.md): technologie zatwierdzone przez Bohdana i zasady dla agentów.
3. [`docs/projekt/EKRANY.md`](docs/projekt/EKRANY.md): teksty i układ ekranów, obrazy w `docs/projekt/`.
4. [`AGENTS.md`](AGENTS.md): zasady pracy dla ludzi i agentów AI.
5. [`CONTRIBUTING.md`](CONTRIBUTING.md): gałęzie, commity, pull requesty.

## Wymagania

- Node.js 22.22 lub nowszy (CI używa Node 22, wersja w `.nvmrc`).
- Git.

## Instalacja

```bash
git clone https://github.com/Kamciosz/teb-student.git
cd teb-student
npm install
```

`npm install` włącza hook, który sprawdza format commitów. Bez tego kroku zły commit przejdzie lokalnie, ale CI go odrzuci.

## Uruchomienie i testy

Komendy dojdą razem ze szkieletem (etap A). Wtedy szkielet dopisze je tutaj i w `AGENTS.md`.

## Struktura

```
docs/                 plan, technologie, architektura, decyzje, log AI
docs/projekt/         teksty i obrazy ekranów
docs/adr/             zapisane decyzje techniczne
.github/              CI i szablon pull requestu
.githooks/            sprawdzanie formatu commitów
```

## Zespół

| Osoba | Odpowiada za |
|---|---|
| Szymon | spina całość: dokumentacja, praca z AI, log AI |
| Bohdan | technologie i wspólne ustalenia w kodzie |
| Adam | repozytorium, przegląd i scalanie pull requestów, wdrożenie |
| Kacper | wygląd, pulpit, licznik do dzwonka |
| Jakub | ankiety, profil i prywatność, dane z pilotażu |

Szczegóły w [`docs/OWNERS.md`](docs/OWNERS.md).

## Licencja

MIT, szczegóły w [LICENSE](LICENSE).
