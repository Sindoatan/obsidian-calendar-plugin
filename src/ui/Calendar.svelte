<svelte:options immutable />

<script lang="ts">
let calendarBaseRef: any; // Reference to CalendarBase instance for fileCache access

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

import type { App, TFile } from "obsidian";
export let app: App;
import type { Moment } from "moment";
import {
  Calendar as CalendarBase,
  configureGlobalMomentLocale,
} from "../../lib/obsidian-calendar-ui";
import type { ICalendarSource } from "obsidian-calendar-ui";
import { onDestroy } from "svelte";

import type { ISettings } from "src/settings";

// Svelte store subscription for settings
let currentSettings;
const unsubscribe = settings.subscribe(val => { currentSettings = val; });
onDestroy(unsubscribe);
import { activeFile, dailyNotes, settings, weeklyNotes } from "./stores";
import { derived } from "svelte/store";


import { onDayClick, onWeekClick } from "./calendarEventHandlers";

let today: Moment;
let localeData;
export let displayedMonth: Moment;
export let sources: ICalendarSource[];



  // Reactively update today and localeData when settings change
  $: today = getToday($settings);
  $: localeData = today.localeData();

  // Reactively reindex notes when settings change
  $: {
    dailyNotes.reindex();
    weeklyNotes.reindex();
  }

  function getToday(settings: ISettings) {
    configureGlobalMomentLocale(settings.localeOverride, settings.weekStart);
    return window.moment();
  }


  // Handler for day cell click
  function handleDayClick(granularity: string, date: Moment, file: TFile, inNewSplit: boolean) {
    if (granularity === "day") {
      // console.log('[Calendar] handleDayClick', { date: date.format(), inNewSplit });
      onDayClick(app, date, inNewSplit);
    }
  }
  // Handler for week number click
  function handleWeekClick(granularity: string, date: Moment, file: TFile, inNewSplit: boolean) {
    if (granularity === "week") {
      // console.log('[Calendar] handleWeekClick', { date: date.format(), inNewSplit });
      onWeekClick(app, date, inNewSplit);
    }
  }
  // Handler for context menu (optional, for completeness)
  function handleContextMenu(granularity: string, date: Moment, file: TFile, event: MouseEvent) {
    // console.log('[Calendar] handleContextMenu', { granularity, date: date.format() });
    // Implement context menu logic if needed
  }
  // Handler for hover (optional, for completeness)
  function handleHover(granularity: string, date: Moment, file: TFile, targetEl: EventTarget, isMetaPressed: boolean) {
    // console.log('[Calendar] handleHover', { granularity, date: date.format(), isMetaPressed });
    // Implement hover logic if needed
  }
</script>

<CalendarBase
  app={app}
  getSourceSettings={getSourceSettings}
  sources={sources}
  {today}
  bind:displayedMonth
  localeData={today.localeData()}
  selectedId={$activeFile}
  showWeekNums={$settings.showWeeklyNote}
  eventHandlers={[
    handleDayClick,
    handleWeekClick,
    handleContextMenu,
    handleHover
  ]}
  bind:this={calendarBaseRef}
/>
