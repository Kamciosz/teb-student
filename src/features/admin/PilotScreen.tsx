/**
 * PL: Ekran „Dane z pilotażu” (6.1e w docs/projekt/EKRANY.md): jeden przycisk pobiera plik CSV z trzema liczbami, bez imion, nazwisk i adresów. Bez internetu przycisk jest nieaktywny z napisem o internecie.
 * EN: The "Dane z pilotażu" screen (6.1e in docs/projekt/EKRANY.md): one button downloads a CSV file with three numbers, with no names and no addresses. Without internet the button is disabled with the internet text.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/admin/queries.ts::usePilotDownload
 * @uses src/features/admin/useOnline.ts::useOnline
 * @uses src/features/admin/icons.tsx::Icon
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/shared/index.ts::Button
 * @used_by src/features/admin/AdminScreen.tsx::AdminScreen
 */

// PL: Wspólne elementy ekranu: nagłówek, grupa wierszy, wiersz i przycisk.
// EN: The shared screen elements: the header, the group of rows, the row and the button.
import { Button, ListGroup, ListRow, ScreenHeader } from '../../shared';
import { Icon } from './icons';
import { usePilotDownload } from './queries';
import { useOnline } from './useOnline';

/**
 * PL: Rysuje ekran pobrania danych z pilotażu: opis pliku, grupa trzech liczb i przycisk „Pobierz plik”.
 * EN: Draws the pilot data download screen: the file description, the group of three numbers and the "Pobierz plik" button.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function PilotScreen() {
  const online = useOnline();
  const download = usePilotDownload();
  return (
    <main className="ad-screen" data-subtrack="8">
      <ScreenHeader title="Dane z pilotażu" backTo="/admin" backLabel="Wróć do panelu" />
      <PilotContents />
      {/* PL: Dół ekranu: błąd lub napis o internecie nad przyciskiem. EN: The bottom of the screen: the error or the internet text above the button. */}
      <div className="ad-bottom">
        {download.isError ? (
          <p className="ad-error" role="alert">
            <Icon name="triangle-alert" />
            Nie udało się przygotować pliku. Spróbuj ponownie za chwilę.
          </p>
        ) : null}
        {online ? null : <p className="ad-hint">Pobranie wymaga internetu.</p>}
        <Button disabled={!online || download.isPending} onClick={() => download.mutate()}>
          <Icon name="download" />
          Pobierz plik
        </Button>
      </div>
    </main>
  );
}

/**
 * PL: Opis pliku: nagłówek, zdanie o zawartości, grupa trzech liczb i przypis o ankietach.
 * EN: The file description: the heading, the sentence about the contents, the group of three numbers and the footnote about the surveys.
 *
 * @returns PL: elementy opisu pliku. EN: the file description elements.
 */
function PilotContents() {
  return (
    <>
      <h2 className="ad-h1">Liczby z pilotażu</h2>
      <p className="ad-lead">Plik z trzema liczbami do wniosków. Nie ma w nim imion, nazwisk ani adresów.</p>
      <ListGroup header="W pliku" footer="Odpowiedzi z ankiet są tylko policzone. Nie widać, kto co wybrał.">
        <ListRow icon={<Icon name="log-in" />} title="Ile osób się zalogowało" />
        <ListRow icon={<Icon name="clipboard-list" />} title="Ile zgłoszeń wpłynęło" />
        <ListRow icon={<Icon name="chart-column" />} title="Ile odpowiedzi dały ankiety" />
      </ListGroup>
    </>
  );
}
