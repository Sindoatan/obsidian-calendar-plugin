import { App, PluginSettingTab, Setting } from "obsidian";
import { appHasDailyNotesPluginLoaded } from "obsidian-daily-notes-interface";
import type { ILocaleOverride, IWeekStartOption } from "obsidian-calendar-ui";

import { DEFAULT_WEEK_FORMAT, DEFAULT_WORDS_PER_DOT } from "src/constants";

import type CalendarPlugin from "./main";

export interface ISettings {
  wordsPerDot: number;
  showAllDotsCounters: boolean;
  showWordCount: boolean;
  showCustomTags: boolean;
  showStreak: boolean;
  showTasks: boolean;
  weekStart: IWeekStartOption;
  shouldConfirmBeforeCreate: boolean;

  // Weekly Note settings
  showWeekNumber: boolean; // unified toggle for week number display
  weeklyNoteFormat: string;
  weeklyNoteTemplate: string;
  weeklyNoteFolder: string;

  localeOverride: ILocaleOverride;
}

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const defaultSettings = Object.freeze({
  shouldConfirmBeforeCreate: true,
  weekStart: "locale" as IWeekStartOption,

  wordsPerDot: DEFAULT_WORDS_PER_DOT,
  showAllDotsCounters: true,
  showWordCount: true,
  showCustomTags: true,
  showStreak: true,
  showTasks: true,
  showWeekNumber: false,

  // showWeeklyNote removed (replaced by showWeekNumber)
  weeklyNoteFormat: "",
  weeklyNoteTemplate: "",
  weeklyNoteFolder: "",

  localeOverride: "system-default",
});

export function appHasPeriodicNotesPluginLoaded(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodicNotes = (<any>window.app).plugins.getPlugin("periodic-notes");
  return periodicNotes && periodicNotes.settings?.weekly?.enabled;
}

export class CalendarSettingsTab extends PluginSettingTab {
  private plugin: CalendarPlugin;

