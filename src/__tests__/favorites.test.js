/** @jest-environment jsdom */

// Silence notification side-effects by mocking notify functions
jest.mock('../components/WeatherData/weatherService.js', () => {
  const actual = jest.requireActual(
    '../components/WeatherData/weatherService.js'
  );
  return {
    ...actual,
    notifyInfo: jest.fn(),
    notifyError: jest.fn(),
  };
});

function mountDOM() {
  document.body.innerHTML = `
    <form id="search-form">
      <input id="search-input" />
      <button type="button" class="search-form__favorite">Fav</button>
    </form>
    <ul class="favorites-list" style="width:300px;overflow:auto;"></ul>
    <button class="favorite-prev"></button>
    <button class="favorite-next"></button>
  `;
}

describe('favorites list behavior', () => {
  beforeEach(async () => {
    localStorage.clear();
    jest.resetModules();
    mountDOM();
    await import('../components/FavoritesList/favoriteList.js');
  });

  test('adds a city and prevents duplicates', () => {
    const input = document.getElementById('search-input');
    const favBtn = document.querySelector('.search-form__favorite');
    input.value = 'Bucharest';
    favBtn.click();
    input.value = 'bucharest'; // duplicate (case-insensitive)
    favBtn.click();
    const items = document.querySelectorAll('.favorites-list__item-link');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toBe('Bucharest');
  });

  test('removes a city via close button', () => {
    const input = document.getElementById('search-input');
    const favBtn = document.querySelector('.search-form__favorite');
    input.value = 'Cluj';
    favBtn.click();
    const closeBtn = document.querySelector('.favorites-list__item-close');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    expect(document.querySelectorAll('.favorites-list__item-link').length).toBe(
      0
    );
    expect(JSON.parse(localStorage.getItem('savedCities')) || []).toHaveLength(
      0
    );
  });
});
