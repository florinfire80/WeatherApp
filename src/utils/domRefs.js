// Lazy DOM reference accessor to prevent repeated querySelector calls
import { SEL } from '../constants/selectors.js';

const cache = {};

function get(sel) {
  if (!cache[sel]) {
    try {
      cache[sel] = document.querySelector(sel);
      // Legacy fallback for renamed id (#5-days-button -> #five-days-button)
      if (!cache[sel] && sel === '#five-days-button') {
        cache[sel] = document.getElementById('5-days-button');
      }
    } catch (_e) {
      // Defensive: invalid selector (should not occur now). Return null instead of throwing.
      cache[sel] = null;
    }
  }
  return cache[sel];
}

export const $ = {
  tabsContainer: () => get(SEL.tabsContainer),
  tabToday: () => get(SEL.tabToday),
  tabFiveDays: () => get(SEL.tabFiveDays),
  panelTodayWeather: () => get(SEL.panelTodayWeather),
  panelTodayMeta: () => get(SEL.panelTodayMeta),
  panelFiveDays: () => get(SEL.panelFiveDays),
};
