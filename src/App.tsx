import { useState } from 'react';
import { getWeatherData } from './services/weatherService';

// Tipado para el estado del clima
interface WeatherInfo {
  city: string;
  temp: number;
  condition: string;
  description: string;
}

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Mapeo de estilos según el clima (puedes ampliarlo después)
  const themeClasses: Record<string, string> = {
    Clear: 'bg-gradient-to-br from-blue-400 to-yellow-200',
    Rain: 'bg-gradient-to-br from-gray-700 to-blue-900',
    Clouds: 'bg-gradient-to-br from-gray-300 to-gray-500',
    Snow: 'bg-gradient-to-br from-blue-100 to-white text-gray-800',
    Thunderstorm: 'bg-gradient-to-br from-purple-900 to-gray-900',
    Drizzle: 'bg-gradient-to-br from-cyan-600 to-blue-400',
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    try {
      const data = await getWeatherData(city);
      setWeather(data);
    } catch (error) {
      alert("No se encontró la ciudad");
    } finally {
      setLoading(false);
    }
  };

  // Seleccionamos el fondo: si hay clima lo usamos, si no, uno por defecto
  const currentBg = weather ? (themeClasses[weather.condition] || 'bg-slate-800') : 'bg-slate-800';

  return (
    <div className={`min-h-screen w-full transition-all duration-1000 flex flex-col items-center justify-center text-white p-4 ${currentBg}`}>
      
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-center mb-6">Weather Mood</h1>

        {/* Buscador */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input 
            type="text" 
            placeholder="Escribe una ciudad..." 
            className="flex-1 px-4 py-2 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/70"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-white text-blue-600 font-bold rounded-xl hover:bg-opacity-90 transition shadow-lg"
          >
            {loading ? '...' : '🔍'}
          </button>
        </form>

        {/* Info del Clima */}
        {weather && (
          <div className="text-center animate-fade-in">
            <h2 className="text-5xl font-extrabold mb-2">{weather.city}</h2>
            <p className="text-7xl font-light mb-4">{weather.temp}°C</p>
            <p className="text-xl capitalize italic opacity-90">{weather.description}</p>
            
            {/* Sección de Recomendación (La parte "Mood") */}
            <div className="mt-8 p-4 bg-black/20 rounded-2xl">
              <p className="text-sm uppercase tracking-widest mb-1 opacity-70">Recomendación:</p>
              <p className="text-lg font-medium">
                {weather.condition === 'Clear' && "☀️ ¡Día perfecto para pasear y hacer fotos!"}
                {weather.condition === 'Rain' && "🍿 Tarde de peli, manta y café."}
                {weather.condition === 'Clouds' && "☁️ Buen momento para un café tranquilo."}
                {weather.condition === 'Snow' && "❄️ ¡Abrígate bien y busca un chocolate caliente!"}
                {weather.condition === 'Thunderstorm' && "⚡ Mejor quédate en casa programando."}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm opacity-50">Powered by OpenWeather API</p>
    </div>
  );
};

export default App;