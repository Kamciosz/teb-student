/**
 * PL: Wszystkie teksty ekranu „Wpisy” w panelu po polsku. W grupie „SCREEN” są teksty z docs/projekt/EKRANY.md (nazwa części „Wpisy” z ekranu 6.1b, typy wpisu z ekranu 5.1, „Opublikuj” z ekranu 5.3, „Anuluj” z ekranu 6.3c). EKRANY.md nie ma ekranu listy wpisów w panelu, więc reszta jest w grupie „TO_AGREE”: powstała z szablonów przepływu 6 („Nie udało się …. Spróbuj ponownie za chwilę.”, „… wymaga internetu.”) i czeka na decyzję zespołu (lista w opisie pull requesta).
 * EN: All texts of the "Wpisy" (entries) panel screen in Polish. The "SCREEN" group has the texts from docs/projekt/EKRANY.md (the section name "Wpisy" from screen 6.1b, the entry types from screen 5.1, "Opublikuj" from screen 5.3, "Anuluj" from screen 6.3c). EKRANY.md has no screen for the panel entry list, so the rest is in the "TO_AGREE" group: built from the flow 6 templates ("Nie udało się …. Spróbuj ponownie za chwilę.", "… wymaga internetu.") and waiting for a team decision (the list is in the pull request description).
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/news/admin/PanelTop.tsx::SCREEN
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::TO_AGREE
 * @used_by src/features/news/admin/EntryTile.tsx::SCREEN
 * @used_by src/features/news/admin/DeleteSheet.tsx::SCREEN
 */

/**
 * PL: Teksty z docs/projekt/EKRANY.md.
 * EN: The texts from docs/projekt/EKRANY.md.
 */
export const SCREEN = {
  title: 'Wpisy',
  publish: 'Opublikuj',
  cancel: 'Anuluj',
  types: { important: 'Ważne', news: 'News', event: 'Wydarzenie', sport: 'Sport' } as Record<string, string>,
} as const;

/**
 * PL: Teksty spoza EKRANY.md: do ustalenia przez zespół.
 * EN: The texts outside EKRANY.md: to be agreed by the team.
 */
export const TO_AGREE = {
  back: 'Wróć',
  newEntry: 'Nowy wpis',
  listLabel: 'Wpisy',
  draft: 'Szkic',
  published: 'Opublikowany',
  review: 'Do korekty',
  openReview: 'Otwórz korektę',
  /** PL: Znacznik wpisu opublikowanego z chwilą startu w przyszłości; argument to „dzień.miesiąc, godzina:minuta”. EN: The tag of a published entry with a start moment in the future; the argument is "day.month, hour:minute". */
  scheduled: (when: string) => `Zaplanowany na ${when}`,
  delete: 'Usuń',
  edit: 'Edytuj',
  emptyTitle: 'Nie ma jeszcze wpisów',
  emptyHint: 'Dotknij „Nowy wpis”, żeby napisać pierwszy.',
  offlineNote: 'Publikacja, przypinanie i usuwanie wymagają internetu.',
  loadFailed: 'Nie udało się pobrać wpisów. Spróbuj ponownie za chwilę.',
  publishFailed: 'Nie udało się opublikować wpisu. Spróbuj ponownie za chwilę.',
  deleteFailed: 'Nie udało się usunąć wpisu. Spróbuj ponownie za chwilę.',
  pin: 'Przypnij',
  unpin: 'Odepnij',
  pinFailed: 'Nie udało się zmienić przypięcia. Spróbuj ponownie za chwilę.',
  pinLimit: 'Najwyżej 3 wpisy mogą być przypięte naraz. Odepnij jeden, żeby przypiąć ten.',
  sheet: {
    title: 'Usunąć wpis?',
    draftHint: (title: string) => `Szkic „${title}” zniknie. Tego nie da się cofnąć.`,
    publishedHint: (title: string) => `Uczniowie przestaną widzieć wpis „${title}”. Tego nie da się cofnąć.`,
    reviewHint: (title: string) => `Wpis „${title}” czekający na korektę zniknie. Tego nie da się cofnąć.`,
    confirm: 'Usuń wpis',
  },
  /** PL: Nazwa przycisku dla czytnika ekranu: czynność i tytuł wpisu. EN: The button name for a screen reader: the action and the entry title. */
  actionName: (action: string, title: string) => `${action}: ${title}`,
} as const;
