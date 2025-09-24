// Map OpenWeather icon codes to registry icon keys (shared across current & five-days modules).
export function mapIconCode(code) {
  switch (code) {
    case '01d':
    case '01n':
      return 'sun';
    case '02d':
    case '02n':
      return 'cloudsSun';
    case '03d':
    case '03n':
    case '04d':
    case '04n':
      return 'cloudy';
    case '09d':
    case '09n':
    case '10d':
    case '10n':
      return 'rain';
    case '11d':
    case '11n':
      return 'thunder';
    case '13d':
    case '13n':
      return 'snow';
    case '50d':
    case '50n':
      return 'cloudsSun';
    default:
      return 'sun';
  }
}
