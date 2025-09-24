'use strict';

// Icon registry - static async-like interface (no legacy fallback needed now that real SVGs migrated)
// Static imports to avoid GitHub Pages 404 -> text/html MIME errors on code-split chunks.
import { sunriseSvg, sunsetSvg, sunSvg } from './astroIcons.js';
import {
  cloudsAndSunSvg,
  cloudySvg,
  barometerSvg,
  humiditySvg,
  windSvg,
} from './atmosphereIcons.js';
import {
  rain,
  rainNight,
  thunderStorm,
  snowSvg as snowDyn,
} from './precipitationIcons.js';

const loaders = {
  sunrise: () => Promise.resolve(sunriseSvg),
  sunset: () => Promise.resolve(sunsetSvg),
  sun: () => Promise.resolve(sunSvg),
  rain: () => Promise.resolve(rain),
  rainNight: () => Promise.resolve(rainNight),
  thunder: () => Promise.resolve(thunderStorm),
  snow: () => Promise.resolve(snowDyn),
  cloudsSun: () => Promise.resolve(cloudsAndSunSvg),
  cloudy: () => Promise.resolve(cloudySvg),
  barometer: () => Promise.resolve(barometerSvg),
  humidity: () => Promise.resolve(humiditySvg),
  wind: () => Promise.resolve(windSvg),
};

export async function getIcon(name) {
  const loader = loaders[name];
  if (!loader) throw new Error('Unknown icon: ' + name);
  try {
    const svg = await loader();
    return svg;
  } catch (_e) {
    return '';
  }
}

export function hasIcon(name) {
  return Boolean(loaders[name]);
}
