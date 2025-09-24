'use strict';

// Populate a data object with current day/month labels (for the header).
const formatDate = data => {
  const currentDate = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  data.currentDayNumber = currentDate.getDate();
  data.currentDay = dayNames[currentDate.getDay()];
  data.currentMonth = monthNames[currentDate.getMonth()];
};

// Decide ordinal suffix for a day number (1 -> st, 2 -> nd, etc.).
function getNumberEnding(number) {
  const lastDigit = number % 10;

  if (number >= 11 && number <= 19) {
    return 'th';
  }

  switch (lastDigit) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function getCurrentTime() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function decodeTime(time) {
  const date = new Date(time * 1000);

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function updateClock() {
  const clock = document.querySelector('.time__hour');
  clock.textContent = getCurrentTime();
}

// Update the clock using a city-specific timezone offset from the API.
function updateClockWithTimeZone(data) {
  if (!data || typeof data.timezone !== 'number') return updateClock();
  const now = Date.now();
  // Browser local offset (min -> ms) * -1 gives difference to UTC in ms
  const localOffsetMs = new Date().getTimezoneOffset() * 60 * 1000; // minutes * 60 * 1000
  const utcTime = now + localOffsetMs; // now shifted to UTC
  const targetTime = utcTime + data.timezone * 1000; // data.timezone already in seconds relative to UTC
  const dt = new Date(targetTime);
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  const ss = String(dt.getSeconds()).padStart(2, '0');
  const clockElement = document.querySelector('.time__hour');
  if (clockElement) clockElement.textContent = `${hh}:${mm}:${ss}`;
}

export {
  updateClock,
  getNumberEnding,
  formatDate,
  decodeTime,
  updateClockWithTimeZone,
};
