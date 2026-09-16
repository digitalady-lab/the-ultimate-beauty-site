#!/usr/bin/env bash
# Végigpörgeti a _redirects fájl szabályait az élő oldalon, és jelzi,
# ha egy régi URL nem a várt státusszal/célra válaszol.
#
#   ./scripts/check-redirects.sh [bázis-URL]
#
# Alapértelmezett bázis: https://theultimatebeauty.net

set -uo pipefail
BASE="${1:-https://theultimatebeauty.net}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAP="$ROOT/_redirects"

[ -f "$MAP" ] || { echo "Nincs meg: $MAP" >&2; exit 1; }

ok=0; bad=0; skipped=0

while read -r from to status _rest; do
  case "$from" in ''|'#'*) continue;; esac
  [ -n "${to:-}" ] && [ -n "${status:-}" ] || continue
  case "$from" in
    http*|*'*') skipped=$((skipped+1)); continue;;   # domain- és splat-szabályok
    /*) ;;
    *) continue;;
  esac

  want="${status%!}"
  head="$(curl -sSI --max-time 15 -o - "$BASE$from" 2>/dev/null)"
  got="$(printf '%s' "$head"  | awk 'NR==1{print $2}')"
  loc="$(printf '%s' "$head"  | awk 'tolower($1)=="location:"{print $2}' | tr -d '\r')"

  if [ "$got" = "$want" ]; then
    ok=$((ok+1))
    printf '  \033[32m✓\033[0m %-42s %s → %s\n' "$from" "$got" "${loc:-–}"
  else
    bad=$((bad+1))
    printf '  \033[31m✗\033[0m %-42s várt: %s, kapott: %s (Location: %s)\n' \
      "$from" "$want" "${got:-nincs válasz}" "${loc:-–}"
  fi
done < "$MAP"

echo
echo "Rendben: $ok · Hibás: $bad · Kihagyva (domain/splat): $skipped"
[ "$bad" -eq 0 ]
