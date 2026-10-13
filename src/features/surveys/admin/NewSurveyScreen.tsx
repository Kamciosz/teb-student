/**
 * PL: Ekran 6.5b „Nowa ankieta” (docs/projekt/EKRANY.md): tytuł, pytania z od 2 do 5 odpowiedzi, czas trwania i przycisk „Opublikuj ankietę”. Po publikacji pytań nie da się zmienić. Zapis wymaga internetu: bez niego przycisk jest nieaktywny.
 * EN: Screen 6.5b "Nowa ankieta" (docs/projekt/EKRANY.md): the title, questions with 2 to 5 options, the duration and the "Opublikuj ankietę" button. After publishing the questions cannot be changed. Saving needs internet: without it the button is inactive.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/useNewSurveyForm.ts::useNewSurveyForm
 * @used_by src/features/surveys/admin/SurveysAdminScreen.tsx::SurveysAdminScreen
 */

import { addQuestion, MAX_QUESTIONS, MAX_TITLE_LENGTH, removeQuestion, updateQuestion } from './draft';
import { PlusIcon, SendIcon, WifiOffIcon } from './icons';
import { DurationPicker } from './DurationPicker';
import { ErrorMessage, PanelNote, ScreenTop } from './PanelParts';
import { FieldError, QuestionEditor } from './QuestionEditor';
import { useNewSurveyForm, type NewSurveyForm } from './useNewSurveyForm';

/**
 * PL: Rysuje dolną część formularza: notatkę bez internetu, błąd zapisu i przycisk „Opublikuj ankietę”.
 * EN: Draws the bottom part of the form: the no-internet note, the write error and the "Opublikuj ankietę" button.
 *
 * @param props - PL: stan formularza. EN: the form state.
 * @returns PL: stopka. EN: the footer.
 */
function PublishFooter({ form }: { form: NewSurveyForm }) {
  return (
    <div className="sa-footer">
      {/* PL: Bez internetu zapis jest wyłączony i tak to nazywamy. EN: Without internet the write is disabled and we say so. */}
      {form.isOnline ? null : <PanelNote icon={<WifiOffIcon />} text="Publikacja ankiety wymaga internetu." />}
      {form.hasPublishError ? <ErrorMessage text="Nie udało się opublikować ankiety. Spróbuj ponownie za chwilę." /> : null}
      <button type="submit" className="sa-button sa-button--primary" disabled={!form.isOnline || form.isPublishing}>
        <SendIcon />
        Opublikuj ankietę
      </button>
    </div>
  );
}

/**
 * PL: Rysuje ekran nowej ankiety. Błędy pól pokazuje dopiero po pierwszej próbie publikacji.
 * EN: Draws the new survey screen. It shows the field errors only after the first publish attempt.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function NewSurveyScreen() {
  const form = useNewSurveyForm();
  const { draft, setDraft, errors } = form;

  return (
    <main className="sa sa--flow" data-subtrack="5b">
      <ScreenTop title="Nowa ankieta" backTo="/surveys/admin" />
      <form className="sa-form" noValidate onSubmit={form.submit}>
        <label className="sa-label sa-label--tight" htmlFor="sa-title">Tytuł ankiety</label>
        <input id="sa-title" className="sa-input" value={draft.title} maxLength={MAX_TITLE_LENGTH} aria-invalid={errors?.title != null} aria-describedby="sa-title-error" onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
        <FieldError id="sa-title-error" text={errors?.title} />
        {draft.questions.map((question, index) => (
          <QuestionEditor
            key={question.key}
            question={question}
            number={index + 1}
            errors={errors?.questions.get(question.key) ?? null}
            canRemove={draft.questions.length > 1}
            onChange={(change) => setDraft(updateQuestion(draft, question.key, change))}
            onRemove={() => setDraft(removeQuestion(draft, question.key))}
          />
        ))}
        <button type="button" className="sa-button sa-button--outline" disabled={draft.questions.length >= MAX_QUESTIONS} onClick={() => setDraft(addQuestion(draft))}>
          <PlusIcon />
          Dodaj pytanie
        </button>
        <DurationPicker value={draft.durationDays} onChange={(durationDays) => setDraft({ ...draft, durationDays })} />
        <PublishFooter form={form} />
      </form>
    </main>
  );
}
