import type { ICalendarSource } from "obsidian-calendar-ui";

export const streakSource: ICalendarSource = {
  id: "streak",
  name: "Streak",
  defaultSettings: {},
  getMetadata: async (_granularity, _date, file) => {
    return {
      value: null,
      dots: file ? [{ isFilled: true }] : [],
    };
  },
};
