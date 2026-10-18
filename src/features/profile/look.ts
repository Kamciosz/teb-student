/**
 * PL: Wygląd aplikacji wybrany przez ucznia: motyw (automatyczny, jasny albo ciemny) i szkoła (liceum albo technikum, od niej zależy akcent).
 *     Plik ustawia atrybut data-motyw (przy automatycznym go usuwa) i data-szkola na elemencie <html>, a kolory wybierają z nich reguły
 *     z src/shared/styles/tokens.css. Wybór zostaje w pamięci telefonu, więc po ponownym uruchomieniu aplikacji wygląd jest ten sam, także bez internetu.
 *     Stary zapis z paletą kolorów (klucz palette) wczytuje się jako motyw automatyczny, bez błędu.
 * EN: The app look chosen by the student: the theme (automatic, light or dark) and the school (lyceum or technical school, the accent depends on it).
 *     The file sets the data-motyw attribute (it removes it for automatic) and data-szkola on the <html> element, and the rules from
 *     src/shared/styles/tokens.css pick the colors from them. The choice stays in the phone storage, so after the app is restarted the look
 *     is the same, also without internet. An old record with the color palette (the palette key) loads as the automatic theme, without an error.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/shared/styles/tokens.css::data-motyw
 * @used_by src/features/profile/index.ts::applyStoredLook
 * @used_by src/features/profile/queries.ts::applySchool
 * @used_by src/features/profile/SettingsScreen.tsx::THEMES
 * @used_by src/features/profile/look.test.ts::applyLook
 * @used_by src/features/profile/textSize.ts::browserRoot
 */

/** PL: Szkoła: L to liceum (niebieski akcent), T to technikum (czerwony akcent). EN: The school: L is the lyceum (blue accent), T is the technical school (red accent). */
export type School = 'L' | 'T';

/** PL: Motyw: auto idzie za telefonem, jasny i ciemny są wybrane ręcznie. EN: The theme: auto follows the phone, light and dark are chosen by hand. */
export type Theme = 'auto' | 'jasny' | 'ciemny';

/**
 * PL: Kod palety kolorów z dawnego wyboru. Serwer nadal go przechowuje (podtor 7), ale kolory w aplikacji już z niego nie korzystają.
 * EN: A code of the old color palette. The server still stores it (podtor 7), but the app colors no longer use it.
 */
export type PaletteCode = 'CA' | 'CB' | 'CC' | 'CD' | 'CE' | 'CF' | 'CG' | 'CH';

/** PL: Wygląd aplikacji: motyw i szkoła. EN: The app look: the theme and the school. */
export type Look = { theme: Theme; school: School };

/** PL: Motywy do wyboru, w kolejności na ekranie. EN: The themes to choose from, in the order on the screen. */
export const THEMES: readonly { code: Theme; name: string }[] = [
  { code: 'auto', name: 'Automatyczny' },
  { code: 'jasny', name: 'Jasny' },
  { code: 'ciemny', name: 'Ciemny' },
];

/** PL: Szkoły do wyboru. EN: The schools to choose from. */
export const SCHOOLS: readonly { code: School; name: string }[] = [
  { code: 'L', name: 'Liceum' },
  { code: 'T', name: 'Technikum' },
];

/** PL: Wygląd domyślny, taki sam jak w tokens.css bez atrybutów: motyw telefonu i akcent liceum. EN: The default look, the same as tokens.css without attributes: the phone's theme and the lyceum accent. */
export const DEFAULT_LOOK: Look = { theme: 'auto', school: 'L' };

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
export function browserRoot(): LookTarget | undefined {
  return typeof document === 'undefined' ? undefined : document.documentElement;
}

/**
 * PL: Zwraca localStorage, albo undefined, gdy go nie ma albo przeglądarka go blokuje (samo odczytanie potrafi rzucić błąd).
 * EN: Returns localStorage, or undefined when there is none or the browser blocks it (merely reading it can throw).
 *
 * @returns PL: pamięć albo undefined. EN: the storage or undefined.
 */
export function browserStorage(): LookStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * PL: Czy tekst jest jednym z motywów.
 * EN: Whether the text is one of the themes.
 *
 * @param value - PL: wartość z pamięci. EN: a value from the storage.
 * @returns PL: prawda dla auto, jasny i ciemny. EN: true for auto, jasny and ciemny.
 */
