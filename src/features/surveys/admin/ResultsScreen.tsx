/**
 * PL: Ekrany wyników ankiety: 6.5c „Wyniki: za mało odpowiedzi” (poniżej 5 odpowiedzi tylko liczba) i 6.5d „Wyniki” (od 5 odpowiedzi: liczba i udział każdej odpowiedzi, zbiorczo, bez autorów). To, który z nich zobaczymy, rozstrzyga serwer: poniżej progu nie wysyła rozkładu głosów, więc telefon nie ma czego pokazać nawet po zmianie kodu.
 * EN: The survey results screens: 6.5c "Wyniki: za mało odpowiedzi" (below 5 responses only the count) and 6.5d "Wyniki" (from 5 responses: the count and share of every option, aggregated, without authors). The server decides which one we see: below the threshold it does not send the vote distribution, so the phone has nothing to show even if the code is changed.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/surveyQueries.ts::useSurveyResults
 * @uses src/features/surveys/admin/surveyQueries.ts::useIsOnline
 * @uses src/features/surveys/admin/surveyApi.ts::fetchResultsCsv
 * @used_by src/features/surveys/admin/SurveysAdminScreen.tsx::SurveysAdminScreen
 */

import { useState } from 'react';
import { useParams } from 'react-router';
import { describeQuestions, describeResponses, formatShortDate, OPTION_LETTERS } from './format';
import { LockIcon, WifiOffIcon } from './icons';
import { ErrorMessage, PanelNote, ScreenTop } from './PanelParts';
import { fetchResultsCsv } from './surveyApi';
import { useIsOnline, useSurveyResults } from './surveyQueries';
import { TO_AGREE } from './texts';
import type { OptionResult, QuestionResult, SurveyResults } from './types';

/**
 * PL: Rysuje nagłówek wyników: etykieta „Ankieta”, tytuł i podpis (liczba pytań albo odpowiedzi z terminem).
 * EN: Draws the results header: the "Ankieta" label, the title and the caption (the question or response count with the deadline).
 *
 * @param props - PL: wyniki i pierwsza część podpisu. EN: the results and the first part of the caption.
 * @returns PL: nagłówek. EN: the header.
 */
function ResultsHeader({ results, summary }: { results: SurveyResults; summary: string }) {
  return (
    <div className="sa-results-head">
      <p className="sa-label sa-label--tight">Ankieta</p>
      <h2 className="sa-h2">{results.title}</h2>
      <p className="sa-small">{`${summary} · do ${formatShortDate(results.endsOn)}`}</p>
    </div>
  );
}

/**
 * PL: Rysuje ekran 6.5c: pasek z pięcioma odcinkami, liczba odpowiedzi i wyjaśnienie, dlaczego nie ma wyników.
 * EN: Draws screen 6.5c: a bar with five segments, the response count and the explanation why there are no results.
 *
 * @param props - PL: wyniki bez rozkładu. EN: the results without distribution.
 * @returns PL: ekran. EN: the screen.
 */
function TooFewResults({ results }: { results: SurveyResults }) {
  const { responseCount, minResponses } = results;
  return (
    <main className="sa" data-subtrack="5b">
      <ScreenTop title="Wyniki" backTo="/surveys/admin" />
      <ResultsHeader results={results} summary={describeQuestions(results.questionCount)} />
      <div className="sa-tile sa-tile--center">
        {/* PL: Pasek postępu do progu: tyle odcinków, ile odpowiedzi potrzeba, wypełnione tyle, ile jest. EN: The progress bar to the threshold: as many segments as responses needed, filled as many as there are. */}
        <div className="sa-segments" role="img" aria-label={`${responseCount} z ${minResponses} odpowiedzi`}>
          {Array.from({ length: minResponses }, (_, index) => (
            <span key={index} className={index < responseCount ? 'sa-segments__part sa-segments__part--on' : 'sa-segments__part'} />
          ))}
        </div>
        <p className="sa-numxl">{responseCount}</p>
        <p className="sa-label sa-label--tight">{`z ${minResponses} odpowiedzi`}</p>
        <h2 className="sa-h2">{`Wyniki zobaczysz od ${minResponses} odpowiedzi. Teraz: ${responseCount}.`}</h2>
        <p className="sa-small">Przy mniejszej liczbie łatwo rozpoznać, kto głosował.</p>
      </div>
    </main>
  );
}

