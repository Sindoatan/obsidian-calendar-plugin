import type { ICalendarSource } from "obsidian-calendar-ui";


export const customTagsSource: ICalendarSource = {
  id: "custom-tags",
  name: "Custom Tags",
  defaultSettings: {},
  getMetadata: async (_granularity, _date, file) => {
    return {
      value: null,
      dots: file ? [{ isFilled: true }] : [],
    };
  },
}
