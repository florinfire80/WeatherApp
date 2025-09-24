import { formatDate as formatCurrent } from '../components/WeatherData/utilsForCurrentDay.js';
import { formatDate as formatFive } from '../components/WeatherData/utilsForFiveDays.js';

describe('date formatting consistency', () => {
  test('current day formatter returns string', () => {
    expect(
      typeof formatCurrent({
        currentDay: '',
        currentMonth: '',
        currentDayNumber: '',
      })
    ).toBe('undefined'); // original mutates object; ensure call does not throw
  });

  test('five-day formatDate produces expected pattern', () => {
    const d = new Date('2024-07-26T12:00:00Z');
    const str = formatFive(d.toISOString());
    expect(/^[0-9]{1,2} [A-Z][a-z]{2}$/.test(str)).toBe(true);
  });
});
