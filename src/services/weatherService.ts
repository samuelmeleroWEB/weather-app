const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const OPENWEATHER_API = 'https://api.openweathermap.org/data/2.5';
const OPEN_METEO_API = 'https://api.open-meteo.com/v1';
const AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

type Language = 'es' | 'en';

export const weatherCodeToKey = (code: number): string => {
  if (code <= 1) return 'Clear';
  if (code <= 3) return 'Clouds';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'Rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'Snow';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
};

const fetchJson = async <T>(url: string, errorMessage = 'Fetch error', headers?: HeadersInit): Promise<T> => {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(errorMessage);
  return response.json();
};

const mapOpenWeatherResponse = (data: any) => ({
  city: data.name,
  temp: Math.round(data.main.temp),
  condition: data.weather[0].main,
  description: data.weather[0].description,
  humidity: data.main.humidity,
  wind: Math.round(data.wind.speed * 3.6),
  country: data.sys.country,
  coord: data.coord
});

export const getWeatherData = async (city: string, lang: Language = 'es') => {
  const searchCity = city.toLowerCase().includes(',es') || city.toLowerCase().includes(', es') ? city : `${city},ES`;
  const url = `${OPENWEATHER_API}/weather?q=${searchCity}&appid=${API_KEY}&units=metric&lang=${lang}`;
  const data = await fetchJson<any>(url, "City not found");
  return mapOpenWeatherResponse(data);
};

export const getWeatherByCoords = async (lat: number, lon: number, lang: Language = 'es') => {
  const url = `${OPENWEATHER_API}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`;
  const data = await fetchJson<any>(url, "Weather not found for coordinates");
  return mapOpenWeatherResponse(data);
};

const fetchUnsplashImage = async (query: string): Promise<string | null> => {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_KEY}&per_page=1&orientation=landscape`;
    const data = await fetchJson<any>(url);
    return data.results?.[0]?.urls?.regular || null;
  } catch {
    return null;
  }
};

export const getCityImage = async (cityName: string, country?: string, state?: string): Promise<string | null> => {
  const targetCountry = country === 'ES' ? 'Spain' : (country || '');

  const searchQueries = [
    targetCountry ? `${cityName} ${targetCountry} cityscape landmark` : '',
    `${cityName} architecture monument`,
    targetCountry ? `${cityName} ${targetCountry} town` : '',
    targetCountry ? `${cityName} ${targetCountry}` : '',
    state && targetCountry ? `${state} province ${targetCountry} landscape` : '',
    state ? `${state} province landscape` : '',
    state ? `${state} landmark` : '',
    state && targetCountry ? `${state} ${targetCountry}` : ''
  ].filter(Boolean);

  for (const query of searchQueries) {
    const img = await fetchUnsplashImage(query);
    if (img) return img;
  }
  return null;
};

export const getCitySuggestions = async (query: string) => {
  if (query.length < 3) return [];
  try {
    const url = `${NOMINATIM_API}/search?q=${query}&format=json&addressdetails=1&countrycodes=es&featuretype=settlement&limit=15`;
    const data = await fetchJson<any[]>(url, 'Geo API Error', {
      'Accept-Language': 'es',
    });

    const uniqueMap = new Map();
    data.forEach(item => {
      const state = item.address?.state || item.address?.province || item.address?.region || '';
      const key = `${item.name}-${state}`.toLowerCase();

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          name: item.name,
          country: 'ES',
          state,
          full: state ? `${item.name}, ${state} (España)` : `${item.name} (España)`,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        });
      }
    });
    return Array.from(uniqueMap.values()).slice(0, 5);
  } catch {
    return [];
  }
};

export const getStateFromCoords = async (lat: number, lon: number) => {
  try {
    const url = `${NOMINATIM_API}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
    const data = await fetchJson<any>(url, 'Reverse Geo Error', {
      'Accept-Language': 'es',
    });
    return data.address?.state || data.address?.region || data.address?.county || null;
  } catch {
    return null;
  }
};

export const getExtendedForecast = async (lat: number, lon: number) => {
  const url = `${OPEN_METEO_API}/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,weathercode,apparent_temperature,precipitation_probability,uv_index,visibility,surface_pressure,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&current_weather=true&timezone=auto`;
  return fetchJson<any>(url);
};

export const getAirQuality = async (lat: number, lon: number) => {
  const url = `${AIR_QUALITY_API}/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;
  return fetchJson<any>(url);
};

export const getHourlyForDay = (extendedData: any, date: Date) => {
  const startOfDay = new Date(date).setHours(0, 0, 0, 0);
  const endOfDay = new Date(date).setHours(23, 59, 59, 999);

  return extendedData.hourly.time
    .map((t: string, i: number) => ({ time: new Date(t), index: i }))
    .filter(({ time }: { time: Date }) => time.getTime() >= startOfDay && time.getTime() <= endOfDay)
    .map(({ index }: { index: number }) => ({
      time: extendedData.hourly.time[index],
      temp: extendedData.hourly.temperature_2m[index],
      code: extendedData.hourly.weathercode[index],
      uv: extendedData.hourly.uv_index[index],
      pop: extendedData.hourly.precipitation_probability[index],
      humidity: extendedData.hourly.relativehumidity_2m[index],
      wind: extendedData.hourly.windspeed_10m ? extendedData.hourly.windspeed_10m[index] : 0,
      vis: extendedData.hourly.visibility[index],
      pressure: extendedData.hourly.surface_pressure[index]
    }));
};