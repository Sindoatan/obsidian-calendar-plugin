import type { ICalendarSource } from "obsidian-calendar-ui";
import { derived } from "svelte/store";


import { settings } from "../stores";
import { getWordCount, clamp } from "../utils";

const NUM_MAX_DOTS = 5;

import type { TFile } from "obsidian";
import type { IDot } from "obsidian-calendar-ui";

export async function getWordLengthAsDots(note: TFile, wordsPerDot: number): Promise<number> {
  if (!note || wordsPerDot <= 0) {
    return 0;
  }
  const fileContents = await window.app.vault.cachedRead(note);

  const wordCount = getWordCount(fileContents);
  const numDots = wordCount / wordsPerDot;
  return clamp(Math.floor(numDots), 1, NUM_MAX_DOTS);
}

export async function getDotsForDailyNote(
  dailyNote: TFile | null,
  wordsPerDot: number
): Promise<IDot[]> {
  if (!dailyNote) {
    return [];
  }
  const numSolidDots = await getWordLengthAsDots(dailyNote, wordsPerDot);

  const dots = [];
  for (let i = 0; i < numSolidDots; i++) {
    dots.push({
      color: "default",
      isFilled: true,
    });
  }
  return dots;
}

export const wordCountSource = derived(settings, ($settings) => {
  const { wordsPerDot } = $settings;

  return {
    id: "word-count",
    name: "Word Count",
    defaultSettings: {},
    getMetadata: async (_granularity, _date, file: TFile) => {
      if (!file) {
        return { value: 0, dots: [] };
      }
      const fileContents = await window.app.vault.cachedRead(file);
      const wordCount = getWordCount(fileContents);
      const numDots = await getWordLengthAsDots(file, wordsPerDot);
      const dots = Array.from({ length: numDots }, () => ({ color: "default", isFilled: true }));
      return {
        value: wordCount,
        dots,
    
      };
    },
  } as ICalendarSource;
});
