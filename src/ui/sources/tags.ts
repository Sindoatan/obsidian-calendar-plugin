import type { ICalendarSource } from "obsidian-calendar-ui";
import { get } from "svelte/store";
import { settings as settingsStore } from "../stores";


import type { TFile } from "obsidian";

export const customTagsSource: ICalendarSource = {
  id: "custom-tags",
  name: "Custom Tags",
  defaultSettings: {},
  getMetadata: async (_granularity, _date, file: TFile) => {
    const opts = get(settingsStore);
    const { showAllDotsCounters = true, showCustomTags = true } = opts;

    if (!showAllDotsCounters) {
      return { value: undefined, dots: undefined };
    }
    if (!file) return { value: undefined, dots: undefined };
    if (!showCustomTags) {
      return { value: undefined, dots: undefined };
    }
    // TODO: Replace with real tag extraction logic if available
    // For now, just return 1 dot if file exists
    return {
      value: 1,
      dots: [{ isFilled: true }],
    };
  },
}
