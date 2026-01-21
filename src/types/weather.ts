// src/types/weather.ts

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  description: string;
  icon: string;
}

// Esto nos ayudará a manejar los estados de nuestra interfaz dinámica
export type WeatherTheme = 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Drizzle';