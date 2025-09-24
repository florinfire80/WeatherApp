'use strict';

// REFACTORED: This file now orchestrates modular pieces for current weather.
// Legacy inline logic replaced by imports from ./current/* modules.
import {
  scheduleIdle,
  scheduleFrame,
} from '../../components/scheduler/scheduler.js';
import {
  MSG_ENTER_CITY,
  MSG_ALREADY_CURRENT_LOCATION,
} from '../../constants/messages.js';
import { emit } from '../../events/eventBus.js';

import { applyCityBackground } from './current/backgroundImage';
import {
  startBaseClock,
  startCityClock,
  restartCityClock,
} from './current/clock';
import {
  resolveCityFromGeolocation,
  fetchCurrentWeather,
  safeFetchCity,
} from './current/currentWeatherService';
import { renderCurrentWeather } from './current/renderCurrent';
import { initSearch } from './current/searchForm';
import { sunriseSvg, sunsetSvg } from './icons/astroIcons.js';
import { mapIconCode } from './icons/mapIconCode.js';
import { getIcon } from './icons/registry.js';
import { formatDate } from './utilsForCurrentDay';
// Removed direct svgConstants import (icons now resolved via registry)
import { notifyError, notifyInfo } from './weatherService.js';

// DOM references encapsulated for renderer
const dom = {
  currentTemperature: document.querySelector('.current-temperature'),
  degreesMin: document.querySelector('.degrees-min'),
  degreesMax: document.querySelector('.degrees-max'),
  dateInfo: document.querySelector('.date-info__date'),
  currentMonth: document.querySelector('.time__month'),
  sunset: document.getElementById('sunset'),
  sunrise: document.getElementById('sunrise'),
  sunDetails: document.querySelector('.sun-details'),
  sunLine: document.querySelector('.line-sun'),
  cityText: document.getElementById('city'),
  searchForm: document.querySelector('#search-form'),
  searchInput: document.querySelector('#search-input'),
  weatherInfo: document.querySelector('.weather-info__weather'),
  weatherType: document.createElement('div'),
  iconMap: {}, // resolved dynamically via registry
};

// Seed with a neutral placeholder; real icon injected asynchronously once code resolved
dom.weatherType.innerHTML = '';
if (dom.weatherInfo) {
  dom.weatherInfo.prepend(dom.weatherType);
}

const sunsetSvgElement = document.createElement('div');
sunsetSvgElement.innerHTML = `<svg class="sun-svg" width="20" height="20" class="card__icon" viewBox="0 0 32 32" fill="#FF6B09">${sunsetSvg}</svg>`;
const sunriseSvgElement = document.createElement('div');
sunriseSvgElement.innerHTML = `<svg class="sun-svg" width="20" height="20" viewBox="0 0 32 32" fill="#FF6B09">${sunriseSvg}</svg>`;
if (dom.sunDetails) {
  dom.sunDetails.prepend(sunriseSvgElement);
}
if (dom.sunLine) {
  dom.sunLine.prepend(sunsetSvgElement);
}

const weatherData = {
  city: 'Bucharest',
  country: '',
  currentTemp: '',
  todayMax: '',
  todayMin: '',
  sunRise: '',
  sunSunset: '',
  currentDay: '',
  currentMonth: '',
  currentDayNumber: '',
  icon: '',
  timezone: '',
};

formatDate(weatherData);

// Clock logic now handled in clock.js

// Get user location (async/await)
// Replaced by resolveCityFromGeolocation()

// Fetch current weather data for a city
// Superseded by fetchCurrentWeather(city)

// Superseded by safeFetchCity(city)

// Day content now generated inside renderer when needed

// Render data into the DOM
// mapIconCode moved to shared ./icons/mapIconCode.js

