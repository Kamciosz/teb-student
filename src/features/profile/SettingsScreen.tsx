/**
 * PL: Ekran „Ustawienia”: zmiana imienia, klasy, szkoły, palety kolorów i większego tekstu. Szkoła wybiera akcent (liceum niebieski, technikum czerwony), a paleta zmienia kolory całej aplikacji, a większy tekst powiększa litery w całej aplikacji. Zapis idzie na serwer, a wygląd od razu zmienia się na stronie i zostaje w telefonie. Tekstów tego ekranu nie ma w docs/projekt/EKRANY.md (do ustalenia z zespołem).
 * EN: The "Ustawienia" screen: changing the name, class, school, color palette and larger text. The school picks the accent (lyceum blue, technical school red), the palette changes the colors of the whole app, and the larger text enlarges the letters of the whole app. The save goes to the server, and the look changes on the page at once and stays on the phone. The texts of this screen are not in docs/projekt/EKRANY.md (to be agreed with the team).
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/queries.ts::useProfile
 * @uses src/features/profile/queries.ts::useSaveProfile
 * @uses src/features/profile/look.ts::PALETTES
 * @uses src/features/profile/textSize.ts::TextSize
 * @uses src/features/profile/api.ts::fetchMyData
 * @used_by src/features/profile/ProfileScreen.tsx::SettingsScreen
 */

// PL: useState trzyma wpisywane wartości do czasu zapisu.
// EN: useState keeps the typed values until the save.
import { useState, type FormEvent } from 'react';
// PL: Dane, wygląd i pasek.
// EN: The data, the look and the bar.
import { EXPORT_FILE_NAME, fetchMyData, type Profile } from './api';
import { PALETTES, SCHOOLS } from './look';
import { useProfile, useSaveProfile } from './queries';
import type { TextSize } from './textSize';
import { ScreenTop } from './ScreenTop';

/** PL: Najwięcej znaków w imieniu i klasie, takie same jak na serwerze (worker/profile/validation.ts). EN: The most characters in the name and class, the same as on the server (worker/profile/validation.ts). */
const MAX_NAME_LENGTH = 40;
const MAX_CLASS_LENGTH = 10;

/**
 * PL: Grupa przycisków radiowych wyglądających jak „chipy”: jedna wartość do wyboru.
 * EN: A group of radio buttons that look like "chips": one value to choose.
 *
 * @param props - PL: nazwa grupy, opis, możliwości, wybrana wartość i funkcja zmiany. EN: the group name, the legend, the options, the chosen value and the change function.
 * @returns PL: pole grupy. EN: the group field.
 */
