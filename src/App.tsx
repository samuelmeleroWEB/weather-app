import { useState } from "react";
import { getWeatherData } from "./services/weatherService";
import { motion, AnimatePresence } from 'framer-motion';

// Tipado para el estado del clima
interface WeatherInfo {
  city: string;
  temp: number;
  condition: string;
  description: string;
}

// Componente Spinner interno
const Spinner = () => (
  <div className="flex flex-col items-center justify-center my-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-2"></div>
    <p className="text-sm animate-pulse">Buscando el mood...</p>
  </div>
);

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const weatherConfig: Record<string, { bg: string; advice: string; icon: string }> = {
    Clear: {
      bg: "bg-gradient-to-br from-orange-400 to-yellow-200",
      advice: "¡Día de terraza y gafas de sol! No olvides el protector solar.",
      icon: "☀️",
    },
    Rain: {
      bg: "bg-gradient-to-br from-indigo-900 via-slate-800 to-blue-900",
      advice: "Tarde de sofá, peli y manta. Un café caliente vendría genial.",
      icon: "🌧️",
    },
    Clouds: {
      bg: "bg-gradient-to-br from-gray-400 to-slate-600",
      advice: "Día gris, pero ideal para caminar sin pasar calor.",
      icon: "☁️",
    },
    Snow: {
      bg: "bg-gradient-to-br from-blue-100 to-indigo-200 text-slate-800",
      advice: "¡Hora de sacar el abrigo gordo y hacer fotos a la nieve!",
      icon: "❄️",
    },
    Thunderstorm: {
      bg: "bg-gradient-to-br from-purple-900 to-black",
      advice: "Mejor quédate a cubierto y aprovecha para avanzar tu código.",
      icon: "⚡",
    },
    Default: {
      bg: "bg-slate-800",
      advice: "Consulta el tiempo para planear tu día.",
      icon: "🌍",
    },
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    setWeather(null); // Limpiamos el clima anterior al buscar uno nuevo
    
    try {
      const data = await getWeatherData(city);
      setWeather(data);
    } catch (error) {
      alert("No se encontró la ciudad. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Obtenemos la clase de fondo (ahora correctamente)
  const currentBgClass = weather 
    ? (weatherConfig[weather.condition]?.bg || weatherConfig.Default.bg) 
    : weatherConfig.Default.bg;

  return (
    <div className={`min-h-screen w-full transition-all duration-1000 flex flex-col items-center justify-center text-white p-4 ${currentBgClass}`}>
      
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
            disabled={loading}
            className="px-4 py-2 bg-white text-blue-600 font-bold rounded-xl hover:bg-opacity-90 transition shadow-lg disabled:opacity-50"
          >
            🔍
          </button>
        </form>

        {/* Sección de Carga */}
        {loading && <Spinner />}

        {/* Info del Clima con Animación */}
        <AnimatePresence>
          {weather && !loading && (
            <motion.div
              key={weather.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-8xl mb-4">
                {weatherConfig[weather.condition]?.icon || "🌡️"}
              </div>
              <h2 className="text-4xl font-bold mb-2">{weather.city}</h2>
              <p className="text-7xl font-light mb-6">{weather.temp}°C</p>

              <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <p className="text-sm uppercase tracking-widest opacity-70 mb-2">
                  Mood del día
                </p>
                <p className="text-lg font-medium leading-relaxed">
                  {weatherConfig[weather.condition]?.advice || "Disfruta del día con precaución."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-6 text-sm opacity-50 italic">Powered by OpenWeather API</p>
    </div>
  );
};

export default App;