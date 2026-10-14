/**
 * PL: Formularz zgłoszenia w trzech krokach (ekrany 3.1–3.4): kategoria, miejsce, opis, potem potwierdzenie. Między miejscem a opisem pokazuje krok „Ktoś już to zgłosił?”, żeby uczeń mógł dołączyć zamiast tworzyć duplikat. Szkic trzyma się w stanie ekranu, więc „Wstecz” niczego nie kasuje. Zgłoszenie idzie na serwer dopiero po ostatnim kroku.
 * EN: The report form in three steps (screens 3.1–3.4): category, place, description, then the confirmation. Between the place and the description it shows the step "Ktoś już to zgłosił?", so the student can join instead of making a duplicate. The draft lives in the screen state, so "Wstecz" erases nothing. The report goes to the server only after the last step.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/ReportSteps.tsx::StepCategory
 * @uses src/features/reports/student/SimilarReports.tsx::SimilarReports
 * @uses src/features/reports/student/queries.ts::useSendReport
 * @uses src/features/reports/student/useReportPhoto.ts::useReportPhoto
 * @uses src/features/reports/student/ReportPhotoField.tsx::ReportPhotoField
 * @used_by src/features/reports/student/ReportsStudentScreen.tsx::ReportForm
 */

// PL: useState trzyma szkic i numer kroku.
// EN: useState holds the draft and the step number.
import { useState } from 'react';
// PL: Elementy ekranu.
// EN: The screen elements.
import { FlowTop } from './FlowTop';
import { Icon } from './icons';
import { StepCategory, StepDescription, StepPlace, type Draft } from './ReportSteps';
import { ReportSent } from './ReportSent';
// PL: Krok z listą podobnych zgłoszeń („Mnie też”).
// EN: The step with the list of similar reports ("Me too").
import { SimilarReports } from './SimilarReports';
// PL: Wysyłanie zgłoszenia.
// EN: Sending the report.
import { useSendReport } from './queries';
// PL: Zdjęcie do zgłoszenia (nieobowiązkowe): stan trzyma formularz, pole go tylko pokazuje.
// EN: The photo for the report (optional): the form holds the state, the field only shows it.
import { ReportPhotoField } from './ReportPhotoField';
import { useReportPhoto } from './useReportPhoto';

/** PL: Pusty szkic: nic nie wybrane, anonimowo włączone. EN: The empty draft: nothing chosen, anonymity on. */
const EMPTY_DRAFT: Draft = { category: '', place: '', placeDetail: '', description: '', isAnonymous: true };

/** PL: Kroki formularza; 'similar' to lista podobnych zgłoszeń, 'done' to potwierdzenie. EN: The form steps; 'similar' is the list of similar reports, 'done' is the confirmation. */
type Step = 1 | 2 | 'similar' | 3 | 'done';

/**
 * PL: Mówi, czy bieżący krok ma komplet danych, żeby przycisk „Dalej” mógł działać.
 * EN: Tells whether the current step has all its data, so the "Dalej" button may work.
 *
 * @param step - PL: numer kroku. EN: the step number.
 * @param draft - PL: szkic zgłoszenia. EN: the report draft.
 * @returns PL: prawda, gdy można iść dalej. EN: true when moving on is allowed.
 */
function isStepComplete(step: 1 | 2 | 3, draft: Draft): boolean {
  // PL: Krok 1 wymaga kategorii, krok 2 miejsca, krok 3 niepustego opisu.
  // EN: Step 1 needs a category, step 2 a place, step 3 a non-empty description.
  if (step === 1) return draft.category !== '';
  if (step === 2) return draft.place !== '';
  return draft.description.trim() !== '';
}

/**
 * PL: Zamienia błąd wysyłania na zdanie dla ucznia.
 * EN: Turns a sending error into a sentence for the student.
 *
 * @param error - PL: błąd z mutacji. EN: the error from the mutation.
 * @returns PL: komunikat po polsku. EN: the message in Polish.
 */
function errorMessage(error: Error): string {
  // PL: TypeError z fetch oznacza brak połączenia z siecią.
  // EN: A TypeError from fetch means no network connection.
  return error instanceof TypeError
    ? 'Brak internetu. Zgłoszenie nie zostało wysłane. Spróbuj ponownie, gdy wróci zasięg.'
    : 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.';
}

