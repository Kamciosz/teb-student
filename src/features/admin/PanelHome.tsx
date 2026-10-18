/**
 * PL: Ekran główny panelu (6.1b i 6.1c w docs/projekt/EKRANY.md): podpis roli i wiersze części panelu, które widzi ta rola. Samorząd widzi Wpisy, Zgłoszenia, Ankiety i Kody zaproszeń, administrator to samo plus „Role” ze znacznikiem i osobną grupę „Pilotaż”, redakcja tylko Wpisy z notatką o ograniczeniu.
 * EN: The panel main screen (6.1b and 6.1c in docs/projekt/EKRANY.md): the role caption and the rows of the panel sections this role sees. The Council sees Entries, Reports, Surveys and Invitation codes, the administrator the same plus "Role" with a badge and a separate "Pilotaż" group, the editorial team only Entries with a note about the limit.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/queries.ts::usePanelLevel
 * @uses src/features/admin/panelView.ts::sectionsFor
 * @uses src/features/admin/panelView.ts::pilotSectionsFor
 * @uses src/features/admin/panelView.ts::roleCaption
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @used_by src/features/admin/AdminScreen.tsx::PanelHome
 */

// PL: Wspólne elementy ekranu: nagłówek, grupy i wiersze.
// EN: The shared screen elements: the header, the groups and the rows.
import { ListGroup, ListRow, ScreenHeader } from '../../shared';
// PL: Ikony panelu i części panelu z widoku.
// EN: The panel icons and the panel sections from the view.
import { Icon } from './icons';
import { type PanelSection, pilotSectionsFor, roleCaption, sectionsFor } from './panelView';
import { usePanelLevel } from './queries';

/**
 * PL: Rysuje ekran główny panelu dla roli zalogowanego ucznia. Rama panelu wpuszcza tu tylko uczniów z rolą, więc bez roli ekran nic nie rysuje.
 * EN: Draws the panel main screen for the signed-in student's role. The panel frame lets only students with a role in here, so without a role the screen draws nothing.
 *
 * @returns PL: drzewo elementów ekranu albo null. EN: the tree of screen elements or null.
 */
export function PanelHome() {
  // PL: Rola z pamięci podręcznej (rama panelu już ją wczytała).
  // EN: The role from the cache (the panel frame has already loaded it).
  const level = usePanelLevel().data;
  if (!level) return null;

  const pilot = pilotSectionsFor(level);
  return (
    <main className="ad-screen" data-subtrack="8">
      {/* PL: Redakcja ma „Panel redakcji”, reszta „Panel Samorządu”. Pasek prowadzi z powrotem do profilu, a podpis roli stoi pod paskiem. EN: The editorial team has "Panel redakcji", the rest "Panel Samorządu". The bar leads back to the profile, and the role caption stands below the bar. */}
      <ScreenHeader title={level === 'editor' ? 'Panel redakcji' : 'Panel Samorządu'} backTo="/profile" backLabel="Profil" />
      <p className="ad-role-caption">{roleCaption(level)}</p>
      {/* PL: Główna grupa z wierszami części panelu. EN: The main group with the panel section rows. */}
      <SectionGroup sections={sectionsFor(level)} footer={level === 'editor' ? 'Redakcja publikuje tylko wpisy. Resztę panelu widzi Samorząd.' : undefined} />
      {/* PL: Administrator widzi pod nagłówkiem „Pilotaż” osobną grupę. EN: The administrator sees a separate group under the "Pilotaż" header. */}
      {pilot.length > 0 ? <SectionGroup sections={pilot} header="Pilotaż" /> : null}
    </main>
  );
}

/**
 * PL: Rysuje grupę wierszy części panelu. Każdy wiersz jest linkiem do ekranu części, a znacznik (jeśli jest) stoi przy tytule.
 * EN: Draws a group of panel section rows. Each row is a link to the section screen, and the badge (if there is one) stands next to the title.
 *
 * @param props - PL: części do pokazania, nagłówek i przypis grupy. EN: the sections to show, the group header and the footnote.
 * @returns PL: grupa wierszy. EN: the group of rows.
 */
function SectionGroup({ sections, header, footer }: { sections: PanelSection[]; header?: string; footer?: string }) {
  return (
    <ListGroup header={header} footer={footer}>
      {sections.map((section) => (
        <ListRow
          key={section.to}
          to={section.to}
          icon={<Icon name={section.icon} />}
          title={
            <>
              {section.title}
              {section.badge ? (
                <>
                  {' '}
                  <span className="ad-badge">{section.badge}</span>
                </>
              ) : null}
            </>
          }
          subtitle={section.hint}
        />
      ))}
    </ListGroup>
  );
}
