'use strict';

// State management for five-days forecast
export const fiveDaysState = {
  lastForecast: null,
  selectedDay: null,
  activeCity: null,
};

export function setForecast(forecast) {
  fiveDaysState.lastForecast = forecast;
}

export function setSelectedDay(dayKey) {
  fiveDaysState.selectedDay = dayKey;
}

export function setActiveCity(city) {
  fiveDaysState.activeCity = city || null;
}
