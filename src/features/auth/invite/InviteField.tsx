/**
 * PL: Pole formularza kodu zaproszenia: etykieta nad polem tekstowym, jak „Pole tekstowe” w docs/projekt/EKRANY.md. Pole ma 56 px wysokości i 16 px tekstu, żeby iPhone nie powiększał strony.
 * EN: A field of the invitation code form: a label above a text input, like "Pole tekstowe" in docs/projekt/EKRANY.md. The field is 56 px tall with 16 px text, so the iPhone does not zoom the page.
 *
 * @author Szymon
 * @since 2026-10-11
 * @used_by src/features/auth/invite/SignUpForm.tsx::InviteField
 * @used_by src/features/auth/invite/SignInForm.tsx::InviteField
 */

import type { InputHTMLAttributes } from 'react';

/**
 * PL: Dane pola: etykieta, wartość i funkcja zmiany oraz zwykłe atrybuty pola (typ, podpowiedź przeglądarki).
 * EN: The field data: the label, the value and the change function, plus plain input attributes (type, browser hint).
 */
export type InviteFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  /** PL: Napis nad polem. EN: The text above the field. */
  label: string;
  /** PL: Wpisany tekst. EN: The typed text. */
  value: string;
  /** PL: Wywoływane przy każdej zmianie tekstu. EN: Called on every change of the text. */
  onChange: (value: string) => void;
};

/**
 * PL: Rysuje etykietę i pole. Numer pola bierze z atrybutu name, więc etykieta jest z nim związana (czytnik ekranu i test znajdują pole po etykiecie).
 * EN: Draws the label and the field. The field id comes from the name attribute, so the label is tied to it (a screen reader and a test find the field by its label).
 *
 * @param props - PL: etykieta, wartość, zmiana i atrybuty pola. EN: the label, the value, the change and the field attributes.
 * @returns PL: etykieta i pole. EN: the label and the field.
 */
export function InviteField({ label, value, onChange, ...input }: InviteFieldProps) {
  const id = `auth-invite-${input.name}`;
  return (
    <>
      <label className="auth-invite__label" htmlFor={id}>{label}</label>
      <input
        {...input}
        id={id}
        className="auth-invite__input"
        autoCapitalize={input.autoCapitalize ?? 'none'}
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </>
  );
}
