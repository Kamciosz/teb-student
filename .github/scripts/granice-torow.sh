#!/usr/bin/env sh
# PL: Sprawdza „Granice torów”: gałąź feat/<podtor>-… może zmieniać tylko pliki swojego podtoru
# PL: i katalog docs/zmiany/. Tabela podtorów jest jedynym źródłem mapowania (poniżej).
# EN: Checks the "track boundaries": a feat/<subtrack>-… branch may change only the files of
# EN: its own subtrack and the docs/zmiany/ directory. The subtrack table below is the single
# EN: source of the mapping.
#
# PL: Użycie: granice-torow.sh <nazwa gałęzi>   (lista zmienionych plików na wejściu, jeden w linii)
# EN: Usage:  granice-torow.sh <branch name>    (changed files on stdin, one per line)
# PL: Kod wyjścia: 0 = dozwolone albo pominięte, 1 = naruszenie albo nieznany podtor, 2 = zły sposób użycia.
# EN: Exit code: 0 = allowed or skipped, 1 = violation or unknown subtrack, 2 = wrong usage.
#
# @author Adam
# @since 2026-10-09
# @uses docs/PODZIAL_PRACY.md::Tory i podtory
# @used_by .github/workflows/granice-torow.yml
# @used_by .github/scripts/granice-torow.test.sh

# PL: Przerwij przy błędzie i przy użyciu niezdefiniowanej zmiennej.
# EN: Stop on an error and on use of an undefined variable.
set -eu

# PL: Tabela podtorów z docs/PODZIAL_PRACY.md, część 3. Kolumny: podtor, moduł, część ("-" = brak części).
# PL: Podtor 0 (wspólne) ma osobną regułę w funkcji allowed_paths, bo nie jest modułem.
# EN: Subtrack table from docs/PODZIAL_PRACY.md, part 3. Columns: subtrack, module, part ("-" = no part).
# EN: Subtrack 0 (shared) has its own rule in allowed_paths, because it is not a module.
SUBTRACKS='
0  shared    -
1a auth      email
1b auth      invite
2  media     -
3a news      feed
3b news      editor
3c news      admin
4a reports   student
4b reports   admin
5a surveys   vote
5b surveys   admin
6  bell      -
7  profile   -
8  admin     -
9  dashboard -
'

# PL: Katalog, który wolno zmieniać każdej gałęzi (wpis do changelogu i logu AI).
# EN: Directory every branch may change (the changelog and AI log entry).
CHANGES_DIR='docs/zmiany/'

# PL: Wypisuje ścieżki dozwolone dla podtoru. Wpis z "/" na końcu to katalog, bez "/" to jeden plik.
# PL: Parametry: $1 = podtor, $2 = moduł, $3 = część ("-" = brak).
# EN: Prints the paths allowed for a subtrack. An entry ending in "/" is a directory, otherwise one file.
# EN: Parameters: $1 = subtrack, $2 = module, $3 = part ("-" = none).
allowed_paths() {
	subtrack=$1
	module=$2
	part=$3

	# PL: Podtor 0: tylko wspólne elementy telefonu i serwera, bez testów i bazy.
	# EN: Subtrack 0: only the shared phone and server code, no tests and no database.
	if [ "$subtrack" = "0" ]; then
		echo "src/shared/"
		echo "worker/shared/"
		return
	fi

	# PL: Podtor z częścią ma katalog <moduł>/<część>, podtor bez części tylko <moduł>.
	# EN: A subtrack with a part has the directory <module>/<part>, one without a part only <module>.
	if [ "$part" = "-" ]; then
		dir="$module"
		e2e_name="$module"
	else
		dir="$module/$part"
		e2e_name="$module-$part"
	fi

	# PL: Ekrany i logika w telefonie, serwer, testy całych ścieżek.
	# EN: Phone screens and logic, server code, end-to-end tests.
	echo "src/features/$dir/"
	echo "worker/$dir/"
	echo "e2e/$e2e_name.spec.ts"

	# PL: Schemat i dane testowe modułu należą tylko do podtoru "a" albo bez litery.
	# EN: The module schema and seed data belong only to subtrack "a" or one without a letter.
	case "$subtrack" in
		*[b-z]) ;;
		*)
			echo "worker/db/schema/$module.ts"
			echo "worker/db/seed/$module.ts"
			;;
	esac
}

