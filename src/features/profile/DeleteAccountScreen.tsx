/**
 * PL: Ekran potwierdzenia „Usuń konto i dane”. Usunięcie jest ostateczne, więc wymaga osobnego przycisku. Po usunięciu telefon czyści zapisane dane i przenosi na ekran logowania. Tekst „Usuniemy zgłoszenia i odpowiedzi.” pochodzi z ekranu 2.4, a reszty tekstów nie ma w docs/projekt/EKRANY.md (do ustalenia z zespołem).
 * EN: The confirmation screen "Usuń konto i dane". The deletion is final, so it needs a separate button. After the deletion the phone clears the saved data and goes to the sign-in screen. The text "Usuniemy zgłoszenia i odpowiedzi." comes from screen 2.4, and the other texts are not in docs/projekt/EKRANY.md (to be agreed with the team).
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/queries.ts::useDeleteAccount
 * @used_by src/features/profile/ProfileScreen.tsx::DeleteAccountScreen
 */

// PL: Link do innego ekranu i przejście z kodu.
// EN: A link to another screen and the navigation from code.
import { Link, useNavigate } from 'react-router';
// PL: Usunięcie konta i pasek.
// EN: The account deletion and the bar.
import { useDeleteAccount } from './queries';
import { ScreenTop } from './ScreenTop';

/**
 * PL: Rysuje ekran potwierdzenia usunięcia konta.
 * EN: Draws the account deletion confirmation screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function DeleteAccountScreen() {
  // PL: Usunięcie konta; po sukcesie przechodzimy na logowanie.
  // EN: The account deletion; after success we go to sign-in.
  const remove = useDeleteAccount();
  const navigate = useNavigate();

  /** PL: Usuwa konto, a po sukcesie przenosi na ekran logowania (bez wracania do profilu klawiszem „wstecz”). EN: Deletes the account and after success goes to the sign-in screen (without going back to the profile with the back key). */
  function handleDelete(): void {
    remove.mutate(undefined, { onSuccess: () => navigate('/auth/email', { replace: true }) });
  }

  return (
    <>
      <ScreenTop title="Usuń konto i dane" backTo="/profile" backLabel="Wróć do profilu" />
      {/* PL: Pytanie i opis skutków. EN: The question and the description of the consequences. */}
      <h1>Usunąć konto?</h1>
      <p className="pf-lead">Usuniemy zgłoszenia i odpowiedzi.</p>
      {/* PL: Błąd usunięcia (na przykład brak internetu); konto zostaje. EN: The deletion error (for example no internet); the account stays. */}
      {remove.isError ? <p className="pf-error" role="alert">Nie udało się usunąć konta.</p> : null}
      {/* PL: Przycisk usunięcia; w trakcie jest wyłączony, żeby nie wysłać dwa razy. EN: The delete button; disabled while running, so it is not sent twice. */}
      <button type="button" className="pf-btn pf-btn-accent" disabled={remove.isPending} onClick={handleDelete}>Usuń konto i dane</button>
      {/* PL: Rezygnacja: wraca do profilu bez zmian. EN: Giving up: goes back to the profile with no change. */}
      <Link className="pf-btn pf-btn-soft" to="/profile">Anuluj</Link>
    </>
  );
}
