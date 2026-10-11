/**
 * PL: Wygląd aplikacji wybrany przez ucznia: paleta kolorów (8 do wyboru) i szkoła (liceum albo technikum, od niej zależy akcent). Plik ustawia atrybuty data-paleta i data-szkola na elemencie <html>, a kolory wybierają z nich reguły z src/shared/styles/tokens.css. Wybór zostaje w pamięci telefonu, więc po ponownym uruchomieniu aplikacji wygląd jest ten sam, także bez internetu.
 * EN: The app look chosen by the student: the color palette (8 to choose from) and the school (lyceum or technical school, the accent depends on it). The file sets the data-paleta and data-szkola attributes on the <html> element, and the rules from src/shared/styles/tokens.css pick the colors from them. The choice stays in the phone storage, so after the app is restarted the look is the same, also without internet.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/shared/styles/tokens.css::data-paleta
 * @used_by src/features/profile/index.ts::applyStoredLook
 * @used_by src/features/profile/queries.ts::applyLook
 * @used_by src/features/profile/SettingsScreen.tsx::PALETTES
 * @used_by src/features/profile/look.test.ts::applyLook
 */

/** PL: Szkoła: L to liceum (niebieski akcent), T to technikum (czerwony akcent). EN: The school: L is the lyceum (blue accent), T is the technical school (red accent). */
export type School = 'L' | 'T';

/** PL: Kod palety z tokens.css: CA do CH. EN: A palette code from tokens.css: CA to CH. */
export type PaletteCode = 'CA' | 'CB' | 'CC' | 'CD' | 'CE' | 'CF' | 'CG' | 'CH';

/** PL: Wygląd aplikacji: paleta i szkoła. EN: The app look: the palette and the school. */
export type Look = { palette: PaletteCode; school: School };

/**
 * PL: Osiem palet z nazwami z docs/projekt/referencje/uklad_C.html. Kolejność jak w tokens.css. Kody CC i CE mają tę samą nazwę „Grafit”, więc na ekranie stoją obok kodu.
 * EN: The eight palettes with the names from docs/projekt/referencje/uklad_C.html. The order is as in tokens.css. The codes CC and CE share the name "Grafit", so on screen they stand next to the code.
 */
export const PALETTES: readonly { code: PaletteCode; name: string }[] = [
  { code: 'CA', name: 'Szałwia' },
  { code: 'CB', name: 'Błękit' },
  { code: 'CC', name: 'Grafit' },
  { code: 'CD', name: 'Śliwka' },
  { code: 'CE', name: 'Grafit' },
  { code: 'CF', name: 'Czerń' },
  { code: 'CG', name: 'Biel' },
  { code: 'CH', name: 'Granat' },
];

/** PL: Szkoły do wyboru. EN: The schools to choose from. */
export const SCHOOLS: readonly { code: School; name: string }[] = [
  { code: 'L', name: 'Liceum' },
  { code: 'T', name: 'Technikum' },
];

/** PL: Wygląd domyślny, taki sam jak w tokens.css bez atrybutów: paleta CE Grafit i akcent liceum. EN: The default look, the same as tokens.css without attributes: the CE Grafit palette and the lyceum accent. */
export const DEFAULT_LOOK: Look = { palette: 'CE', school: 'L' };

/** PL: Klucz w pamięci telefonu, pod którym leży wybrany wygląd. EN: The key in the phone storage under which the chosen look lies. */
export const LOOK_STORAGE_KEY = 'teb-student-look';

/** PL: Element, na którym ustawiamy atrybuty: w aplikacji <html>, w teście zwykły obiekt. EN: The element the attributes are set on: <html> in the app, a plain object in a test. */
export type LookTarget = { dataset: DOMStringMap };

/** PL: Pamięć, w której zapisujemy wygląd: w aplikacji localStorage. EN: The storage the look is saved in: localStorage in the app. */
export type LookStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * PL: Zwraca element <html>, albo undefined poza przeglądarką (testy serwera nie mają dokumentu).
 * EN: Returns the <html> element, or undefined outside a browser (server tests have no document).
 *
 * @returns PL: element <html> albo undefined. EN: the <html> element or undefined.
 */
function browserRoot(): LookTarget | undefined {
  return typeof document === 'undefined' ? undefined : document.documentElement;
}

/**
 * PL: Zwraca localStorage, albo undefined, gdy go nie ma albo przeglądarka go blokuje (samo odczytanie potrafi rzucić błąd).
 * EN: Returns localStorage, or undefined when there is none or the browser blocks it (merely reading it can throw).
 *
 * @returns PL: pamięć albo undefined. EN: the storage or undefined.
 */
function browserStorage(): LookStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * PL: Czy tekst jest kodem jednej z ośmiu palet.
 * EN: Whether the text is the code of one of the eight palettes.
 *
 * @param value - PL: wartość z pamięci albo z serwera. EN: a value from the storage or the server.
 * @returns PL: prawda dla kodów CA do CH. EN: true for the codes CA to CH.
 */
function isPaletteCode(value: unknown): value is PaletteCode {
  return PALETTES.some((palette) => palette.code === value);
}

/**
 * PL: Czy tekst jest kodem szkoły.
 * EN: Whether the text is a school code.
 *
 * @param value - PL: wartość z pamięci albo z serwera. EN: a value from the storage or the server.
 * @returns PL: prawda dla L i T. EN: true for L and T.
 */
