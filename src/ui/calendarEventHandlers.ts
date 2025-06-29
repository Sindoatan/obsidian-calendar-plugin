import { get } from "svelte/store";
import { tryToCreateDailyNote } from "../io/dailyNotes";
import { tryToCreateWeeklyNote } from "../io/weeklyNotes";
import { settings, dailyNotes, weeklyNotes, activeFile } from "./stores";
import { getDailyNote, getWeeklyNote } from "obsidian-daily-notes-interface";
import type { App, TFile } from "obsidian";
import type { Moment } from "moment";

// Handler for clicking a day cell
export async function onDayClick(app: App, date: Moment, inNewSplit = false) {
  // Robust check: ensure date is a valid Moment object
  if (!date || typeof date !== 'object' || typeof (date as any).isValid !== 'function' || !(date as any).isValid()) {
    console.error('[CalendarPlugin] onDayClick: Invalid date argument (guarded):', date, 'Type:', typeof date);
    return;
  }
  console.log('[CalendarPlugin] onDayClick triggered:', date.format(), 'inNewSplit:', inNewSplit);
  console.log('[CalendarPlugin] onDayClick triggered:', date.format(), 'inNewSplit:', inNewSplit);
  const dailyNoteFile = getDailyNote(date, get(dailyNotes));
  if (dailyNoteFile) {
    console.log('[CalendarPlugin] Daily note exists, opening:', dailyNoteFile.path);
    const leaf = inNewSplit
      ? app.workspace.splitActiveLeaf()
      : app.workspace.getUnpinnedLeaf();
    await leaf.openFile(dailyNoteFile, { active: true });
    activeFile.setFile(dailyNoteFile);
    console.log('[CalendarPlugin] Daily note opened:', dailyNoteFile.path);
  } else {
    console.log('[CalendarPlugin] Daily note does not exist, creating for:', date.format());
    await tryToCreateDailyNote(date, inNewSplit, get(settings), (file: TFile) => {
      console.log('[CalendarPlugin] Daily note created and opened:', file?.path);
      activeFile.setFile(file);
    });
  }
}

// Handler for clicking a week cell
export async function onWeekClick(app: App, date: Moment, inNewSplit = false) {
  // Robust check: ensure date is a valid Moment object
  if (!date || typeof date !== 'object' || typeof (date as any).isValid !== 'function' || !(date as any).isValid()) {
    console.error('[CalendarPlugin] onWeekClick: Invalid date argument (guarded):', date, 'Type:', typeof date);
    return;
  }
  console.log('[CalendarPlugin] onWeekClick: date argument is valid Moment:', date, 'Type:', typeof date);
  console.log('[CalendarPlugin] onWeekClick triggered:', date.format(), 'inNewSplit:', inNewSplit);
  const weekFile = getWeeklyNote(date, get(weeklyNotes));
  if (weekFile) {
    console.log('[CalendarPlugin] Weekly note exists, opening:', weekFile.path);
    const leaf = inNewSplit
      ? app.workspace.splitActiveLeaf()
      : app.workspace.getUnpinnedLeaf();
    await leaf.openFile(weekFile, { active: true });
    activeFile.setFile(weekFile);
    console.log('[CalendarPlugin] Weekly note opened:', weekFile.path);
  } else {
    console.log('[CalendarPlugin] Weekly note does not exist, creating for:', date.format());
    await tryToCreateWeeklyNote(date, inNewSplit, get(settings), (file: TFile) => {
      console.log('[CalendarPlugin] Weekly note created and opened:', file?.path);
      activeFile.setFile(file);
    });
  }
}
