'use strict';
// Helpers and renderers for the five-days forecast section.
// Uses the icon registry to fetch SVGs based on OpenWeather codes.
import { mapIconCode } from './icons/mapIconCode.js';
import { getIcon } from './icons/registry.js';
// Measurement icons (barometer, humidity, wind) are also resolved via registry.

// Format a date like "2023-07-26" into "26 Jul" for compact UI labels.
const formatDate = dateString => {
  const date = new Date(dateString);

  const day = date.getDate();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()];

  return `${day} ${month}`;
};

// Format a timestamp string into HH:MM (24-hour clock).
function getHour(dateString) {
  const date = new Date(dateString);
  const hour = date.getHours();
  const minutes = date.getMinutes();

  return `${hour.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`;
}

// Get the weekday name for a given date string.
const getDayOfWeek = dateString => {
  const date = new Date(dateString);
  const dayOfWeekNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayOfWeek = dayOfWeekNames[date.getDay()];

  return dayOfWeek;
};

/**
 * Create and append a single forecast day card.
 * Keeps DOM updates simple by inserting an HTML string at the end.
 */
async function createCardsMarkup(item, cardsList) {
  const { weatherIconCode, day, dayDate, minTemp, maxTemp } = item;
  let iconSVG = '';
  try {
    const key = mapIconCode(weatherIconCode);
    iconSVG = await getIcon(key);
  } catch {
    // leave blank if fails
  }
  const cardHTML = `
    <div class="card" data-day="${dayDate}">
      <h3 class="card__name">${day}</h3>
      <h2 class="card__date">${dayDate}</h2>
      <svg width="35" height="35" class="card__icon" viewBox="0 0 32 32">${iconSVG}</svg>
      <ul class="temperatures">
        <li class="temperatures__item">
          <span class="temperatures__label">min</span>
          ${minTemp}°
        </li>
        <li class="temperatures__item">
          <span class="temperatures__label">max</span>
          ${maxTemp}°
        </li>
      </ul>
      <button type="button" class="card__button" value="${dayDate}">more info</button>
    </div>`;
  cardsList.insertAdjacentHTML('beforeend', cardHTML);
}

// Aggregate 3-hour entries per calendar day, tracking min/max and icon.
function getDailyData(item, dailyData) {
  const {
    dt_txt,
    main: { temp, temp_min, temp_max },
    weather,
  } = item;
  const date = formatDate(dt_txt);
  const existingData = dailyData.find(data => data.dayDate === date);

  if (!existingData) {
    dailyData.push({
      minTemp: Math.ceil(temp_min),
      maxTemp: Math.ceil(temp_max),
      day: getDayOfWeek(dt_txt),
      dayDate: date,
      weatherIconCode: weather[0].icon,
    });
  } else {
    existingData.minTemp = Math.ceil(Math.min(existingData.minTemp, temp));
    existingData.maxTemp = Math.ceil(Math.max(existingData.maxTemp, temp));
  }
}

// Build an hourly list per day for the "More info" panel.
function moreInfoData(item, myarr) {
  const { dt_txt } = item;
  const date = formatDate(dt_txt);
  const hour = getHour(dt_txt);
  const dayData = myarr[date];

  if (!dayData) {
    myarr[date] = [{ hour, ...item }];
  } else {
    const hourData = dayData.find(data => getHour(data.dt_txt) === hour);
    if (!hourData) {
      dayData.push({ hour, ...item });
    }
  }
}

/**
 * Render the hourly "More info" panel for a specific day.
 * Preloads measurement icons once to keep the loop lighter.
 */
async function createMoreInfoMarkup(dataForDay, moreInfoContainer) {
  let markup = '';
  // Preload measurement icons once
  let barometerSvg = '';
  let humiditySvg = '';
  let windSvg = '';
  try {
    [barometerSvg, humiditySvg, windSvg] = await Promise.all([
      getIcon('barometer'),
      getIcon('humidity'),
      getIcon('wind'),
    ]);
  } catch (_e) {
    // Silently ignore icon preload failure; UI will render without measurement icons.
  }
  for (let i = 1; i < dataForDay.length; i++) {
    const item = dataForDay[i];
    const { weather, hour, main, wind } = item;
    const iconCode = weather[0].icon;
    let iconSVG = '';
    try {
      const key = mapIconCode(iconCode);
      iconSVG = await getIcon(key);
    } catch (_e) {
      // Leave icon blank if individual icon fails.
    }
    markup += `
      <div class="more-info">
        <p class="more-info__hour">${hour}</p>
        <svg width="35" height="35" class="more-info__icon" viewBox="0 0 32 32">${iconSVG}</svg>
        <p class="more-info__temperature">${Math.ceil(main.temp)}°</p>
        <ul class="details-list">
          <li class="details-list__item">
            <svg class="details-list__icon" width="20" height="20" viewBox="0 0 32 32">${barometerSvg}</svg>
            ${main.pressure} mm
          </li>
          <li class="details-list__item">
            <svg class="details-list__icon" width="20" height="20" viewBox="0 0 32 32">${humiditySvg}</svg>
            ${main.humidity}%
          </li>
            <li class="details-list__item">
            <svg class="details-list__icon" width="20" height="20" viewBox="0 0 32 32">${windSvg}</svg>
            ${wind.speed} m/s
          </li>
        </ul>
      </div>`;
  }
  moreInfoContainer.innerHTML = markup;
}

// Public exports used by other modules.
export {
  formatDate,
  getDayOfWeek,
  createCardsMarkup,
  getDailyData,
  moreInfoData,
  createMoreInfoMarkup,
};
