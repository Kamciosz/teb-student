/**
 * PL: Wspólne części ekranów ankiet w panelu (podtor 5b): górny pasek z „Wstecz”, notatka z ikoną i komunikat błędu nad przyciskiem. Teksty są z EKRANY.md.
 *     Ekran 6.1d „Tylko dla Samorządu” pokazuje bramka roli podtoru 8 (PanelGate), a nie ten plik.
 * EN: The shared parts of the survey panel screens (subtrack 5b): the top bar with "Wstecz", a note with an icon, the error message above the button. Screen 6.1d "no access" is shown by the role gate of subtrack 8 (PanelGate).
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/icons.tsx::ArrowLeftIcon
 * @used_by src/features/surveys/admin/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 * @used_by src/features/surveys/admin/ResultsScreen.tsx::ResultsScreen
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeftIcon, TriangleAlertIcon } from './icons';

/** PL: Dane górnego paska: tytuł i dokąd prowadzi „Wstecz” (adres albo funkcja). EN: The top bar data: the title and where "Wstecz" leads (an address or a function). */
type ScreenTopProps = { title: string; backTo?: string; onBack?: () => void };

/**
 * PL: Rysuje górny pasek ekranu: przycisk „Wstecz” i tytuł. „Wstecz” to funkcja (poprzednie pytanie) albo link (poprzedni ekran).
 * EN: Draws the screen's top bar: the "Wstecz" button and the title. "Wstecz" is a function (the previous question) or a link (the previous screen).
 *
 * @param props - PL: tytuł i cel „Wstecz”. EN: the title and the "Wstecz" target.
 * @returns PL: pasek. EN: the bar.
 */
export function ScreenTop({ title, backTo = '/admin', onBack }: ScreenTopProps) {
  return (
    <header className="sa-top">
      {/* PL: Powrót: do poprzedniego pytania (przycisk) albo do poprzedniego ekranu (link). EN: Back: to the previous question (a button) or to the previous screen (a link). */}
      {onBack === undefined ? (
        <Link className="sa-icon-button" to={backTo} aria-label="Wstecz">
          <ArrowLeftIcon />
        </Link>
      ) : (
        <button type="button" className="sa-icon-button" onClick={onBack} aria-label="Wstecz">
          <ArrowLeftIcon />
        </button>
      )}
      <h1 className="sa-top__title">{title}</h1>
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
      {onRetry === undefined ? null : (
        <button type="button" className="sa-button sa-button--outline" onClick={onRetry}>
          Spróbuj ponownie
        </button>
      )}
    </div>
  );
}
