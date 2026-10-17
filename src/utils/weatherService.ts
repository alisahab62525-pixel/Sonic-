import { WeatherData } from '../types';

export interface WorldCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

export const WORLD_CITIES: WorldCity[] = [
  { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587, timezone: 'Asia/Karachi' },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011, timezone: 'Asia/Karachi' },
  { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lon: 73.0479, timezone: 'Asia/Karachi' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Makkah', country: 'Saudi Arabia', lat: 21.3891, lon: 39.8579, timezone: 'Asia/Riyadh' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.006, timezone: 'America/New_York' },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, timezone: 'Asia/Shanghai' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, timezone: 'Europe/Istanbul' },
];

export function getWeatherConditionInfo(code: number): { label: string; icon: string } {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return { label: 'Clear Sky / Saaf Aasman', icon: '☀️' };
  if (code === 1 || code === 2) return { label: 'Mainly Clear / Halka Baadal', icon: '🌤️' };
  if (code === 3) return { label: 'Overcast / Gehre Baadal', icon: '☁️' };
  if (code === 45 || code === 48) return { label: 'Foggy / Dhund', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { label: 'Drizzle / Boondabandi', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { label: 'Rain / Baarish', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Snowfall / Barfbari', icon: '❄️' };
  if (code >= 80 && code <= 82) return { label: 'Rain Showers / Tez Bochar', icon: '🌧️' };
  if (code >= 95) return { label: 'Thunderstorm / Toofan o Barq', icon: '⛈️' };
  return { label: 'Partly Cloudy', icon: '⛅' };
}

export function formatCityTime(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return new Date().toLocaleTimeString();
  }
}

export async function fetchCityWeather(city: WorldCity): Promise<WeatherData> {
  try {
    const res = await fetch(`/api/weather?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(city.name)}`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return {
      city: city.name,
      country: city.country,
      temperature: Math.round(data.current?.temperature_2m ?? 24),
      humidity: Math.round(data.current?.relative_humidity_2m ?? 50),
      apparentTemperature: Math.round(data.current?.apparent_temperature ?? 25),
      weatherCode: data.current?.weather_code ?? 0,
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 10),
      isDay: Boolean(data.current?.is_day ?? 1),
      time: data.current?.time || new Date().toISOString(),
      timezone: data.timezone || city.timezone,
      cached: Boolean(data.cached),
    };
  } catch {
    // Graceful offline fallback
    return {
      city: city.name,
      country: city.country,
      temperature: 24,
      humidity: 50,
      apparentTemperature: 25,
      weatherCode: 1,
      windSpeed: 12,
      isDay: true,
      time: new Date().toISOString(),
      timezone: city.timezone,
      cached: true,
    };
  }
}

export async function fetchUserLocationWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&city=Your%20Location`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return {
      city: 'Your Location',
      temperature: Math.round(data.current?.temperature_2m ?? 23),
      humidity: Math.round(data.current?.relative_humidity_2m ?? 55),
      apparentTemperature: Math.round(data.current?.apparent_temperature ?? 24),
      weatherCode: data.current?.weather_code ?? 1,
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 8),
      isDay: Boolean(data.current?.is_day ?? 1),
      time: data.current?.time || new Date().toISOString(),
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      cached: Boolean(data.cached),
    };
  } catch {
    return {
      city: 'Your Location',
      temperature: 22,
      humidity: 52,
      apparentTemperature: 23,
      weatherCode: 0,
      windSpeed: 10,
      isDay: true,
      time: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cached: true,
    };
  }
}
