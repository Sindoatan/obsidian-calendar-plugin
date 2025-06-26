import type { ISettings } from "src/settings";

export function getDefaultSettings(
  overrides: Partial<ISettings> = {}
): ISettings {
  return Object.assign(
    {},
    {
      weekStart: "monday",
      shouldConfirmBeforeCreate: false,
      wordsPerDot: 250,
      showWeeklyNote: true,
      weeklyNoteFolder: "",
      weeklyNoteFormat: "gggg-[W]ww",
      weeklyNoteTemplate: "",
      localeOverride: "",
    },
    overrides
  );
}
