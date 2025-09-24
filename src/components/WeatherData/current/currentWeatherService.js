'use strict';

// Data-only utilities for current weather fetching
import { MSG_CITY_NOT_FOUND } from '../../../constants/messages.js';
import {
  baseUrlForTodayWeather,
  makeUrlForDetectedCityFromCurrentCoord,
} from '../../config';
import { decodeTime } from '../utilsForCurrentDay';
import { notifyError } from '../weatherService';

export async function resolveCityFromGeolocation() {
  if (!('geolocation' in navigator)) throw new Error('Geolocation unsupported');
  const position = await new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  );
  const { latitude, longitude } = position.coords;
  const url = makeUrlForDetectedCityFromCurrentCoord(latitude, longitude);
  const r = await fetch(url);
  if (!r.ok) throw new Error('Reverse geocoding failed');
  const data = await r.json();
  if (Array.isArray(data) && data[0] && data[0].name) return data[0].name;
  throw new Error('Unable to resolve city name');
}

export async function fetchCurrentWeather(city) {
  const r = await fetch(baseUrlForTodayWeather + city);
  if (!r.ok) throw new Error('City not found');
  const data = await r.json();
  return {
    currentTemp: Math.round(data.main.temp) + '°',
    todayMax: Math.round(data.main.temp_max) + '°',
    todayMin: Math.round(data.main.temp_min) + '°',
    sunRise: decodeTime(data.sys.sunrise),
    sunSunset: decodeTime(data.sys.sunset),
    icon: data.weather[0].icon,
    country: data.sys.country,
    timezone: data.timezone,
  };
}

// Wrapper that optionally suppresses user-facing error notifications (useful for debounced live typing)
export async function safeFetchCity(city, { notify = true } = {}) {
  try {
    return await fetchCurrentWeather(city);
  } catch (e) {
    if (notify) {
      notifyError({ type: 'notfound', message: MSG_CITY_NOT_FOUND });
    }
    throw e;
  }
}
