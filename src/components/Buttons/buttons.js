// Simple tab navigation between Today and 5 Days views.
// Responsibilities: wire tab buttons, toggle panels.
// Panels are shown/hidden via 'hidden' class. Some layout tweaks remain inline for simplicity.

'use strict';

import { $ } from '../../utils/domRefs.js';

function setActive(view) {
  const todayBtn = $.tabToday();
  const fiveBtn = $.tabFiveDays();
  const todayPanel = $.panelTodayWeather();
  const todayMeta = $.panelTodayMeta();
  const fivePanel = $.panelFiveDays();
  const container = $.tabsContainer();

  const isToday = view === 'today';

  // Button visual state
  todayBtn.classList.toggle('buttons__active', isToday);
  fiveBtn.classList.toggle('buttons__active', !isToday);

  // We keep it simple without ARIA roles in this project.

  // Panels
  todayPanel.classList.toggle('hidden', !isToday);
  todayMeta.classList.toggle('hidden', !isToday);
  fivePanel.classList.toggle('hidden', isToday);

  // Quick layout tweak (could be moved to a CSS data attribute)
  if (container) {
    container.style.marginTop = isToday ? '0px' : '50px';
  }

  // Update a body class to manage page scroll when panels expand
  const body = document.body;
  body.classList.toggle('view-today', isToday);
  body.classList.toggle('view-five', !isToday);
  if (isToday) {
    // Only collapse scroll if neither more-info nor chart are active
    const moreInfo = document.querySelector('.more-info-container');
    const moreInfoVisible = moreInfo && !moreInfo.classList.contains('hidden');
    const chartExpanded =
      (typeof localStorage !== 'undefined' &&
        localStorage.getItem('chartExpanded') === 'true') ||
      (() => {
        const canvas = document.getElementById('myChart');
        return !!(canvas && canvas.style.display !== 'none');
      })();
    if (!moreInfoVisible && !chartExpanded) {
      body.classList.remove('content-expanded');
    }
  }
}

function handleClick(e) {
  const id = e.currentTarget.id;
  if (id === 'today-button') setActive('today');
  else setActive('five');
}

// Keyboard navigation removed with ARIA simplification

function initTabs() {
  const container = $.tabsContainer();
  if (!container) return;
  // role=tablist removed
  const todayBtn = $.tabToday();
  const fiveBtn = $.tabFiveDays();
  if (!todayBtn || !fiveBtn) return;
  todayBtn.addEventListener('click', handleClick);
  fiveBtn.addEventListener('click', handleClick);
  // keyboard handlers removed
  // Initial state: today
  setActive('today');
}

// Delay init until DOM ready if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTabs);
} else {
  initTabs();
}

export { initTabs, setActive };
