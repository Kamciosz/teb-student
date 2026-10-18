/**
 * PL: Karta roli ucznia (6.3b i 6.3c w docs/projekt/EKRANY.md): dwa przełączniki, Samorząd i redakcja gazetki. Przy odebraniu roli Samorządu arkusz pyta o potwierdzenie, a zapis to osobny przycisk na dole. Znacznik „Zmiana” pokazuje, co różni się od zapisanego.
 * EN: The role card of a student (6.3b and 6.3c in docs/projekt/EKRANY.md): two switches, the Samorząd and the editorial team. When the Samorząd role is taken away, a sheet asks for confirmation, and saving is a separate button at the bottom. The "Zmiana" badge shows what differs from the saved state.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/admin/queries.ts::useRoleCard
 * @uses src/features/admin/queries.ts::useSaveRoles
 * @uses src/features/admin/useOnline.ts::useOnline
 * @uses src/features/admin/api.ts::RoleChoice
 * @uses src/features/admin/icons.tsx::Icon
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/shared/index.ts::TextField
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::Sheet
 * @used_by src/features/admin/AdminScreen.tsx::AdminScreen
 */

// PL: Wspólne elementy ekranu: nagłówek, grupa, wiersz, pole, przycisk i arkusz.
// EN: The shared screen elements: the header, the group, the row, the field, the button and the sheet.
import { useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { Button, ListGroup, ListRow, ScreenHeader, Sheet, TextField } from '../../shared';
import type { RoleCard, RoleChoice } from './api';
import { Icon } from './icons';
import { useRoleCard, useSaveRoles } from './queries';
import { useOnline } from './useOnline';

/** PL: Tekst błędu zapisu ról (6.3b). EN: The text of a role save error (6.3b). */
const SAVE_ERROR = 'Nie udało się zapisać ról. Spróbuj ponownie za chwilę.';

/**
 * PL: Stan przekazany z wyszukiwania: adres wpisany przez administratora, żeby pokazać go w polu (6.3b).
 * EN: The state passed from the search: the address the administrator typed, to show it in the field (6.3b).
 */
type CardState = { email?: string } | null;

/**
 * PL: Ekran karty roli. Dane ładuje z serwera, a dopóki ich nie ma, pokazuje tylko pasek z tytułem.
 * EN: The role card screen. It loads the data from the server, and until then shows only the bar with the title.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function RoleCardScreen() {
  const { studentId = '' } = useParams();
  const card = useRoleCard(studentId);
  if (!card.data) {
    return (
      <main className="ad-screen" data-subtrack="8">
        <ScreenHeader title="Role" backTo="/admin/role" backLabel="Role" />
      </main>
    );
  }
  return <RoleCardBody card={card.data} studentId={studentId} />;
}

/**
 * PL: Rysuje kartę jednej osoby: pole z adresem, kafel z osobą, przełączniki ról i przycisk zapisu.
 * EN: Draws one person's card: the address field, the person tile, the role switches and the save button.
 *
 * @param props - PL: karta z serwera i identyfikator ucznia. EN: the card from the server and the student's id.
 * @returns PL: drzewo elementów karty. EN: the tree of the card elements.
 */
function RoleCardBody({ card, studentId }: { card: RoleCard; studentId: string }) {
  const online = useOnline();
  const email = (useLocation().state as CardState)?.email;
  const draft = useRoleDraft(card, studentId);
  return (
    <main className="ad-screen" data-subtrack="8">
      <ScreenHeader title="Role" backTo="/admin/role" backLabel="Role" />
      <PersonFields card={card} email={email} />
      <RoleSwitches card={card} shown={draft.shown} onToggle={draft.onToggle} />
      <p className="ad-note">
        <Icon name="lock" />
        Roli administratora nie nadaje się tutaj.
      </p>
      <SaveBar failed={draft.save.isError} disabled={!draft.changed || !online || draft.save.isPending} onSave={draft.onSave} />
      <RevokeSheet open={draft.askRevoke} firstName={card.firstName} onCancel={() => draft.setAskRevoke(false)} onConfirm={draft.confirmRevoke} />
    </main>
  );
}

/**
 * PL: Trzyma wybór przełączników, który jeszcze nie jest zapisany. Przy odebraniu Samorządu pyta o potwierdzenie, a zapis wysyła tylko dwa pola ról.
 * EN: Holds the switch choice that is not saved yet. When the Samorząd role is taken away it asks for confirmation, and the save sends only the two role fields.
 *
 * @param card - PL: karta z serwera. EN: the card from the server.
 * @param studentId - PL: identyfikator ucznia do zapisu. EN: the student's id for the save.
 * @returns PL: stan przełączników i ich obsługa. EN: the state of the switches and their handlers.
 */
function useRoleDraft(card: RoleCard, studentId: string) {
  const save = useSaveRoles(studentId);
  // PL: Wybór z przełączników; null znaczy, że nic nie zmieniono.
  // EN: The choice from the switches; null means nothing has changed.
  const [draft, setDraft] = useState<RoleChoice | null>(null);
  const [askRevoke, setAskRevoke] = useState(false);
  // PL: Zapisany stan bez pól osoby, bo tylko te dwa pola idą do zapisu.
  // EN: The saved state without the person's fields, because only these two fields are sent on save.
  const saved: RoleChoice = { council: card.council, editor: card.editor };
  const shown: RoleChoice = draft ?? saved;
  const changed = shown.council !== saved.council || shown.editor !== saved.editor;

  function onToggle(role: keyof RoleChoice, next: boolean) {
    // PL: Odebranie Samorządu najpierw pyta o potwierdzenie (6.3c). Nadanie nie wymaga potwierdzenia.
    // EN: Taking away the Samorząd role asks for confirmation first (6.3c). Granting it needs no confirmation.
    if (role === 'council' && !next && card.council) {
      setAskRevoke(true);
      return;
    }
    setDraft({ ...shown, [role]: next });
  }

  function onSave() {
    save.mutate(shown, { onSuccess: () => setDraft(null) });
  }

  function confirmRevoke() {
    setDraft({ ...shown, council: false });
    setAskRevoke(false);
  }

  return { save, shown, changed, askRevoke, setAskRevoke, onToggle, onSave, confirmRevoke };
}

/**
 * PL: Pola osoby na karcie: adres wpisany w wyszukiwaniu (gdy jest, tylko do odczytu) i kafel z imieniem oraz zamaskowanym adresem.
 * EN: The person's fields on the card: the address typed in the search (when there is one, read-only) and the tile with the first name and the masked address.
 *
 * @param props - PL: karta z serwera i adres z wyszukiwania. EN: the card from the server and the address from the search.
 * @returns PL: elementy nagłówka karty. EN: the card header elements.
 */
function PersonFields({ card, email }: { card: RoleCard; email?: string }) {
  return (
    <>
      {email ? (
        <ListGroup>
          <TextField label="Szkolny e-mail" type="email" value={email} readOnly />
        </ListGroup>
      ) : null}
      <div className="ad-person">
        <span className="ad-avatar ad-avatar-big">{card.firstName.charAt(0).toUpperCase()}</span>
        <div>
          <h2>{card.firstName}</h2>
          <small>{card.maskedEmail}</small>
        </div>
      </div>
    </>
  );
}

/**
 * PL: Grupa dwóch przełączników ról: Samorząd i redakcja gazetki.
 * EN: The group of the two role switches: the Samorząd and the editorial team.
 *
 * @param props - PL: karta z zapisanym stanem, wybór do pokazania i obsługa przełączenia. EN: the card with the saved state, the choice to show and the toggle handler.
 * @returns PL: grupa przełączników. EN: the group of switches.
 */
function RoleSwitches({ card, shown, onToggle }: { card: RoleCard; shown: RoleChoice; onToggle: (role: keyof RoleChoice, next: boolean) => void }) {
  return (
    <ListGroup>
      <SwitchRow
        title="Samorząd"
        hint="Zgłoszenia, ankiety, kody zaproszeń i wpisy."
        checked={shown.council}
        changed={shown.council !== card.council}
        onToggle={(next) => onToggle('council', next)}
      />
      <SwitchRow
        title="Redakcja gazetki"
        hint="Tylko wpisy."
        checked={shown.editor}
        changed={shown.editor !== card.editor}
        onToggle={(next) => onToggle('editor', next)}
      />
    </ListGroup>
  );
}

/**
 * PL: Dolny pasek karty: komunikat o błędzie zapisu (gdy jest) i przycisk „Zapisz role”.
 * EN: The bottom bar of the card: the save error message (when there is one) and the "Zapisz role" button.
 *
 * @param props - PL: czy zapis się nie udał, czy przycisk ma być nieaktywny i obsługa zapisu. EN: whether the save failed, whether the button is disabled and the save handler.
 * @returns PL: pasek z przyciskiem. EN: the bar with the button.
 */
function SaveBar({ failed, disabled, onSave }: { failed: boolean; disabled: boolean; onSave: () => void }) {
  return (
    <div className="ad-bottom">
      {failed ? (
        <p className="ad-error" role="alert">
          <Icon name="triangle-alert" />
          {SAVE_ERROR}
        </p>
      ) : null}
      <Button disabled={disabled} onClick={onSave}>
        <Icon name="check" />
        Zapisz role
      </Button>
    </div>
  );
}

/**
 * PL: Jeden wiersz z przełącznikiem roli (`role="switch"`) w części wartości. Znacznik „Zmiana” stoi przy tytule, gdy stan różni się od zapisanego.
 * EN: One row with a role switch (`role="switch"`) in the value part. The "Zmiana" badge stands by the title when the state differs from the saved one.
 *
 * @param props - PL: tytuł, opis, stan, czy zmieniony i obsługa przełączenia. EN: the title, the description, the state, whether it is changed and the toggle handler.
 * @returns PL: wiersz przełącznika. EN: the switch row.
 */
function SwitchRow({
  title,
  hint,
  checked,
  changed,
  onToggle,
}: {
  title: string;
  hint: string;
  checked: boolean;
  changed: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <ListRow
      title={
        <>
          {title}
          {changed ? (
            <>
              {' '}
              <span className="ad-badge">Zmiana</span>
            </>
          ) : null}
        </>
      }
      subtitle={hint}
      value={
        <button type="button" role="switch" aria-checked={checked} aria-label={title} className="ad-switch" onClick={() => onToggle(!checked)}>
          <span className="ad-switch-knob" />
        </button>
      }
    />
  );
}

/**
 * PL: Arkusz potwierdzenia odebrania roli Samorządu (6.3c). „Odbierz rolę” zmienia tylko wybór, zapis dopiero przyciskiem na dole. „Anuluj” zamyka arkusz bez zmiany.
 * EN: The confirmation sheet for taking away the Samorząd role (6.3c). "Odbierz rolę" changes only the choice, saving happens only with the button at the bottom. "Anuluj" closes the sheet without a change.
 *
 * @param props - PL: czy arkusz jest otwarty, imię osoby i obsługa dwóch przycisków. EN: whether the sheet is open, the person's first name and the handlers of the two buttons.
 * @returns PL: arkusz. EN: the sheet.
 */
function RevokeSheet({ open, firstName, onCancel, onConfirm }: { open: boolean; firstName: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Sheet open={open} onClose={onCancel} title="Odebrać rolę Samorządu?">
      <p>{firstName} straci dostęp do zgłoszeń, ankiet i kodów zaproszeń.</p>
      <div className="ad-bottom">
        <Button variant="destructive" onClick={onConfirm}>
          Odbierz rolę
        </Button>
        <Button variant="plain" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </Sheet>
  );
}
