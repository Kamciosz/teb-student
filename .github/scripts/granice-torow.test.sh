#!/usr/bin/env sh
# PL: Samotest skryptu granice-torow.sh. Oczekiwania są wpisane tu na sztywno, niezależnie od tabeli
# PL: w skrypcie, więc zły wiersz mapowania oblewa test. Dodatkowo test czyta tabelę podtorów z
# PL: docs/PODZIAL_PRACY.md i sprawdza, że skrypt zna każdy podtor i jego katalog.
# EN: Self-test of granice-torow.sh. The expectations are hard-coded here, independent of the table
# EN: in the script, so a wrong mapping row fails the test. The test also reads the subtrack table
# EN: from docs/PODZIAL_PRACY.md and checks that the script knows every subtrack and its directory.
#
# @author Adam
# @since 2026-10-09
# @uses .github/scripts/granice-torow.sh::main
# @uses docs/PODZIAL_PRACY.md::Tory i podtory
# @used_by .github/workflows/granice-torow.yml

# PL: Przerwij przy błędzie i przy użyciu niezdefiniowanej zmiennej.
# EN: Stop on an error and on use of an undefined variable.
set -eu

# PL: Katalogi skryptu i dokumentu, liczone od położenia tego pliku, żeby test działał z dowolnego katalogu.
# EN: Script and document paths, computed from this file's location so the test runs from any directory.
HERE=$(cd "$(dirname "$0")" && pwd)
SCRIPT="$HERE/granice-torow.sh"
DOC="$HERE/../../docs/PODZIAL_PRACY.md"

# PL: Liczniki przypadków, które przeszły i które oblały.
# EN: Counters of the cases that passed and that failed.
passed=0
failed=0

# PL: Uruchamia skrypt i porównuje kod wyjścia oraz fragment komunikatu z oczekiwaniem.
# PL: Parametry: $1 = oczekiwany kod, $2 = gałąź, $3 = pliki (po jednym w linii),
# PL: $4 = fragment, który musi być w komunikacie (puste = bez sprawdzania).
# EN: Runs the script and compares the exit code and a message fragment with the expectation.
# EN: Parameters: $1 = expected code, $2 = branch, $3 = files (one per line),
# EN: $4 = fragment that must appear in the message (empty = not checked).
expect() {
	want_code=$1
	branch=$2
	files=$3
	fragment=${4:-}

	# PL: Uruchom skrypt i zbierz komunikat z obu strumieni oraz kod wyjścia.
	# EN: Run the script and collect the message from both streams plus the exit code.
	code=0
	output=$(printf '%s\n' "$files" | sh "$SCRIPT" "$branch" 2>&1) || code=$?

	# PL: Kod ma się zgadzać, a komunikat ma zawierać wskazany fragment.
	# EN: The code must match and the message must contain the given fragment.
	if [ "$code" = "$want_code" ] && { [ -z "$fragment" ] || printf '%s' "$output" | grep -qF -- "$fragment"; }; then
		passed=$((passed + 1))
		echo "OK    $branch | $(printf '%s' "$files" | tr '\n' ' ')"
	else
		failed=$((failed + 1))
		echo "BŁĄD  $branch | $(printf '%s' "$files" | tr '\n' ' ') (kod $code, oczekiwano $want_code)"
		echo "$output" | sed 's/^/        /'
	fi
}

# PL: Przypadki z polecenia: własny podtor, plik spoza podtoru, schemat auth, docs/zmiany, nieznany podtor, gałąź spoza feat/.
# EN: Required cases: own subtrack, file outside the subtrack, auth schema, docs/zmiany, unknown subtrack, non-feat branch.
expect 0 feat/3b-x 'src/features/news/editor/A.tsx'
expect 1 feat/3b-x 'package.json' 'package.json'
expect 0 feat/1a-x 'worker/db/schema/auth.ts'
expect 1 feat/1b-x 'worker/db/schema/auth.ts' 'worker/db/schema/auth.ts'
expect 0 feat/3b-x 'docs/zmiany/feat-3b-x.md'
expect 1 feat/99-x 'src/shared/A.tsx' 'Nieznany podtor'
expect 0 build/cokolwiek 'package.json' 'pomijam'

