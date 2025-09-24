# WeatherApp

Simple, fast, and modern weather app that shows current conditions and a 5‑day
forecast with helpful visuals and a favorites list. It uses OpenWeather as the
data source and Pixabay for dynamic backgrounds.

Live demo: https://florinfire80.github.io/WeatherApp

## What you can do with it

- Search for any city and see the current weather (temperature, wind, humidity,
  etc.)
- Browse a 5‑day forecast and expand each day for hourly details
- Save cities to a favorites list and quickly switch between them
  (mobile-friendly carousel)
- Enjoy a clean icon set and background imagery that match the weather context

## Data sources

- Weather: OpenWeather (Current weather + 5‑day/3‑hour forecast)
- Backgrounds: Pixabay (optional; used to fetch a relevant background image)

## Quick start

Prerequisites:

- Node.js 18+ recommended

Install and run locally:

```bash
git clone https://github.com/florinfire80/WeatherApp.git
cd WeatherApp
npm install

# Create a .env file (see Environment variables below) then start the dev server
npm run start
```

[![Deploy to GitHub Pages](https://github.com/florinfire80/WeatherApp/actions/workflows/deploy.yml/badge.svg)](https://github.com/florinfire80/WeatherApp/actions/workflows/deploy.yml)

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Lint and format:

```bash
npm run lint
npm run lint:fix
npm run format
```

## Environment variables

This project expects API keys via environment variables. For consistency,
variables are prefixed with `PARCEL_` and inlined by Parcel during builds.

Create a file named `.env` in the project root with:

```
PARCEL_OPENWEATHER_API_KEY=your_openweather_api_key
PARCEL_PIXABAY_API_KEY=your_pixabay_api_key   # optional (background images)
```

Notes:

- The app will run without `PARCEL_PIXABAY_API_KEY`, but background images may
  fail to load.
- Without `PARCEL_OPENWEATHER_API_KEY`, API calls will fail. The app logs a
  clear warning and some features won’t work.
- API keys in client apps are public by nature. Use free or restricted keys;
  never reuse sensitive keys from other systems.

Windows (Git Bash) one-liner to create `.env`:

```bash
printf "PARCEL_OPENWEATHER_API_KEY=YOUR_KEY\nPARCEL_PIXABAY_API_KEY=YOUR_KEY\n" > .env
```

### GitHub Pages deployment settings

This repo uses GitHub Actions to build and deploy to Pages on every push to
`main`.

- Add repository secrets (Settings → Secrets and variables → Actions):
  - `PARCEL_OPENWEATHER_API_KEY` (required)
  - `PARCEL_PIXABAY_API_KEY` (optional)
- After the first successful run, GitHub Pages will serve at:
  - `https://florinfire80.github.io/WeatherApp/`
  - Ensure `homepage` in `package.json` matches this URL (already set).

## How to use the app

1. Search: Enter a city name in the search field and submit. The app shows the
   current conditions for the detected city.
2. Today vs 5 Days: Use the on‑screen tabs/buttons to switch between the current
   day view and the 5‑day forecast.
3. Expand details: In the 5‑day view, expand a day to see hourly breakdown
   (temperature, wind, pressure, etc.).
4. Favorites: Save a city to favorites and quickly switch among them. On mobile,
   swipe the favorites carousel.

## Key features (under the hood)

- Modular architecture: clear separation between UI rendering, services, and
  utilities
- Icon registry: SVG icons are centrally mapped to weather codes for consistent
  visuals
- Caching: in‑memory and `localStorage` with TTL reduce API calls and speed up
  navigation
- Lightweight scheduling: non‑critical work is deferred to keep the UI
  responsive
- Test suite: Jest tests for core utilities such as icon mapping, schedulers,
  and date helpers

## Project structure (high‑level)

```
src/
  index.html
  index.js                 # entry + theme + initial wiring
  components/
    WeatherData/
      current/             # current weather: service, clock, background, search
      fiveDays/            # five‑day view: bootstrap + renderers + state
      icons/               # SVG icons + registry + icon code mapping
      weatherService.js    # fetch, normalize, cache
      utilsForCurrentDay.js
      utilsForFiveDays.js
    scheduler/             # performance-friendly task helpers
    ...
  sass/                    # SCSS partials and variables
  css/                     # built CSS (by Parcel/Sass)
```

## Scripts (package.json)

- `npm run start` – start the Parcel dev server
- `npm run build` – clean and build production assets (outputs to `dist/`)
- `npm test` – run the Jest test suite
- `npm run lint` / `npm run lint:fix` – run ESLint (and auto‑fix)
- `npm run format` – format files with Prettier

## Deployment

The app builds as a static site suitable for GitHub Pages.

1. Build locally: `npm run build`
2. Push the contents of `dist/` to the branch you serve with GitHub Pages (e.g.,
   `gh-pages`)
3. Configure Pages to serve from that branch (Settings → Pages)

This repository also sets `homepage` in `package.json` to the public URL; ensure
it matches your Pages settings if you fork.

Example (push `dist` to `gh-pages` once):

```bash
git checkout --orphan gh-pages
git reset --hard
cp -r dist/* .
git add .
git commit -m "Deploy"
git push -u origin gh-pages -f
```

Subsequent deploys can be done by rebuilding and repeating the copy/commit to
`gh-pages`.

## Troubleshooting

- Missing or wrong API key
  - Symptom: Errors in the console about failing requests, empty weather blocks.
  - Fix: Ensure `.env` contains a valid `PARCEL_OPENWEATHER_API_KEY`, then
    restart `npm run start`.

- Rate limiting from OpenWeather
  - Symptom: 429 errors or temporary failures when searching often.
  - Fix: Wait and retry; consider caching favorites and switching less
    frequently.

- Background image not loading
  - Symptom: Plain background; console warning about Pixabay key.
  - Fix: Add `PARCEL_PIXABAY_API_KEY` to `.env` or ignore (it’s optional).

- Blank page after build on GitHub Pages
  - Symptom: 404 on asset files.
  - Fix: Ensure build used `--public-url ./` (already configured in
    `npm run build`).

## License

ISC
