/**
 * PL: Krok „Ktoś już to zgłosił?” między miejscem a opisem. Pokazuje otwarte zgłoszenia tej samej kategorii i miejsca z licznikiem „Mnie też”; uczeń może dołączyć albo wysłać nowe. Gdy nie ma czego pokazać (pusta lista, brak sieci, błąd), od razu przechodzi do opisu. Teksty na ekranie są do uzgodnienia z zespołem.
 * EN: The step "Ktoś już to zgłosił?" between the place and the description. It shows open reports of the same category and place with the "Mnie też" counter; the student can join or send a new one. When there is nothing to show (empty list, no network, an error), it moves on to the description at once. The texts on the screen are to be agreed with the team.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/reports/student/icons.tsx::Icon
 * @uses src/features/reports/student/queries.ts::useSimilarReports
 * @uses src/features/reports/student/queries.ts::useJoinReport
 * @uses src/features/reports/student/api.ts::SimilarReport
 * @uses src/features/reports/student/reportOptions.ts::STAGE_ORDER
 * @used_by src/features/reports/student/ReportForm.tsx::SimilarReports
 */

// PL: Efekt przejścia dalej, gdy nie ma listy do pokazania.
// EN: The effect that moves on when there is no list to show.
import { useEffect } from 'react';
// PL: Ikony przycisków.
// EN: The button icons.
import { Icon } from './icons';
// PL: Dane listy i dołączenia.
// EN: The list and join data.
import type { SimilarReport } from './api';
// PL: Hook dołączania (typ mutacji do listy).
// EN: The join hook (the mutation type for the list).
import { useJoinReport, useSimilarReports } from './queries';
// PL: Polskie nazwy etapów.
// EN: The Polish stage names.
import { STAGE_ORDER } from './reportOptions';

/** PL: Dane kroku: kategoria i miejsce z szkicu oraz przyciski. EN: The step data: the category and place from the draft, and the buttons. */
export type SimilarReportsProps = {
  category: string;
  place: string;
  /** PL: Wraca do kroku miejsca. EN: Goes back to the place step. */
  onBack: () => void;
  /** PL: Idzie do opisu, żeby wysłać nowe zgłoszenie. EN: Goes to the description, to send a new report. */
  onNewReport: () => void;
};

/**
 * PL: Podaje polską nazwę etapu do podpisu na karcie.
 * EN: Gives the Polish stage name for the caption on the card.
 *
 * @param code - PL: kod etapu z serwera. EN: the stage code from the server.
 * @returns PL: nazwa etapu albo sam kod, gdy serwer wyśle nieznany. EN: the stage name, or the code itself when the server sends an unknown one.
 */
function stageLabel(code: string): string {
  // PL: Nieznany etap pokazujemy bez zmian, żeby nic nie zniknęło.
  // EN: An unknown stage is shown as is, so nothing disappears.
  return STAGE_ORDER.find((stage) => stage.code === code)?.label ?? code;
}

/** PL: Dane jednej karty na liście. EN: The data of one card on the list. */
type ItemProps = {
  item: SimilarReport;
  joined: boolean;
  joining: boolean;
  onJoin: () => void;
};

/**
 * PL: Karta podobnego zgłoszenia: opis, miejsce, etap, licznik i przycisk „Mnie też”. Nie pokazuje autora ani tego, kto dołączył.
 * EN: A card of a similar report: the description, the place, the stage, the counter and the "Mnie też" button. It does not show the author or who joined.
 *
 * @param props - PL: zgłoszenie, stan dołączenia i obsługa kliknięcia. EN: the report, the join state and the click handler.
 * @returns PL: drzewo elementów karty. EN: the tree of card elements.
 */