function isTheme(value: unknown): value is Theme {
  return THEMES.some((theme) => theme.code === value);
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
 * PL: Ustawia atrybuty wyglądu na elemencie. Motyw auto usuwa atrybut data-motyw, żeby działał motyw telefonu.
 * EN: Sets the look attributes on the element. The auto theme removes the data-motyw attribute, so the phone's theme applies.
 *
 * @param look - PL: motyw i szkoła do ustawienia. EN: the theme and the school to set.
 * @param target - PL: element z atrybutami albo undefined. EN: the element with the attributes or undefined.
 */
function setAttributes(look: Look, target: LookTarget | undefined): void {
  // PL: Atrybuty, z których reguły w tokens.css wybierają kolory.
  // EN: The attributes the rules in tokens.css pick the colors from.
  if (!target) return;
  if (look.theme === 'auto') {
    delete target.dataset.motyw;
  } else {
    target.dataset.motyw = look.theme;
  }
  target.dataset.szkola = look.school;
}

/**
 * PL: Ustawia wygląd na stronie i zapisuje go w pamięci telefonu. Zmienia atrybuty elementu <html> i klucz w localStorage.
 * EN: Sets the look on the page and saves it in the phone storage. Changes the attributes of the <html> element and a key in localStorage.
 *
 * @param look - PL: motyw i szkoła do ustawienia. EN: the theme and the school to set.
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
 * PL: Czyta zapisany wygląd. Zepsuty zapis albo nieznana szkoła to brak zapisu. Nieznany albo brakujący motyw (na przykład stary zapis z paletą) to motyw automatyczny.
 * EN: Reads the saved look. A broken record or an unknown school counts as no record. An unknown or missing theme (for example an old record with a palette) is the automatic theme.
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
    if (!isSchool(record.school)) return undefined;
    return { theme: isTheme(record.theme) ? record.theme : 'auto', school: record.school };
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
 * PL: Wygląd, który widać teraz na stronie, czytany z atrybutów elementu. Gdy pamięć jest zablokowana, nadal pokazuje wybór z tej sesji.
 * EN: The look shown on the page now, read from the attributes of the element. When the storage is blocked, it still shows the choice of this session.
 *
 * @param target - PL: element z atrybutami (domyślnie <html>). EN: the element with the attributes (<html> by default).
 * @returns PL: motyw i szkoła na stronie. EN: the theme and the school on the page.
 */
export function currentLook(target: LookTarget | undefined = browserRoot()): Look {
  const motyw = target?.dataset.motyw;
  const theme: Theme = motyw === 'jasny' || motyw === 'ciemny' ? motyw : 'auto';
  const school: School = target?.dataset.szkola === 'T' ? 'T' : 'L';
  return { theme, school };
}

/**
 * PL: Zmienia tylko szkołę z serwera i zostawia motyw, który jest teraz na stronie. Motyw nie jest w profilu na serwerze, więc nie wolno go nadpisać.
 * EN: Changes only the school from the server and keeps the theme that is on the page now. The theme is not in the server profile, so it must not be overwritten.
 *
 * @param school - PL: szkoła z serwera. EN: the school from the server.
 * @param target - PL: element z atrybutami (domyślnie <html>). EN: the element with the attributes (<html> by default).
 * @param storage - PL: pamięć do zapisu (domyślnie localStorage). EN: the storage to save to (localStorage by default).
 */
export function applySchool(school: School, target: LookTarget | undefined = browserRoot(), storage: LookStorage | undefined = browserStorage()): void {
  applyLook({ theme: currentLook(target).theme, school }, target, storage);
}

/**
 * PL: Zmienia tylko motyw, na przykład po kliknięciu w ustawieniach, i zostawia szkołę, która jest teraz na stronie. Motyw działa od razu i zostaje w telefonie.
 * EN: Changes only the theme, for example when clicked in the settings, and keeps the school that is on the page now. The theme works at once and stays on the phone.
 *
 * @param theme - PL: nowy motyw. EN: the new theme.
 * @param target - PL: element z atrybutami (domyślnie <html>). EN: the element with the attributes (<html> by default).
 * @param storage - PL: pamięć do zapisu (domyślnie localStorage). EN: the storage to save to (localStorage by default).
 */
export function applyTheme(theme: Theme, target: LookTarget | undefined = browserRoot(), storage: LookStorage | undefined = browserStorage()): void {
  applyLook({ theme, school: currentLook(target).school }, target, storage);
}

/**
 * PL: Wraca do wyglądu domyślnego i kasuje zapis. Wołamy po usunięciu konta, żeby na telefonie nie został motyw usuniętego ucznia.
 * EN: Goes back to the default look and deletes the record. We call it after the account deletion, so the deleted student's theme does not stay on the phone.
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
