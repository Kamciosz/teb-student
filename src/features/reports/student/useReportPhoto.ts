/**
 * PL: Stan zdjęcia w formularzu zgłoszenia: wysyłanie, nazwa pliku, błąd i ponowienie. Stan leży w formularzu, a nie w polu, żeby przetrwał cofnięcie z kroku opisu. Odpowiedź starej wysyłki jest pomijana, gdy w międzyczasie wybrano inne zdjęcie albo je usunięto.
 * EN: The state of the photo in the report form: sending, file name, error and retry. The state lives in the form, not in the field, so it survives going back from the description step. The answer of an old send is ignored when another photo was chosen or the photo was removed meanwhile.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/media/index.ts::uploadReportPhoto
 * @uses src/features/media/index.ts::ReportPhotoUnreadableError
 * @used_by src/features/reports/student/ReportForm.tsx::useReportPhoto
 */

// PL: useRef trzyma ostatni plik i numer wysyłki, useState trzyma widoczny stan.
// EN: useRef holds the last file and the send number, useState holds the visible state.
import { useRef, useState } from 'react';
// PL: Wysyłka zdjęcia i jej błąd z drzwi modułu media.
// EN: Sending the photo and its error, from the door of the media module.
import { ReportPhotoUnreadableError, uploadReportPhoto } from '../../media';

/** PL: Stan zdjęcia: brak pliku, wysyłanie, gotowe albo błąd (z możliwością ponowienia lub bez). EN: The photo state: no file, sending, ready, or an error (retry possible or not). */
export type ReportPhotoState =
  | { status: 'idle' }
  | { status: 'uploading'; fileName: string }
  | { status: 'ready'; fileName: string }
  | { status: 'error'; fileName: string; message: string; canRetry: boolean };

/** PL: Stan i akcje dla pola zdjęcia. EN: The state and the actions for the photo field. */
export type ReportPhotoController = {
  state: ReportPhotoState;
  choose: (file: File) => void;
  retry: () => void;
  remove: () => void;
};

/**
 * PL: Prowadzi wysyłkę zdjęcia do zgłoszenia i zapisuje jego numer w szkicu.
 * EN: Runs the photo upload for the report and saves its id in the draft.
 *
 * @param setPhotoId - PL: zapisuje numer zdjęcia w szkicu albo `undefined`, gdy zdjęcia nie ma. EN: saves the photo id in the draft, or `undefined` when there is no photo.
 * @returns PL: stan zdjęcia i akcje wyboru, ponowienia i usunięcia. EN: the photo state and the actions to choose, retry and remove.
 */
export function useReportPhoto(setPhotoId: (photoId: string | undefined) => void): ReportPhotoController {
  // PL: Widoczny stan i numer ostatniej wysyłki; numer odróżnia aktualną odpowiedź od starej.
  // EN: The visible state and the number of the last send; the number tells the current answer from an old one.
  const [state, setState] = useState<ReportPhotoState>({ status: 'idle' });
  const lastFile = useRef<File | null>(null);
  const sendNumber = useRef(0);

  // PL: Wysyłka: najpierw czyścimy numer w szkicu, żeby nie poszedł stary, potem wysyłamy plik.
  // EN: The send: first we clear the id in the draft so no old one goes out, then we send the file.
  const choose = async (file: File) => {
    const number = ++sendNumber.current;
    lastFile.current = file;
    setPhotoId(undefined);
    setState({ status: 'uploading', fileName: file.name });
    try {
      const { id } = await uploadReportPhoto(file);
      if (number !== sendNumber.current) return;
      setPhotoId(id);
      setState({ status: 'ready', fileName: file.name });
    } catch (error) {
      if (number !== sendNumber.current) return;
      // PL: Nieczytelne zdjęcie wymaga innego pliku, więc ponowienie tego samego nie ma sensu.
      // EN: An unreadable photo needs another file, so retrying the same one makes no sense.
      const canRetry = !(error instanceof ReportPhotoUnreadableError);
      const message = error instanceof Error ? error.message : 'Nie udało się wysłać zdjęcia.';
      setState({ status: 'error', fileName: file.name, message, canRetry });
    }
  };

  // PL: Ponowienie wysyła ostatni plik jeszcze raz.
  // EN: Retry sends the last file again.
  const retry = () => {
    if (lastFile.current) void choose(lastFile.current);
  };

  // PL: Usunięcie unieważnia trwającą wysyłkę, czyści plik i numer w szkicu.
  // EN: Removing invalidates the ongoing send, and clears the file and the id in the draft.
  const remove = () => {
    sendNumber.current += 1;
    lastFile.current = null;
    setPhotoId(undefined);
    setState({ status: 'idle' });
  };

  return { state, choose: (file) => void choose(file), retry, remove };
}
