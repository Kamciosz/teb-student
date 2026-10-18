/**
 * PL: Przycisk „Kopiuj kod” z ekranu 6.2b w docs/projekt/EKRANY.md: kopiuje kod do schowka, a przez 3 sekundy pokazuje „Skopiowano” z ptaszkiem. Wersja kompaktowa (sama ikona 44×44) stoi przy każdym kodzie z listy „Wydane wcześniej”. Gdy przeglądarka nie pozwala na kopiowanie, napis się nie zmienia, a kod nadal da się zaznaczyć na ekranie.
 * EN: The "Kopiuj kod" button from screen 6.2b in docs/projekt/EKRANY.md: it copies the code to the clipboard and for 3 seconds shows "Skopiowano" with a check mark. The compact version (the icon alone, 44 by 44) stands next to each code in the "Wydane wcześniej" list. When the browser does not allow copying, the label does not change, and the code can still be selected on the screen.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/icons.tsx::Icon
 * @uses src/shared/index.ts::Button
 * @used_by src/features/admin/InvitesScreen.tsx::CopyCodeButton
 * @used_by src/features/admin/InviteList.tsx::CopyCodeButton
 */

import { useEffect, useState } from 'react';
// PL: Wspólny przycisk w wariancie tekstowym (pełny) i lokalna ikona kopiowania (kompakt).
// EN: The shared button in the text variant (full) and the local copy icon (compact).
import { Button } from '../../shared';
import { Icon } from './icons';

/** PL: Jak długo (ms) po skopiowaniu stoi napis „Skopiowano”, zgodnie z opisem w ekranie 6.2b. EN: How long (ms) the "Skopiowano" label stays after copying, as the screen 6.2b describes. */
const COPIED_MS = 3000;

/**
 * PL: Rysuje przycisk kopiowania kodu. Wersja kompaktowa nie ma napisu, więc dostaje nazwę dla czytnika ekranu z kodem.
 * EN: Draws the code copy button. The compact version has no label, so it gets a name for the screen reader with the code.
 *
 * @param props - PL: kod do skopiowania i wersja kompaktowa. EN: the code to copy and the compact version.
 * @returns PL: element przycisku. EN: the button element.
 */
export function CopyCodeButton({ code, compact = false }: { code: string; compact?: boolean }) {
  const [isCopied, setIsCopied] = useState(false);

  // PL: Po skopiowaniu wróć do napisu „Kopiuj kod” po 3 sekundach. Sprzątanie zatrzymuje licznik przy zmianie ekranu.
  // EN: After copying go back to the "Kopiuj kod" label after 3 seconds. The cleanup stops the timer when the screen changes.
  useEffect(() => {
    if (!isCopied) return undefined;
    const timer = setTimeout(() => setIsCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [isCopied]);

  /** PL: Kopiuje kod do schowka; przy odmowie przeglądarki nic nie zmienia. EN: Copies the code to the clipboard; on a browser refusal it changes nothing. */
  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
    } catch {
      // PL: Schowek niedostępny (na przykład brak zgody): kod zostaje na ekranie do zaznaczenia.
      // EN: The clipboard is unavailable (for example no permission): the code stays on the screen to be selected.
    }
  }

  const iconName = isCopied ? 'check' : 'copy';
  // PL: Kompaktowy przycisk ma nazwę z kodem, a pełny ma napis na przycisku.
  // EN: The compact button is named with the code, and the full one has its label on the button.
  if (compact) {
    return (
      <button type="button" className="ad-btn-icon" aria-label={`Kopiuj kod ${code}`} onClick={handleCopy}>
        <Icon name={iconName} />
      </button>
    );
  }
  return (
    <Button variant="plain" onClick={handleCopy}>
      <Icon name={iconName} />
      {isCopied ? 'Skopiowano' : 'Kopiuj kod'}
    </Button>
  );
}
