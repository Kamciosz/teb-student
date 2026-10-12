/**
 * PL: „Pasek wyboru” z przepływu 6: trzy etapy w jednym rzędzie zamiast listy rozwijanej (ekran 6.4b). To grupa przycisków radiowych, więc czytnik ekranu ogłasza, który etap jest wybrany.
 * EN: The "Pasek wyboru" (segmented control) of flow 6: three stages in one row instead of a dropdown (screen 6.4b). It is a group of radio buttons, so a screen reader announces which stage is chosen.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/reportLabels.ts::STAGES
 * @used_by src/features/reports/admin/ReportDetail.tsx::StagePicker
 */

import { STAGES } from './reportLabels';

/**
 * PL: Rysuje pasek wyboru etapu.
 * EN: Draws the stage segmented control.
 *
 * @param props - PL: wybrany etap i funkcja wywoływana po dotknięciu innego. EN: the chosen stage and the function called when another one is tapped.
 * @returns PL: drzewo elementów paska. EN: the tree of control elements.
 */
export function StagePicker({ value, onChange }: { value: string; onChange: (stage: string) => void }) {
  return (
    <div className="ra-segments" role="radiogroup" aria-label="Etap">
      {STAGES.map((stage) => (
        <button key={stage.code} type="button" role="radio" aria-checked={stage.code === value} className="ra-segment" onClick={() => onChange(stage.code)}>{stage.label}</button>
      ))}
    </div>
  );
}
