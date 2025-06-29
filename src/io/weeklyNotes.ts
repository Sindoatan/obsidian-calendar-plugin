import type { Moment } from "moment";
import { TFile } from "obsidian";
import {
  getWeeklyNoteSettings,
} from "obsidian-daily-notes-interface";

import type { ISettings } from "src/settings";
import { createConfirmationDialog } from "src/ui/modal";
import { weeklyNotes } from "../ui/stores";
import { Notice } from "obsidian";

/**
 * Create a Weekly Note for a given date.
 */
export async function tryToCreateWeeklyNote(
  date: Moment,
  inNewSplit: boolean,
  settings: ISettings,
  cb?: (file: TFile) => void
): Promise<void> {
  console.log('[CalendarPlugin] tryToCreateWeeklyNote called for:', date.format(), 'inNewSplit:', inNewSplit);
  const { workspace } = window.app;
  // Prefer user settings if provided, else fallback to plugin defaults
  const periodicSettings = getWeeklyNoteSettings();
  const format = settings.weeklyNoteFormat || periodicSettings.format;
  const templatePath = settings.weeklyNoteTemplate || periodicSettings.template;
  const folder = settings.weeklyNoteFolder || periodicSettings.folder;
  const filename = date.format(format);
  const vault = window.app.vault;

  const createFile = async () => {
    try {
      // Step 1: Ensure folder exists
      const folderPath = folder ? folder.replace(/\/$/, "") : "";
      if (folderPath) {
        try {
          await vault.createFolder(folderPath);
          console.log('[CalendarPlugin] Created weekly note folder:', folderPath);
        } catch (err) {
          if (err.message && err.message.includes('Folder already exists')) {
            console.log('[CalendarPlugin] Weekly note folder already exists, continuing:', folderPath);
          } else {
            throw err;
          }
        }
      }
      // Step 2: Compose file path
      const filePath = (folderPath ? folderPath + "/" : "") + filename + ".md";
      // Step 3: Resolve and read template
      let content = "";
      if (templatePath) {
        let resolvedTemplate = vault.getAbstractFileByPath(templatePath);
        if (!resolvedTemplate && !templatePath.endsWith('.md')) {
          resolvedTemplate = vault.getAbstractFileByPath(templatePath + '.md');
        }
        if (!resolvedTemplate) {
          // Try relative to folder
          resolvedTemplate = vault.getAbstractFileByPath((folderPath ? folderPath + "/" : "") + templatePath);
        }
        if (resolvedTemplate && resolvedTemplate instanceof TFile) {
          content = await vault.read(resolvedTemplate);
          console.log('[CalendarPlugin] Loaded weekly note template:', resolvedTemplate.path);
          // Replace template variables (e.g., {{date}} and {{date:FORMAT}}) with actual values
          content = content.replace(/{{date(?::([^}]+))?}}/gi, (_, fmt) => date.format(fmt || 'YYYY-MM-DD'));
          // Add more replacements here if needed
        } else {
          console.warn('[CalendarPlugin] Weekly note template file not found:', templatePath);
        }
      }
      // Step 4: Create the file
      let weeklyNote: TFile;
      try {
        weeklyNote = await vault.create(filePath, content);
        console.log('[CalendarPlugin] Weekly note created at:', filePath);
      } catch (err) {
        if (err.message && (err.message.includes('File already exists') || err.message.includes('already exists'))) {
          const existing = vault.getAbstractFileByPath(filePath);
          if (existing && existing instanceof TFile) {
            weeklyNote = existing as TFile;
            console.log('[CalendarPlugin] Weekly note already exists, opening:', filePath);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      weeklyNotes.reindex();
      const leaf = workspace.getLeaf(inNewSplit);
      await leaf.openFile(weeklyNote, { active: true });
      console.log('[CalendarPlugin] Weekly note opened after creation:', weeklyNote?.path);
      cb?.(weeklyNote);
    } catch (err) {
      new Notice('Failed to create weekly note: ' + err.message);
      console.error('[CalendarPlugin] Failed to create weekly note:', err);
    }
  };

  if (settings.shouldConfirmBeforeCreate) {
    createConfirmationDialog({
      cta: "Create",
      onAccept: createFile,
      text: `File ${filename} does not exist. Would you like to create it?`,
      title: "New Weekly Note",
    });
  } else {
    await createFile();
  }
}
