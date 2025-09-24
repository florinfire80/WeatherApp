'use strict';

// Orchestrator for five-days forecast UI
import { MSG_ENTER_CITY } from '../../../constants/messages.js';
import { on } from '../../../events/eventBus.js';
import { notifyInfo, notifyError } from '../weatherService.js';

import { renderDays } from './renderDays';
import { renderMoreInfo } from './renderMoreInfo';
import { loadCurrentLocation, loadCity } from './service';
import {
  fiveDaysState,
  setForecast,
  setSelectedDay,
  setActiveCity,
} from './state';

export function initFiveDays() {
  const refs = {
    moreInfoCards: document.querySelector('.more-info-container'),
    cardsList: document.querySelector('.days-cards'),
    sectionTitle: document.querySelector('.five-days-section__title'),
    moreInfoContainer: document.querySelector('.more-info-container'),
    fiveDaysSectionContainer: document.querySelector('.five-days-section'),
    searchForm: document.querySelector('#search-form'),
    searchInput: document.querySelector('#search-input'),
    fiveDaysButton:
      document.getElementById('five-days-button') ||
      document.getElementById('5-days-button'),
  };

  if (!refs.cardsList || !refs.searchForm || !refs.searchInput) return;
  if (refs.sectionTitle) refs.sectionTitle.textContent = ' ';

  async function loadInitial() {
    try {
      // Do not auto-use typed input; only load current location by default
      const f = await loadCurrentLocation();
      setForecast(f);
      await renderDays(fiveDaysState.lastForecast, refs.cardsList);
    } catch (_e) {
      notifyError(_e);
    }
  }

  loadInitial();

  // When today page updates to detected location, prefer the provided city name
  // to fetch five-days forecast to avoid falling back to the default config city.
  on('weather:location-refresh', async payload => {
    try {
      const city = payload && payload.city ? String(payload.city).trim() : '';
      const f = city ? await loadCity(city) : await loadCurrentLocation();
      setForecast(f);
      if (city) setActiveCity(city);
      if (refs.sectionTitle && city) refs.sectionTitle.textContent = city;
      await renderDays(fiveDaysState.lastForecast, refs.cardsList);
    } catch (_e) {
      notifyError(_e);
    }
  });

  // Make the entire card clickable, not only the inner button
  refs.cardsList.addEventListener('click', async e => {
    const selectedCard = e.target.closest('.card');
    if (!selectedCard) return;
    const clickedDay =
      selectedCard.dataset.day ||
      selectedCard.querySelector('.card__button')?.value ||
      '';
    const isCardSelected = selectedCard.classList.contains('selected');

    refs.cardsList
      .querySelectorAll('.card.selected')
      .forEach(card => card.classList.remove('selected'));

    if (!isCardSelected || fiveDaysState.selectedDay !== clickedDay) {
      selectedCard.classList.add('selected');
      setSelectedDay(clickedDay);
      refs.moreInfoCards?.classList.remove('hidden');
      if (refs.fiveDaysSectionContainer)
        refs.fiveDaysSectionContainer.style.marginBottom = '400px';
      // Enable page scroll only when extra content is visible
      document.body.classList.add('content-expanded');
      await renderMoreInfo(refs.moreInfoContainer);
    } else {
      setSelectedDay(null);
      refs.moreInfoCards?.classList.add('hidden');
      if (refs.fiveDaysSectionContainer)
        refs.fiveDaysSectionContainer.style.marginBottom = '0px';
      // Only remove scroll expansion if chart is not expanded
      const chartExpanded =
        (typeof localStorage !== 'undefined' &&
          localStorage.getItem('chartExpanded') === 'true') ||
        (() => {
          const canvas = document.getElementById('myChart');
          return !!(canvas && canvas.style.display !== 'none');
        })();
      if (!chartExpanded) {
        document.body.classList.remove('content-expanded');
      }
    }
  });

  refs.searchForm.addEventListener('submit', async e => {
    e.preventDefault();
    const value = refs.searchInput.value.trim();
    if (!value) {
      notifyInfo(MSG_ENTER_CITY);
      return;
    }
    try {
      const f = await loadCity(value);
      setForecast(f);
      setActiveCity(value);
      if (refs.sectionTitle) refs.sectionTitle.textContent = value;
      await renderDays(fiveDaysState.lastForecast, refs.cardsList);
    } catch (_err) {
      // notifyError already called in service
    }
  });

  if (refs.fiveDaysButton) {
    refs.fiveDaysButton.addEventListener('click', async () => {
      try {
        // Prefer latest active city if present; else current location
        if (fiveDaysState.activeCity) {
          const f = await loadCity(fiveDaysState.activeCity);
          setForecast(f);
          if (refs.sectionTitle) {
            refs.sectionTitle.textContent = fiveDaysState.activeCity;
          }
        } else {
          const f = await loadCurrentLocation();
          setForecast(f);
        }
        await renderDays(fiveDaysState.lastForecast, refs.cardsList);
      } catch (_e) {
        // errors handled already
      }
    });
  }
}