# PL: Granice katalogów: sąsiedni podtor, katalog o podobnej nazwie, jeden zły plik wśród dobrych.
# EN: Directory boundaries: a neighbouring subtrack, a similarly named directory, one bad file among good ones.
expect 1 feat/3b-x 'src/features/news/feed/A.tsx' 'src/features/news/feed/A.tsx'
expect 1 feat/3b-x 'src/features/news/editor-v2/A.tsx' 'editor-v2'
expect 1 feat/3b-x 'src/features/news/A.tsx' 'src/features/news/A.tsx'
expect 1 feat/3b-x 'src/features/news/editor/A.tsx
package.json
worker/news/editor/b.ts' 'package.json'
expect 0 feat/3b-x 'worker/news/editor/b.ts
e2e/news-editor.spec.ts
src/features/news/editor/index.ts'
expect 1 feat/3b-x 'e2e/news-feed.spec.ts' 'e2e/news-feed.spec.ts'
expect 0 feat/3b-x ''
expect 0 fix/3b-x 'package.json'

# PL: Schemat i dane testowe: tylko podtor „a” albo bez litery.
# EN: Schema and seed data: only subtrack "a" or one without a letter.
expect 0 feat/3a-x 'worker/db/schema/news.ts
worker/db/seed/news.ts'
expect 1 feat/3b-x 'worker/db/schema/news.ts' 'worker/db/schema/news.ts'
expect 1 feat/3b-x 'worker/db/seed/news.ts' 'worker/db/seed/news.ts'
expect 1 feat/1a-x 'worker/db/schema/media.ts' 'worker/db/schema/media.ts'
expect 0 feat/1a-x 'e2e/auth-email.spec.ts'
expect 0 feat/1b-x 'src/features/auth/invite/A.tsx'

# PL: Podtory bez części i podtor 0.
# EN: Subtracks without a part, and subtrack 0.
expect 0 feat/6-licznik 'src/features/bell/A.tsx
worker/bell/a.ts
e2e/bell.spec.ts
worker/db/schema/bell.ts
worker/db/seed/bell.ts'
expect 1 feat/6-licznik 'src/features/dashboard/A.tsx' 'src/features/dashboard/A.tsx'
expect 0 feat/0-przycisk 'src/shared/Button.tsx
worker/shared/a.ts'
expect 1 feat/0-przycisk 'src/features/bell/A.tsx' 'src/features/bell/A.tsx'
expect 1 feat/0-przycisk 'worker/db/schema/shared.ts' 'worker/db/schema/shared.ts'

# PL: Nieprawidłowa nazwa podtoru: brak, litera bez cyfry, nazwa opisowa.
# EN: Invalid subtrack name: missing, a letter without a digit, a descriptive name.
expect 1 feat/-x 'package.json' 'Nieznany podtor'
expect 1 feat/3-x 'package.json' 'Nieznany podtor'
expect 1 feat/ankiety-wyniki 'package.json' 'Nieznany podtor'

# PL: Zgodność z dokumentem: każdy podtor z tabeli w części 3 (poza 0) ma przyjąć plik ze swojego katalogu
# PL: i odrzucić package.json. Parsujemy wiersze „| 3b | opis | `news/editor` | …”.
# EN: Match with the document: every subtrack in the part 3 table (except 0) must accept a file from its
# EN: directory and reject package.json. We parse rows like "| 3b | description | `news/editor` | …".
rows=$(awk -F'|' '$2 ~ /^ *[1-9][0-9]*[a-z]? *$/ && $4 ~ /`/ { gsub(/[ `]/, "", $2); gsub(/[ `]/, "", $4); print $2, $4 }' "$DOC")
rows_count=$(printf '%s\n' "$rows" | grep -c .)

# PL: Tabela w dokumencie ma 14 wierszy z katalogiem. Mniej oznacza, że parser się zepsuł.
# EN: The table in the document has 14 rows with a directory. Fewer means the parser broke.
if [ "$rows_count" -lt 14 ]; then
	failed=$((failed + 1))
	echo "BŁĄD  z docs/PODZIAL_PRACY.md wczytano $rows_count podtorów, oczekiwano co najmniej 14"
fi

# PL: Dla każdego wiersza sprawdź plik z katalogu podtoru i plik spoza niego.
# PL: Pętla czyta z dokumentu here-doc, a nie z potoku, żeby liczniki zostały w tej powłoce.
# EN: For each row check a file from the subtrack directory and a file outside it.
# EN: The loop reads from a here-document, not a pipe, so the counters stay in this shell.
while read -r id dir; do
	[ -n "$id" ] || continue
	expect 0 "feat/$id-test" "src/features/$dir/Test.tsx
worker/$dir/test.ts"
	expect 1 "feat/$id-test" 'package.json' 'package.json'
done <<ROWS
$rows
ROWS

# PL: Podsumowanie: każdy oblany przypadek daje kod 1, więc CI robi się czerwone.
# EN: Summary: any failed case gives exit code 1, so CI turns red.
echo "Samotest granice-torow.sh: przeszło $passed, oblało $failed."
[ "$failed" -eq 0 ]
