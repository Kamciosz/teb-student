/**
 * PL: Karta linku do mediów społecznościowych we wpisie. Pokazuje nazwę serwisu i adres, a cała karta jest linkiem w nowej karcie. Nie osadza treści i nie ładuje niczego z serwisu (bez ramki, bez obrazka i bez ikony), bo osadzenie ładowałoby śledzenie serwisu (plan, część 3).
 * EN: A social media link card in an entry. It shows the network name and the address, and the whole card is a link that opens in a new tab. It does not embed the content and loads nothing from the network (no frame, no image and no icon), because embedding would load the network's tracking (plan, part 3).
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/feed/content/sanitize.ts::SafeBlock
 * @used_by src/features/news/feed/content/RichContent.tsx::renderBlock
 * @used_by src/features/news/feed/content/LinkCard.test.tsx::RichContent
 */

/**
 * PL: Dane karty linku. Adres i nazwa są już sprawdzone w sanitize.ts.
 * EN: Link card data. The address and the name are already checked in sanitize.ts.
 */
export type LinkCardProps = {
  /** PL: Adres https serwisu. EN: The https address of the network. */
  href: string;
  /** PL: Nazwa serwisu, na przykład „Instagram”. EN: The network name, for example "Instagram". */
  network: string;
};

/**
 * PL: Rysuje kartę linku: nazwę serwisu i adres, z linkiem w nowej karcie.
 * EN: Draws the link card: the network name and the address, with a link that opens in a new tab.
 *
 * @param props - PL: adres i nazwa serwisu. EN: the address and the network name.
 * @returns PL: element karty. EN: the card element.
 */
export function LinkCard({ href, network }: LinkCardProps) {
  return (
    <a className="news-link-card" href={href} target="_blank" rel="noopener noreferrer">
      <strong className="news-link-card__network">{network}</strong>
      <span className="news-link-card__address">{href}</span>
    </a>
  );
}