/**
 * PL: Rysuje jedną odpowiedź w wynikach: litera, treść, „głosy · procent” i pasek o szerokości udziału.
 * EN: Draws one option in the results: the letter, the text, "votes · percent" and a bar as wide as the share.
 *
 * @param props - PL: litera i odpowiedź z wynikiem. EN: the letter and the option with its result.
 * @returns PL: pozycja listy. EN: the list item.
 */
function ResultBar({ letter, option }: { letter: string; option: OptionResult }) {
  return (
    <li className="sa-result">
      <div className="sa-result__row">
        <span className="sa-key">{letter}</span>
        <span className="sa-result__label">{option.label}</span>
        <span className="sa-result__value">{`${option.votes} · ${option.percent}%`}</span>
      </div>
      {/* PL: Pasek tylko ilustruje liczbę z wiersza nad nim, więc czytnik ekranu go pomija. EN: The bar only illustrates the number in the row above it, so the screen reader skips it. */}
      <div className="sa-bar" aria-hidden="true">
        <span className="sa-bar__fill" style={{ width: `${option.percent}%` }} />
      </div>
    </li>
  );
}

/**
 * PL: Przycisk „Pobierz CSV” pod wynikami. Pobiera plik z serwera i zapisuje go w telefonie. Bez internetu jest nieaktywny, a obok stoi notatka.
 * EN: The "Pobierz CSV" button under the results. It fetches the file from the server and saves it on the phone. Without internet it is inactive, with a note beside it.
 *
 * @param props - PL: numer ankiety. EN: the survey id.
 * @returns PL: przycisk, notatka i ewentualny błąd. EN: the button, the note and a possible error.
 */
