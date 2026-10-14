/**
 * PL: Kafel „Zgłoszenia”: zgłoszenie ucznia z paskiem trzech etapów i podpisem „Etap N z 3”. Cały kafel prowadzi do „Moich zgłoszeń”. Bez zgłoszeń kafel mówi, że nic nie ma (docs/projekt/EKRANY.md, ekran 2.1).
 * EN: The "Zgłoszenia" tile: the student's report with a bar of three stages and the "Etap N z 3" caption. The whole tile leads to "Moje zgłoszenia". Without reports the tile says there is nothing (docs/projekt/EKRANY.md, screen 2.1).
 *
 * @author Kacper
 * @since 2026-10-11
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Link do ekranu „Moje zgłoszenia” bez przeładowania strony.
// EN: A link to the "Moje zgłoszenia" screen without reloading the page.
import { Link } from 'react-router';
// PL: Typ danych kafla.
// EN: The tile data type.
import type { DashboardReport } from './types';

/** PL: Liczba etapów zgłoszenia (przyjęte, w trakcie, załatwione), czyli segmentów paska. EN: The number of report stages (received, in progress, resolved), that is the bar segments. */
const STAGE_COUNT = 3;

/** PL: Numery segmentów paska, od 1 do liczby etapów. EN: The bar segment numbers, from 1 to the stage count. */
const SEGMENTS = Array.from({ length: STAGE_COUNT }, (_unused, index) => index + 1);

/**
 * PL: Dane kafla „Zgłoszenia”.
 * EN: The data of the "Zgłoszenia" tile.
 */
export type ReportTileProps = {
  /** PL: Zgłoszenie do pokazania albo null, gdy uczeń nic nie zgłosił. EN: The report to show, or null when the student reported nothing. */
  report: DashboardReport | null;
};

/**
 * PL: Rysuje kafel „Zgłoszenia” ze zgłoszeniem albo z pustym stanem.
 * EN: Draws the "Zgłoszenia" tile with a report or with the empty state.
 *
 * @param props - PL: zgłoszenie do pokazania. EN: the report to show.
 * @returns PL: kafel z linkiem do „Moich zgłoszeń” albo kafel z napisem o braku zgłoszeń. EN: a tile with a link to "Moje zgłoszenia", or a tile with a label about no reports.
 */
export function ReportTile({ report }: ReportTileProps) {
  // PL: Bez zgłoszeń kafel mówi to wprost. Napis jest z modułu zgłoszeń.
  // EN: Without reports the tile says so plainly. The label is from the reports module.
  if (report === null) {
    return (
      <section className="dash-tile" aria-label="Zgłoszenia">
        <p className="dash-label">Zgłoszenia</p>
        <p className="dash-empty">Nie masz jeszcze żadnych zgłoszeń.</p>
      </section>
    );
  }

  // PL: Kafel jest linkiem. Liczba niezałatwionych zgłoszeń, treść zgłoszenia, pasek etapów i podpis etapu.
  // EN: The tile is a link. The unresolved report count, the report text, the stage bar and the stage caption.
  return (
    <Link className="dash-tile dash-tile--split" to="/reports/student/moje">
      <span>
        <span className="dash-label">Zgłoszenia</span>
        <span className="dash-num">{report.openCount}</span>
        <span className="dash-label dash-label--ink">w trakcie</span>
      </span>
      <span className="dash-bottom">
        <span className="dash-small dash-clamp">{report.description}</span>
        {/* PL: Pasek etapów: zapalone segmenty do bieżącego etapu włącznie. Ozdoba, bo etap czyta podpis pod spodem. EN: The stage bar: lit segments up to and including the current stage. Decoration, because the caption below carries the stage. */}
        <span className="dash-stages" aria-hidden="true">
          {SEGMENTS.map((segment) => (
            <i key={segment} className={segment <= report.stage ? 'dash-stages__on' : undefined} />
          ))}
        </span>
        <span className="dash-caption">{`Etap ${report.stage} z ${STAGE_COUNT}`}</span>
      </span>
    </Link>
  );
}
