import { useState } from 'react'

// Definimos un tipo para los estilos según el clima
type WeatherCondition = 'Clear' | 'Rain' | 'Clouds' | 'Default';

const App = () => {
  const [weather, setWeather] = useState<WeatherCondition>('Clear');

  // Mapeo de colores según el clima
  const themeClasses: Record<WeatherCondition, string> = {
    Clear: 'bg-gradient-to-br from-blue-400 to-yellow-200',
    Rain: 'bg-gradient-to-br from-gray-700 to-blue-900',
    Clouds: 'bg-gradient-to-br from-gray-300 to-gray-500',
    Default: 'bg-slate-800'
  };

  return (
    <div className={`min-height-screen h-screen w-full transition-colors duration-700 flex flex-col items-center justify-center text-white ${themeClasses[weather]}`}>
      
      <h1 className="text-4xl font-bold mb-8">Weather Mood App</h1>
      
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/30 text-center">
        <p className="text-xl mb-4 font-medium">¿Cómo está el cielo hoy?</p>
        
        {/* Botones temporales para probar el cambio de diseño */}
        <div className="flex gap-2">
          <button 
            onClick={() => setWeather('Clear')}
            className="px-4 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600 transition"
          >
            Soleado
          </button>
          <button 
            onClick={() => setWeather('Rain')}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Lluvia
          </button>
        </div>
      </div>

      <p className="mt-10 italic">Próximo paso: Conectar la API real...</p>
    </div>
  )
}

export default App