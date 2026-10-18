/**
 * PL: Ekran „Polityka prywatności”. Otwiera się bez logowania i nie pyta serwera, a treść jest zapisana w aplikacji, więc działa też bez internetu.
 * EN: The "Polityka prywatności" screen. It opens without signing in and asks no server, and the content is stored in the app, so it also works without internet.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/privacyText.ts::PRIVACY_SECTIONS
 * @uses src/shared/index.ts::ScreenHeader
 * @used_by src/features/profile/ProfileScreen.tsx::PrivacyScreen
 */

// PL: Treść polityki i górny pasek.
// EN: The policy content and the top bar.
import { PRIVACY_SECTIONS } from './privacyText';
// PL: Wspólny nagłówek ekranu z przyciskiem wstecz.
// EN: The shared screen header with the back button.
import { ScreenHeader } from '../../shared';

/**
 * PL: Rysuje politykę prywatności.
 * EN: Draws the privacy policy.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function PrivacyScreen() {
  return (
    <>
      {/* PL: Pasek z powrotem do profilu (bez sesji profil odeśle na logowanie). EN: The bar with the way back to the profile (without a session the profile sends to sign-in). */}
      <ScreenHeader title="Polityka prywatności" backTo="/profile" backLabel="Profil" />
      {/* PL: Części polityki: nagłówek i akapity. EN: The parts of the policy: a heading and paragraphs. */}
      {PRIVACY_SECTIONS.map((section) => (
        <section key={section.heading} className="pf-section">
          <h2>{section.heading}</h2>
          {section.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </section>
      ))}
    </>
  );
}
