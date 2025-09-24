'use strict';

// Pure render logic for current weather UI
import { getNumberEnding } from '../utilsForCurrentDay';

export function renderCurrentWeather(weatherData, dom) {
  const {
    currentTemp,
    todayMin,
    todayMax,
    sunRise,
    sunSunset,
    currentDayNumber,
    currentDay,
    currentMonth,
    city,
    country,
    icon,
  } = weatherData;

  dom.currentTemperature.textContent = currentTemp;
  dom.degreesMin.textContent = todayMin;
  dom.degreesMax.textContent = todayMax;
  dom.dateInfo.innerHTML = `<h3>${currentDayNumber}<sup class="exponent">${getNumberEnding(
    currentDayNumber
  )}</sup> ${currentDay}</h3>`;
  dom.sunrise.textContent = sunRise;
  dom.sunset.textContent = sunSunset;
  dom.currentMonth.textContent = currentMonth;
  dom.cityText.innerHTML = `<b>${city}, ${country}</b>`;

  if (icon && dom.weatherType) {
    // For now keep legacy inline icon mapping (will migrate to registry soon)
    const weatherIcons = dom.iconMap;
    if (weatherIcons[icon]) {
      dom.weatherType.innerHTML = `<svg width="35" height="35" viewBox="0 0 32 32">${weatherIcons[icon]}</svg>`;
    }
  }
}
