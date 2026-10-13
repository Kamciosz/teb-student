/**
 * PL: Edytor jednego pytania na ekranie 6.5b „Nowa ankieta”: pole pytania, od 2 do 5 wierszy odpowiedzi z literami A–E i przyciskiem „x”, przycisk „Dodaj odpowiedź” i teksty błędów pod polami (EKRANY.md). Stan trzyma ekran (NewSurveyScreen), a ten komponent tylko rysuje i woła funkcje z draft.ts.
 * EN: The editor of one question on screen 6.5b "Nowa ankieta": the question field, 2 to 5 option rows with letters A–E and an "x" button, the "Dodaj odpowiedź" button and the error texts under the fields (EKRANY.md). The screen (NewSurveyScreen) holds the state, and this component only draws and calls the functions from draft.ts.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/draft.ts::addOption
 * @used_by src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 */

import { addOption, MAX_OPTION_LENGTH, MAX_OPTIONS, MAX_PROMPT_LENGTH, MIN_OPTIONS, removeOption, type DraftQuestion, type QuestionErrors } from './draft';
import { OPTION_LETTERS } from './format';
import { PlusIcon, TriangleAlertIcon, XIcon } from './icons';

/** PL: Dane edytora pytania. EN: The question editor data. */
type QuestionEditorProps = {
  /** PL: Pytanie ze szkicu. EN: The question from the draft. */
  question: DraftQuestion;
  /** PL: Numer pytania w ankiecie od 1 (do podpisu „Pytanie 1”). EN: The question number in the survey from 1 (for the "Pytanie 1" label). */
  number: number;
  /** PL: Błędy pól albo null, dopóki nie próbowano publikować. EN: The field errors, or null until a publish was tried. */
  errors: QuestionErrors | null;
  /** PL: Czy pytanie wolno usunąć (jest więcej niż jedno). EN: Whether the question may be removed (there is more than one). */
  canRemove: boolean;
  /** PL: Zmienia pytanie w szkicu. EN: Changes the question in the draft. */
  onChange: (change: (question: DraftQuestion) => DraftQuestion) => void;
  /** PL: Usuwa pytanie ze szkicu. EN: Removes the question from the draft. */
  onRemove: () => void;
};

/**
 * PL: Rysuje błąd pod polem: ikona ostrzeżenia i tekst (błędu nie oznaczamy kolorem). Bez tekstu nic nie rysuje.
 * EN: Draws an error under a field: a warning icon and text (an error is not marked with color). Without text it draws nothing.
 *
 * @param props - PL: numer elementu błędu i tekst. EN: the error element id and the text.
 * @returns PL: błąd albo nic. EN: the error or nothing.
 */
export function FieldError({ id, text }: { id: string; text: string | null | undefined }) {
  if (text === null || text === undefined) return null;
  return (
    <p id={id} className="sa-field-error">
      <TriangleAlertIcon />
      <span>{text}</span>
    </p>
  );
}

/**
 * PL: Rysuje wiersz jednej odpowiedzi: litera, pole tekstu i przycisk „x” (nieaktywny przy dwóch odpowiedziach).
 * EN: Draws the row of one option: the letter, the text field and the "x" button (inactive with two options).
 *
 * @param props - PL: litera, tekst, możliwość usunięcia i funkcje. EN: the letter, the text, whether it can be removed and the functions.
 * @returns PL: wiersz. EN: the row.
 */
function OptionRow(props: { letter: string; value: string; canRemove: boolean; onChange: (text: string) => void; onRemove: () => void }) {
  return (
    <li className="sa-option">
      {/* PL: Litera odpowiedzi. EN: The option letter. */}
      <span className="sa-letter">{props.letter}</span>
      {/* PL: Treść odpowiedzi, wpisywana przez osobę z Samorządu. EN: The option text, typed by the Student Council member. */}
      <input className="sa-option__input" value={props.value} maxLength={MAX_OPTION_LENGTH} aria-label={`Odpowiedź ${props.letter}`} onChange={(event) => props.onChange(event.target.value)} />
      {/* PL: Usuń odpowiedź. Przy dwóch odpowiedziach jest nieaktywny. EN: Remove the option. Inactive with two options. */}
      <button type="button" className="sa-icon-button" disabled={!props.canRemove} aria-label={`Usuń odpowiedź ${props.letter}`} onClick={props.onRemove}>
        <XIcon />
      </button>
    </li>
  );
}

/**
 * PL: Rysuje edytor jednego pytania.
 * EN: Draws the editor of one question.
 *
 * @param props - PL: dane edytora. EN: the editor data.
 * @returns PL: sekcja pytania. EN: the question section.
 */
export function QuestionEditor({ question, number, errors, canRemove, onChange, onRemove }: QuestionEditorProps) {
  const promptId = `sa-prompt-${question.key}`;
  const canRemoveOption = question.options.length > MIN_OPTIONS;

  return (
    <section className="sa-question">
      <div className="sa-question__head">
        <label className="sa-label sa-label--tight" htmlFor={promptId}>{`Pytanie ${number}`}</label>
        {/* PL: Usunięcie pytania jest tylko przy kilku pytaniach, bo ankieta ma co najmniej jedno. EN: Removing a question exists only with several questions, because a survey has at least one. */}
        {canRemove ? (
          <button type="button" className="sa-icon-button" aria-label={`Usuń pytanie ${number}`} onClick={onRemove}>
            <XIcon />
          </button>
        ) : null}
      </div>
      <input id={promptId} className="sa-input" value={question.prompt} maxLength={MAX_PROMPT_LENGTH} aria-invalid={errors?.prompt != null} aria-describedby={`${promptId}-error`} onChange={(event) => onChange((current) => ({ ...current, prompt: event.target.value }))} />
      <FieldError id={`${promptId}-error`} text={errors?.prompt} />
      <ul className="sa-options">
        {question.options.map((option, index) => (
          <OptionRow
            key={index}
            letter={OPTION_LETTERS[index] ?? ''}
            value={option}
            canRemove={canRemoveOption}
            onChange={(text) => onChange((current) => ({ ...current, options: current.options.map((item, place) => (place === index ? text : item)) }))}
            onRemove={() => onChange((current) => removeOption(current, index))}
          />
        ))}
      </ul>
      <FieldError id={`${promptId}-options-error`} text={errors?.options} />
      {/* PL: Dodaj odpowiedź. Przy pięciu odpowiedziach jest nieaktywny. EN: Add an option. Inactive with five options. */}
      <button type="button" className="sa-button sa-button--outline" disabled={question.options.length >= MAX_OPTIONS} onClick={() => onChange(addOption)}>
        <PlusIcon />
        Dodaj odpowiedź
      </button>
    </section>
  );
}
