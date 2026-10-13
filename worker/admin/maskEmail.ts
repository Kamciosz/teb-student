/**
 * PL: Maskowanie szkolnego adresu przed pokazaniem go w panelu: zostaje pierwsza litera i domena, reszta to gwiazdki (np. o***@teb.edu.pl). Serwer nie może importować funkcji z frontu, więc ta kopia żyje tutaj.
 * EN: Masking a school address before showing it in the panel: the first letter and the domain stay, the rest becomes asterisks (e.g. o***@teb.edu.pl). The server cannot import a front-end function, so this copy lives here.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses (none)
 * @used_by worker/admin/roleRoutes.ts::rolesApp
 * @used_by worker/admin/roleRoutes.test.ts::rolesApp
 */

/**
 * PL: Zamienia adres na postać z gwiazdkami. Adres bez małpy zwraca bez zmian.
 * EN: Turns the address into the starred form. An address without an at-sign is returned unchanged.
 *
 * @param email - PL: adres ucznia. EN: the student's address.
 * @returns PL: zamaskowany adres. EN: the masked address.
 */
export function maskEmail(email: string): string {
  // PL: Znajdź znak małpy. Bez niego albo z pustą częścią przed nią nie ma czego maskować.
  // EN: Find the at-sign. Without it, or with an empty part before it, there is nothing to mask.
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;
  // PL: Pierwsza litera, trzy gwiazdki i reszta od małpy (domena zostaje).
  // EN: The first letter, three asterisks and the rest from the at-sign (the domain stays).
  return `${email.charAt(0)}***${email.slice(atIndex)}`;
}
