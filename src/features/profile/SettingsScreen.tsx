/**
 * PL: Ekran „Ustawienia”: zmiana imienia, klasy, szkoły, motywu i większego tekstu. Szkoła wybiera akcent (liceum niebieski, technikum czerwony), a motyw (automatyczny, jasny albo ciemny) zmienia kolory całej aplikacji, a większy tekst powiększa litery w całej aplikacji. Zapis imienia, klasy i szkoły idzie na serwer, a motyw działa od razu i zostaje tylko w tym telefonie. Zapisz pojawia się na dole formularza tylko wtedy, gdy coś się zmieniło. Tekstów tego ekranu nie ma w docs/projekt/EKRANY.md, ale właściciel je zatwierdził.
 * EN: The "Ustawienia" screen: changing the name, class, school, theme and larger text. The school picks the accent (lyceum blue, technical school red), the theme (automatic, light or dark) changes the colors of the whole app, and the larger text enlarges the letters of the whole app. The name, class and school are saved to the server; the theme works at once and stays only on this phone. The Zapisz (save) button appears at the bottom of the form only when something has changed. The texts of this screen are not in docs/projekt/EKRANY.md, but the owner approved them.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::Chip
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/shared/index.ts::TextField
 * @uses src/features/profile/queries.ts::useProfile
 * @uses src/features/profile/queries.ts::useSaveProfile
 * @uses src/features/profile/look.ts::THEMES
 * @uses src/features/profile/look.ts::applyTheme
 * @uses src/features/profile/textSize.ts::TextSize
 * @uses src/features/profile/api.ts::fetchMyData
 * @uses src/features/profile/icons.tsx::Icon
 * @used_by src/features/profile/ProfileScreen.tsx::SettingsScreen
 */

// PL: useState trzyma wpisywane wartości do czasu zapisu; useRef blokuje podwójne kliknięcie pobrania.
// EN: useState keeps the typed values until the save; useRef blocks a double click on the download.
import { useRef, useState, type FormEvent } from 'react';
// PL: Dane, wygląd i ikony.
// EN: The data, the look and the icons.
import { EXPORT_FILE_NAME, fetchMyData, type Profile } from './api';
import { Icon } from './icons';
import { SCHOOLS, THEMES, applyTheme, currentLook, type Theme } from './look';
import { useProfile, useSaveProfile } from './queries';
import type { TextSize } from './textSize';
// PL: Wspólne klocki wyglądu: nagłówek, grupy, wiersze, pola, wybory i przyciski.
// EN: The shared look blocks: the header, the groups, the rows, the fields, the choices and the buttons.
import { Button, Chip, ListGroup, ListRow, ScreenHeader, TextField } from '../../shared';
import { PasskeySection } from './PasskeySection';

/** PL: Najwięcej znaków w imieniu i klasie, takie same jak na serwerze (worker/profile/validation.ts). EN: The most characters in the name and class, the same as on the server (worker/profile/validation.ts). */
const MAX_NAME_LENGTH = 40;
const MAX_CLASS_LENGTH = 10;

/**
 * PL: Zamienia stan przełącznika na rozmiar tekstu.
 * EN: Turns the switch state into a text size.
 *
 * @param larger - PL: czy przełącznik „Większy tekst” jest zaznaczony. EN: whether the "Większy tekst" switch is checked.
 * @returns PL: duzy po zaznaczeniu, inaczej normalny. EN: duzy when checked, otherwise normalny.
 */
function toTextSize(larger: boolean): TextSize {
  return larger ? 'duzy' : 'normalny';
}

/**
 * PL: Formularz z wpisanym profilem. Zapisuje całość jednym przyciskiem, który widać tylko przy zmianach.
 * EN: The form with the typed profile. It saves everything with one button, which is visible only when something changed.
 *
 * @param props - PL: profil, od którego zaczyna formularz. EN: the profile the form starts from.
 * @returns PL: formularz. EN: the form.
 */