  constructor(app: App, plugin: CalendarPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();

    if (!appHasDailyNotesPluginLoaded()) {
      this.containerEl.createDiv("settings-banner", (banner) => {
        banner.createEl("h3", {
          text: "⚠️ Daily Notes plugin not enabled",
        });
        banner.createEl("p", {
          cls: "setting-item-description",
          text:
            "The calendar is best used in conjunction with either the Daily Notes plugin or the Periodic Notes plugin (available in the Community Plugins catalog).",
        });
      });
    }

    this.containerEl.createEl("h3", {
      text: "General Settings",
    });
    this.addWeekStartSetting();
    this.addConfirmCreateSetting();

    // Dots & Counters Visibility Group
    this.containerEl.createEl("h4", { text: "Dots & Counters Visibility" });
    this.addDotThresholdSetting();
    new Setting(this.containerEl)
      .setName("Show all dots and counters")
      .setDesc("Master switch to show or hide all dots, counters, and captions in the calendar and pop-ups.")
      .addToggle((toggle: import('obsidian').ToggleComponent) => {
        toggle.setValue(this.plugin.options.showAllDotsCounters);
        toggle.onChange(async (value: boolean) => {
          if (typeof window !== "undefined" && (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions) {
            await (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions(() => ({ showAllDotsCounters: value }));
          } else {
            this.plugin.writeOptions(() => ({ showAllDotsCounters: value }));
          }
          this.app.workspace.trigger('calendar:settings-updated');
          this.display(); // Immediately refresh settings UI
        });
      });
    if (this.plugin.options.showAllDotsCounters) {
      this.addShowWordCountSetting();
      this.addShowCustomTagsSetting();
      this.addShowStreakSetting();
      this.addShowTasksSetting();
    }

    // Weekly Note Settings
    this.containerEl.createEl("h3", {
      text: "Weekly Note Settings",
    });
    this.addShowWeekNumberSetting();
    if (this.plugin.options.showWeekNumber && !appHasPeriodicNotesPluginLoaded()) {
      this.addWeeklyNoteFormatSetting();
      this.addWeeklyNoteTemplateSetting();
      this.addWeeklyNoteFolderSetting();
    }

    this.containerEl.createEl("h3", {
      text: "Advanced Settings",
    });
    this.addLocaleOverrideSetting();
  }

  addDotThresholdSetting(): void {
    new Setting(this.containerEl)
      .setName("Words per dot")
      .setDesc("How many words should be represented by a single dot?")
      .addText((textfield: import('obsidian').TextComponent) => {
        textfield.setValue(String(this.plugin.options.wordsPerDot));
        textfield.setPlaceholder(String(DEFAULT_WORDS_PER_DOT));
        textfield.inputEl.type = "number";
        textfield.onChange(async (value: string) => {
          this.plugin.writeOptions(() => ({
            wordsPerDot: value !== "" ? Number(value) : undefined,
          }));
        });
      });
  }

  addShowWordCountSetting(disabled = false): void {
    new Setting(this.containerEl)
      .setName("Show word count")
      .setDesc("Display the word count on calendar dates and pop-up windows.")
      .addToggle((toggle: import('obsidian').ToggleComponent) => {
        toggle.setValue(this.plugin.options.showWordCount);
        toggle.setDisabled(disabled);
        toggle.onChange(async (value: boolean) => {
          if (typeof window !== "undefined" && (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions) {
            await (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions(() => ({ showWordCount: value }));
          } else {
            this.plugin.writeOptions(() => ({ showWordCount: value }));
          }
          this.app.workspace.trigger('calendar:settings-updated');
        });
      });
  }
  
  addShowCustomTagsSetting(disabled = false): void {
    new Setting(this.containerEl)
      .setName("Show custom tags")
      .setDesc("Display custom tag dots on calendar dates and pop-up windows.")
      .addToggle((toggle: import('obsidian').ToggleComponent) => {
        toggle.setValue(this.plugin.options.showCustomTags);
        toggle.setDisabled(disabled);
        toggle.onChange(async (value: boolean) => {
          if (typeof window !== "undefined" && (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions) {
            await (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions(() => ({ showCustomTags: value }));
          } else {
            this.plugin.writeOptions(() => ({ showCustomTags: value }));
          }
          this.app.workspace.trigger('calendar:settings-updated');
        });
      });
  }

  addShowStreakSetting(disabled = false): void {
    new Setting(this.containerEl)
      .setName("Show streak")
      .setDesc("Display streak dots on calendar dates and pop-up windows.")
      .addToggle((toggle: import('obsidian').ToggleComponent) => {
        toggle.setValue(this.plugin.options.showStreak);
        toggle.setDisabled(disabled);
        toggle.onChange(async (value: boolean) => {
          if (typeof window !== "undefined" && (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions) {
            await (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions(() => ({ showStreak: value }));
          } else {
            this.plugin.writeOptions(() => ({ showStreak: value }));
          }
          this.app.workspace.trigger('calendar:settings-updated');
        });
      });
  }

  // addShowWeekNumSetting removed (use addShowWeekNumberSetting instead)

  addShowWeekNumberSetting(): void {
  new Setting(this.containerEl)
    .setName("Show week number")
    .setDesc("Display the week number in the calendar and weekly notes.")
    .addToggle((toggle: import('obsidian').ToggleComponent) => {
      toggle.setValue(this.plugin.options.showWeekNumber);
      toggle.onChange(async (value: boolean) => {
        if (typeof window !== "undefined" && (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions) {
          await (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions(() => ({ showWeekNumber: value }));
        } else {
          this.plugin.writeOptions(() => ({ showWeekNumber: value }));
        }
        this.app.workspace.trigger('calendar:settings-updated');
        this.display();
      });
    });
}

addShowTasksSetting(disabled = false): void {
    new Setting(this.containerEl)
      .setName("Show tasks")
      .setDesc("Display tasks dots on calendar dates and pop-up windows.")
      .addToggle((toggle: import('obsidian').ToggleComponent) => {
        toggle.setValue(this.plugin.options.showTasks);
        toggle.setDisabled(disabled);
        toggle.onChange(async (value: boolean) => {
          if (typeof window !== "undefined" && (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions) {
            await (window as { calendarPluginSetOptions?: (cb: unknown) => Promise<void> }).calendarPluginSetOptions(() => ({ showTasks: value }));
          } else {
            this.plugin.writeOptions(() => ({ showTasks: value }));
          }
          this.app.workspace.trigger('calendar:settings-updated');
        });
      });
  }

addWeekStartSetting(): void {
    const { moment } = window;

    const localizedWeekdays = moment.weekdays();
    const localeWeekStartNum = window._bundledLocaleWeekSpec.dow;
    const localeWeekStart = moment.weekdays()[localeWeekStartNum];

    new Setting(this.containerEl)
      .setName("Start week on:")
      .setDesc(
        "Choose what day of the week to start. Select 'Locale default' to use the default specified by moment.js"
      )
      .addDropdown((dropdown: import('obsidian').DropdownComponent) => {
        dropdown.addOption("locale", `Locale default (${localeWeekStart})`);
        localizedWeekdays.forEach((day, i) => {
          dropdown.addOption(weekdays[i], day);
        });
        dropdown.setValue(this.plugin.options.weekStart);
        dropdown.onChange(async (value: string) => {
          this.plugin.writeOptions(() => ({
            weekStart: value as IWeekStartOption,
          }));
        });
      });
  }

  addConfirmCreateSetting(): void {
    new Setting(this.containerEl)
      .setName("Confirm before creating new note")
      .setDesc("Show a confirmation modal before creating a new note")
      .addToggle((toggle: import('obsidian').ToggleComponent) => {
        toggle.setValue(this.plugin.options.shouldConfirmBeforeCreate);
        toggle.onChange(async (value: boolean) => {
          this.plugin.writeOptions(() => ({
            shouldConfirmBeforeCreate: value,
          }));
        });
      });
  }

  addWeeklyNoteFormatSetting(): void {
    new Setting(this.containerEl)
      .setName("Weekly note format")
      .setDesc("For more syntax help, refer to format reference")
      .addText((textfield: import('obsidian').TextComponent) => {
        textfield.setValue(this.plugin.options.weeklyNoteFormat);
        textfield.setPlaceholder(DEFAULT_WEEK_FORMAT);
        textfield.onChange(async (value: string) => {
          this.plugin.writeOptions(() => ({ weeklyNoteFormat: value }));
        });
      });
  }

  addWeeklyNoteTemplateSetting(): void {
    new Setting(this.containerEl)
      .setName("Weekly note template")
      .setDesc(
        "Choose the file you want to use as the template for your weekly notes"
      )
      .addText((textfield: import('obsidian').TextComponent) => {
        textfield.setValue(this.plugin.options.weeklyNoteTemplate);
        textfield.onChange(async (value: string) => {
          this.plugin.writeOptions(() => ({ weeklyNoteTemplate: value }));
        });
      });
  }

  addWeeklyNoteFolderSetting(): void {
    new Setting(this.containerEl)
      .setName("Weekly note folder")
      .setDesc("New weekly notes will be placed here")
      .addText((textfield: import('obsidian').TextComponent) => {
        textfield.setValue(this.plugin.options.weeklyNoteFolder);
        textfield.onChange(async (value: string) => {
          this.plugin.writeOptions(() => ({ weeklyNoteFolder: value }));
        });
      });
  }

  addLocaleOverrideSetting(): void {
    // Use global moment import
    const moment: typeof import('moment') | undefined = typeof window !== 'undefined' && (window as any).moment ? (window as any).moment : undefined;
    const sysLocale = navigator.language?.toLowerCase();

    new Setting(this.containerEl)
      .setName("Override locale:")
      .setDesc(
        "Set this if you want to use a locale different from the default"
      )
      .addDropdown((dropdown: import('obsidian').DropdownComponent) => {
        dropdown.addOption("system-default", `Same as system (${sysLocale})`);
        if (moment && moment.locales) {
          moment.locales().forEach((locale: string) => {
            dropdown.addOption(locale, locale);
          });
        }
        dropdown.setValue(this.plugin.options.localeOverride);
        dropdown.onChange(async (value: string) => {
          this.plugin.writeOptions(() => ({
            localeOverride: value as ILocaleOverride,
          }));
        });
      });
  }
}


