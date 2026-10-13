/**
 * PL: Rzędy kafelków pulpitu w zapisanej kolejności. W trybie edycji pod każdym kafelkiem stoją przyciski „Wyżej” i „Niżej” (pole dotyku 44 px, z aria-label). Kafelek z przyciskami nie prowadzi do ekranu, żeby przypadkowe dotknięcie nie zabrało ucznia z układania.
 * EN: The rows of the dashboard tiles in the saved order. In edit mode, the "Wyżej" and "Niżej" buttons stand under every tile (a 44 px touch area, with an aria-label). A tile with the buttons does not lead to a screen, so an accidental tap does not take the student away from arranging.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/dashboard/tileOrder.ts::groupRows
 * @uses src/features/dashboard/tileOrder.ts::TILE_NAMES
 * @uses src/features/dashboard/types.ts::DashboardData
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Typy fragmentów i węzłów Reacta.
// EN: The React fragment and node types.
import { Fragment } from 'react';
// PL: Kafelki pulpitu.
// EN: The dashboard tiles.
import { AnnouncementsTile } from './AnnouncementsTile';
import { ImportantTile } from './ImportantTile';
import { ReportTile } from './ReportTile';
import { SurveyTile } from './SurveyTile';
// PL: Dane pulpitu i kolejność kafelków.
// EN: The dashboard data and the tile order.
import type { DashboardData } from './types';
import { TILE_NAMES, groupRows, type TileId } from './tileOrder';

/**
 * PL: Rysuje kafelek o podanym identyfikatorze z jego danych.
 * EN: Draws the tile with the given identifier from its data.
 *
 * @param props - PL: identyfikator i dane pulpitu. EN: the identifier and the dashboard data.
 * @returns PL: kafelek. EN: the tile.
 */
function TileContent({ id, data }: { id: TileId; data: DashboardData | undefined }) {
  switch (id) {
    case 'important':
      return <ImportantTile entry={data?.important ?? null} />;
    case 'survey':
      return <SurveyTile survey={data?.survey ?? null} />;
    case 'report':
      return <ReportTile report={data?.report ?? null} />;
    case 'announcements':
      return <AnnouncementsTile rows={data?.announcements ?? []} />;
  }
}

/** PL: Własności jednego miejsca na kafelek. EN: The properties of one tile place. */
type TileSlotProps = {
  id: TileId;
  data: DashboardData | undefined;
  editing: boolean;
  canUp: boolean;
  canDown: boolean;
  onMove: (id: TileId, step: -1 | 1) => void;
};

/**
 * PL: Miejsce na kafelek: sam kafelek, a w trybie edycji także przyciski kolejności.
 * EN: A place for a tile: the tile alone, and in edit mode also the order buttons.
 *
 * @param props - PL: kafelek, dane, tryb edycji i możliwość przesunięcia. EN: the tile, the data, the edit mode and whether it can move.
 * @returns PL: miejsce na kafelek. EN: the tile place.
 */
function TileSlot({ id, data, editing, canUp, canDown, onMove }: TileSlotProps) {
  const name = TILE_NAMES[id];
  return (
    <div className={editing ? 'dash-slot dash-slot--editing' : 'dash-slot'}>
      <TileContent id={id} data={data} />
      {editing && (
        <div className="dash-move">
          <button type="button" className="dash-move__btn" disabled={!canUp} aria-label={`Wyżej: ${name}`} onClick={() => onMove(id, -1)}>
            Wyżej
          </button>
          <button type="button" className="dash-move__btn" disabled={!canDown} aria-label={`Niżej: ${name}`} onClick={() => onMove(id, 1)}>
            Niżej
          </button>
        </div>
      )}
    </div>
  );
}

/** PL: Własności rzędów kafelków. EN: The properties of the tile rows. */
type TileRowsProps = {
  order: readonly TileId[];
  data: DashboardData | undefined;
  editing: boolean;
  onMove: (id: TileId, step: -1 | 1) => void;
};

/**
 * PL: Rysuje kafelki w kolejności z zapisu. Ankieta i zgłoszenie są w jednym rzędzie tylko wtedy, gdy stoją obok siebie.
 * EN: Draws the tiles in the saved order. The survey and the report share a row only when they stand next to each other.
 *
 * @param props - PL: kolejność, dane, tryb edycji i funkcja przesunięcia. EN: the order, the data, the edit mode and the move function.
 * @returns PL: rzędy kafelków. EN: the tile rows.
 */
export function TileRows({ order, data, editing, onMove }: TileRowsProps) {
  return (
    <>
      {groupRows(order).map((row) => {
        const slots = row.map((id) => (
          <TileSlot
            key={id}
            id={id}
            data={data}
            editing={editing}
            canUp={order.indexOf(id) > 0}
            canDown={order.indexOf(id) < order.length - 1}
            onMove={onMove}
          />
        ));
        // PL: Para kafelków stoi w jednym rzędzie siatki; pojedynczy kafelek ma cały wiersz.
        // EN: A pair of tiles stands in one grid row; a single tile takes a whole line.
        return row.length === 2 ? (
          <div className="dash-pair" key={row.join('+')}>
            {slots}
          </div>
        ) : (
          <Fragment key={row[0]}>{slots}</Fragment>
        );
      })}
    </>
  );
}
