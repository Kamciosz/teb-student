/**
 * PL: Wspólne części ekranów ankiet w panelu (podtor 5b): górny pasek z „Wstecz” (współdzielony ScreenHeader albo przycisk do poprzedniego pytania), notatka z ikoną i komunikat błędu nad przyciskiem. Teksty są z EKRANY.md.
 *     Ekran 6.1d „Tylko dla Samorządu” pokazuje bramka roli podtoru 8 (PanelGate), a nie ten plik.
 * EN: The shared parts of the survey panel screens (subtrack 5b): the top bar with "Wstecz" (the shared ScreenHeader or a button to the previous question), a note with an icon, the error message above the button. Screen 6.1d "no access" is shown by the role gate of subtrack 8 (PanelGate).
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/shared/ui/ScreenHeader.tsx::ScreenHeader
 * @uses src/shared/ui/Button.tsx::Button
 * @uses src/features/surveys/admin/icons.tsx::TriangleAlertIcon
 * @used_by src/features/surveys/admin/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 * @used_by src/features/surveys/admin/ResultsScreen.tsx::ResultsScreen
 */

import type { ReactNode } from 'react';
// PL: Wspólny nagłówek ekranu (pasek z „Wstecz” i tytułem h1).
// EN: The shared screen header (the bar with "Wstecz" and the h1 title).
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
// PL: Wspólny przycisk tekstowy.
// EN: The shared text button.
import { Button } from '../../../shared/ui/Button';
import { TriangleAlertIcon } from './icons';

/** PL: Dane górnego paska: tytuł i dokąd prowadzi „Wstecz” (adres albo funkcja). EN: The top bar data: the title and where "Wstecz" leads (an address or a function). */
type ScreenTopProps = { title: string; backTo?: string; onBack?: () => void };

/**
 * PL: Rysuje górny pasek ekranu: „‹ Wstecz” i tytuł. Z adresem to link do poprzedniego ekranu z jego nazwą: „Panel” albo „Ankiety” (współdzielony nagłówek). Z funkcją to przycisk, np. do poprzedniego pytania, w tym samym pasku.
 * EN: Draws the screen's top bar: "‹ Wstecz" and the title. With an address it is a link to the previous screen with its name: "Panel" or "Ankiety" (the shared header). With a function it is a button, for example to the previous question, in the same bar.
 *
 * @param props - PL: tytuł i cel „Wstecz”. EN: the title and the "Wstecz" target.
 * @returns PL: pasek. EN: the bar.
 */
export function ScreenTop({ title, backTo = '/admin', onBack }: ScreenTopProps) {
  if (onBack === undefined) return <ScreenHeader title={title} backTo={backTo} backLabel={backTo === '/admin' ? 'Panel' : 'Ankiety'} />;
  // PL: Ten sam pasek co w ScreenHeader, ale „Wstecz” jest przyciskiem. EN: The same bar as in ScreenHeader, but "Wstecz" is a button.
  return (
    <header className="ui-screen-header ui-screen-header--bar">
      <button type="button" className="ui-screen-header-back sa-back-button" onClick={onBack}>
        <span aria-hidden="true">‹</span> Wstecz
      </button>
      <h1 className="ui-screen-header-bar-title">{title}</h1>
      <span className="ui-screen-header-action" />
    </header>
  );
}

/**
 * PL: Rysuje notatkę z ikoną, na przykład „Wyniki są zbiorcze. Nie widać, kto co wybrał.”.
 * EN: Draws a note with an icon, for example "Wyniki są zbiorcze. Nie widać, kto co wybrał.".
 *
 * @param props - PL: ikona i tekst. EN: the icon and the text.
 * @returns PL: notatka. EN: the note.
 */
export function PanelNote({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <p className="sa-note">
      {icon}
      <span>{text}</span>
    </p>
  );
}

/**
 * PL: Rysuje komunikat błędu (element „Komunikat” z EKRANY.md): ikona ostrzeżenia i tekst, bez koloru błędu. Z przyciskiem „Spróbuj ponownie”, gdy podano funkcję ponowienia.
 * EN: Draws an error message (the "Komunikat" element from EKRANY.md): a warning icon and text, without an error color. With a "Spróbuj ponownie" button when a retry function is given.
 *
 * @param props - PL: tekst błędu i opcjonalne ponowienie. EN: the error text and the optional retry.
 * @returns PL: komunikat. EN: the message.
 */
export function ErrorMessage({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="sa-message" role="alert">
      <p className="sa-message__text">
        <TriangleAlertIcon size={20} />
        <span>{text}</span>
      </p>
      {onRetry === undefined ? null : <Button variant="plain" onClick={onRetry}>Spróbuj ponownie</Button>}
    </div>
  );
}
