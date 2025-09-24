'use strict';

// Service layer for five-days forecast (wraps existing weatherService exports)
import {
  getCurrentLocationForecast,
  getForecastByCity,
  notifyError,
} from '../weatherService.js';

export async function loadCurrentLocation() {
  try {
    return await getCurrentLocationForecast();
  } catch (e) {
    notifyError(e);
    throw e;
  }
}

export async function loadCity(city) {
  try {
    return await getForecastByCity(city);
  } catch (e) {
    notifyError(e);
    throw e;
  }
}