function isSchool(value: unknown): value is School {
  return SCHOOLS.some((school) => school.code === value);
}

/**
 * PL: Ustawia atrybuty wyglądu na elemencie. Bez elementu (poza przeglądarką) nic nie robi.
 * EN: Sets the look attributes on the element. Without an element (outside a browser) it does nothing.
 *
 * @param look - PL: paleta i szkoła do ustawienia. EN: the palette and the school to set.
 * @param target - PL: element z atrybutami albo undefined. EN: the element with the attributes or undefined.
 */
function setAttributes(look: Look, target: LookTarget | undefined): void {
  // PL: Atrybuty, z których reguły w tokens.css wybierają kolory.
  // EN: The attributes the rules in tokens.css pick the colors from.
  if (!target) return;
  target.dataset.paleta = look.palette;
  target.dataset.szkola = look.school;
}

/**
 * PL: Ustawia wygląd na stronie i zapisuje go w pamięci telefonu. Zmienia atrybuty elementu <html> i klucz w localStorage.
 * EN: Sets the look on the page and saves it in the phone storage. Changes the attributes of the <html> element and a key in localStorage.
 *
 * @param look - PL: paleta i szkoła do ustawienia. EN: the palette and the school to set.
 * @param target - PL: element z atrybutami (domyślnie <html>). EN: the element with the attributes (<html> by default).
 * @param storage - PL: pamięć do zapisu (domyślnie localStorage). EN: the storage to save to (localStorage by default).
 */
export function applyLook(look: Look, target: LookTarget | undefined = browserRoot(), storage: LookStorage | undefined = browserStorage()): void {
  // PL: Ustaw atrybuty, potem zapisz wybór.
  // EN: Set the attributes, then save the choice.
  setAttributes(look, target);
  // PL: Zapisz wybór. Zablokowana pamięć nie może zepsuć zmiany wyglądu, więc błąd zapisu pomijamy.
  // EN: Save the choice. A blocked storage must not break the look change, so we skip a save error.
  try {
    storage?.setItem(LOOK_STORAGE_KEY, JSON.stringify(look));
  } catch {
    // PL: Nic więcej nie da się zrobić, wygląd działa do końca tej sesji.
    // EN: Nothing more can be done, the look works until the end of this session.
  }
}

/**
 * PL: Czyta zapisany wygląd. Zepsuty zapis albo nieznany kod palety to brak zapisu.
 * EN: Reads the saved look. A broken record or an unknown palette code counts as no record.
 *
 * @param storage - PL: pamięć do odczytu (domyślnie localStorage). EN: the storage to read from (localStorage by default).
 * @returns PL: zapisany wygląd albo undefined. EN: the saved look or undefined.
 */
export function readStoredLook(storage: LookStorage | undefined = browserStorage()): Look | undefined {
  // PL: Odczyt i parsowanie w try: pamięć może rzucić błąd, a tekst może nie być JSON-em.
  // EN: Read and parse inside a try: the storage may throw and the text may not be JSON.
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(LOOK_STORAGE_KEY) ?? 'null');
    const record = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
    return isPaletteCode(record.palette) && isSchool(record.school) ? { palette: record.palette, school: record.school } : undefined;
  } catch {
    return undefined;
  }
}

/**
 * PL: Przy starcie aplikacji ustawia zapisany wygląd, a gdy go nie ma, wygląd domyślny. Wołają to drzwi modułu przy wczytaniu, więc wygląd działa na każdym ekranie, nie tylko w profilu.
 * EN: At app start sets the saved look, and the default look when there is none. The module door calls it on load, so the look works on every screen, not only in the profile.
 *
 * @param target - PL: element z atrybutami (domyślnie <html>). EN: the element with the attributes (<html> by default).
 * @param storage - PL: pamięć do odczytu (domyślnie localStorage). EN: the storage to read from (localStorage by default).
 */
export function applyStoredLook(target: LookTarget | undefined = browserRoot(), storage: LookStorage | undefined = browserStorage()): void {
  // PL: Ustaw tylko atrybuty. Nie zapisujemy z powrotem tego, co właśnie odczytaliśmy.
  // EN: Set only the attributes. We do not save back what we have just read.
  setAttributes(readStoredLook(storage) ?? DEFAULT_LOOK, target);
}

/**
 * PL: Wraca do wyglądu domyślnego i kasuje zapis. Wołamy po usunięciu konta, żeby na telefonie nie została paleta usuniętego ucznia.
 * EN: Goes back to the default look and deletes the record. We call it after the account deletion, so the deleted student's palette does not stay on the phone.
 *
 * @param target - PL: element z atrybutami (domyślnie <html>). EN: the element with the attributes (<html> by default).
 * @param storage - PL: pamięć do wyczyszczenia (domyślnie localStorage). EN: the storage to clear (localStorage by default).
 */
export function resetLook(target: LookTarget | undefined = browserRoot(), storage: LookStorage | undefined = browserStorage()): void {
  // PL: Usuń zapis (zablokowana pamięć nie zatrzymuje reszty), potem ustaw wygląd domyślny.
  // EN: Remove the record (a blocked storage does not stop the rest), then set the default look.
  try {
    storage?.removeItem(LOOK_STORAGE_KEY);
  } catch {
    // PL: Nic więcej nie da się zrobić.
    // EN: Nothing more can be done.
  }
  setAttributes(DEFAULT_LOOK, target);
}
