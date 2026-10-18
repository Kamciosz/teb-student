/**
 * PL: Ekran „Role” (6.3a i 6.3d w docs/projekt/EKRANY.md): administrator wpisuje szkolny adres ucznia i szuka go, a pod polem widzi komunikat, gdy adres jest spoza szkoły albo nie ma konta. Pod polem stoi lista osób z rolą Samorządu albo redakcji. Znaleziony uczeń otwiera kartę ról (6.3b).
 * EN: The "Role" screen (6.3a and 6.3d in docs/projekt/EKRANY.md): the administrator types a student's school address and searches for the student, and under the field sees a message when the address is outside the school or has no account. Under the field stands the list of people with the Samorząd or editorial role. A found student opens the role card (6.3b).
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/admin/queries.ts::useRoleSearch
 * @uses src/features/admin/queries.ts::useRoleHolders
 * @uses src/features/admin/api.ts::RoleCard
 * @uses src/features/admin/icons.tsx::Icon
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/shared/index.ts::TextField
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @used_by src/features/admin/AdminScreen.tsx::AdminScreen
 */

// PL: Wspólne elementy ekranu: nagłówek, pole, przycisk, grupa i wiersz listy.
// EN: The shared screen elements: the header, the field, the button, the group and the list row.
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, ListGroup, ListRow, ScreenHeader, TextField } from '../../shared';
import type { RoleCard } from './api';
import { Icon } from './icons';
import { useRoleHolders, useRoleSearch } from './queries';

/** PL: Domena szkolnych adresów. EN: The domain of the school addresses. */
const SCHOOL_DOMAIN = '@teb.edu.pl';

/** PL: Komunikat, gdy adres nie kończy się na domenę szkoły (6.3d). EN: The message when the address does not end with the school domain (6.3d). */
const NOT_SCHOOL_MESSAGE = 'Wpisz adres, który kończy się na @teb.edu.pl.';

/** PL: Komunikat, gdy nie ma konta z tym adresem (6.3d). EN: The message when there is no account with this address (6.3d). */
const NO_ACCOUNT_MESSAGE = 'Nie ma konta z tym adresem.';

/**
 * PL: Sprawdza, czy adres to szkolna skrzynka: coś przed domeną i sama domena na końcu. Porównanie po przycięciu i zamianie na małe litery.
 * EN: Checks whether the address is a school mailbox: something before the domain and the domain itself at the end. The comparison is after trimming and lowercasing.
 *
 * @param address - PL: adres wpisany przez administratora. EN: the address typed by the administrator.
 * @returns PL: true, gdy adres kończy się na domenę szkoły. EN: true when the address ends with the school domain.
 */
function isSchoolAddress(address: string): boolean {
  // PL: Samej domeny bez nazwy skrzynki nie przyjmujemy.
  // EN: The domain alone without a mailbox name is not accepted.
  return address.endsWith(SCHOOL_DOMAIN) && address.length > SCHOOL_DOMAIN.length;
}

/**
 * PL: Stan formularza wyszukiwania: adres, komunikat pod polem i wysłanie. Po znalezieniu ucznia przechodzi do karty, a adres jedzie w stanie trasy.
 * EN: The search form state: the address, the message under the field and the submit. After finding a student it goes to the card, and the address travels in the route state.
 *
 * @returns PL: adres, komunikat, obsługa zmiany i wysłania oraz czy trwa szukanie. EN: the address, the message, the change and submit handlers and whether a search is running.
 */
function useRoleSearchForm() {
  const navigate = useNavigate();
  const search = useRoleSearch();
  // PL: Komunikat pod polem: adres spoza szkoły albo brak konta. Znika, gdy administrator zmieni adres.
  // EN: The message under the field: an address outside the school or no account. It goes away when the administrator changes the address.
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function onChange(value: string) {
    setEmail(value);
    setMessage(null);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    if (!isSchoolAddress(address)) {
      setMessage(NOT_SCHOOL_MESSAGE);
      return;
    }
    search.mutate(address, {
      onSuccess: (card) => {
        if (card) navigate(`/admin/role/${card.studentId}`, { state: { email: address } });
        else setMessage(NO_ACCOUNT_MESSAGE);
      },
    });
  }

  return { email, message, pending: search.isPending, onChange, onSubmit };
}

