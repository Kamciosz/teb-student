/**
 * PL: Pasek postępu, np. etap zgłoszenia albo wypełnienie ankiety. Ma rolę „progressbar” i wartości aria, więc czytnik podaje postęp. Wartość jest przycinana do zakresu 0–max, żeby pasek nigdy nie wyszedł poza kafel.
 * EN: A progress bar, for example the stage of a report or the completion of a survey. It has the "progressbar" role and aria values, so the screen reader gives the progress. The value is clamped to the 0–max range, so the bar never leaves the tile.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/ProgressBar.css::.ui-progress
 * @used_by src/shared/index.ts::ProgressBar
 */

// PL: Style paska postępu.
// EN: The progress bar styles.
import './ProgressBar.css';

/**
 * PL: Właściwości paska: aktualna wartość, najwyższa wartość i opcjonalny podpis dla czytnika.
 * EN: Bar properties: the current value, the top value and an optional label for the screen reader.
 */
export type ProgressBarProps = {
  /** PL: Aktualna wartość. EN: The current value. */
  value: number;
  /** PL: Wartość pełnego paska, domyślnie 100. EN: The value of a full bar, 100 by default. */
  max?: number;
  /** PL: Nazwa paska dla czytnika, np. „Postęp zgłoszenia”. EN: The bar name for the screen reader, for example "Report progress". */
  label: string;
  className?: string;
};

/**
 * PL: Zamienia wartość na procent 0–100. Wartość poza zakresem, pusty zakres albo liczba niepoprawna (NaN) dają krańcową wartość, a nie błąd.
 * EN: Turns a value into a percent 0–100. A value out of range, an empty range or a wrong number (NaN) give the edge value, not an error.
 *
 * @param value - PL: aktualna wartość. EN: the current value.
 * @param max - PL: wartość pełnego paska. EN: the value of a full bar.
 * @returns PL: procent od 0 do 100. EN: a percent from 0 to 100.
 */
export function clampPercent(value: number, max: number): number {
  // PL: Pusty zakres albo wartość niepoprawna: pasek pusty.
  // EN: An empty range or a wrong value: the bar is empty.
  if (!(max > 0) || Number.isNaN(value)) return 0;

  // PL: Przytnij do zakresu i zaokrąglij do pełnego procenta.
  // EN: Clamp to the range and round to a whole percent.
  return Math.round(Math.min(Math.max(value / max, 0), 1) * 100);
}

/**
 * PL: Rysuje pasek postępu. Szerokość wypełnienia to wynik clampPercent, więc styl nigdy nie dostaje wartości spoza zakresu.
 * EN: Draws the progress bar. The fill width is the result of clampPercent, so the style never gets a value out of range.
 *
 * @param props - PL: wartość, zakres i nazwa. EN: the value, the range and the name.
 * @returns PL: pasek postępu. EN: the progress bar.
 */
export function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  // PL: Procent po przycięciu do zakresu.
  // EN: The percent after clamping to the range.
  const percent = clampPercent(value, max);

  // PL: Połącz klasę bazową z klasą od wywołującego.
  // EN: Join the base class with the caller's class.
  const classes = ['ui-progress', className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={percent === 0 && !(max > 0) ? 0 : Math.min(Math.max(value, 0), max)}
    >
      <div className="ui-progress-fill" style={{ transform: `scaleX(${percent / 100})` }} />
    </div>
  );
}
