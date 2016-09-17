#!/bin/bash
DIM="50"
CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOGOS_PATH="../public/logos"

for curLogo in ${CWD}/${LOGOS_PATH}/*; do
    FILENAME=$(basename "$curLogo")
    DIRNAME=$(dirname "$curLogo")
    EXT="${FILENAME##*.}"
    FILE="${FILENAME%.*}"
    THUMBNAME="${DIRNAME}/${FILE}-thumb.${EXT}"
    echo "converting $FILENAME ..."
    convert "$curLogo" -resize ${DIM}x${DIM} "${THUMBNAME}"
done
