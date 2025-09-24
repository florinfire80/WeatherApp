'use strict';

// Fetch a random travel-themed image from Pixabay and set it as the app background.
import { URL, KEY } from '../config';

async function initBackground() {
  const params = `?image_type=photo&category=travel&orientation=horizontal&q=bucharest&page=1&per_page=40`;
  const bg = document.querySelector('.backgroundImage');
  try {
    const res = await fetch(URL + params + KEY);
    if (!res.ok) throw new Error('Failed to fetch background image');
    const data = await res.json();
    if (!data || !Array.isArray(data.hits) || !data.hits.length) {
      throw new Error('No images returned');
    }
    const randomImg = Math.floor(Math.random() * data.hits.length);
    const img = data.hits[randomImg].largeImageURL;
    if (bg) bg.style.backgroundImage = `url(${img})`;
  } catch (err) {
    console.error('Background image load failed:', err);
  }
}

// Run after DOM is ready so the background element exists
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackground);
} else {
  initBackground();
}
