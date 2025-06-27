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
      showAllDotsCounters: true,
      showWordCount: true,
      showCustomTags: true,
      showStreak: true,
      showTasks: true,
      showWeeklyNote: true,
      weeklyNoteFolder: "",
      weeklyNoteFormat: "gggg-[W]ww",
      weeklyNoteTemplate: "",
      localeOverride: "",
    },
    overrides
  );
}
