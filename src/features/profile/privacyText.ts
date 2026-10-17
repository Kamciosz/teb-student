/**
 * PL: Treść polityki prywatności, zebrana z założeń prywatności w docs/PLAN_APLIKACJI.md, część 3. W docs/projekt/EKRANY.md nie ma jej treści, a właściciel ją zatwierdził. Każde zdanie musi zgadzać się z działaniem aplikacji.
 * EN: The privacy policy content, collected from the privacy assumptions in docs/PLAN_APLIKACJI.md, part 3. docs/projekt/EKRANY.md has no content for it, and the owner approved it. Every sentence must match how the app works.
 *
 * @author Jakub
 * @since 2026-10-11
 * @used_by src/features/profile/PrivacyScreen.tsx::PRIVACY_SECTIONS
 */

/** PL: Jedna część polityki: nagłówek i akapity. EN: One part of the policy: a heading and paragraphs. */
export type PrivacySection = { heading: string; paragraphs: string[] };

/**
 * PL: Części polityki prywatności, w kolejności na ekranie.
 * EN: The parts of the privacy policy, in the order on screen.
 */
export const PRIVACY_SECTIONS: readonly PrivacySection[] = [
  {
    heading: 'Co zbieramy',
    paragraphs: [
      'Szkolny adres e-mail, którym się logujesz. Imię, klasę i szkołę, jeśli je wpiszesz w profilu. Zgłoszenia, które wysyłasz. Informację, że wypełniłeś ankietę.',
    ],
  },
  {
    heading: 'Kto co widzi',
    paragraphs: [
      'Z ankiety nie da się ustalić, kto co odpowiedział. Samorząd nie widzi autora zgłoszenia anonimowego. Wyniki ankiety pokazujemy dopiero od 5 odpowiedzi.',
    ],
  },
  {
    heading: 'Usunięcie konta',
    paragraphs: ['Usunięcie konta usuwa Twoje dane. Zgłoszenia i wpisy zostają, ale bez autora.'],
  },
];
