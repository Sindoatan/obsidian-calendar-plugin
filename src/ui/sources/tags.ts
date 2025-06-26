import type { ICalendarSource } from "obsidian-calendar-ui";
import type { TFile } from "obsidian";

export const customTagsSource: ICalendarSource = {
  id: "custom-tags",
  name: "Custom Tags",
  defaultSettings: {},
  getMetadata: async (_granularity, _date, file: TFile) => {
    if (!file) return { value: 0, dots: [] };
    // TODO: Replace with real tag extraction logic if available
    // For now, just return 1 dot if file exists
    return {
      value: 1,
      dots: [{ isFilled: true }],

    };
  },
}
