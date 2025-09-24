'use strict';

// Rendering of the hourly/more info panel
import { moreInfoData, createMoreInfoMarkup } from '../utilsForFiveDays';

import { fiveDaysState } from './state';

export function buildMoreInfoStructure() {
  if (
    !fiveDaysState.lastForecast ||
    !fiveDaysState.lastForecast.data ||
    !fiveDaysState.lastForecast.data.raw
  )
    return null;
  const rawList = fiveDaysState.lastForecast.data.raw.list || [];
  const moreInfo = [];
  rawList.forEach(item => moreInfoData(item, moreInfo));
  return moreInfo;
}

export async function renderMoreInfo(moreInfoContainer) {
  const moreInfo = buildMoreInfoStructure();
  if (!moreInfo) return;
  const dayKey = fiveDaysState.selectedDay;
  if (!dayKey) return;
  const dataForDay = moreInfo[dayKey];
  if (!dataForDay) return;
  await createMoreInfoMarkup(dataForDay, moreInfoContainer);
}