/**
 * PL: Rysuje ekran wyszukiwania ról: pole z adresem, przycisk „Znajdź ucznia” i listę osób z rolą.
 * EN: Draws the role search screen: the address field, the "Znajdź ucznia" button and the list of people with a role.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function RoleScreen() {
  const form = useRoleSearchForm();
  return (
    <main className="ad-screen" data-subtrack="8">
      <ScreenHeader title="Role" backTo="/admin" backLabel="Wróć do panelu" />
      <p className="ad-lead ad-lead-tight">Wpisz szkolny adres ucznia, żeby nadać albo odebrać rolę.</p>
      <form className="ad-form" onSubmit={form.onSubmit} noValidate>
        <SearchField email={form.email} message={form.message} onChange={form.onChange} />
        <HoldersList />
        {/* PL: Przycisk stoi na dole ekranu. EN: The button stands at the bottom of the screen. */}
        <div className="ad-bottom">
          <Button type="submit" disabled={form.pending}>
            <Icon name="search" />
            Znajdź ucznia
          </Button>
        </div>
      </form>
    </main>
  );
}

/**
 * PL: Pole szkolnego adresu w grupie, z podpisem i komunikatem błędu pod polem. Komunikat ustawia aria-invalid i opis pola (robi to wspólne pole).
 * EN: The school address field in a group, with a label and the error message under the field. The message sets aria-invalid and the field description (the shared field does this).
 *
 * @param props - PL: adres, komunikat (albo null) i obsługa zmiany. EN: the address, the message (or null) and the change handler.
 * @returns PL: grupa z polem. EN: the group with the field.
 */
function SearchField({ email, message, onChange }: { email: string; message: string | null; onChange: (value: string) => void }) {
  return (
    <ListGroup>
      <TextField
        label="Szkolny e-mail"
        error={message ?? undefined}
        type="email"
        inputMode="email"
        autoComplete="off"
        placeholder="imie.nazwisko@teb.edu.pl"
        value={email}
        onChange={(event) => onChange(event.target.value)}
      />
    </ListGroup>
  );
}

/**
 * PL: Rysuje listę osób z rolą pod polem (6.3a): grupa z wierszami, pusty stan albo błąd pobrania.
 * EN: Draws the list of people with a role under the field (6.3a): a group with rows, the empty state or the fetch error.
 *
 * @returns PL: grupa z listą albo komunikat. EN: the group with the list or a message.
 */
function HoldersList() {
  const holders = useRoleHolders();
  const people = holders.data ?? [];
  return (
    <>
      {people.length > 0 ? (
        <ListGroup header="Osoby z rolą">
          {people.map((card) => (
            <HolderRow key={card.studentId} card={card} />
          ))}
        </ListGroup>
      ) : (
        <span className="ad-label ad-label-below">Osoby z rolą</span>
      )}
      {holders.isError ? (
        <p className="ad-error" role="alert">
          <Icon name="triangle-alert" />
          Nie udało się pobrać listy. Spróbuj ponownie za chwilę.
        </p>
      ) : null}
      {holders.data && people.length === 0 ? <p className="ad-hint">Nikt jeszcze nie ma roli Samorządu ani redakcji.</p> : null}
    </>
  );
}

/**
 * PL: Rysuje jeden wiersz osoby z rolą: inicjał, imię, znaczniki ról i zamaskowany adres. Dotknięcie otwiera kartę (6.3b).
 * EN: Draws one row of a person with a role: the initial, the first name, the role badges and the masked address. Tapping it opens the card (6.3b).
 *
 * @param props - PL: karta osoby z listy. EN: the person's card from the list.
 * @returns PL: wiersz listy. EN: the list row.
 */
function HolderRow({ card }: { card: RoleCard }) {
  return (
    <ListRow
      to={`/admin/role/${card.studentId}`}
      icon={<span className="ad-avatar">{card.firstName.charAt(0).toUpperCase()}</span>}
      title={
        <>
          {card.firstName}
          {card.council ? (
            <>
              {' '}
              <span className="ad-badge">Samorząd</span>
            </>
          ) : null}
          {card.editor ? (
            <>
              {' '}
              <span className="ad-badge">Redakcja gazetki</span>
            </>
          ) : null}
        </>
      }
      subtitle={card.maskedEmail}
    />
  );
}
