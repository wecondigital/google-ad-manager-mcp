#!/usr/bin/env bash
# Converte um deck .pptx em PDF com o LibreOffice.
#   ./exporta_pdf.sh Relatorio-DiTerra-2026-09-07-a-2026-09-13.pptx
#
# Duas pegadinhas do ambiente, por isso este script existe:
#  - a imagem traz so libreoffice-core; sem libreoffice-impress o soffice
#    devolve "source file could not be loaded" ate para um pptx trivial
#  - o soffice precisa de um perfil gravavel, senao falha calado
set -euo pipefail
[ $# -eq 1 ] || { echo "uso: $0 <arquivo.pptx>" >&2; exit 1; }

if ! ls /usr/lib/libreoffice/program/ | grep -qi impress; then
  echo "instalando libreoffice-impress..." >&2
  apt-get update -qq >/dev/null 2>&1 || true
  apt-get install -y -qq libreoffice-impress >/dev/null
fi

PERFIL="$(mktemp -d)"
trap 'rm -rf "$PERFIL"' EXIT
soffice -env:UserInstallation="file://$PERFIL" --headless --norestore \
        --convert-to pdf --outdir "$(dirname "$1")" "$1"
