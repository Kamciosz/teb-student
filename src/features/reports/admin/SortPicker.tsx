/**
 * PL: Przełącznik kolejności listy zgłoszeń: „Najnowsze” i „Najwięcej osób” jako dwa przyciski obok siebie, a nie lista rozwijana. Wzór jak „Pasek wyboru” z przepływu 6 (StagePicker).
 * EN: The list order switch of the reports: "Najnowsze" and "Najwięcej osób" as two buttons side by side, not a dropdown. The pattern of the "Pasek wyboru" from flow 6 (StagePicker).
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/reports/admin/reportLabels.ts::ORDERS
 * @uses src/features/reports/admin/reportLabels.ts::ReportOrder
 * @used_by src/features/reports/admin/ReportsList.tsx::SortPicker
 */

import { ORDERS, type ReportOrder } from './reportLabels';

/**
 * PL: Rysuje przełącznik kolejności listy.
 * EN: Draws the list order switch.
 *
 * @param props - PL: wybrana kolejność i funkcja wywoływana po dotknięciu innej. EN: the chosen order and the function called when another one is tapped.
 * @returns PL: drzewo elementów przełącznika. EN: the tree of switch elements.
 */
export function SortPicker({ value, onChange }: { value: ReportOrder; onChange: (order: ReportOrder) => void }) {
  // PL: Jeden przycisk na kolejność; wybrany ma `aria-checked`, a dotknięcie innego woła `onChange`. Grupa ma własną etykietę „Kolejność”, bo etapy są już opisane jako „Etap”.
  // EN: One button per order; the chosen one has `aria-checked`, and tapping another calls `onChange`. The group has its own label "Kolejność", because the stages are already labelled "Etap".
  return (
    <div className="ra-segments" role="radiogroup" aria-label="Kolejność">
      {ORDERS.map((order) => (
        <button key={order.code} type="button" role="radio" aria-checked={order.code === value} className="ra-segment" onClick={() => onChange(order.code)}>{order.label}</button>
      ))}
    </div>
  );
}
