<svelte:options immutable />

<script lang="ts">
// Provide getSourceSettings to CalendarBase for correct popup captions
function getSourceSettings(sourceId: string) {
  const source = sources.find((s) => s.id === sourceId);
  if (source) {
    return {
      color: (source as any).color || '',
      display: (source as any).display || 'calendar-and-menu',
      order: (source as any).order || 0,
      id: source.id,
      name: source.name,
    };
  }
  return { color: '', display: 'calendar-and-menu', order: 0, id: sourceId, name: '' };
}

import type { App } from "obsidian";
export let app: App;
import type { Moment } from "moment";
import {
  Calendar as CalendarBase,
  configureGlobalMomentLocale,
} from "obsidian-calendar-ui";
import type { ICalendarSource } from "obsidian-calendar-ui";
import { onDestroy } from "svelte";

import type { ISettings } from "src/settings";
import { activeFile, dailyNotes, settings, weeklyNotes } from "./stores";
import { onDayClick, onWeekClick } from "./calendarEventHandlers";

  let today: Moment;

  $: today = getToday($settings);

  export let displayedMonth: Moment = today;
  export let sources: ICalendarSource[];

  export function tick() {
    today = window.moment();
  }

  function getToday(settings: ISettings) {
    configureGlobalMomentLocale(settings.localeOverride, settings.weekStart);
    dailyNotes.reindex();
    weeklyNotes.reindex();
    return window.moment();
  }

  // 1 minute heartbeat to keep `today` reflecting the current day
  let heartbeat = setInterval(() => {
    tick();

    const isViewingCurrentMonth = displayedMonth.isSame(today, "day");
    if (isViewingCurrentMonth) {
      // if it's midnight on the last day of the month, this will
      // update the display to show the new month.
      displayedMonth = today;
    }
  }, 1000 * 60);

  onDestroy(() => {
    clearInterval(heartbeat);
  });

  // The order of handlers must match CalendarBase's eventHandlers contract.
  // [0]: day-click, [1]: week-click
  const calendarEventHandlers = [
    (date: Moment, inNewSplit: boolean = false) => onDayClick(app, date, inNewSplit),
    (date: Moment, inNewSplit: boolean = false) => onWeekClick(app, date, inNewSplit),
  ];
</script>

<CalendarBase
  app={app}
  eventHandlers={calendarEventHandlers}
  getSourceSettings={getSourceSettings}
  {sources}
  {today}
  bind:displayedMonth
  localeData={today.localeData()}
  selectedId={$activeFile}
  showWeekNums={$settings.showWeeklyNote}
/>
