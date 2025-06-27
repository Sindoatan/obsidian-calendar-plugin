import { get } from "svelte/store";
import { tryToCreateDailyNote } from "../io/dailyNotes";
import { tryToCreateWeeklyNote } from "../io/weeklyNotes";
import { settings, dailyNotes, weeklyNotes, activeFile } from "./stores";
import { getDailyNote, getWeeklyNote } from "obsidian-daily-notes-interface";
import type { App, TFile } from "obsidian";
import type { Moment } from "moment";

// Handler for clicking a day cell
export async function onDayClick(app: App, date: Moment, inNewSplit = false) {
  console.log('[Calendar] onDayClick', { date: date.format(), inNewSplit });
  const dailyNoteFile = getDailyNote(date, get(dailyNotes));
  if (dailyNoteFile) {
    const leaf = inNewSplit
      ? app.workspace.splitActiveLeaf()
      : app.workspace.getUnpinnedLeaf();
    await leaf.openFile(dailyNoteFile, { active: true });
    activeFile.setFile(dailyNoteFile);
  } else {
    await tryToCreateDailyNote(date, inNewSplit, get(settings), (file: TFile) => {
      activeFile.setFile(file);
    });
  }
}

// Handler for clicking a week cell
export async function onWeekClick(app: App, date: Moment, inNewSplit = false) {
  console.log('[Calendar] onWeekClick', { date: date.format(), inNewSplit });
  const weekFile = getWeeklyNote(date, get(weeklyNotes));
  if (weekFile) {
    const leaf = inNewSplit
      ? app.workspace.splitActiveLeaf()
      : app.workspace.getUnpinnedLeaf();
    await leaf.openFile(weekFile, { active: true });
    activeFile.setFile(weekFile);
  } else {
    await tryToCreateWeeklyNote(date, inNewSplit, get(settings), (file: TFile) => {
      activeFile.setFile(file);
    });
  }
}
