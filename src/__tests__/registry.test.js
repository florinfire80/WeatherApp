import { getIcon, hasIcon } from '../components/WeatherData/icons/registry.js';

describe('icon registry', () => {
  test('hasIcon works for known key', () => {
    expect(hasIcon('sun')).toBe(true);
  });
  test('getIcon returns svg string', async () => {
    const svg = await getIcon('sun');
    expect(typeof svg).toBe('string');
    expect(svg.length).toBeGreaterThan(10);
  });
  test('getIcon unknown rejects', async () => {
    await expect(getIcon('nope')).rejects.toThrow(/Unknown icon/);
  });
});
