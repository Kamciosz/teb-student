/**
 * PL: Żeton wyboru (chip), np. filtr kategorii albo wybór odpowiedzi. To zwykły przycisk z atrybutem aria-pressed, więc czytnik mówi, czy jest włączony, a klawisz Enter i Spacja działają bez dodatkowego kodu.
 * EN: A choice chip, for example a category filter or an answer choice. It is a plain button with the aria-pressed attribute, so the screen reader says whether it is on, and the Enter and Space keys work without extra code.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Chip.css::.ui-chip
 * @used_by src/shared/index.ts::Chip
 */

// PL: Typy właściwości przycisku z Reacta.
// EN: The React button property types.
import type { ComponentProps } from 'react';
// PL: Style żetonu.
// EN: The chip styles.
import './Chip.css';

/**
 * PL: Właściwości żetonu: zwykły przycisk plus stan włączenia.
 * EN: Chip properties: a plain button plus the on or off state.
 */
export type ChipProps = Omit<ComponentProps<'button'>, 'type' | 'aria-pressed'> & {
  /** PL: Czy żeton jest włączony (wybrany). EN: Whether the chip is on (chosen). */
  selected: boolean;
};

/**
 * PL: Rysuje żeton. Stan wybrania idzie do aria-pressed i do wyglądu, więc ekran i czytnik pokazują to samo.
 * EN: Draws the chip. The chosen state goes to aria-pressed and to the look, so the screen and the screen reader show the same thing.
 *
 * @param props - PL: stan i zwykłe właściwości przycisku. EN: the state and the usual button properties.
 * @returns PL: żeton. EN: the chip.
 */
export function Chip({ selected, className, children, ...rest }: ChipProps) {
  // PL: Połącz klasę bazową z klasą od wywołującego.
  // EN: Join the base class with the caller's class.
  const classes = ['ui-chip', className].filter(Boolean).join(' ');

  // PL: Zwróć przycisk z aria-pressed. Typ „button” zapobiega wysłaniu formularza.
  // EN: Return the button with aria-pressed. The "button" type prevents submitting a form.
  return (
    <button type="button" className={classes} aria-pressed={selected} {...rest}>
      {children}
    </button>
  );
}
