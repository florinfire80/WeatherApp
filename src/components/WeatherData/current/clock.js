'use strict';

// Clock / timezone handling extracted from currentDayData.js
// Provides start/stop functions returning clear handles
import { updateClock, updateClockWithTimeZone } from '../utilsForCurrentDay';

let globalClockInterval = null;
let cityClockInterval = null;

export function startBaseClock() {
  if (globalClockInterval) return;
  globalClockInterval = setInterval(updateClock, 1000);
}

export function stopBaseClock() {
  clearInterval(globalClockInterval);
  globalClockInterval = null;
}

export function startCityClock(weatherData) {
  // Ensure the base (local) clock is not racing with the city clock on the same DOM element
  stopBaseClock();
  stopCityClock();
  cityClockInterval = setInterval(
    () => updateClockWithTimeZone(weatherData),
    1000
  );
}

export function stopCityClock() {
  clearInterval(cityClockInterval);
  cityClockInterval = null;
}

export function restartCityClock(weatherData) {
  stopCityClock();
  startCityClock(weatherData);
}