function SettingsForm({ initial }: { initial: Profile }) {
  // PL: Wpisywane wartości i zapis na serwer.
  // EN: The typed values and the save to the server.
  const [draft, setDraft] = useState<Profile>(initial);
  // PL: Motyw jest tylko w tym telefonie, więc start to to, co jest teraz na stronie.
  // EN: The theme is only on this phone, so the start is what is on the page now.
  const [theme, setTheme] = useState<Theme>(() => currentLook().theme);
  const save = useSaveProfile();
  // PL: Zapisz jest widoczny, gdy szkic różni się od zapisanego profilu. Motyw pominięty, bo zapisuje się tylko w telefonie.
  // EN: Save is visible when the draft differs from the saved profile. The theme is left out, because it is saved only on the phone.
  const dirty =
    draft.name !== initial.name ||
    draft.className !== initial.className ||
    draft.school !== initial.school ||
    draft.textSize !== initial.textSize;

  /** PL: Zmienia motyw od razu na stronie i w telefonie, bez zapisu na serwer. EN: Changes the theme at once on the page and on the phone, without a save to the server. */
  function handleTheme(next: Theme): void {
    setTheme(next);
    applyTheme(next);
  }

  /** PL: Wysyła profil na serwer zamiast przeładowywać stronę. EN: Sends the profile to the server instead of reloading the page. */
  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    save.mutate(draft);
  }

  return (
    <form className="pf-stack" onSubmit={handleSubmit}>
      {/* PL: Imię i klasa w jednej grupie. EN: The name and the class in one group. */}
      <ListGroup>
        {/* PL: Pola mają własne odstępy, bo pole stoi na kaflu grupy. EN: The fields have their own spacing, because the field stands on the group tile. */}
        <div className="pf-fields">
          <TextField
            label="Imię"
            value={draft.name}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="given-name"
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
          <TextField
            label="Klasa"
            value={draft.className}
            maxLength={MAX_CLASS_LENGTH}
            onChange={(event) => setDraft((current) => ({ ...current, className: event.target.value }))}
          />
        </div>
      </ListGroup>
      {/* PL: Przełącznik większego tekstu w stylu iOS. Zaznaczony oznacza większy tekst w całej aplikacji. EN: The larger text switch in the iOS style. Checked means larger text in the whole app. */}
      <ListGroup header="Wielkość tekstu">
        <label className="ui-list-row pf-switch-row">
          <span>Większy tekst</span>
          <input
            type="checkbox"
            role="switch"
            className="pf-switch"
            checked={draft.textSize === 'duzy'}
            onChange={(event) => setDraft((current) => ({ ...current, textSize: toTextSize(event.target.checked) }))}
          />
        </label>
      </ListGroup>
      {/* PL: Wybór szkoły jako segmenty; wybrany ma jaśniejsze tło. EN: The school choice as segments; the chosen one has a lighter background. */}
      <ListGroup header="Szkoła">
        <div className="pf-segment" role="group" aria-label="Szkoła">
          {SCHOOLS.map((school) => (
            <Chip
              key={school.code}
              selected={draft.school === school.code}
              onClick={() => setDraft((current) => ({ ...current, school: school.code }))}
            >
              {school.name}
            </Chip>
          ))}
        </div>
      </ListGroup>
      {/* PL: Wybór motywu jako segmenty. Zmiana działa od razu i zostaje w tym telefonie. EN: The theme choice as segments. The change works at once and stays on this phone. */}
      <ListGroup header="Motyw">
        <div className="pf-segment" role="group" aria-label="Motyw">
          {THEMES.map((item) => (
            <Chip key={item.code} selected={theme === item.code} onClick={() => handleTheme(item.code)}>
              {item.name}
            </Chip>
          ))}
        </div>
      </ListGroup>
      {/* PL: Wynik zapisu: potwierdzenie albo błąd. Stoi poza warunkiem „zmieniono”, żeby po zapisie został widoczny. EN: The save result: a confirmation or an error. It stays outside the "changed" condition, so it remains visible after the save. */}
      <div className="pf-actions">
        {save.isSuccess ? <p className="pf-hint" role="status">Zapisano.</p> : null}
        {save.isError ? <p className="pf-error" role="alert">Nie udało się zapisać.</p> : null}
        {/* PL: Jeden przycisk zapisu na dole formularza; w trakcie zapisu jest wyłączony, żeby nie wysłać dwa razy. EN: One save button at the bottom of the form; disabled while saving, so it is not sent twice. */}
        {dirty ? <Button type="submit" variant="filled" disabled={save.isPending}>Zapisz</Button> : null}
      </div>
    </form>
  );
}

