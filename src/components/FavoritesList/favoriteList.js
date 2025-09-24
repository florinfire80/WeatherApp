'use strict';

import {
  MSG_TYPE_CITY_FIRST,
  MSG_CITY_ALREADY_FAVORITE,
} from '../../constants/messages.js';
import { submitForm } from '../WeatherData/currentDayData';
import { notifyInfo, notifyError } from '../WeatherData/weatherService.js';

let favoriteCity,
  searchCity,
  favoritesList,
  nextButton,
  prevButton,
  savedCities;

// Initialize once DOM is ready; if already ready (e.g., in tests), run immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeFavorites();
  });
} else {
  initializeFavorites();
}

// variables declared above

function initializeFavorites() {
  favoriteCity = document.querySelector('.search-form__favorite');
  searchCity = document.querySelector('#search-input');
  favoritesList = document.querySelector('.favorites-list');
  nextButton = document.querySelector('.favorite-next');
  prevButton = document.querySelector('.favorite-prev');
  savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];
  if (!favoritesList) {
    console.warn('[favorites] .favorites-list element not found – abort init');
    return;
  }

  loadFromLocalStorage();

  // Add the current search input as a favorite city when star button is clicked.
  if (favoriteCity) {
    favoriteCity.addEventListener('click', addFavoritesListItems);
  } else {
    console.warn('[favorites] favorite button not found');
  }

  if (nextButton) {
    nextButton.addEventListener('click', onClickNextBtn);
  }
  if (prevButton) {
    prevButton.addEventListener('click', onClickPrevBtn);
  }

  // Attach delegated click & scroll listeners now that favoritesList exists
  favoritesList.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    if (
      target.tagName === 'BUTTON' &&
      target.classList.contains('favorites-list__item-close')
    ) {
      const listItemEl = target.parentElement;
      const listItem = listItemEl.querySelector(
        '.favorites-list__item-link'
      ).textContent;
      listItemEl.remove();
      removeFromLocalStorage(listItem);
      return;
    }
    if (
      target.tagName === 'P' &&
      target.classList.contains('favorites-list__item-link')
    ) {
      if (searchCity) searchCity.value = target.textContent;
      try {
        const maybePromise = submitForm();
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.catch(err => {
            console.error('submitForm failed', err);
            notifyError(err);
          });
        }
      } catch (err) {
        console.error('submitForm threw synchronously', err);
        notifyError(err);
      }
    }
  });

  favoritesList.addEventListener('scroll', checkButtons);
  // Initial button state update
  checkButtons();
}

function addFavoritesListItems() {
  if (!searchCity) return;
  let searchCityName = (searchCity.value || '').trim();
  if (!searchCityName) {
    notifyInfo(MSG_TYPE_CITY_FIRST);
    searchCity.focus();
    return;
  }
  // Re-sync in-memory list from storage to avoid divergence
  const stored = JSON.parse(localStorage.getItem('savedCities')) || [];
  savedCities = stored;
  // Prevent case-insensitive duplicates
  const exists = savedCities.some(
    c => (c || '').toLowerCase() === searchCityName.toLowerCase()
  );
  if (exists) {
    notifyInfo(MSG_CITY_ALREADY_FAVORITE);
    return;
  }
  savedCities.push(searchCityName);
  localStorage.setItem('savedCities', JSON.stringify(savedCities));
  loadFromLocalStorage();
}

function onClickNextBtn(_event) {
  favoritesList.scrollLeft += favoritesList.clientWidth * 0.2;
}

function onClickPrevBtn(_event) {
  favoritesList.scrollLeft -= favoritesList.clientWidth * 0.2;
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('savedCities');
  const parsedData = JSON.parse(data);
  if (parsedData) {
    const markup = parsedData
      .map(item => {
        return `<li class="favorites-list__item close"><p class="favorites-list__item-link">${item}</p><button class="favorites-list__item-close" type="button"></button></li>`;
      })
      .join('');
    favoritesList.innerHTML = markup;
    checkButtons();
  }
}

function removeFromLocalStorage(listItem) {
  const data = localStorage.getItem('savedCities');
  const parsedData = JSON.parse(data) || [];
  const filtered = parsedData.filter(
    c => (c || '').toLowerCase() !== (listItem || '').toLowerCase()
  );
  savedCities = filtered; // keep in-memory in sync
  localStorage.setItem('savedCities', JSON.stringify(filtered));
  loadFromLocalStorage(); // re-render and update buttons
}

function checkButtons() {
  if (!favoritesList || !nextButton || !prevButton) return;
  const containerWidth = favoritesList.clientWidth;
  const contentWidth = favoritesList.scrollWidth;
  const scrollLeft = favoritesList.scrollLeft;

  const canScrollRight = scrollLeft < contentWidth - containerWidth - 1; // allow minor rounding
  const canScrollLeft = scrollLeft > 0;

  // Always visible; toggle disabled state
  if (canScrollLeft) {
    prevButton.classList.remove('is-disabled');
  } else {
    prevButton.classList.add('is-disabled');
  }

  if (canScrollRight) {
    nextButton.classList.remove('is-disabled');
  } else {
    nextButton.classList.add('is-disabled');
  }
}