function DownloadCsvButton({ surveyId }: { surveyId: string }) {
  const isOnline = useIsOnline();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  /**
   * PL: Pobiera plik i uruchamia zapis w przeglądarce. Tymczasowy adres zwalniamy po chwili, żeby pobranie zdążyło ruszyć.
   * EN: Fetches the file and starts the save in the browser. The temporary address is released after a moment, so the download has time to start.
   */
  async function download() {
    setBusy(true);
    setFailed(false);
    try {
      const { file, filename } = await fetchResultsCsv(surveyId);
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="sa-button sa-button--outline" disabled={!isOnline || busy} onClick={() => void download()}>
        Pobierz CSV
      </button>
      {isOnline ? null : <PanelNote icon={<WifiOffIcon />} text="Pobranie wymaga internetu." />}
      {failed ? <ErrorMessage text="Nie udało się pobrać pliku. Spróbuj ponownie za chwilę." /> : null}
    </>
  );
}

/**
 * PL: Przy wielokrotnym wyborze pokazuje liczbę zaznaczeń (suma głosów wszystkich odpowiedzi) i dopisek, że uczeń mógł zaznaczyć kilka odpowiedzi. Przy jednokrotnym nic nie rysuje.
 * EN: With multiple choice it shows the number of checked boxes (the sum of the votes of all options) and a note that the student could check several options. With single choice it draws nothing.
 *
 * @param props - PL: pytanie z wynikami. EN: the question with its results.
 * @returns PL: notatka albo nic. EN: the note or nothing.
 */
function MultipleChoiceNote({ question }: { question: QuestionResult }) {
  if (question.type !== 'multiple_choice') return null;
  const checked = question.options.reduce((sum, option) => sum + option.votes, 0);
  return (
    <>
      <p className="sa-small">{TO_AGREE.checkedCount(checked)}</p>
      <p className="sa-small">{TO_AGREE.multipleNote}</p>
    </>
  );
}

/**
 * PL: Przy skali 1–5 pokazuje średnią, jeśli serwer ją przysłał (dopiero od progu odpowiedzi i gdy ktoś głosował). Przy innych typach nic nie rysuje.
 * EN: With the 1–5 scale it shows the average, if the server sent it (only from the response threshold and when somebody voted). With other types it draws nothing.
 *
 * @param props - PL: pytanie z wynikami. EN: the question with its results.
 * @returns PL: notatka albo nic. EN: the note or nothing.
 */
function AverageNote({ question }: { question: QuestionResult }) {
  if (question.average === undefined) return null;
  return <p className="sa-small">{TO_AGREE.average(question.average)}</p>;
}

/**
 * PL: Rysuje ekran 6.5d dla jednego pytania. Przy kilku pytaniach „Następne pytanie” przełącza je, a „Wstecz” wraca do poprzedniego.
 * EN: Draws screen 6.5d for one question. With several questions "Następne pytanie" switches them, and "Wstecz" returns to the previous one.
 *
 * @param props - PL: wyniki z rozkładem. EN: the results with the distribution.
 * @returns PL: ekran. EN: the screen.
 */
function QuestionResults({ results }: { results: SurveyResults }) {
  const [index, setIndex] = useState(0);
  const questions = results.questions ?? [];
  const question = questions[index];
  if (question === undefined) return null;

  return (
    <main className="sa" data-subtrack="5b">
      <ScreenTop title="Wyniki" backTo="/surveys/admin" onBack={index > 0 ? () => setIndex(index - 1) : undefined} />
      <ResultsHeader results={results} summary={describeResponses(results.responseCount)} />
      <p className="sa-label sa-label--tight">{`Pytanie ${index + 1}`}</p>
      <h2 className="sa-h2">{question.prompt}</h2>
      <MultipleChoiceNote question={question} />
      <AverageNote question={question} />
      <ul className="sa-tile sa-results">
        {question.options.map((option, place) => (
          <ResultBar key={place} letter={question.type === 'scale_1_5' ? '' : OPTION_LETTERS[place] ?? ''} option={option} />
        ))}
      </ul>
      <PanelNote icon={<LockIcon />} text="Wyniki są zbiorcze. Nie widać, kto co wybrał." />
      <DownloadCsvButton surveyId={results.id} />
      {index < questions.length - 1 ? (
        <button type="button" className="sa-button sa-button--outline" onClick={() => setIndex(index + 1)}>
          Następne pytanie
        </button>
      ) : null}
    </main>
  );
}

/**
 * PL: Rysuje ekran wyników dla ankiety z adresu. Wybiera 6.5c albo 6.5d według tego, czy serwer przysłał rozkład głosów.
 * EN: Draws the results screen for the survey from the address. Picks 6.5c or 6.5d by whether the server sent the vote distribution.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ResultsScreen() {
  const { surveyId = '' } = useParams();
  const query = useSurveyResults(surveyId);

  if (query.data?.questions !== undefined) return <QuestionResults key={surveyId} results={query.data} />;
  if (query.data !== undefined) return <TooFewResults results={query.data} />;

  // PL: Bez danych: błąd z ponowieniem albo pusty ekran do czasu odpowiedzi (zapisane dane pokazują się od razu).
  // EN: Without data: an error with a retry, or an empty screen until the answer (saved data shows at once).
  return (
    <main className="sa" data-subtrack="5b" aria-busy={query.isPending}>
      <ScreenTop title="Wyniki" backTo="/surveys/admin" />
      {query.isError ? <ErrorMessage text="Nie udało się pobrać wyników. Spróbuj ponownie za chwilę." onRetry={() => void query.refetch()} /> : null}
    </main>
  );
}