/**
 * PL: Zapisuje pobrany plik na telefonie: tworzy tymczasowy adres, klika w odnośnik do pobrania i go sprząta.
 * EN: Saves the downloaded file on the phone: makes a temporary address, clicks a download link and cleans it up.
 *
 * @param blob - PL: plik do zapisu. EN: the file to save.
 * @param fileName - PL: nazwa pliku. EN: the file name.
 */
function saveFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // PL: Adres zwalniamy z opóźnieniem, żeby przeglądarka zdążyła rozpocząć pobieranie.
  // EN: We release the address with a delay, so the browser has time to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/**
 * PL: Wiersz „Pobierz moje dane”: pobiera plik JSON z kontem i ustawieniami. Przy błędzie pokazuje komunikat, a plik się nie zapisuje.
 * EN: The "Pobierz moje dane" row: downloads the JSON file with the account and settings. On an error it shows a message and no file is saved.
 *
 * @returns PL: grupa z wierszem i wynikiem. EN: the group with the row and the result.
 */
function ExportData() {
  // PL: Czy ostatnie pobranie się nie udało.
  // EN: Whether the last download failed.
  const [failed, setFailed] = useState(false);
  // PL: Blokada przed podwójnym kliknięciem: stan z useState zmienia się dopiero po odrysowaniu, a ref już nie.
  // EN: A guard against a double click: the useState value changes only after the redraw, a ref does not wait.
  const running = useRef(false);

  /** PL: Pobiera plik i zapisuje go na telefonie. EN: Downloads the file and saves it on the phone. */
  async function handleClick(): Promise<void> {
    if (running.current) return;
    running.current = true;
    setFailed(false);
    try {
      saveFile(await fetchMyData(), EXPORT_FILE_NAME);
    } catch {
      setFailed(true);
    } finally {
      running.current = false;
    }
  }

  return (
    <>
      <ListGroup footer="Pobierzesz plik JSON z numerem i adresem konta oraz z profilem i ustawieniami.">
        <ListRow title="Pobierz moje dane" onClick={handleClick} />
      </ListGroup>
      {failed ? <p className="pf-error" role="alert">Nie udało się pobrać danych.</p> : null}
    </>
  );
}

/**
 * PL: Rysuje ekran ustawień: formularz, gdy profil jest wczytany, a inaczej napis o wczytywaniu albo błąd z ponowieniem.
 * EN: Draws the settings screen: the form when the profile is loaded, otherwise the loading text or an error with a retry.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SettingsScreen() {
  // PL: Profil z serwera albo z zapisu w telefonie.
  // EN: The profile from the server or the saved copy.
  const query = useProfile();
  return (
    <>
      <ScreenHeader title="Ustawienia" backTo="/profile" backLabel="Profil" />
      <div className="pf-stack">
        {/* PL: Dane mają pierwszeństwo przed stanem zapytania (bez internetu zostaje zapisany profil). EN: The data takes priority over the query state (without internet the saved profile stays). */}
        {query.data ? <SettingsForm initial={query.data} /> : null}
        {/* PL: Pobranie własnych danych jest zawsze pod formularzem. EN: Downloading one's own data is always under the form. */}
        <ExportData />
        {/* PL: Wiersz prowadzi do listy urządzeń (ekran podtoru 1a). Tekst „Moje urządzenia” nie ma w docs/projekt/EKRANY.md, ale właściciel go zatwierdził. EN: The row leads to the device list (the screen of subtrack 1a). The text "Moje urządzenia" is not in docs/projekt/EKRANY.md, but the owner approved it. */}
        <ListGroup>
          <ListRow title="Moje urządzenia" icon={<Icon name="smartphone" />} to="/auth/email/urzadzenia" />
        </ListGroup>
        {/* PL: Klucze Face ID i odcisk palca są w ustawieniach, obok urządzeń. EN: The Face ID and fingerprint keys are in the settings, next to the devices. */}
        <PasskeySection />
        {!query.data && query.isError ? (
          <div className="pf-empty" role="alert">
            <p>Nie udało się wczytać profilu.</p>
            <Button variant="plain" onClick={() => query.refetch()}>Spróbuj ponownie</Button>
          </div>
        ) : null}
        {!query.data && !query.isError ? <p className="pf-empty" role="status">Wczytuję profil…</p> : null}
      </div>
    </>
  );
}
