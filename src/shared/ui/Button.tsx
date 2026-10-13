/**
 * PL: Przycisk aplikacji: główny (akcent szkoły), miękki i z obwódką. Wysokość co najmniej 48 px, żeby dało się go trafić palcem. Wyłączony przycisk nie reaguje i jest przygaszony.
 * EN: The app button: primary (school accent), soft and outlined. At least 48 px high, so a finger can hit it. A disabled button does not react and looks faded.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Button.css::.ui-button
 * @used_by src/shared/index.ts::Button
 */

// PL: Typy właściwości przycisku z Reacta.
// EN: The React button property types.
import type { ComponentProps } from 'react';
// PL: Style przycisku.
// EN: The button styles.
import './Button.css';

/**
 * PL: Wygląd przycisku: „accent” główny, „soft” miękki, „outline” z obwódką.
 * EN: The button look: "accent" primary, "soft" soft, "outline" with an outline.
 */
export type ButtonVariant = 'accent' | 'soft' | 'outline';

/**
 * PL: Właściwości przycisku: wszystko, co ma zwykły przycisk, plus wygląd.
 * EN: Button properties: everything a plain button has, plus the look.
 */
export type ButtonProps = ComponentProps<'button'> & {
  /** PL: Wygląd przycisku, domyślnie główny. EN: The button look, primary by default. */
  variant?: ButtonVariant;
};

/**
 * PL: Rysuje przycisk. Typ „button” jest domyślny, więc przycisk w formularzu nie wysyła go przypadkiem.
 * EN: Draws the button. The "button" type is the default, so a button in a form does not submit it by accident.
 *
 * @param props - PL: wygląd i zwykłe właściwości przycisku. EN: the look and the usual button properties.
 * @returns PL: przycisk. EN: the button.
 */
export function Button({ variant = 'accent', className, type = 'button', ...rest }: ButtonProps) {
  // PL: Połącz klasę bazową, klasę wyglądu i klasę od wywołującego.
  // EN: Join the base class, the look class and the caller's class.
  const classes = ['ui-button', `ui-button--${variant}`, className].filter(Boolean).join(' ');

  // PL: Zwróć przycisk. Wyłączenie idzie przez właściwość disabled, którą przeglądarka i czytnik ekranu znają.
  // EN: Return the button. Disabling goes through the disabled property, which the browser and the screen reader know.
  return <button type={type} className={classes} {...rest} />;
}
