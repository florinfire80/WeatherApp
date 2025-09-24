'use strict';

// Lightweight preloader overlay controller.
const loader = document.querySelector('.preloader');
const backgroundImage = document.querySelector('.backgroundImage');

function showLoader() {
  loader.classList.replace('is-hidden', 'preloader');
  if (backgroundImage) backgroundImage.classList.add('is-hidden');
}

function hideLoader() {
  loader.classList.replace('preloader', 'is-hidden');
  if (backgroundImage) backgroundImage.classList.remove('is-hidden');
}

export { showLoader, hideLoader };
