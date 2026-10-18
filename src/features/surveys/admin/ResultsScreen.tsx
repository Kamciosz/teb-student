/**
 * PL: Ekrany wyników ankiety: 6.5c „Wyniki: za mało odpowiedzi” (poniżej 5 odpowiedzi tylko liczba) i 6.5d „Wyniki” (od 5 odpowiedzi: liczba i udział każdej odpowiedzi, zbiorczo, bez autorów). To, który z nich zobaczymy, rozstrzyga serwer: poniżej progu nie wysyła rozkładu głosów, więc telefon nie ma czego pokazać nawet po zmianie kodu.
 * EN: The survey results screens: 6.5c "Wyniki: za mało odpowiedzi" (below 5 responses only the count) and 6.5d "Wyniki" (from 5 responses: the count and share of every option, aggregated, without authors). The server decides which one we see: below the threshold it does not send the vote distribution, so the phone has nothing to show even if the code is changed.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/surveyQueries.ts::useSurveyResults
 * @uses src/features/surveys/admin/surveyQueries.ts::useIsOnline
 * @uses src/features/surveys/admin/surveyApi.ts::fetchResultsCsv
 * @uses src/shared/ui/ListGroup.tsx::ListGroup
 * @uses src/shared/ui/ListRow.tsx::ListRow
 * @uses src/shared/ui/ProgressBar.tsx::ProgressBar
 * @uses src/shared/ui/Button.tsx::Button
 * @used_by src/features/surveys/admin/SurveysAdminScreen.tsx::SurveysAdminScreen
 */

import { useState } from 'react';
import { useParams } from 'react-router';
// PL: Grupy, wiersze i pasek postępu w stylu systemowym.
// EN: The groups, rows and progress bar in the system style.
import { ListGroup } from '../../../shared/ui/ListGroup';
import { ListRow } from '../../../shared/ui/ListRow';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { Button } from '../../../shared/ui/Button';
import { describeQuestions, describeResponses, formatShortDate, OPTION_LETTERS } from './format';
import { LockIcon, WifiOffIcon } from './icons';
import { ErrorMessage, PanelNote, ScreenTop } from './PanelParts';
import { fetchResultsCsv } from './surveyApi';
import { useIsOnline, useSurveyResults } from './surveyQueries';
import { TEXTS } from './texts';
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
 * PL: Rysuje ekran 6.5c: cienki pasek postępu do progu, podpis z liczbą i wyjaśnienie, dlaczego nie ma wyników.
 * EN: Draws screen 6.5c: a thin progress bar to the threshold, the caption with the count and the explanation why there are no results.
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
      <ListGroup>
        <div className="sa-tile sa-tile--center">
          {/* PL: Pasek postępu do progu: wypełniony tyle, ile jest odpowiedzi. EN: The progress bar to the threshold: filled as far as there are responses. */}
          <ProgressBar value={responseCount} max={minResponses} label={`${responseCount} z ${minResponses} odpowiedzi`} />
          <p className="sa-label sa-label--tight">{`z ${minResponses} odpowiedzi`}</p>
          <h2 className="sa-h2">{`Wyniki zobaczysz od ${minResponses} odpowiedzi. Teraz: ${responseCount}.`}</h2>
          <p className="sa-small">Przy mniejszej liczbie łatwo rozpoznać, kto głosował.</p>
        </div>
      </ListGroup>
    </main>
  );
}

/**
 * PL: Rysuje jedną odpowiedź w wynikach: litera (przy skali bez litery), tytuł, „głosy · procent” po prawej i cienki pasek udziału pod spodem.
 * EN: Draws one option in the results: the letter (none for the scale), the title, "votes · percent" on the right and a thin share bar underneath.
 *
 * @param props - PL: litera i odpowiedź z wynikiem. EN: the letter and the option with its result.
 * @returns PL: pozycja listy. EN: the list item.
 */
function ResultBar({ letter, option }: { letter: string | undefined; option: OptionResult }) {
  return (
    <li>
      <ListRow
        icon={letter}
        title={option.label}
        value={`${option.votes} · ${option.percent}%`}
        subtitle={<ProgressBar value={option.percent} label={`${option.label}: ${option.percent}%`} />}
      />
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
      <Button variant="plain" disabled={!isOnline || busy} onClick={() => void download()}>
        Pobierz CSV
      </Button>
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
      <p className="sa-small">{TEXTS.checkedCount(checked)}</p>
      <p className="sa-small">{TEXTS.multipleNote}</p>
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
  return <p className="sa-small">{TEXTS.average(question.average)}</p>;
}

/**
 * PL: Lista krótkich odpowiedzi jednego pytania w grupie: same teksty, bez procentów i bez autorów. Serwer już je posortował alfabetycznie.
 * EN: The list of short answers of one question in a group: the texts only, without percentages and without authors. The server has already sorted them alphabetically.
 *
 * @param props - PL: teksty odpowiedzi. EN: the answer texts.
 * @returns PL: notatka i grupa z listą. EN: the note and the group with the list.
 */
function TextAnswers({ texts }: { texts: string[] }) {
  return (
    <>
      <p className="sa-small">{TEXTS.textsNote}</p>
      <ListGroup>
        <ul className="sa-list sa-results">
          {texts.map((text, place) => (
            <li key={place}>
              <ListRow title={text} />
            </li>
          ))}
        </ul>
      </ListGroup>
    </>
  );
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
      {question.type === 'short_text' ? (
        <TextAnswers texts={question.texts ?? []} />
      ) : (
        <ListGroup>
          <ul className="sa-list">
            {question.options.map((option, place) => (
              <ResultBar key={place} letter={question.type === 'scale_1_5' ? undefined : OPTION_LETTERS[place]} option={option} />
            ))}
          </ul>
        </ListGroup>
      )}
      <PanelNote icon={<LockIcon />} text="Wyniki są zbiorcze. Nie widać, kto co wybrał." />
      <DownloadCsvButton surveyId={results.id} />
      {index < questions.length - 1 ? (
        <Button variant="plain" onClick={() => setIndex(index + 1)}>
          Następne pytanie
        </Button>
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
