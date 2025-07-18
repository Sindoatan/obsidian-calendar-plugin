#!/bin/bash
LOG_DIR="/home/sindo/win-obsidian-logs"
TMP_DIR="/home/sindo/obsidian-calendar-plugin/tmp"
NEWEST_LOG=$(ls -t "$LOG_DIR"/console-log.*.ndjson 2>/dev/null | head -n 1)
if [ -n "$NEWEST_LOG" ]; then
  tail -n 1000 "$NEWEST_LOG" > "$TMP_DIR/latest-log.ndjson"
fi
