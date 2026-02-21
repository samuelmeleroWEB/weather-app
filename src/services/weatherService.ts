const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const ROOT_URL = 'https://api.openweathermap.org/data/2.5';

// Helper to map Open-Meteo WMO codes to translation keys
export const weatherCodeToKey = (code: number): string => {
  const weatherMap: { [key: number]: string } = {
    0: 'Clear', 1: 'Clear', 2: 'Clouds', 3: 'Clouds',
    45: 'Fog', 48: 'Fog',
    51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
    56: 'Drizzle', 57: 'Drizzle',
    61: 'Rain', 63: 'Rain', 65: 'Rain',
    66: 'Rain', 67: 'Rain',
    71: 'Snow', 73: 'Snow', 75: 'Snow',
    77: 'Snow',
    80: 'Rain', 81: 'Rain', 82: 'Rain',
    85: 'Snow', 86: 'Snow',
    95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
  };
  return weatherMap[code] || 'Clear';
};

export const getWeatherData = async (city: string, lang: 'es' | 'en' = 'es') => {
  const response = await fetch(`${ROOT_URL}/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`);
  if (!response.ok) throw new Error("City not found");
  const data = await response.json();
  return {
    city: data.name,
    temp: Math.round(data.main.temp),
    condition: data.weather[0].main,
    description: data.weather[0].description,
    humidity: data.main.humidity,
    wind: Math.round(data.wind.speed * 3.6),
    country: data.sys.country,
    coord: data.coord // Return coords for further calls
  };
};

// Helper to try multiple search queries
export const getCityImage = async (cityName: string, country?: string, state?: string) => {
  try {
    const trySearch = async (query: string) => {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_KEY}&per_page=1&orientation=landscape`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.results?.[0]?.urls?.regular || null;
    };

    // 1. Try "City, Country"
    let img = country ? await trySearch(`${cityName} ${country} city`) : null;
    if (img) return img;

    // 2. Try just "City"
    img = await trySearch(`${cityName} city`);
    if (img) return img;

    // 3. Fallback: Try State/Province if available
    if (state) {
      img = country ? await trySearch(`${state} province ${country}`) : await trySearch(`${state} province`);
      if (img) return img;

      // 4. Try just state name
      img = await trySearch(`${state} landscape`);
      if (img) return img;
    }

    return null;
  } catch (error) {
    console.error("Unsplash Error:", error);
    return null;
  }
};

export const getCitySuggestions = async (query: string) => {
  if (query.length < 3) return [];
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`);
  const data = await response.json();
  return data.map((item: any) => ({
    name: item.name,
    country: item.address.country_code ? item.address.country_code.toUpperCase() : '',
    // Prioritize state, then region, then county
    state: item.address.state || item.address.region || item.address.county || '',
    full: `${item.name}, ${item.address.country}`,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon)
  }));
};

export const getStateFromCoords = async (lat: number, lon: number) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.address?.state || data.address?.region || data.address?.county || null;
  } catch (error) {
    console.error("Reverse Geocode Error:", error);
    return null;
  }
};

export const getExtendedForecast = async (lat: number, lon: number) => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,weathercode,apparent_temperature,precipitation_probability,uv_index,visibility,surface_pressure,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&current_weather=true&timezone=auto`
  );
  const data = await response.json();
  return data;
};

export const getAirQuality = async (lat: number, lon: number) => {
  const response = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`
  );
  const data = await response.json();
  return data;
};

export const getWeatherByCoords = async (lat: number, lon: number, lang: 'es' | 'en' = 'es') => {
  const response = await fetch(`${ROOT_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`);
  if (!response.ok) throw new Error("Weather not found for coordinates");
  const data = await response.json();
  // Return consistent format with getWeatherData
  return {
    city: data.name,
    temp: Math.round(data.main.temp),
    condition: data.weather[0].main,
    description: data.weather[0].description,
    humidity: data.main.humidity,
    wind: Math.round(data.wind.speed * 3.6),
    country: data.sys.country,
    coord: data.coord
  };
};

export const getHourlyForDay = (extendedData: any, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const indices = extendedData.hourly.time
    .map((t: string, i: number) => ({ time: new Date(t), index: i }))
    .filter(({ time }: { time: Date }) => time >= startOfDay && time <= endOfDay)
    .map(({ index }: { index: number }) => index);

  return indices.map((i: number) => ({
    time: extendedData.hourly.time[i],
    temp: extendedData.hourly.temperature_2m[i],
    code: extendedData.hourly.weathercode[i],
    uv: extendedData.hourly.uv_index[i],
    pop: extendedData.hourly.precipitation_probability[i],
    humidity: extendedData.hourly.relativehumidity_2m[i],
    wind: extendedData.hourly.windspeed_10m ? extendedData.hourly.windspeed_10m[i] : 0, // Note: windspeed might need to be added to fetch url if not present
    vis: extendedData.hourly.visibility[i],
    pressure: extendedData.hourly.surface_pressure[i]
  }));
};