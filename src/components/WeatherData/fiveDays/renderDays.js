'use strict';

// Pure rendering of day cards list
import {
  createCardsMarkup,
  formatDate,
  getDayOfWeek,
} from '../utilsForFiveDays';

export function mapServiceDayToCard(dayObj) {
  return {
    day: getDayOfWeek(dayObj.date),
    dayDate: formatDate(dayObj.date),
    minTemp: dayObj.min,
    maxTemp: dayObj.max,
    weatherIconCode: dayObj.icon,
  };
}

export async function renderDays(forecast, cardsList) {
  if (!forecast || !forecast.data || !forecast.data.days) return;
  cardsList.innerHTML = '';
  const days = forecast.data.days;
  for (let i = 0; i < days.length; i++) {
    if (i === 0) continue; // skip current day
    const item = mapServiceDayToCard(days[i]);
    // sequential await preserves visual order (acceptable here)
    await createCardsMarkup(item, cardsList);
  }
}
