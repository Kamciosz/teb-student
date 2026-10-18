/**
 * PL: Sekcja „Face ID i odcisk palca” w ustawieniach: grupa z nagłówkiem, lista kluczy z nazwą, datą i „Usuń” przy każdym kluczu oraz przycisk dodania. Bez WebAuthn grupa ma tylko zdanie w stopce, bez przycisku. Komponent tylko rysuje; logikę ma usePasskeys.
 * EN: The "Face ID i odcisk palca" (Face ID and fingerprint) section in the settings: a group with a header, a list of keys with name, date and "Usuń" (delete) on each key, and the add button. Without WebAuthn the group has only a sentence in its footer, with no button. The component only draws; the logic is in usePasskeys.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::ListGroup
 * @uses src/features/profile/usePasskeys.ts::usePasskeys
 * @uses src/features/profile/passkeyApi.ts::isPasskeySupported
 * @uses src/features/profile/passkeyApi.ts::PASSKEY_UNSUPPORTED_MESSAGE
 * @used_by src/features/profile/SettingsScreen.tsx::SettingsScreen
 */
import { Button, ListGroup } from '../../shared';
import { isPasskeySupported, PASSKEY_UNSUPPORTED_MESSAGE, type PasskeyItem } from './passkeyApi';
import { usePasskeys } from './usePasskeys';

// PL: Data w polskim zapisie i czasie warszawskim, tak jak w reszcie aplikacji.
// EN: The date in the Polish format and Warsaw time, as in the rest of the app.
const DATE_FORMAT = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeZone: 'Europe/Warsaw' });

/**
 * PL: Zamienia datę dodania na tekst po polsku.
 * EN: Turns the date of adding into text in Polish.
 *
 * @param iso - PL: data z serwera albo null. EN: the date from the server, or null.
 * @returns PL: data albo „bez daty”. EN: the date, or "bez daty" (no date).
 */
function formatDate(iso: string | null): string {
  return iso ? DATE_FORMAT.format(new Date(iso)) : 'bez daty';
}

/**
 * PL: Cała sekcja. Bez WebAuthn grupa ma tylko zdanie w stopce, a pusty blok z przyciskami jest ukryty w CSS.
 * EN: The whole section. Without WebAuthn the group has only a sentence in its footer, and the empty block with the buttons is hidden in CSS.
 *
 * @returns PL: sekcja ustawień. EN: the settings section.
 */
export function PasskeySection() {
  if (!isPasskeySupported()) {
    return (
      <div className="pf-passkeys">
        <ListGroup header="Face ID i odcisk palca" footer={PASSKEY_UNSUPPORTED_MESSAGE}>{null}</ListGroup>
      </div>
    );
  }
  return <PasskeyList />;
}

/**
 * PL: Lista kluczy z przyciskiem dodania i komunikatami.
 * EN: The list of keys with the add button and the messages.
 *
 * @returns PL: grupa z listą i przyciskiem. EN: the group with the list and the button.
 */
function PasskeyList() {
  const { loading, items, listError, message, busy, add, remove } = usePasskeys();
  // PL: Pusta lista bez błędu i bez ładowania: podpowiedź idzie do stopki grupy.
  // EN: An empty list with no error and no loading: the hint goes to the group footer.
  const empty = !loading && !listError && items.length === 0;
  return (
    <div className="pf-passkeys">
      <ListGroup
        header="Face ID i odcisk palca"
        footer={empty ? 'Nie masz jeszcze klucza. Dodaj Face ID albo odcisk palca, żeby logować się szybciej.' : undefined}
      >
        {loading ? <p className="pf-hint" role="status">Ładowanie kluczy…</p> : null}
        {listError ? <p className="pf-error" role="alert">{listError}</p> : null}
        {items.length > 0 ? (
          <ul className="pf-keys">
            {items.map((item) => (
              <PasskeyRow key={item.id} item={item} disabled={busy} onRemove={() => remove(item.id)} />
            ))}
          </ul>
        ) : null}
        <Button variant="plain" disabled={busy} onClick={() => add()}>
          Dodaj Face ID lub odcisk palca
        </Button>
        {message ? <p className="pf-error" role="alert">{message}</p> : null}
      </ListGroup>
    </div>
  );
}

/**
 * PL: Jeden klucz na liście: nazwa, data dodania i przycisk „Usuń”.
 * EN: One key on the list: the name, the date of adding and the "Usuń" (delete) button.
 *
 * @param props - PL: klucz, czy przyciski są zablokowane i akcja usunięcia. EN: the key, whether the buttons are disabled, and the delete action.
 * @returns PL: wiersz listy. EN: the list row.
 */
function PasskeyRow({ item, disabled, onRemove }: { item: PasskeyItem; disabled: boolean; onRemove: () => void }) {
  const name = item.name ?? 'Klucz bez nazwy';
  return (
    <li className="ui-list-row pf-key-row">
      <span className="pf-row-text">
        {name}
        <small>Dodano {formatDate(item.createdAt)}</small>
      </span>
      <Button variant="destructive" disabled={disabled} onClick={onRemove} aria-label={`Usuń klucz: ${name}`}>
        Usuń
      </Button>
    </li>
  );
}
