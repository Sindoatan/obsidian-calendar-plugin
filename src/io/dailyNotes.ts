import type { Moment } from "moment";
import type { TFile } from "obsidian";
import {
  createDailyNote,
  getDailyNoteSettings,
} from "obsidian-daily-notes-interface";

import type { ISettings } from "src/settings";
import { createConfirmationDialog } from "src/ui/modal";
import { dailyNotes } from "../ui/stores";
import { Notice } from "obsidian";

/**
 * Create a Daily Note for a given date.
 */
export async function tryToCreateDailyNote(
  date: Moment,
  inNewSplit: boolean,
  settings: ISettings,
  cb?: (newFile: TFile) => void
): Promise<void> {
  console.log('[CalendarPlugin] tryToCreateDailyNote called for:', date.format(), 'inNewSplit:', inNewSplit);
  const { workspace } = window.app;
  const { format } = getDailyNoteSettings();
  const filename = date.format(format);

  const createFile = async () => {
    try {
      const dailyNote = await createDailyNote(date);
      console.log('[CalendarPlugin] Daily note created:', dailyNote?.path);
      // Immediately reindex after creation
      dailyNotes.reindex();
      const leaf = inNewSplit
        ? workspace.splitActiveLeaf()
        : workspace.getUnpinnedLeaf();
      await leaf.openFile(dailyNote, { active : true });
      console.log('[CalendarPlugin] Daily note opened after creation:', dailyNote?.path);
      cb?.(dailyNote);
    } catch (err) {
      new Notice('Failed to create daily note: ' + err.message);
      console.error('[CalendarPlugin] Failed to create daily note:', err);
    }
  };

  if (settings.shouldConfirmBeforeCreate) {
    createConfirmationDialog({
      cta: "Create",
      onAccept: createFile,
      text: `File ${filename} does not exist. Would you like to create it?`,
      title: "New Daily Note",
    });
  } else {
    await createFile();
  }
}
