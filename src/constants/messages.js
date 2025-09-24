// Centralized user-facing message constants (English)
export const MSG_ENTER_CITY = 'Please enter a city name.';
export const MSG_TYPE_CITY_FIRST = 'Please type a city name first.';
export const MSG_CITY_ALREADY_FAVORITE = 'This city is already in favorites.';
export const MSG_CITY_NOT_FOUND = 'City not found or misspelled.';
export const MSG_NETWORK_GENERIC =
  'A network error occurred. Please try again.';
export const MSG_PERMISSION_DENIED =
  'Permission to access location was denied.';
export const MSG_ALREADY_CURRENT_LOCATION =
  'Already showing weather for your current location.';

// Utility: fallback helper
export function messageFor(type) {
  switch (type) {
    case 'enter-city':
      return MSG_ENTER_CITY;
    case 'type-city-first':
      return MSG_TYPE_CITY_FIRST;
    case 'already-favorite':
      return MSG_CITY_ALREADY_FAVORITE;
    case 'notfound':
      return MSG_CITY_NOT_FOUND;
    case 'permission':
      return MSG_PERMISSION_DENIED;
    default:
      return MSG_NETWORK_GENERIC;
  }
}
