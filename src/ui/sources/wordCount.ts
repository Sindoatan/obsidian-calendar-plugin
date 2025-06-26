import type { ICalendarSource } from "obsidian-calendar-ui";
import { get } from "svelte/store";


import { settings } from "../stores";
import { getWordCount, clamp } from "../utils";

const NUM_MAX_DOTS = 5;

import type { TFile } from "obsidian";
import type { IDot } from "obsidian-calendar-ui";

export async function getWordLengthAsDots(note: TFile): Promise<number> {
  const { wordsPerDot = 250 } = get(settings);
  if (!note || wordsPerDot <= 0) {
    return 0;
  }
  const fileContents = await window.app.vault.cachedRead(note);

  const wordCount = getWordCount(fileContents);
  const numDots = wordCount / wordsPerDot;
  return clamp(Math.floor(numDots), 1, NUM_MAX_DOTS);
}

export async function getDotsForDailyNote(
  dailyNote: TFile | null
): Promise<IDot[]> {
  if (!dailyNote) {
    return [];
  }
  const numSolidDots = await getWordLengthAsDots(dailyNote);

  const dots = [];
  for (let i = 0; i < numSolidDots; i++) {
    dots.push({
      color: "default",
      isFilled: true,
    });
  }
  return dots;
}

export const wordCountSource: ICalendarSource = {
  id: "word-count",
  name: "Word Count",
  defaultSettings: {},
  getMetadata: async (_granularity, _date, file) => {
    const dots = file ? [{ isFilled: true }] : [];
    return {
      value: null,
      dots,
    };
  },
};