# PL: Sprawdza, czy plik pasuje do jednej ze ścieżek dozwolonych (lista w $2, po jednej w linii).
# PL: Parametry: $1 = plik, $2 = lista ścieżek. Zwraca 0 przy dopasowaniu.
# EN: Checks whether a file matches one of the allowed paths (list in $2, one per line).
# EN: Parameters: $1 = file, $2 = list of paths. Returns 0 on a match.
is_allowed() {
	file=$1
	allowed=$2

	# PL: Porównaj plik z każdą dozwoloną ścieżką po kolei.
	# EN: Compare the file with every allowed path in turn.
	for path in $allowed; do
		case "$path" in
			# PL: Katalog: plik musi leżeć w środku (końcowy "/" odcina katalogi o podobnej nazwie).
			# EN: Directory: the file must be inside it (the trailing "/" rules out similarly named directories).
			*/) case "$file" in "$path"*) return 0 ;; esac ;;
			# PL: Pojedynczy plik: nazwa musi być identyczna.
			# EN: Single file: the name must be identical.
			*) [ "$file" = "$path" ] && return 0 ;;
		esac
	done

	# PL: Żadna ścieżka nie pasuje, więc plik jest spoza podtoru.
	# EN: No path matched, so the file is outside the subtrack.
	return 1
}

# PL: Główna funkcja: czyta gałąź i listę plików, wypisuje naruszenia i zwraca kod wyjścia.
# PL: Parametry: $1 = nazwa gałęzi.
# EN: Main function: reads the branch and the file list, prints violations and sets the exit code.
# EN: Parameters: $1 = branch name.
main() {
	branch=${1:-}

	# PL: Bez nazwy gałęzi nie ma czego sprawdzać.
	# EN: Without a branch name there is nothing to check.
	if [ -z "$branch" ]; then
		echo "Użycie: granice-torow.sh <nazwa gałęzi>, lista plików na wejściu." >&2
		return 2
	fi

	# PL: Gałęzie spoza feat/ (build/, fix/, docs/, ci/ i inne) nie mają podtoru, więc je pomijamy.
	# EN: Branches outside feat/ (build/, fix/, docs/, ci/ and others) have no subtrack, so we skip them.
	case "$branch" in
		feat/*) ;;
		*)
			echo "Gałąź „$branch” nie zaczyna się od feat/, pomijam sprawdzenie."
			return 0
			;;
	esac

	# PL: Podtor to tekst między „feat/” a pierwszym „-”, na przykład „3b” z „feat/3b-tabela”.
	# EN: The subtrack is the text between "feat/" and the first "-", for example "3b" from "feat/3b-tabela".
	subtrack=${branch#feat/}
	subtrack=${subtrack%%-*}

	# PL: Znajdź wiersz podtoru w tabeli. Zmienna środowiskowa chroni przed znakami specjalnymi w nazwie gałęzi.
	# EN: Find the subtrack row in the table. An environment variable protects against special characters in the branch name.
	row=$(printf '%s\n' "$SUBTRACKS" | SUBTRACK="$subtrack" awk 'NF && $1 == ENVIRON["SUBTRACK"] { print $2, $3 }')
	if [ -z "$row" ]; then
		echo "Nieznany podtor „$subtrack” w gałęzi „$branch”." >&2
		echo "Gałąź ma mieć nazwę feat/<podtor>-opis, na przykład feat/3b-tabela. Podtory są w docs/PODZIAL_PRACY.md, część 3." >&2
		return 1
	fi

	# PL: Rozbij wiersz na moduł i część, a potem zbierz ścieżki dozwolone dla tego podtoru.
	# EN: Split the row into module and part, then collect the paths allowed for this subtrack.
	# shellcheck disable=SC2086
	set -- $row
	allowed=$(allowed_paths "$subtrack" "$1" "$2")
	allowed="$allowed
$CHANGES_DIR"

	# PL: Przejdź po zmienionych plikach i zapamiętaj te spoza podtoru.
	# EN: Walk through the changed files and remember the ones outside the subtrack.
	violations=''
	while IFS= read -r file; do
		# PL: Puste linie na wejściu pomijamy.
		# EN: Skip empty lines on the input.
		[ -n "$file" ] || continue
		if ! is_allowed "$file" "$allowed"; then
			violations="$violations  $file
"
		fi
	done

	# PL: Bez naruszeń gałąź mieści się w swoim podtorze.
	# EN: With no violations the branch stays inside its subtrack.
	if [ -z "$violations" ]; then
		echo "Granice torów: gałąź „$branch” zmienia tylko pliki podtoru $subtrack."
		return 0
	fi

	# PL: Wypisz pliki spoza podtoru i to, co wolno zmieniać.
	# EN: Print the files outside the subtrack and what is allowed to change.
	echo "Granice torów: gałąź „$branch” (podtor $subtrack) zmienia pliki spoza swojego podtoru:" >&2
	printf '%s' "$violations" >&2
	echo "Podtor $subtrack może zmieniać tylko:" >&2
	echo "$allowed" | sed 's/^/  /' >&2
	echo "Brakuje pliku w innym podtorze? Załóż zgłoszenie dla tamtego podtoru (docs/PODZIAL_PRACY.md, część 6)." >&2
	return 1
}

# PL: Uruchom sprawdzenie z argumentami skryptu.
# EN: Run the check with the script arguments.
main "$@"
