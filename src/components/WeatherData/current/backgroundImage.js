'use strict';

// Handles background image fetching & selection
import { URL, KEY } from '../../config';
import { showLoader, hideLoader } from '../../Loader/loader';

async function fetchImages(params) {
  const res = await fetch(URL + params + KEY);
  if (!res.ok) throw new Error('Image fetch failed');
  const data = await res.json();
  return data.hits || [];
}

export async function applyCityBackground(cityName) {
  const bg = document.querySelector('.backgroundImage');
  if (!bg) return;
  const primary = `?image_type=photo&category=travel&orientation=horizontal&q=${cityName}&page=1&per_page=10`;
  const fallback = `?image_type=photo&category=buildings&orientation=horizontal&q=&page=1&per_page=10`;
  showLoader();
  try {
    let images = await fetchImages(primary);
    if (!images.length) images = await fetchImages(fallback);
    if (images.length) {
      const idx = Math.floor(Math.random() * images.length);
      const url = images[idx].largeImageURL;
      bg.style.backgroundImage = `url(${url})`;
    }
  } catch (e) {
    console.error('Background load failed', e);
  } finally {
    setTimeout(() => hideLoader(), 500);
  }
}
