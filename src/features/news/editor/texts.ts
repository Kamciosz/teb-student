/**
 * PL: Wszystkie teksty ekranu edytora po polsku. Teksty z docs/projekt/EKRANY.md (ekrany 5.1, 5.2 i 5.3) są w grupie „SCREEN”. Teksty, których EKRANY.md nie zawiera (pasek narzędzi, okna na adres, komunikaty błędów), są w grupie „TO_AGREE” i czekają na decyzję zespołu (lista w opisie pull requesta).
 * EN: All the editor screen texts in Polish. The texts from docs/projekt/EKRANY.md (screens 5.1, 5.2 and 5.3) are in the "SCREEN" group. The texts EKRANY.md does not contain (the toolbar, the address panels, error messages) are in the "TO_AGREE" group and wait for a team decision (the list is in the pull request description).
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/news/editor/TypeStep.tsx::SCREEN
 * @used_by src/features/news/editor/ContentStep.tsx::SCREEN
 * @used_by src/features/news/editor/PreviewStep.tsx::SCREEN
 * @used_by src/features/news/editor/TypeStep.tsx::TO_AGREE
 * @used_by src/features/news/editor/EditorToolbar.tsx::TO_AGREE
 * @used_by src/features/news/editor/AddressPanel.tsx::TO_AGREE
 * @used_by src/features/news/editor/PhotoButton.tsx::TO_AGREE
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::TO_AGREE
 * @used_by src/features/news/editor/api.ts::TO_AGREE
 */

/**
 * PL: Teksty z docs/projekt/EKRANY.md, przepływ 5.
 * EN: The texts from docs/projekt/EKRANY.md, flow 5.
 */
export const SCREEN = {
  title: 'Nowy wpis',
  typeHeading: 'Jaki to wpis?',
  contentHeading: 'Co chcesz napisać?',
  titleLabel: 'Tytuł',
  bodyLabel: 'Opis',
  previewHeading: 'Podgląd',
  next: 'Dalej',
  saveDraft: 'Zapisz szkic i dokończ później',
  publish: 'Opublikuj',
  types: { important: 'Ważne', news: 'News', event: 'Wydarzenie', sport: 'Sport' },
  mediaLabel: 'Zdjęcia i wideo',
  mediaHint: 'Pliki są zmniejszane przed wysłaniem. Zdjęcie przytniesz klikając ikonę kadrowania.',
} as const;

/**
 * PL: Teksty spoza EKRANY.md: do ustalenia przez zespół.
 * EN: The texts outside EKRANY.md: to be agreed by the team.
 */
export const TO_AGREE = {
  back: 'Wróć',
  stepOf: (step: number) => `Krok ${step} z 3`,
  counter: (length: number, max: number) => `${length} / ${max} znaków`,
  addMedia: 'Dodaj zdjęcie albo wideo',
  toolbarLabel: 'Formatowanie tekstu',
  loading: 'Wczytuję edytor…',
  loadFailed: 'Edytor się nie wczytał. Sprawdź internet.',
  reload: 'Wczytaj ponownie',
  buttons: {
    bold: 'Pogrubienie',
    italic: 'Kursywa',
    underline: 'Podkreślenie',
    heading2: 'Nagłówek',
    heading3: 'Podnagłówek',
    bulletList: 'Lista punktowana',
    orderedList: 'Lista numerowana',
    quote: 'Cytat',
    link: 'Link',
    video: 'Film',
    card: 'Karta linku',
    sources: 'Źródła',
    photo: 'Zdjęcie',
    undo: 'Cofnij',
    redo: 'Ponów',
  },
  photo: {
    sending: 'Wysyłam zdjęcie…',
    failed: 'Nie udało się wysłać zdjęcia. Spróbuj ponownie.',
  },
  prompt: {
    link: { label: 'Adres linku (https://)', submit: 'Zapisz link', remove: 'Usuń link' },
    video: { label: 'Adres filmu z YouTube', submit: 'Dodaj film' },
    card: { label: 'Adres wpisu w Instagramie, TikToku, Facebooku albo X', submit: 'Dodaj kartę' },
    sources: { label: 'Adresy źródeł, jeden w wierszu', submit: 'Dodaj źródła' },
    cancel: 'Anuluj',
    errors: {
      link: 'To nie jest adres zaczynający się od https://.',
      video: 'To nie jest adres filmu z YouTube.',
      card: 'To nie jest adres z Instagrama, TikToka, Facebooka ani X.',
      sources: 'Każdy wiersz musi być adresem zaczynającym się od https://.',
    },
  },
  saving: 'Zapisuję…',
  savedDraft: 'Szkic zapisany.',
  savedPublished: 'Wpis opublikowany.',
  sendToReview: 'Wyślij do korekty',
  sentToReview: 'Wpis wysłany do korekty. Zatwierdzi go inny redaktor.',
  reviewHeading: 'Wpis czeka na korektę',
  reviewWaiting: 'Ten wpis czeka na korektę. Zatwierdzi go inny redaktor, nie jego autor.',
  approve: 'Zatwierdź i opublikuj',
  approving: 'Zatwierdzam…',
  ownEntry: 'Własnego wpisu nie możesz zatwierdzić. Zrobi to inny redaktor.',
  inReview: 'Ten wpis czeka na korektę, więc nie da się go zmienić.',
  notInReview: 'Ten wpis nie czeka już na korektę. Wróć do listy wpisów.',
  goToPanel: 'Przejdź do wpisów w panelu',
  scheduleToggle: 'Opublikuj o wybranej godzinie',
  scheduleDate: 'Dzień publikacji',
  scheduleTime: 'Godzina publikacji',
  scheduleMissing: 'Wpisz dzień i godzinę publikacji.',
  scheduledFor: (moment: string) => `Wpis pojawi się ${moment}.`,
  offline: 'Brak internetu. Wpis został w edytorze, wyślesz go, gdy internet wróci.',
  signedOut: 'Sesja wygasła. Zaloguj się ponownie.',
  forbidden: 'Wpisy mogą dodawać tylko Samorząd i redakcja gazetki.',
  failed: 'Nie udało się zapisać wpisu. Spróbuj ponownie.',
  draftLoading: 'Wczytuję szkic…',
  draftLoadFailed: 'Nie udało się wczytać szkicu. Spróbuj ponownie za chwilę.',
  alreadyPublished: 'Ten wpis jest już opublikowany, więc nie da się go edytować.',
  draftNotFound: 'Nie ma takiego szkicu. Może został usunięty.',
  rejected: {
    bad_title: 'Tytuł jest pusty albo za długi.',
    empty: 'Wpis jest pusty.',
    too_long: 'Wpis jest za długi.',
    too_large: 'Wpis jest za duży.',
    bad_link: 'Link w treści musi zaczynać się od https://.',
    bad_video: 'Film w treści ma zły adres.',
    bad_card: 'Karta linku ma zły adres.',
    bad_sources: 'Źródła mają zły adres.',
    bad_image: 'Zdjęcie ma zły adres.',
    bad_publish_at: 'Godzina publikacji ma zły format.',
    publish_past: 'Data publikacji musi być w przyszłości.',
    publish_too_far: 'Można zaplanować publikację najwyżej 30 dni naprzód.',
  } as Record<string, string>,
} as const;
