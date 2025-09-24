'use strict';

// Chart rendering (lazy loads Chart.js). Caches API data for 10 minutes.
import axios from 'axios';

import { weatherEndpoint } from '../config.js';
// Chart.js will be dynamically imported on first use for smaller initial bundle
let ChartModule = null;
async function loadChartLib() {
  if (ChartModule) return ChartModule;
  const mod = await import('chart.js/auto');
  ChartModule = mod.default || mod;
  return ChartModule;
}

function generateLabels(dataList) {
  return dataList.slice(0, 5).map(item => {
    const date = new Date(item.dt * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${day}/${month}/${year} ${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}`;
  });
}

// Caching layer for datasets (10 minutes TTL)
const DATA_TTL_MS = 10 * 60 * 1000;
let cachedDatasets = null;
let cachedAt = 0;

// Single fetch that returns all needed datasets with caching
async function fetchChartDatasets(force = false) {
  const now = Date.now();
  const fresh = now - cachedAt < DATA_TTL_MS;
  if (!force && cachedDatasets && fresh) {
    return cachedDatasets;
  }
  try {
    const response = await axios.get(weatherEndpoint);
    const list = response.data.list.slice(0, 5);
    const labels = generateLabels(list);
    cachedDatasets = {
      temperature: list.map(item => item.main.temp),
      humidity: list.map(item => item.main.humidity),
      wind: list.map(item => item.wind.speed),
      pressure: list.map(item => item.main.pressure),
      labels,
    };
    cachedAt = now;
    return cachedDatasets;
  } catch (err) {
    console.error('fetchChartDatasets failed:', err);
    return null;
  }
}

// Helper function for responsive font size
function chartFont() {
  if (window.innerWidth < 480) {
    return 12;
  } else {
    return 18;
  }
}

// Create the multi-axis chart and attach resize behavior.
async function generateWeatherChart(force = false) {
  if (myChart) return myChart; // already created
  try {
    const datasets = await fetchChartDatasets(force);
    if (!datasets) throw new Error('Datasets unavailable');
    const canvasEl = document.getElementById('myChart');
    if (!canvasEl) throw new Error('#myChart canvas not found');
    const ctx = canvasEl.getContext('2d');
    const Chart = await loadChartLib();
    myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datasets.labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: datasets.temperature,
            borderColor: 'rgb(255, 107, 9)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y',
          },
          {
            label: 'Humidity (%)',
            data: datasets.humidity,
            borderColor: 'rgb(9, 6, 235)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y',
          },
          {
            label: 'Wind Speed (m/s)',
            data: datasets.wind,
            borderColor: 'rgb(234, 154, 5)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y',
          },
          {
            label: 'Atmosphere pressure (hPa)',
            data: datasets.pressure,
            borderColor: 'rgb(6, 120, 6)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { color: 'rgb(100, 100, 100)' },
            ticks: { color: 'rgb(100, 100, 100)', font: { size: chartFont() } },
            title: {
              display: true,
              text: 'Date[dd/mm/yyyy - hour/minutes]',
              color: 'rgb(100, 100, 100)',
              font: { size: chartFont() },
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: { color: 'rgb(100, 100, 100)' },
            ticks: { color: 'rgb(100, 100, 100)', font: { size: chartFont() } },
            title: {
              display: true,
              text: 'Temperature (°C) / Humidity (%) / Wind (m/s)',
              color: 'rgb(100, 100, 100)',
              font: { size: chartFont() },
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: 'rgb(6, 120, 6)', font: { size: chartFont() } },
            title: {
              display: true,
              text: 'Atmospheric Pressure (hPa)',
              color: 'rgb(6, 120, 6)',
              font: { size: chartFont() },
            },
          },
        },
      },
    });
    setupChartResizeHandler();
    return myChart;
  } catch (err) {
    console.error('generateWeatherChart failed:', err);
    return null;
  }
}

// Initialize chart
let myChart = null;

// Add resize event listener only after chart is created
function setupChartResizeHandler() {
  window.addEventListener('resize', () => {
    if (myChart && myChart.options && myChart.options.scales) {
      const fontSize = chartFont();

      // Safely update x-axis font size if it exists
      if (myChart.options.scales.x && myChart.options.scales.x.ticks) {
        if (!myChart.options.scales.x.ticks.font) {
          myChart.options.scales.x.ticks.font = {};
        }
        myChart.options.scales.x.ticks.font.size = fontSize;
      }

      // Safely update y-axis font size if it exists
      if (myChart.options.scales.y && myChart.options.scales.y.ticks) {
        if (!myChart.options.scales.y.ticks.font) {
          myChart.options.scales.y.ticks.font = {};
        }
        myChart.options.scales.y.ticks.font.size = fontSize;
      }

      // Update y1 axis font size (for pressure)
      if (myChart.options.scales.y1 && myChart.options.scales.y1.ticks) {
        if (!myChart.options.scales.y1.ticks.font) {
          myChart.options.scales.y1.ticks.font = {};
        }
        myChart.options.scales.y1.ticks.font.size = fontSize;
      }

      myChart.update();
    }
  });
}

// Init: wire Show/Hide and Refresh buttons; persist state in localStorage
document.addEventListener('DOMContentLoaded', () => {
  const chartContainer = document.querySelector('.chart-container');
  const canvas = document.getElementById('myChart');
  const toggleBtn = document.getElementById('chartButton');
  const refreshBtn = document.getElementById('chartRefresh');
  const statusEl = document.getElementById('chartStatus');
  if (!chartContainer || !canvas) return;

  // Migration of old keys
  const legacyActivated = localStorage.getItem('chartContainerActivated');
  const legacyDeactivated = localStorage.getItem('chartContainerDeactivated');
  if (legacyActivated || legacyDeactivated) {
    // If it was previously activated => expanded true
    let expanded = legacyActivated === 'true';
    localStorage.setItem('chartExpanded', expanded ? 'true' : 'false');
    localStorage.removeItem('chartContainerActivated');
    localStorage.removeItem('chartContainerDeactivated');
  }

  const _initialExpanded = localStorage.getItem('chartExpanded') === 'true'; // retained for potential future logic (prefixed to avoid unused var warning)

  // applyState will be defined inside wireControls where we know we have a button

  // Determine active section: default landing is Today, so hide buttons initially
  const fiveDaysBtn =
    document.getElementById('five-days-button') ||
    document.getElementById('5-days-button');
  const todayBtn = document.getElementById('today-button');

  // If buttons not yet in DOM (because user still on Today), we delay wiring until 5-days button is clicked
  if (!toggleBtn) {
    // We will attach logic upon five-days navigation
    if (fiveDaysBtn) {
      fiveDaysBtn.addEventListener('click', () => {
        // Re-run initialization on next frame after DOM updates (if includes re-render)
        requestAnimationFrame(() => {
          const lateToggle = document.getElementById('chartButton');
          const lateRefresh = document.getElementById('chartRefresh');
          if (!lateToggle) return;
          wireControls(lateToggle, lateRefresh);
        });
      });
    }
    return; // Exit early until controls exist
  }

  // Normal flow (already in DOM because user maybe loaded on 5-days after interaction)
  wireControls(toggleBtn, refreshBtn);

  function wireControls(tBtn, rBtn) {
    let expandedState = false;
    function applyState(expanded) {
      expandedState = expanded;
      if (expanded) {
        canvas.style.display = 'block';
        tBtn.innerText = 'Hide Chart';
        document.body.classList.add('content-expanded');
      } else {
        canvas.style.display = 'none';
        tBtn.innerText = 'Show Chart';
        // If more-info is not visible, we can remove content-expanded
        const moreInfo = document.querySelector('.more-info-container');
        const moreInfoVisible =
          moreInfo && !moreInfo.classList.contains('hidden');
        if (!moreInfoVisible) {
          document.body.classList.remove('content-expanded');
        }
      }
      localStorage.setItem('chartExpanded', expanded ? 'true' : 'false');
    }

    // Always start collapsed until user clicks Show Chart
    applyState(false);

    function showStatus(msg) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.hidden = false;
    }

    function hideStatus() {
      if (!statusEl) return;
      statusEl.hidden = true;
    }

    async function ensureChart(expanded) {
      if (expanded) {
        showStatus('Loading chart data...');
        const chart = await generateWeatherChart();
        hideStatus();
        if (chart && rBtn) rBtn.hidden = false;
      }
    }

    tBtn.addEventListener('click', async e => {
      e.preventDefault();
      const next = !expandedState;
      applyState(next);
      if (next && !myChart) {
        await ensureChart(true);
      }
    });

    if (rBtn) {
      rBtn.addEventListener('click', async () => {
        if (!myChart) return;
        showStatus('Refreshing data...');
        const datasets = await fetchChartDatasets(true);
        if (datasets) {
          myChart.data.labels = datasets.labels;
          myChart.data.datasets[0].data = datasets.temperature;
          myChart.data.datasets[1].data = datasets.humidity;
          myChart.data.datasets[2].data = datasets.wind;
          myChart.data.datasets[3].data = datasets.pressure;
          myChart.update();
        }
        hideStatus();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        applyState(false);
        if (rBtn) rBtn.hidden = true;
      });
    }
  }
});
