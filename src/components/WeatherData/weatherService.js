'use strict';

// Centralized weather service layer
// Responsibility: coordinate all weather-related API calls, normalization, caching, error handling.

import { Notify } from 'notiflix';

import {
  urlForFiveDaysWeather,
  urlForCoordinates,
  urlForCoordinatesForSearchedCity,
} from '../config.js';

// Simple in-memory cache (resets on reload)
const memoryCache = new Map(); // key -> { fetchedAt, ttlMs, data }

// LocalStorage namespace
const LS_PREFIX = 'weatherCache:';
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

function now() {
  return Date.now();
}

function buildKey(type, value) {
  return `${type}:${value.toLowerCase()}`;
}

function readPersisted(key) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (now() - parsed.fetchedAt > parsed.ttlMs) return null; // expired
    return parsed;
  } catch (_e) {
    return null;
  }
}

function writePersisted(key, payload) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(payload));
  } catch (_e) {
    // ignore quota errors silently
  }
}

function getFromCache(key) {
  // Memory first
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (now() - entry.fetchedAt < entry.ttlMs)
      return { ...entry, source: 'memory' };
  }
  // LocalStorage fallback
  const persisted = readPersisted(key);
  if (persisted) {
    // hydrate memory
    memoryCache.set(key, persisted);
    return { ...persisted, source: 'storage' };
  }
  return null;
}

function saveToCache(key, data, ttlMs) {
  const entry = { fetchedAt: now(), ttlMs, data };
  memoryCache.set(key, entry);
  writePersisted(key, entry);
  return { ...entry, source: 'network' };
}

async function safeFetchJson(url, { label = 'request' } = {}) {
  let res;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    throw { type: 'network', label, message: networkErr.message };
  }
  if (!res.ok) {
    let body = null;
    try {
      body = await res.text();
    } catch (_e) {
      // Ignore body read error; we'll still throw HTTP error with status.
    }
    throw { type: 'http', status: res.status, label, body };
  }
  try {
    return await res.json();
  } catch (parseErr) {
    throw { type: 'parse', label, message: parseErr.message };
  }
}

// --- Normalization helpers ---
function normalizeDaily(list) {
  const map = new Map();
  list.forEach(item => {
    const { dt_txt, main, weather } = item;
    const date = dt_txt.split(' ')[0];
    const existing = map.get(date) || {
      date,
      dayLabel: new Date(dt_txt).toLocaleDateString(undefined, {
        weekday: 'short',
      }),
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      icon: weather?.[0]?.icon || '01d',
      periods: [],
    };
    existing.min = Math.min(existing.min, main.temp_min, main.temp);
    existing.max = Math.max(existing.max, main.temp_max, main.temp);
    existing.icon = existing.icon || weather?.[0]?.icon;
    existing.periods.push({
      time: dt_txt.slice(11, 16),
      temp: Math.round(main.temp),
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      wind: item.wind?.speed,
      weather: weather?.[0]?.main,
      icon: weather?.[0]?.icon,
    });
    map.set(date, existing);
  });
  return Array.from(map.values()).map(d => ({
    ...d,
    min: Math.round(d.min),
    max: Math.round(d.max),
  }));
}

// --- Public API ---
export async function getForecastByCoords(
  { lat, lon },
  { ttlMs = DEFAULT_TTL } = {}
) {
  const key = buildKey('coords', `${lat},${lon}`);
  const cached = getFromCache(key);
  if (cached) return cached;
  const json = await safeFetchJson(urlForFiveDaysWeather(lat, lon), {
    label: 'forecast',
  });
  const normalized = { raw: json, days: normalizeDaily(json.list) };
  return saveToCache(key, normalized, ttlMs);
}

export async function getForecastByCity(city, { ttlMs = DEFAULT_TTL } = {}) {
  const key = buildKey('city', city);
  const cached = getFromCache(key);
  if (cached) return cached;
  // first get coordinates for city
  const coordsData = await safeFetchJson(
    urlForCoordinatesForSearchedCity(city),
    { label: 'coords:city' }
  );
  if (!Array.isArray(coordsData) || !coordsData.length) {
    throw { type: 'notfound', message: 'City not found' };
  }
  const { lat, lon } = coordsData[0];
  return getForecastByCoords({ lat, lon }, { ttlMs });
}

export async function getCurrentLocationForecast({ ttlMs = DEFAULT_TTL } = {}) {
  const coordsData = await safeFetchJson(urlForCoordinates(), {
    label: 'coords:current',
  });
  if (!Array.isArray(coordsData) || !coordsData.length) {
    throw { type: 'coords', message: 'Unable to get current coordinates' };
  }
  const { lat, lon } = coordsData[0];
  return getForecastByCoords({ lat, lon }, { ttlMs });
}

export function formatServiceError(err) {
  if (!err || typeof err !== 'object') return 'Unknown error';
  if (err.type === 'network') return 'Network error – check your connection';
  if (err.type === 'http') return `Request failed (${err.status})`;
  if (err.type === 'parse') return 'Data format error';
  if (err.type === 'notfound') return 'City not found';
  return err.message || 'Unexpected error';
}

export function notifyError(err) {
  const msg = formatServiceError(err);
  Notify.failure(msg, { position: 'center-center' });
}

export function notifyInfo(msg) {
  Notify.info(msg, { position: 'center-center' });
}

// (Optional) expose raw cache for debugging
export function _debugCache() {
  return { memory: Array.from(memoryCache.keys()) };
}

// Attach debug helper & clear function to window (for manual console testing)
if (typeof window !== 'undefined') {
  // Marker so we can confirm load in console quickly
  // Removed noisy load marker for production cleanliness
  if (!window.__WEATHER_SERVICE_LOADED__) {
    window.__WEATHER_SERVICE_LOADED__ = true;
  }
  // Provide both names for convenience
  window._weatherDebugCache = _debugCache;
  window._debugCache = _debugCache; // alias (user previously tried this name)
  window.clearWeatherCache = function () {
    // Clear memory map
    memoryCache.clear();
    // Remove LS entries
    Object.keys(localStorage)
      .filter(k => k.startsWith(LS_PREFIX))
      .forEach(k => localStorage.removeItem(k));
    return 'Weather cache cleared';
  };
}
