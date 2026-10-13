/**
 * PL: Znacznik (badge), mała etykieta stanu, np. „nowe” albo liczba nieprzeczytanych. Sam nie jest interaktywny i nie ma stanu wyłączenia. Kolor zależy od tonu, a tekst nosi znaczenie, więc kolor nie jest jedynym nośnikiem.
 * EN: A badge, a small status label, for example "new" or a count of unread items. It is not interactive and has no disabled state. The color depends on the tone, and the text carries the meaning, so color is not the only carrier.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Badge.css::.ui-badge
 * @used_by src/shared/index.ts::Badge
 */

// PL: Typy właściwości elementu span z Reacta.
// EN: The React span property types.
import type { ComponentProps } from 'react';
// PL: Style znacznika.
// EN: The badge styles.
import './Badge.css';

/**
 * PL: Ton znacznika: „neutral” szary, „accent” w kolorze akcentu szkoły.
 * EN: The badge tone: "neutral" gray, "accent" in the school accent color.
 */
export type BadgeTone = 'neutral' | 'accent';

/**
 * PL: Właściwości znacznika: zwykły span plus ton.
 * EN: Badge properties: a plain span plus the tone.
 */
export type BadgeProps = ComponentProps<'span'> & {
  /** PL: Ton, domyślnie neutralny. EN: The tone, neutral by default. */
  tone?: BadgeTone;
};

/**
 * PL: Rysuje znacznik. Ton idzie do atrybutu data-tone, więc CSS i testy czytają to samo.
 * EN: Draws the badge. The tone goes to the data-tone attribute, so the CSS and the tests read the same thing.
 *
 * @param props - PL: ton i zwykłe właściwości span. EN: the tone and the usual span properties.
 * @returns PL: znacznik. EN: the badge.
 */
export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  // PL: Połącz klasę bazową z klasą od wywołującego.
  // EN: Join the base class with the caller's class.
  const classes = ['ui-badge', className].filter(Boolean).join(' ');

  return <span className={classes} data-tone={tone} {...rest} />;
}
