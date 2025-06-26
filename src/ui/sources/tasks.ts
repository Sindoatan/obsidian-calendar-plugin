import type { ICalendarSource } from "obsidian-calendar-ui";
import type { TFile } from "obsidian";

export const tasksSource: ICalendarSource = {
  id: "tasks",
  name: "Tasks",
  defaultSettings: {},
  getMetadata: async (_granularity, _date, file: TFile) => {
    if (!file) {
      return { value: 0, dots: [] };
    }
    const value = await getNumberOfRemainingTasks(file);
    const dots = await getDotsForDailyNote(file);
    return {
      value,
      dots,

    };
  },
};

export async function getNumberOfRemainingTasks(note: TFile): Promise<number> {
  if (!note) {
    return 0;
  }

  const { vault } = window.app;
  const fileContents = await vault.cachedRead(note);
  return (fileContents.match(/(-|\*) \[ \]/g) || []).length;
}

import type { IDot } from "obsidian-calendar-ui";

export async function getDotsForDailyNote(
  dailyNote: TFile | null
): Promise<IDot[]> {
  if (!dailyNote) {
    return [];
  }
  const numTasks = await getNumberOfRemainingTasks(dailyNote);

  const dots = [];
  if (numTasks) {
    dots.push({
      className: "task",
      color: "default",
      isFilled: false,
    });
  }
  return dots;
}

