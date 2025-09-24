import { mapIconCode } from '../components/WeatherData/icons/mapIconCode.js';

describe('mapIconCode', () => {
  test('maps 01d to sun', () => {
    expect(mapIconCode('01d')).toBe('sun');
  });
  test('maps 01n to sun (night clear uses sun icon fallback)', () => {
    expect(mapIconCode('01n')).toBe('sun');
  });
  test('maps thunder codes', () => {
    expect(mapIconCode('11d')).toBe('thunder');
  });
  test('unknown code returns sun as safe default', () => {
    expect(mapIconCode('99x')).toBe('sun');
  });
});
