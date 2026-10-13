/**
 * PL: Skala 1–5 na ekranie pytania: pięć przycisków w jednym rzędzie i opisy skrajnych wartości pod nimi. Każdy przycisk to prawdziwe pole radio (ukryte wizualnie), więc działa z klawiatury i z czytnikiem ekranu. Odpowiedzi to zwykłe opcje z serwera, bez liter.
 * EN: The 1–5 scale on the question screen: five buttons in one row, with the extreme values captioned under them. Each button is a real radio input (visually hidden), so it works with the keyboard and a screen reader. The answers are ordinary options from the server, with no letters.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/surveys/vote/texts.ts::TO_AGREE
 * @uses src/features/surveys/vote/types.ts::SurveyOption
 * @used_by src/features/surveys/vote/QuestionStep.tsx::QuestionStep
 */

// PL: Opisy skrajnych wartości (do uzgodnienia).
// EN: The captions of the extreme values (to be agreed).
import { TO_AGREE } from './texts';
import type { SurveyOption } from './types';

/** PL: Dane skali 1–5. EN: The data of the 1–5 scale. */
export type ScaleOptionsProps = {
  /** PL: Nazwa grupy pól radio, wspólna dla pytania. EN: The name of the radio group, shared by the question. */
  name: string;
  /** PL: Pięć odpowiedzi skali w kolejności z serwera. EN: The five scale options in the order from the server. */
  options: SurveyOption[];
  /** PL: Numery wybranych odpowiedzi (pusta lista, gdy nic). EN: The chosen option ids (an empty list when none). */
  selectedIds: string[];
  /** PL: Zgłasza kliknięcie odpowiedzi. EN: Reports a click on an option. */
  onPick: (optionId: string) => void;
};

/**
 * PL: Rysuje skalę: w rzędzie przyciski z wartościami z serwera, pod nimi opisy „1” i „5”.
 * EN: Draws the scale: a row of buttons with the values from the server, and the captions of "1" and "5" under them.
 *
 * @param props - PL: nazwa grupy, odpowiedzi, wybrane i funkcja kliknięcia. EN: the group name, the options, the chosen ones and the click function.
 * @returns PL: drzewo elementów skali. EN: the tree of scale elements.
 */
export function ScaleOptions({ name, options, selectedIds, onPick }: ScaleOptionsProps) {
  return (
    <fieldset className="vote-scale">
      <legend className="vote-sr-only">Odpowiedzi</legend>
      <div className="vote-scale__row">
        {options.map((option) => (
          <label key={option.id} className="vote-scale__item">
            <input type="radio" name={name} value={option.id} checked={selectedIds.includes(option.id)} onChange={() => onPick(option.id)} />
            <span className="vote-scale__segment">{option.label}</span>
          </label>
        ))}
      </div>
      <div className="vote-scale__ends">
        <span>{TO_AGREE.scaleLowest}</span>
        <span>{TO_AGREE.scaleHighest}</span>
      </div>
    </fieldset>
  );
}
