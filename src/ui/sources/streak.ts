import type { ICalendarSource } from "obsidian-calendar-ui";
import { get } from "svelte/store";
import { settings } from "../stores";

export const streakSource: ICalendarSource = {
  id: "streak",
  name: "Streak",
  defaultSettings: {},
  getMetadata: async (_granularity, _date, file) => {
    const { showAllDotsCounters = true, showStreak = true } = get(settings);
    if (!showAllDotsCounters) {
      return { value: undefined, dots: undefined };
    }
    if (!showStreak) {
      return { value: undefined, dots: undefined };
    }
    // TODO: Replace with real streak calculation logic if available
    // For now, return 0 if no file, or 1 if file exists
    if (!file) {
      return { value: undefined, dots: undefined };
    }
    return {
      value: 1,
      dots: [{ isFilled: true }],
    };
  },
};
