/**
 * PL: Pole tekstowe z podpisem. Podpis jest połączony z polem (label), a komunikat o błędzie jest opisem pola (aria-describedby), więc czytnik czyta go przy polu. Błąd ustawia aria-invalid.
 * EN: A text field with a label. The label is tied to the field (label), and the error message describes the field (aria-describedby), so the screen reader reads it at the field. An error sets aria-invalid.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/TextField.css::.ui-field
 * @used_by src/shared/index.ts::TextField
 */

// PL: Typy właściwości pola z Reacta i hook do unikalnych numerów.
// EN: The React input property types and the hook for unique ids.
import { useId, type ComponentProps } from 'react';
// PL: Style pola.
// EN: The field styles.
import './TextField.css';

/**
 * PL: Właściwości pola: zwykłe pole tekstowe plus podpis i komunikat o błędzie. Numer (id) nadaje komponent.
 * EN: Field properties: a plain text field plus the label and the error message. The component sets the id.
 */
export type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  /** PL: Podpis nad polem. EN: The label above the field. */
  label: string;
  /** PL: Komunikat o błędzie; gdy jest, pole dostaje aria-invalid. EN: The error message; when set, the field gets aria-invalid. */
  error?: string;
};

/**
 * PL: Rysuje podpis, pole i ewentualny błąd. Pole zawsze ma wysokość 48 px, żeby dało się je trafić palcem.
 * EN: Draws the label, the field and the error, if any. The field is always 48 px high, so a finger can hit it.
 *
 * @param props - PL: podpis, błąd i zwykłe właściwości pola. EN: the label, the error and the usual field properties.
 * @returns PL: blok pola. EN: the field block.
 */
export function TextField({ label, error, className, ...rest }: TextFieldProps) {
  // PL: Jeden numer dla pola i jeden dla komunikatu, żeby podpis i opis wskazywały właściwe elementy.
  // EN: One id for the field and one for the message, so the label and the description point at the right elements.
  const fieldId = useId();
  const errorId = `${fieldId}-blad`;

  // PL: Połącz klasę bazową z klasą od wywołującego.
  // EN: Join the base class with the caller's class.
  const classes = ['ui-field', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {/* PL: Podpis połączony z polem przez htmlFor. EN: The label tied to the field by htmlFor. */}
      <label htmlFor={fieldId}>{label}</label>
      {/* PL: Błąd ustawia aria-invalid i opisuje pole. EN: An error sets aria-invalid and describes the field. */}
      <input id={fieldId} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} {...rest} />
      {error ? (
        <p id={errorId} className="ui-field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
