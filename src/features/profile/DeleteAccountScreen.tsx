/**
 * PL: Ekran potwierdzenia „Usuń konto i dane”. Usunięcie jest ostateczne, więc wymaga osobnego przycisku. Po usunięciu telefon czyści zapisane dane, a wspólny kod przenosi na ekran logowania. Tekst „Usuniemy zgłoszenia i odpowiedzi.” pochodzi z ekranu 2.4, a pozostałych tekstów nie ma w docs/projekt/EKRANY.md, ale właściciel je zatwierdził.
 * EN: The confirmation screen "Usuń konto i dane". The deletion is final, so it needs a separate button. After the deletion the phone clears the saved data, and the shared code takes the student to the sign-in screen. The text "Usuniemy zgłoszenia i odpowiedzi." comes from screen 2.4, and the other texts are not in docs/projekt/EKRANY.md, but the owner approved them.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/queries.ts::useDeleteAccount
 * @uses src/shared/index.ts::Button
 * @used_by src/features/profile/ProfileScreen.tsx::DeleteAccountScreen
 */

// PL: Link do innego ekranu.
// EN: A link to another screen.
import { Link } from 'react-router';
// PL: Usunięcie konta i pasek.
// EN: The account deletion and the bar.
import { useDeleteAccount } from './queries';
// PL: Wspólny nagłówek ekranu z przyciskiem wstecz i przycisk w wariancie na czerwono.
// EN: The shared screen header with the back button, and the button in the red variant.
import { Button, ScreenHeader } from '../../shared';

/**
 * PL: Rysuje ekran potwierdzenia usunięcia konta.
 * EN: Draws the account deletion confirmation screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function DeleteAccountScreen() {
  // PL: Usunięcie konta; po sukcesie wspólny kod (clearQueryData) przenosi na logowanie.
  // EN: The account deletion; after success the shared code (clearQueryData) takes the student to sign-in.
  const remove = useDeleteAccount();

  return (
    <>
      <ScreenHeader title="Usuń konto i dane" backTo="/profile" backLabel="Profil" />
      {/* PL: Pytanie i opis skutków. EN: The question and the description of the consequences. */}
      <h2>Usunąć konto?</h2>
      <p className="pf-lead">Usuniemy zgłoszenia i odpowiedzi.</p>
      {/* PL: Błąd usunięcia (na przykład brak internetu); konto zostaje. EN: The deletion error (for example no internet); the account stays. */}
      {remove.isError ? <p className="pf-error" role="alert">Nie udało się usunąć konta.</p> : null}
      {/* PL: Przycisk usunięcia; w trakcie jest wyłączony, żeby nie wysłać dwa razy. EN: The delete button; disabled while running, so it is not sent twice. */}
      <Button variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate()}>Usuń konto i dane</Button>
      {/* PL: Rezygnacja: wraca do profilu bez zmian. EN: Giving up: goes back to the profile with no change. */}
      <Link className="pf-btn pf-btn-soft" to="/profile">Anuluj</Link>
    </>
  );
}
