'use strict';

// Centralized configuration using environment variables (injected by build tool)
// NOTE: For Parcel v2, environment vars must be prefixed with PARCEL_ (user will define PARCEL_OPENWEATHER_API_KEY / PARCEL_PIXABAY_API_KEY)

function sanitize(raw) {
  if (!raw) return '';
  // Remove wrapping quotes and stray semicolons/spaces
  return raw.trim().replace(/^['"`]+|['"`;]+$/g, '');
}

const isTest =
  typeof process !== 'undefined' &&
  process.env &&
  process.env.JEST_WORKER_ID !== undefined;
const RAW_OPENWEATHER_KEY = sanitize(
  process.env.PARCEL_OPENWEATHER_API_KEY || (isTest ? 'TEST_KEY' : '')
);
const RAW_PIXABAY_KEY = sanitize(process.env.PARCEL_PIXABAY_API_KEY);

if (!RAW_OPENWEATHER_KEY) {
  console.warn(
    '[config] Missing PARCEL_OPENWEATHER_API_KEY – API calls will fail'
  );
}
if (!RAW_PIXABAY_KEY) {
  console.warn(
    '[config] Missing PARCEL_PIXABAY_API_KEY – background images may fail'
  );
}

// pixabay.com/api config
export const URL = 'https://pixabay.com/api/';
// Accept either raw key or a user mistakenly pasting with &key= prefix
const cleanedPixabay = RAW_PIXABAY_KEY.replace(/^&?key=/i, '');
export const KEY = cleanedPixabay ? `&key=${cleanedPixabay}` : '';

// openweathermap.org/api config
export const API_KEY = RAW_OPENWEATHER_KEY;
export const city = 'Bucharest';

function requireKey() {
  // During tests, avoid throwing to keep unit tests isolated from env config
  if (!API_KEY && !isTest) {
    throw new Error('OpenWeather API key not configured');
  }
}

export const weatherEndpoint = (() => {
  requireKey();
  return `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
})();

export const baseUrlForTodayWeather = (() => {
  requireKey();
  return `https://api.openweathermap.org/data/2.5/weather?APPID=${API_KEY}&units=metric&lang=en&q=`;
})();

export const makeUrlForDetectedCityFromCurrentCoord = (latitude, longitude) => {
  requireKey();
  return `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
};

export const urlForFiveDaysWeather = (lat, lon) => {
  requireKey();
  return `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`;
};

export const urlForCoordinates = () => {
  requireKey();
  return `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${API_KEY}`;
};

export const urlForCoordinatesForSearchedCity = cityName => {
  requireKey();
  return `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${API_KEY}`;
};
