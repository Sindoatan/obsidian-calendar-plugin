import type { ICalendarSource } from "obsidian-calendar-ui";

export const streakSource: ICalendarSource = {
  id: "streak",
  name: "Streak",
  defaultSettings: {},
  getMetadata: async (_granularity, _date, file) => {
    // TODO: Replace with real streak calculation logic if available
    // For now, return 0 if no file, or 1 if file exists
    return {
      value: file ? 1 : 0,
      dots: file ? [{ isFilled: true }] : [],

    };
  },
};
