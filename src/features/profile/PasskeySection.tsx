/**
 * PL: Sekcja „Face ID i odcisk palca” w ustawieniach: przycisk dodania klucza, lista z nazwą i datą oraz „Usuń” przy każdym kluczu. Bez WebAuthn zostaje jedno zdanie, bez przycisku. Komponent tylko rysuje; logikę ma usePasskeys.
 * EN: The "Face ID i odcisk palca" (Face ID and fingerprint) section in the settings: an add-key button, a list with name and date, and "Usuń" (delete) on each key. Without WebAuthn one sentence stays, with no button. The component only draws; the logic is in usePasskeys.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/profile/usePasskeys.ts::usePasskeys
 * @uses src/features/profile/passkeyApi.ts::isPasskeySupported
 * @uses src/features/profile/passkeyApi.ts::PASSKEY_UNSUPPORTED_MESSAGE
 * @used_by src/features/profile/SettingsScreen.tsx::SettingsScreen
 */
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
 * PL: Cała sekcja. Bez WebAuthn pokazuje tylko zdanie.
 * EN: The whole section. Without WebAuthn it shows only a sentence.
 *
 * @returns PL: sekcja ustawień. EN: the settings section.
 */
export function PasskeySection() {
  return (
    <fieldset className="pf-group">
      <legend>Face ID i odcisk palca</legend>
      {isPasskeySupported() ? <PasskeyList /> : <p className="pf-hint">{PASSKEY_UNSUPPORTED_MESSAGE}</p>}
    </fieldset>
  );
}

/**
 * PL: Lista kluczy z przyciskiem dodania i komunikatami.
 * EN: The list of keys with the add button and the messages.
 *
 * @returns PL: lista i przycisk. EN: the list and the button.
 */
function PasskeyList() {
  const { loading, items, listError, message, busy, add, remove } = usePasskeys();
  return (
    <>
      {loading ? <p className="pf-hint" role="status">Ładowanie kluczy…</p> : null}
      {listError ? <p className="pf-error" role="alert">{listError}</p> : null}
      {items.length > 0 ? (
        <ul className="pf-tile">
          {items.map((item) => (
            <PasskeyRow key={item.id} item={item} disabled={busy} onRemove={() => remove(item.id)} />
          ))}
        </ul>
      ) : null}
      {!loading && !listError && items.length === 0 ? (
        <p className="pf-hint">Nie masz jeszcze klucza. Dodaj Face ID albo odcisk palca, żeby logować się szybciej.</p>
      ) : null}
      <button type="button" className="pf-btn pf-btn-soft" disabled={busy} onClick={() => add()}>
        Dodaj Face ID lub odcisk palca
      </button>
      {message ? <p className="pf-error" role="alert">{message}</p> : null}
    </>
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
    <li className="pf-row">
      <span className="pf-row-text">
        {name}
        <small>Dodano {formatDate(item.createdAt)}</small>
      </span>
      <button type="button" className="pf-btn pf-btn-soft pf-passkey-delete" disabled={disabled} onClick={onRemove} aria-label={`Usuń klucz: ${name}`}>
        Usuń
      </button>
    </li>
  );
}
