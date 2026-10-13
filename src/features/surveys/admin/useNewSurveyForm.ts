/**
 * PL: Stan i wysyłanie formularza „Nowa ankieta” (ekran 6.5b): szkic, błędy pokazywane dopiero po pierwszej próbie publikacji i zapis przez serwer. Po udanym zapisie przenosi na listę ankiet. Ekran (NewSurveyScreen) tylko rysuje to, co zwróci ten hook.
 * EN: The state and sending of the "Nowa ankieta" form (screen 6.5b): the draft, errors shown only after the first publish attempt, and writing through the server. After a successful write it moves to the survey list. The screen (NewSurveyScreen) only draws what this hook returns.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/draft.ts::validateDraft
 * @uses src/features/surveys/admin/surveyQueries.ts::usePublishSurvey
 * @used_by src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { hasErrors, newDraft, toRequestBody, validateDraft, type Draft, type DraftErrors } from './draft';
import { useIsOnline, usePublishSurvey } from './surveyQueries';

/** PL: Wszystko, czego potrzebuje ekran formularza. EN: Everything the form screen needs. */
export type NewSurveyForm = {
  /** PL: Szkic ankiety. EN: The survey draft. */
  draft: Draft;
  /** PL: Zmienia szkic. EN: Changes the draft. */
  setDraft: (draft: Draft) => void;
  /** PL: Błędy pól albo null, dopóki nie próbowano publikować. EN: The field errors, or null until a publish was tried. */
  errors: DraftErrors | null;
  /** PL: Obsługa wysłania formularza. EN: The form submit handler. */
  submit: (event: FormEvent) => void;
  /** PL: Czy telefon ma internet. EN: Whether the phone has internet. */
  isOnline: boolean;
  /** PL: Czy zapis właśnie trwa. EN: Whether a write is in progress. */
  isPublishing: boolean;
  /** PL: Czy ostatni zapis się nie udał. EN: Whether the last write failed. */
  hasPublishError: boolean;
};

/**
 * PL: Prowadzi formularz nowej ankiety. Zmienia dane na serwerze dopiero po poprawnym szkicu.
 * EN: Runs the new survey form. It changes data on the server only after a valid draft.
 *
 * @returns PL: stan formularza dla ekranu. EN: the form state for the screen.
 */
export function useNewSurveyForm(): NewSurveyForm {
  const [draft, setDraft] = useState(newDraft);
  const [hasTried, setHasTried] = useState(false);
  const publish = usePublishSurvey();
  const navigate = useNavigate();
  const isOnline = useIsOnline();
  const errors = validateDraft(draft, new Date());

  // PL: Wysłanie: zły szkic pokazuje błędy, dobry idzie na serwer, a po zapisie wracamy na listę.
  // EN: Submitting: a bad draft shows the errors, a good one goes to the server, and after the write we return to the list.
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setHasTried(true);
    if (hasErrors(errors) || !isOnline || publish.isPending) return;
    publish.mutate(toRequestBody(draft), { onSuccess: () => void navigate('/surveys/admin', { replace: true }) });
  };

  return { draft, setDraft, errors: hasTried ? errors : null, submit, isOnline, isPublishing: publish.isPending, hasPublishError: publish.isError };
}
