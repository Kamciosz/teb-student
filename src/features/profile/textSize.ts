/**
 * PL: Większy tekst wybrany przez ucznia. Plik ustawia atrybut data-tekst na elemencie <html>, a rozmiary liter zmienia reguła w profile.css (nadpisuje zmienne --t-* z src/shared/styles/tokens.css, więc src/shared zostaje bez zmian). Wybór zostaje w pamięci telefonu, tak jak wygląd palety i szkoły.
 * EN: The larger text chosen by the student. The file sets the data-tekst attribute on the <html> element, and the letter sizes change through a rule in profile.css (it overrides the --t-* variables from src/shared/styles/tokens.css, so src/shared stays unchanged). The choice stays in the phone storage, like the palette and school look.
 *
 * @author Jakub
 * @since 2026-10-13
 * @uses src/features/profile/look.ts::browserRoot
 * @uses src/features/profile/look.ts::browserStorage
 * @uses src/features/profile/look.ts::LookTarget
 * @uses src/features/profile/look.ts::LookStorage
 * @used_by src/features/profile/index.ts::applyStoredTextSize
 * @used_by src/features/profile/queries.ts::applyTextSize
 * @used_by src/features/profile/textSize.test.ts::applyTextSize
 */

// PL: Pobieranie elementu <html> i pamięci telefonu oraz typy do podstawiania w testach.
// EN: Getting the <html> element and the phone storage, and the types to stand in for them in tests.
import { browserRoot, browserStorage, type LookStorage, type LookTarget } from './look';

/** PL: Rozmiar tekstu: normalny albo większy (duzy). EN: The text size: normal or larger (duzy). */
export type TextSize = 'normalny' | 'duzy';

/** PL: Wszystkie rozmiary tekstu. EN: All the text sizes. */
export const TEXT_SIZES: readonly TextSize[] = ['normalny', 'duzy'];

/** PL: Rozmiar domyślny, czyli zwykły tekst. EN: The default size, that is the normal text. */
export const DEFAULT_TEXT_SIZE: TextSize = 'normalny';

/** PL: Klucz w pamięci telefonu, pod którym leży wybrany rozmiar tekstu. EN: The key in the phone storage under which the chosen text size lies. */
export const TEXT_SIZE_STORAGE_KEY = 'teb-student-text-size';

/**
 * PL: Czy tekst jest jednym z rozmiarów.
 * EN: Whether the text is one of the sizes.
 *
 * @param value - PL: wartość z pamięci albo z serwera. EN: a value from the storage or the server.
 * @returns PL: prawda dla normalny i duzy. EN: true for normalny and duzy.
 */
function isTextSize(value: unknown): value is TextSize {
  return TEXT_SIZES.some((size) => size === value);
}

/**
 * PL: Ustawia rozmiar tekstu na stronie i zapisuje go w pamięci telefonu. Zmienia atrybut data-tekst elementu <html> i klucz w localStorage.
 * EN: Sets the text size on the page and saves it in the phone storage. Changes the data-tekst attribute of the <html> element and a key in localStorage.
 *
 * @param size - PL: rozmiar do ustawienia. EN: the size to set.
 * @param target - PL: element z atrybutem (domyślnie <html>). EN: the element with the attribute (<html> by default).
 * @param storage - PL: pamięć do zapisu (domyślnie localStorage). EN: the storage to save to (localStorage by default).
 */
export function applyTextSize(size: TextSize, target: LookTarget | undefined = browserRoot(), storage: LookStorage | undefined = browserStorage()): void {
  // PL: Ustaw atrybut, żeby reguła w profile.css zadziałała na całej aplikacji.
  // EN: Set the attribute, so the rule in profile.css works on the whole app.
  if (target) target.dataset.tekst = size;
  // PL: Zapisz wybór. Zablokowana pamięć nie może zepsuć zmiany, więc błąd zapisu pomijamy.
  // EN: Save the choice. A blocked storage must not break the change, so we skip a save error.
  try {
    storage?.setItem(TEXT_SIZE_STORAGE_KEY, size);
  } catch {
    // PL: Nic więcej nie da się zrobić, rozmiar działa do końca tej sesji.
    // EN: Nothing more can be done, the size works until the end of this session.
  }
}

/**
 * PL: Czyta zapisany rozmiar tekstu. Nieznana wartość to brak zapisu.
 * EN: Reads the saved text size. An unknown value counts as no record.
 *
 * @param storage - PL: pamięć do odczytu (domyślnie localStorage). EN: the storage to read from (localStorage by default).
 * @returns PL: zapisany rozmiar albo undefined. EN: the saved size or undefined.
 */
export function readStoredTextSize(storage: LookStorage | undefined = browserStorage()): TextSize | undefined {
  // PL: Odczyt w try: pamięć może rzucić błąd.
  // EN: Read inside a try: the storage may throw.
  try {
    const value: unknown = storage?.getItem(TEXT_SIZE_STORAGE_KEY);
    return isTextSize(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/**
 * PL: Przy starcie aplikacji ustawia zapisany rozmiar tekstu, a gdy go nie ma, zwykły tekst. Wołają to drzwi modułu przy wczytaniu.
 * EN: At app start sets the saved text size, and the normal text when there is none. The module door calls it on load.
 *
 * @param target - PL: element z atrybutem (domyślnie <html>). EN: the element with the attribute (<html> by default).
 * @param storage - PL: pamięć do odczytu (domyślnie localStorage). EN: the storage to read from (localStorage by default).
 */
export function applyStoredTextSize(target: LookTarget | undefined = browserRoot(), storage: LookStorage | undefined = browserStorage()): void {
  // PL: Ustaw tylko atrybut. Nie zapisujemy z powrotem tego, co właśnie odczytaliśmy.
  // EN: Set only the attribute. We do not save back what we have just read.
  if (target) target.dataset.tekst = readStoredTextSize(storage) ?? DEFAULT_TEXT_SIZE;
}

/**
 * PL: Wraca do zwykłego tekstu i kasuje zapis. Wołamy po usunięciu konta, tak jak przy wyglądzie.
 * EN: Goes back to the normal text and deletes the record. We call it after the account deletion, just like with the look.
 *
 * @param target - PL: element z atrybutem (domyślnie <html>). EN: the element with the attribute (<html> by default).
 * @param storage - PL: pamięć do wyczyszczenia (domyślnie localStorage). EN: the storage to clear (localStorage by default).
 */
export function resetTextSize(target: LookTarget | undefined = browserRoot(), storage: LookStorage | undefined = browserStorage()): void {
  // PL: Usuń zapis (zablokowana pamięć nie zatrzymuje reszty), potem ustaw zwykły tekst.
  // EN: Remove the record (a blocked storage does not stop the rest), then set the normal text.
  try {
    storage?.removeItem(TEXT_SIZE_STORAGE_KEY);
  } catch {
    // PL: Nic więcej nie da się zrobić.
    // EN: Nothing more can be done.
  }
  if (target) target.dataset.tekst = DEFAULT_TEXT_SIZE;
}
