## Changelog

### Dodane

- Ankiety dla ucznia: lista aktywnych ankiet z liczbą dni do końca, oznaczenie wypełnionych i lista zakończonych.
- Wypełnianie ankiety: jedno pytanie na ekranie, przycisk „Dalej” aktywny po wyborze odpowiedzi, ekran „Odpowiedzi wysłane”.
- Ankiety wymagają zalogowanego ucznia: numer ucznia pochodzi z sesji logowania, a bez sesji serwer odpowiada 401.
- Jeden głos na ucznia: drugiej próby serwer nie przyjmuje, a ekran pokazuje komunikat.
- Anonimowość na poziomie bazy: serwer zapisuje tylko liczniki odpowiedzi i informację, że uczeń już głosował, bez jego odpowiedzi i bez czasu.
- Lista ankiet i ostatnio otwarte ankiety zapisują się w telefonie, więc po zerwaniu połączenia lista nie znika.
- Dane przykładowe: trzy ankiety (dwie trwające, jedna zakończona).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | #22, podtor 5a: ankieta, głosowanie | Zbuduj ankietę ucznia: lista, głosowanie, zapis w D1, anonimowość, testy | Schemat i dane przykładowe ankiet, serwer w `worker/surveys/vote/`, ekrany w `src/features/surveys/vote/`, testy Vitest na prawdziwej bazie D1 i `e2e/surveys-vote.spec.ts` | do uzupełnienia | Jakub |
