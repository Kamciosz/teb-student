## Changelog

### Naprawione

- Zakładka „Zgłoszenia” w dolnym pasku otwiera listę „Moje zgłoszenia”, a nie formularz nowego zgłoszenia. Formularz otwiera plus u góry listy i kafel „Zgłoś problem” na pulpicie.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Jak sprawdzono |
|---|---|---|---|---|---|
| 2026-11-01 | Zakładka zgłoszeń (gałąź fix/zakladka-zgloszenia) | Poprawiać od razu to, co jest do poprawy; plus ma być u góry „Moje zgłoszenia” | Zmieniło adres zakładki w `src/shared/navigation/items.ts` oraz testy `src/shared/ui/Dock.test.tsx` i `src/app/routes.test.ts`, który nie dopuszczał adresu wewnątrz podtoru | Nic | Vitest i e2e lokalnie, kliknięcie zakładki w zbudowanej aplikacji |