function render() {
  const code = weatherData.icon;
  if (code) {
    const key = mapIconCode(code);
    // async resolution; we don't await; updates UI when ready
    getIcon(key)
      .then(svg => {
        if (!svg) return;
        dom.weatherType.innerHTML = `<svg width="35" height="35" viewBox="0 0 32 32">${svg}</svg>`;
      })
      .catch(() => {
        // silent fail
      });
  }
  renderCurrentWeather(weatherData, dom);
}

async function initialLoad() {
  try {
    weatherData.city = await resolveCityFromGeolocation();
  } catch {
    // Keep default city
  }
  try {
    const data = await fetchCurrentWeather(weatherData.city);
    Object.assign(weatherData, data);
    // Defer non-critical UI tasks to keep first paint responsive
    scheduleFrame(() => {
      startBaseClock();
      startCityClock(weatherData);
    });
    scheduleIdle(() => {
      if (dom.searchInput && weatherData.city) {
        dom.searchInput.value = weatherData.city;
      }
      applyCityBackground(weatherData.city);
      render();
    });
    emit('weather:location-refresh', { city: weatherData.city });
  } catch (_err) {
    notifyError({ type: 'network', message: 'Failed to load current weather' });
  }
}

// Replaced by searchForm module logic

initialLoad();

// Initialize search handling
initSearch(
  weatherData,
  { searchForm: dom.searchForm, searchInput: dom.searchInput },
  render
);

// Debounced live search: when user types a city name, auto-trigger fetch after pause
// Debounce now handled inside search module

// Handle click on new location button (id="locate-me") to force current location refresh with loading state
// TODO: Move locate-me button logic to its own module if retained

const locateBtn = document.getElementById('locate-me');
if (locateBtn) {
  locateBtn.addEventListener('click', async () => {
    if (locateBtn.dataset.loading === '1') return;
    locateBtn.dataset.loading = '1';
    locateBtn.classList.add('is-detecting');
    try {
      const detectedCity = await resolveCityFromGeolocation();
      // Always reflect detected city into the search input, even if it's the same
      if (dom.searchInput && detectedCity) {
        dom.searchInput.value = detectedCity;
      }
      const current = (weatherData.city || '').trim().toLowerCase();
      const detected = (detectedCity || '').trim().toLowerCase();
      if (detectedCity && detected !== current) {
        weatherData.city = detectedCity;
      } else if (detected && detected === current) {
        // Same city; show info and skip heavy work
        notifyInfo(MSG_ALREADY_CURRENT_LOCATION);
        return;
      }
      const data = await fetchCurrentWeather(weatherData.city);
      Object.assign(weatherData, data);
      await applyCityBackground(weatherData.city);
      render();
      restartCityClock(weatherData);
      emit('weather:location-refresh', {
        city: weatherData.city,
        forced: true,
      });
      notifyInfo(`Location updated: ${weatherData.city}`);
    } catch (err) {
      notifyError(err);
    } finally {
      delete locateBtn.dataset.loading;
      locateBtn.classList.remove('is-detecting');
    }
  });
}

// submitForm now handled by search module

// Background handled in backgroundImage module

// Removed (moved to backgroundImage)

// handleError removed (unused)

// BACKWARD COMPATIBILITY: submitForm kept for modules still importing it (e.g., favorites)
// It triggers the form submission programmatically using current input value.
export function submitForm() {
  if (!dom.searchForm || !dom.searchInput) return;
  const value = dom.searchInput.value.trim();
  if (!value) {
    notifyInfo(MSG_ENTER_CITY);
    return;
  }
  // Simulate the logic used in initSearch submit listener
  return (async () => {
    try {
      weatherData.city = value;
      const data = await safeFetchCity(weatherData.city);
      Object.assign(weatherData, data);
      await applyCityBackground(weatherData.city);
      render();
      restartCityClock(weatherData);
      // Notify other modules (e.g., five-days) to refresh for this city
      emit('weather:location-refresh', { city: weatherData.city });
    } catch (err) {
      notifyError(err);
      throw err;
    }
  })();
}
