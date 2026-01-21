const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherData = async (city: string) => {
  try {
    const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
    
    if (!response.ok) {
      throw new Error('Ciudad no encontrada');
    }

    const data = await response.json();
    
    // Devolvemos solo lo que nos interesa para nuestro "mood"
    return {
      city: data.name,
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main, // Ej: 'Clear', 'Rain', 'Clouds'
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw error;
  }
};