function SimilarItem({ item, joined, joining, onJoin }: ItemProps) {
  // PL: Po dołączeniu przycisk pokazuje stan „Dołączyłeś” i nie da się kliknąć drugi raz (jeden głos na ucznia).
  // EN: After joining the button shows the "Dołączyłeś" state and cannot be clicked again (one vote per student).
  return (
    <li className="rs-similar-item">
      <p className="rs-similar-text">{item.description}</p>
      {item.placeDetail ? <small>{item.placeDetail}</small> : null}
      <small className="rs-similar-meta">
        {stageLabel(item.stage)} · Liczba „Mnie też”: {item.joinCount}
      </small>
      <button type="button" className="rs-btn rs-btn-soft rs-similar-join" disabled={joined || joining} onClick={onJoin}>
        {joined ? (
          <>
            <Icon name="check" />
            Dołączyłeś
          </>
        ) : (
          'Mnie też'
        )}
      </button>
    </li>
  );
}

/** PL: Mutacja dołączania z TanStack Query. EN: The join mutation from TanStack Query. */
type JoinMutation = ReturnType<typeof useJoinReport>;

/**
 * PL: Lista kart podobnych zgłoszeń. Stan dołączenia bierze z mutacji: kliknięte zgłoszenie od razu pokazuje „Dołączyłeś”.
 * EN: The list of similar-report cards. The join state comes from the mutation: the clicked report shows "Dołączyłeś" at once.
 *
 * @param props - PL: zgłoszenia i mutacja dołączania. EN: the reports and the join mutation.
 * @returns PL: drzewo elementów listy. EN: the tree of list elements.
 */
function SimilarList({ items, join }: { items: SimilarReport[]; join: JoinMutation }) {
  return (
    <ul className="rs-similar" aria-label="Podobne zgłoszenia">
      {items.map((item) => {
        // PL: Zgłoszenie, które właśnie klikamy, ma stan „w toku”, nawet zanim przyjdzie odpowiedź.
        // EN: The report being clicked has the "in progress" state, even before the answer comes.
        const isClicked = join.variables === item.id;
        return (
          <SimilarItem
            key={item.id}
            item={item}
            joined={item.joinedByMe || (join.isSuccess && isClicked)}
            joining={join.isPending && isClicked}
            onJoin={() => join.mutate(item.id)}
          />
        );
      })}
    </ul>
  );
}

/**
 * PL: Krok z listą podobnych zgłoszeń. Bez listy do pokazania od razu woła `onNewReport`.
 * EN: The step with the list of similar reports. With no list to show it calls `onNewReport` at once.
 *
 * @param props - PL: kategoria, miejsce i przyciski kroku. EN: the category, the place and the step buttons.
 * @returns PL: drzewo elementów kroku. EN: the tree of step elements.
 */
export function SimilarReports({ category, place, onBack, onNewReport }: SimilarReportsProps) {
  // PL: Lista podobnych zgłoszeń i dołączanie do nich.
  // EN: The list of similar reports and joining them.
  const similar = useSimilarReports(category, place);
  const join = useJoinReport();
  const items = similar.data ?? [];

  // PL: Brak listy (błąd, brak sieci) albo pusta lista oznacza: nie ma czego pokazać, idziemy do opisu.
  // EN: No list (an error, no network) or an empty list means there is nothing to show, so we go to the description.
  const nothingToShow = similar.isError || (similar.isSuccess && items.length === 0);
  useEffect(() => {
    if (nothingToShow) onNewReport();
  }, [nothingToShow, onNewReport]);

  return (
    <div>
      <h1 tabIndex={-1}>Ktoś już to zgłosił?</h1>
      <p className="rs-lead">Jeśli to ten sam problem, dołącz. Nie trzeba zgłaszać go drugi raz.</p>
      {similar.isSuccess ? (
        <SimilarList items={items} join={join} />
      ) : (
        <p className="rs-lead" role="status">Szukam podobnych zgłoszeń…</p>
      )}
      {join.error ? <p className="rs-error" role="alert">Nie udało się dołączyć. Spróbuj ponownie za chwilę.</p> : null}
      <div className="rs-cta">
        <button type="button" className="rs-btn rs-btn-soft rs-btn-back" aria-label="Wstecz" onClick={onBack}>
          <Icon name="arrow-left" />
        </button>
        <button type="button" className="rs-btn rs-btn-accent" onClick={onNewReport}>
          Wyślę nowe zgłoszenie
          <Icon name="arrow-right" />
        </button>
      </div>
    </div>
  );
}
