/**
 * PL: Ekran podtoru 4b (zgłoszenia w panelu: zmiana etapu): lista pod `/reports/admin` i szczegół pod `/reports/admin/<numer>`. Stoi w ramie panelu z menu (podtor 8). Stoi za bramką roli Samorządu (PanelGate): uczeń bez roli widzi ekran „Tylko dla Samorządu”. Dane chroni serwer, ten ekran tylko pokazuje błąd, gdy serwer odmówi.
 * EN: The screen of subtrack 4b (reports in the panel: stage change): the list under `/reports/admin` and the detail under `/reports/admin/<id>`. It stands in the panel frame with the menu (subtrack 8). It stands behind the Council role gate (PanelGate): a student without a role sees the "Tylko dla Samorządu" screen. The server protects the data, this screen only shows an error when the server refuses.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/reports/admin/ReportsList.tsx::ReportsList
 * @uses src/features/reports/admin/ReportDetail.tsx::ReportDetail
 * @uses src/features/admin/index.ts::PanelGate
 * @used_by src/features/reports/admin/index.ts::ReportsAdminScreen
 */

import { Route, Routes } from 'react-router';
// PL: Bramka roli panelu, przez drzwi modułu admin.
// EN: The panel role gate, through the door of the admin module.
import { PanelGate } from '../../admin';
import './reportsAdmin.css';
import { ReportDetail } from './ReportDetail';
import { ReportsList } from './ReportsList';

/**
 * PL: Rysuje ekran podtoru 4b: listę albo szczegół zgłoszenia, zależnie od adresu.
 * EN: Draws the screen of subtrack 4b: the list or the report detail, depending on the address.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ReportsAdminScreen() {
  // PL: Bramka roli Samorządu otacza całość: bez roli nie pobieramy zgłoszeń. Pusty adres to lista, adres z numerem to szczegół, każdy inny wraca do listy. `data-subtrack` pokazuje testowi, który to ekran.
  // EN: The Council role gate wraps everything: without the role we do not fetch reports. An empty address is the list, an address with an id is the detail, any other goes back to the list. `data-subtrack` shows a test which screen it is.
  return (
    <PanelGate minimum="council">
      <section className="ra-screen" data-subtrack="4b">
        <Routes>
          <Route index element={<ReportsList />} />
          <Route path=":id" element={<ReportDetail />} />
          <Route path="*" element={<ReportsList />} />
        </Routes>
      </section>
    </PanelGate>
  );
}