function ChipGroup<T extends string>({ legend, options, value, onChange }: { legend: string; options: readonly { code: T; label: string }[]; value: T; onChange: (code: T) => void }) {
  return (
    <fieldset className="pf-group">
      {/* PL: Opis grupy czytany przez czytniki ekranu. EN: The group description read by screen readers. */}
      <legend>{legend}</legend>
      <div className="pf-chips">
        {options.map((option) => (
          <label key={option.code} className="pf-chip">
            {/* PL: Ukryty przycisk radiowy; wybór zmienia wartość w formularzu. EN: The hidden radio button; choosing changes the value in the form. */}
            <input type="radio" name={legend} value={option.code} checked={value === option.code} onChange={() => onChange(option.code)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

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
 * PL: Formularz z wpisanym profilem. Zapisuje całość jednym przyciskiem.
 * EN: The form with the typed profile. It saves everything with one button.
 *
 * @param props - PL: profil, od którego zaczyna formularz. EN: the profile the form starts from.
 * @returns PL: formularz. EN: the form.
 */
function SettingsForm({ initial }: { initial: Profile }) {
  // PL: Wpisywane wartości i zapis na serwer.
  // EN: The typed values and the save to the server.
  const [draft, setDraft] = useState<Profile>(initial);
  const save = useSaveProfile();

  /** PL: Wysyła profil na serwer zamiast przeładowywać stronę. EN: Sends the profile to the server instead of reloading the page. */
  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    save.mutate(draft);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* PL: Pola imienia i klasy. EN: The name and class fields. */}
      <label className="pf-field">
        <span>Imię</span>
        <input value={draft.name} maxLength={MAX_NAME_LENGTH} autoComplete="given-name" onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
      </label>
      <label className="pf-field">
        <span>Klasa</span>
        <input value={draft.className} maxLength={MAX_CLASS_LENGTH} onChange={(event) => setDraft({ ...draft, className: event.target.value })} />
      </label>
      {/* PL: Przełącznik większego tekstu, wybór szkoły i palety. EN: The larger text switch, the school and palette choice. */}
      <fieldset className="pf-group">
        <legend>Wielkość tekstu</legend>
        <div className="pf-chips">
          <label className="pf-chip">
            {/* PL: Zaznaczony oznacza większy tekst w całej aplikacji. EN: Checked means larger text in the whole app. */}
            <input type="checkbox" checked={draft.textSize === 'duzy'} onChange={(event) => setDraft({ ...draft, textSize: toTextSize(event.target.checked) })} />
            <span>Większy tekst</span>
          </label>
        </div>
      </fieldset>
      <ChipGroup legend="Szkoła" options={SCHOOLS.map((school) => ({ code: school.code, label: school.name }))} value={draft.school} onChange={(school) => setDraft({ ...draft, school })} />
      <ChipGroup legend="Paleta kolorów" options={PALETTES.map((palette) => ({ code: palette.code, label: `${palette.code} ${palette.name}` }))} value={draft.palette} onChange={(palette) => setDraft({ ...draft, palette })} />
      {/* PL: Wynik zapisu: potwierdzenie albo błąd. EN: The save result: a confirmation or an error. */}
      {save.isSuccess ? <p className="pf-hint" role="status">Zapisano.</p> : null}
      {save.isError ? <p className="pf-error" role="alert">Nie udało się zapisać.</p> : null}
      {/* PL: Przycisk zapisu; w trakcie zapisu jest wyłączony, żeby nie wysłać dwa razy. EN: The save button; disabled while saving, so it is not sent twice. */}
      <button type="submit" className="pf-btn pf-btn-accent" disabled={save.isPending}>Zapisz</button>
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
 * PL: Przycisk „Pobierz moje dane”: pobiera plik JSON z kontem i ustawieniami. Przy błędzie pokazuje komunikat, a plik się nie zapisuje.
 * EN: The "Pobierz moje dane" button: downloads the JSON file with the account and settings. On an error it shows a message and no file is saved.
 *
 * @returns PL: sekcja z przyciskiem i wynikiem. EN: the section with the button and the result.
 */
function ExportData() {
  // PL: Stan pobierania: bezczynny, w trakcie albo błąd.
  // EN: The download state: idle, in progress or an error.
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');

  /** PL: Pobiera plik i zapisuje go na telefonie. EN: Downloads the file and saves it on the phone. */
  async function handleClick(): Promise<void> {
    setState('busy');
    try {
      saveFile(await fetchMyData(), EXPORT_FILE_NAME);
      setState('idle');
    } catch {
      setState('error');
    }
  }

  return (
    <section className="pf-group">
      <p className="pf-hint">Pobierzesz plik JSON z numerem i adresem konta oraz z profilem i ustawieniami.</p>
      <button type="button" className="pf-btn pf-btn-soft" disabled={state === 'busy'} onClick={handleClick}>Pobierz moje dane</button>
      {state === 'error' ? <p className="pf-error" role="alert">Nie udało się pobrać danych.</p> : null}
    </section>
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
      <ScreenTop title="Ustawienia" backTo="/profile" backLabel="Wróć do profilu" />
      {/* PL: Dane mają pierwszeństwo przed stanem zapytania (bez internetu zostaje zapisany profil). EN: The data takes priority over the query state (without internet the saved profile stays). */}
      {query.data ? <SettingsForm initial={query.data} /> : null}
      {/* PL: Pobranie własnych danych jest zawsze pod formularzem. EN: Downloading one's own data is always under the form. */}
      <ExportData />
      {!query.data && query.isError ? (
        <div className="pf-empty" role="alert">
          <p>Nie udało się wczytać profilu.</p>
          <button type="button" className="pf-btn pf-btn-soft" onClick={() => query.refetch()}>Spróbuj ponownie</button>
        </div>
      ) : null}
      {!query.data && !query.isError ? <p className="pf-empty" role="status">Wczytuję profil…</p> : null}
    </>
  );
}
