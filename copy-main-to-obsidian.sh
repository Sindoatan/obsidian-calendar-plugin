#!/bin/bash
# Copy the built main.js to the Obsidian plugin folder, replacing the existing file

PLUGIN_SRC="$(dirname "$0")/main.js"
PLUGIN_DEST="/home/sindo/win-obsplugin-calendar/main.js"

if [ ! -f "$PLUGIN_SRC" ]; then
  echo "main.js not found in $(dirname "$0")! Build the plugin first."
  exit 1
fi

cp -f "$PLUGIN_SRC" "$PLUGIN_DEST"
echo "Copied $PLUGIN_SRC to $PLUGIN_DEST"
