# ADR 0003: adresy podtorów w telefonie i na serwerze

- **Data:** 9.10.2026
- **Status:** do zatwierdzenia przez Bohdana
- **Autor:** Bohdan (propozycja)

## Kontekst

Piętnaście podtorów pracuje równolegle (`docs/PODZIAL_PRACY.md`). Każdy musi mieć adres, który nie koliduje z innym, i nie może zmieniać pliku, który zmienia inny podtor. Z tego powodu etap A rejestruje wszystkie adresy z góry.

## Rozważane opcje

1. Adres odpowiada katalogowi: `/<moduł>/<część>/*` w telefonie i `/api/<moduł>/<część>` na serwerze.
2. Jeden płaski adres na moduł (`/news/*`). Podtory modułu musiałyby wtedy dzielić jeden router, czyli jeden plik.
3. Adresy po numerze podtoru (`/3a/*`). Numer nic nie mówi uczniowi ani nowemu programiście.

## Decyzja

Opcja 1. Pulpit (podtor 9) ma adres `/`. Wszystko pod `/api/` obsługuje Worker, reszta to ekrany aplikacji. Ekrany Samorządu (3c, 4b, 5b, 8) leżą w jednej ramie z menu panelu. Listy adresów są w `src/app/routes.ts` i `worker/mounts.ts`. Tylko etap A albo Bohdan zmienia te pliki.

## Konsekwencje

- Adres jest łatwy do odgadnięcia i odpowiada katalogowi w kodzie.
- Podtor zmienia tylko swój katalog. Rejestr zmienia się raz, na etapie A.
- Nowy podtor wymaga wpisu w obu listach i w tabeli w `docs/PODZIAL_PRACY.md`.
- Better Auth wymaga `basePath` zgodnego z adresem `/api/auth/email`. Podtor 1a ustawi go przy konfiguracji.
- Nieznany adres w telefonie nie ma jeszcze ekranu „nie znaleziono”. Do dodania przez podtor 0.
