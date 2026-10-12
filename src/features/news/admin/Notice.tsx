/**
 * PL: Element „Komunikat” z przepływu 6: ikona ostrzeżenia i tekst błędu na kaflu. Błędu nie oznaczamy kolorem, tylko ikoną i tekstem.
 * EN: The "Komunikat" element of flow 6: a warning icon and the error text on a tile. We do not mark an error with color, only with an icon and text.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/admin/icons.tsx::Icon
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::Notice
 */

import { Icon } from './icons';

/**
 * PL: Rysuje komunikat błędu. `role="alert"` sprawia, że czytnik ekranu ogłasza go od razu.
 * EN: Draws an error message. `role="alert"` makes a screen reader announce it at once.
 *
 * @param props - PL: tekst błędu. EN: the error text.
 * @returns PL: element komunikatu. EN: the message element.
 */
export function Notice({ text }: { text: string }) {
  // PL: Ikona i tekst błędu obok siebie.
  // EN: The icon and the error text side by side.
  return (
    <div className="na-notice" role="alert">
      <Icon name="triangle-alert" />
      <span>{text}</span>
    </div>
  );
}