/** PL: Komponent każdego kroku. EN: The component of every step. */
const STEP_COMPONENTS = { 1: StepCategory, 2: StepPlace, 3: StepDescription };

/** PL: Dane dolnych przycisków. EN: The data of the bottom buttons. */
type FooterProps = {
  step: 1 | 2 | 3;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
};

/**
 * PL: Rysuje dolne przyciski: „Wstecz” od kroku 2 i „Dalej” albo „Wyślij zgłoszenie”.
 * EN: Draws the bottom buttons: "Wstecz" from step 2 and "Dalej" or "Wyślij zgłoszenie".
 *
 * @param props - PL: krok, zgoda na dalszy ruch i obsługa kliknięć. EN: the step, permission to move on and the click handlers.
 * @returns PL: drzewo elementów przycisków. EN: the tree of button elements.
 */
function FormFooter({ step, canContinue, onBack, onNext }: FooterProps) {
  // PL: Ostatni krok wysyła zgłoszenie, więc ma inny napis i ikonę.
  // EN: The last step sends the report, so it has a different label and icon.
  const isLast = step === 3;
  return (
    <div className="rs-cta">
      {step > 1 ? (
        <button type="button" className="rs-btn rs-btn-soft rs-btn-back" aria-label="Wstecz" onClick={onBack}>
          <Icon name="arrow-left" />
        </button>
      ) : null}
      <button type="button" className="rs-btn rs-btn-accent" disabled={!canContinue} onClick={onNext}>
        {isLast ? 'Wyślij zgłoszenie' : 'Dalej'}
        <Icon name={isLast ? 'send' : 'arrow-right'} />
      </button>
    </div>
  );
}

/**
 * PL: Rysuje formularz i potwierdzenie.
 * EN: Draws the form and the confirmation.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ReportForm() {
  // PL: Stan: krok, szkic i wysyłanie.
  // EN: State: the step, the draft and the sending.
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const send = useSendReport();
  // PL: Zdjęcie żyje w formularzu, więc przetrwa cofnięcie z kroku opisu.
  // EN: The photo lives in the form, so it survives going back from the description step.
  const photo = useReportPhoto((photoId) => setDraft((current) => ({ ...current, photoId })));
  // PL: W trakcie wysyłki zdjęcia albo po jego błędzie nie wysyłamy zgłoszenia.
  // EN: While the photo is uploading or after its error the report is not sent.
  const photoBlocks = photo.state.status === 'uploading' || photo.state.status === 'error';

  // PL: Po wysłaniu pokazujemy samo potwierdzenie.
  // EN: After sending we show the confirmation alone.
  if (step === 'done') return <ReportSent />;

  // PL: Krok podobnych zgłoszeń ma własne przyciski, więc formularz i dolny pasek go nie obejmują.
  // EN: The similar-reports step has its own buttons, so the form and the bottom bar do not cover it.
  if (step === 'similar') {
    return (
      <>
        <FlowTop title="Zgłoś problem" step={2} to="/" button={{ icon: 'x', label: 'Zamknij' }} />
        <SimilarReports category={draft.category} place={draft.place} onBack={() => setStep(2)} onNewReport={() => setStep(3)} />
      </>
    );
  }

  // PL: Na ostatnim kroku wyślij zgłoszenie, po miejscu pokaż podobne, a po kategorii przejdź do miejsca.
  // EN: On the last step send the report, after the place show the similar ones, after the category go to the place.
  const onNext = () => {
    if (step === 3) send.mutate(draft, { onSuccess: () => setStep('done') });
    else setStep(step === 1 ? 2 : 'similar');
  };
  const CurrentStep = STEP_COMPONENTS[step];
  return (
    <>
      <FlowTop title="Zgłoś problem" step={step} to="/" button={{ icon: 'x', label: 'Zamknij' }} />
      <form onSubmit={(event) => event.preventDefault()} noValidate>
        <CurrentStep draft={draft} onChange={(patch) => setDraft({ ...draft, ...patch })} />
        {step === 3 ? <ReportPhotoField {...photo} /> : null}
      </form>
      {send.error ? <p className="rs-error" role="alert">{errorMessage(send.error)}</p> : null}
      <FormFooter step={step} canContinue={isStepComplete(step, draft) && !send.isPending && !(step === 3 && photoBlocks)} onBack={() => setStep(step === 3 ? 2 : 1)} onNext={onNext} />
    </>
  );
}
