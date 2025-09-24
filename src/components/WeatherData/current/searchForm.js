'use strict';

// Search behavior: update weather only on explicit form submit (Enter)
import { MSG_ENTER_CITY } from '../../../constants/messages.js';
import { notifyInfo, notifyError } from '../weatherService';

import { applyCityBackground } from './backgroundImage';
import { restartCityClock } from './clock';
import { safeFetchCity } from './currentWeatherService';

export function initSearch(weatherData, dom, render) {
  if (!dom.searchForm || !dom.searchInput) return;

  dom.searchForm.addEventListener('submit', async e => {
    e.preventDefault();
    const value = dom.searchInput.value.trim();
    if (!value) {
      notifyInfo(MSG_ENTER_CITY);
      return;
    }
    try {
      weatherData.city = value;
      const data = await safeFetchCity(weatherData.city);
      Object.assign(weatherData, data);
      await applyCityBackground(weatherData.city);
      render();
      restartCityClock(weatherData);
    } catch (_err) {
      notifyError(_err);
    }
  });
}
