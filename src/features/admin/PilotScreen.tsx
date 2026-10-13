/**
 * PL: Ekran „Dane z pilotażu” (6.1e w docs/projekt/EKRANY.md): jeden przycisk pobiera plik CSV z trzema liczbami, bez imion, nazwisk i adresów. Bez internetu przycisk jest nieaktywny z napisem o internecie.
 * EN: The "Dane z pilotażu" screen (6.1e in docs/projekt/EKRANY.md): one button downloads a CSV file with three numbers, with no names and no addresses. Without internet the button is disabled with the internet text.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/admin/queries.ts::usePilotDownload
 * @uses src/features/admin/useOnline.ts::useOnline
 * @uses src/features/admin/icons.tsx::Icon
 * @uses src/features/admin/ScreenTop.tsx::ScreenTop
 * @used_by src/features/admin/AdminScreen.tsx::AdminScreen
 */

import { Icon } from './icons';
import { usePilotDownload } from './queries';
import { ScreenTop } from './ScreenTop';
import { useOnline } from './useOnline';

/**
 * PL: Rysuje ekran pobrania danych z pilotażu: opis pliku, lista trzech liczb i przycisk „Pobierz plik”.
 * EN: Draws the pilot data download screen: the file description, the list of three numbers and the "Pobierz plik" button.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function PilotScreen() {
  const online = useOnline();
  const download = usePilotDownload();
  return (
    <main className="ad-screen" data-subtrack="8">
      <ScreenTop title="Dane z pilotażu" backTo="/admin" backLabel="Wróć do panelu" />
      <PilotContents />
      <div className="ad-bottom">
        {download.isError ? (
          <p className="ad-error" role="alert">
            <Icon name="triangle-alert" />
            Nie udało się przygotować pliku. Spróbuj ponownie za chwilę.
          </p>
        ) : null}
        {online ? null : <p className="ad-hint">Pobranie wymaga internetu.</p>}
        <button type="button" className="ad-btn ad-btn-accent" disabled={!online || download.isPending} onClick={() => download.mutate()}>
          <Icon name="download" />
          Pobierz plik
        </button>
      </div>
    </main>
  );
}

/**
 * PL: Opis pliku: nagłówek, zdanie o zawartości, lista trzech liczb i uwaga o ankietach.
 * EN: The file description: the heading, the sentence about the contents, the list of three numbers and the note about the surveys.
 *
 * @returns PL: elementy opisu pliku. EN: the file description elements.
 */
function PilotContents() {
  return (
    <>
      <h1 className="ad-h1">Liczby z pilotażu</h1>
      <p className="ad-lead">Plik z trzema liczbami do wniosków. Nie ma w nim imion, nazwisk ani adresów.</p>
      <span className="ad-label ad-label-below">W pliku</span>
      <ul className="ad-tile">
        <li className="ad-row">
          <Icon name="log-in" />
          <span>Ile osób się zalogowało</span>
        </li>
        <li className="ad-row">
          <Icon name="clipboard-list" />
          <span>Ile zgłoszeń wpłynęło</span>
        </li>
        <li className="ad-row">
          <Icon name="chart-column" />
          <span>Ile odpowiedzi dały ankiety</span>
        </li>
      </ul>
      <p className="ad-note">
        <Icon name="lock" />
        Odpowiedzi z ankiet są tylko policzone. Nie widać, kto co wybrał.
      </p>
    </>
  );
}
