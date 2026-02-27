
import { useState, useEffect, useRef } from "react";
import { getWeatherData, getCityImage, getCitySuggestions, getExtendedForecast, getAirQuality, getWeatherByCoords, getStateFromCoords, weatherCodeToKey, getHourlyForDay } from "./services/weatherService"; 
import { motion, AnimatePresence } from 'framer-motion';
import { DailyForecast } from "./components/DailyForecast";
import { HourlyForecast } from "./components/HourlyForecast";
import { WeatherChart } from "./components/WeatherChart";
import { WeatherDetails } from "./components/WeatherDetails";
import { ActivityAdvice } from "./components/ActivityAdvice";
import { AISummary } from "./components/AISummary";
import { Search, MapPin, Loader2, X, ThermometerSun, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, CloudSun as CloudSunBig } from "lucide-react";
import { PreferencesProvider, usePreferences } from "./context/PreferencesContext";

// Types
interface WeatherInfo {
  city: string;
  temp: number;
  condition: string;
  description: string;
  humidity?: number;
  wind?: number;
  image?: string;
  country?: string;
  coord?: { lat: number; lon: number };
}

const WeatherIcon = ({ condition, className = "w-12 h-12" }: { condition: string, className?: string }) => {
  const getAnimation = (c: string) => {
    switch (c) {
      case 'Clear': return 'animate-spin-slow origin-center';
      case 'Clouds': 
      case 'Mist':
      case 'Fog': return 'animate-float';
      case 'Thunderstorm': return 'animate-pulse';
      case 'Rain':
      case 'Drizzle': return 'animate-pulse'; // Simple pulse for rain for now
      default: return '';
    }
  };
  
  const anim = getAnimation(condition);
  const finalClass = `${className} ${anim}`;

  switch (condition) {
    case 'Clear': return <Sun className={`${finalClass} text-yellow-400`} />;
    case 'Clouds': return <Cloud className={`${finalClass} text-gray-400`} />;
    case 'Rain': return <CloudRain className={`${finalClass} text-blue-400`} />;
    case 'Snow': return <CloudSnow className={`${finalClass} text-white`} />;
    case 'Thunderstorm': return <CloudLightning className={`${finalClass} text-purple-600`} />;
    case 'Drizzle': return <CloudDrizzle className={`${finalClass} text-blue-300`} />;
    case 'Mist':
    case 'Fog': return <CloudFog className={`${finalClass} text-gray-300`} />;
    default: return <Sun className={`${finalClass} text-yellow-500`} />;
  }
};

const WeatherApp = () => {
  const { language, setLanguage, translate, formatTemp } = usePreferences();
  const searchIdRef = useRef(0);
  
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<{name: string, full: string, country: string, lat?: number, lon?: number, state?: string}[]>([]);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  
  // Time Travel State
  const [currentWeather, setCurrentWeather] = useState<WeatherInfo | null>(null);
  const [currentHourly, setCurrentHourly] = useState<any[]>([]);
  const [fullExtendedData, setFullExtendedData] = useState<any>(null);
  const [isViewingFuture, setIsViewingFuture] = useState(false);
  const [selectedDateDisplay, setSelectedDateDisplay] = useState<Date | null>(null);

  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [aqi, setAqi] = useState<number | null>(null);
  const [uvIndex, setUvIndex] = useState<number>(0);
  const [vis, setVis] = useState<number>(0);
  const [pressure, setPressure] = useState<number>(0);
  
  const [cityImage, setCityImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [favorites, setFavorites] = useState<WeatherInfo[]>(() => JSON.parse(localStorage.getItem("weatherFavorites") || "[]"));
  const [history, setHistory] = useState<WeatherInfo[]>(() => JSON.parse(localStorage.getItem("weatherHistoryFull") || "[]"));

  // Function to handle switching to a specific day
  const handleDaySelect = (day: any) => {
    if (!fullExtendedData || !weather) return;

    const selectedDate = new Date(day.time);
    const isToday = new Date().toDateString() === selectedDate.toDateString();

    if (isToday) {
      handleResetToToday();
      return;
    }

    setIsViewingFuture(true);
    setSelectedDateDisplay(selectedDate);

    // 1. Get Hourly Data for that specific day
    const dayHourlyRaw = getHourlyForDay(fullExtendedData, selectedDate);
    
    // Map to app format
    const dayHourly = dayHourlyRaw.map((h: any) => ({
       time: h.time,
       temp: h.temp,
       code: h.code,
       uv: h.uv,
       pop: h.pop,
       wind: h.wind,
       humidity: h.humidity,
       vis: h.vis,
       pressure: h.pressure
    }));

    setHourlyData(dayHourly);
    setChartData(dayHourly.map((h: any) => ({ time: new Date(h.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), temp: h.temp })));

    // 2. Calculate daily averages/max/min for main display from hourly data
    const noonIndex = Math.floor(dayHourly.length / 2);
    const rep = dayHourly[noonIndex] || dayHourly[0]; 

    // Update main weather display
    const codeKey = weatherCodeToKey(rep.code);
    setWeather({
      ...weather, // Keep city/image info
      temp: Math.round(rep.temp),
      condition: codeKey,
      description: translate(codeKey),
      wind: Math.round(rep.wind),
      humidity: rep.humidity,
    });

    setUvIndex(rep.uv);
    setVis(rep.vis);
    setPressure(rep.pressure);
  };

  const handleResetToToday = () => {
    if (currentWeather && currentHourly.length > 0) {
       setWeather(currentWeather);
       setHourlyData(currentHourly);
       setChartData(currentHourly.map((h: any) => ({ time: new Date(h.time).getHours() + ':00', temp: h.temp })));
       
       const nowHour = new Date().getHours();
       const h = currentHourly.find((d:any) => new Date(d.time).getHours() === nowHour) || currentHourly[0];
       if(h) {
         setUvIndex(h.uv);
         // Restore other metrics if stored, for now good enough
       }
    }
    setIsViewingFuture(false);
    setSelectedDateDisplay(null);
  };

  // Refresh favorites on mount/language change
  useEffect(() => {
    const refreshFavorites = async () => {
      const currentFavs = JSON.parse(localStorage.getItem("weatherFavorites") || "[]");
      if (currentFavs.length === 0) return;

      try {
        const updatedFavs = await Promise.all(currentFavs.map(async (fav: WeatherInfo) => {
          try {
            const freshData = fav.coord 
              ? await getWeatherByCoords(fav.coord.lat, fav.coord.lon, language)
              : await getWeatherData(fav.city, language);
            // Preservar el nombre original de la ciudad y las coordenadas para que no lo sobrescriba la API en el refresh
            return { ...freshData, image: fav.image, city: fav.city, coord: fav.coord || freshData.coord }; 
          } catch (error) {
            console.error(`Failed to update favorite ${fav.city}:`, error);
            return fav; 
          }
        }));
        setFavorites(updatedFavs);
        localStorage.setItem("weatherFavorites", JSON.stringify(updatedFavs));
      } catch (e) {
        console.error("Error updating favorites", e);
      }
    };
    refreshFavorites();
  }, [language]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (city.trim().length >= 3) {
        const list = await getCitySuggestions(city);
        setSuggestions(list);
      } else {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [city]);

  const isNight = new Date().getHours() > 19 || new Date().getHours() < 6;

  const weatherConfig: Record<string, { bg: string, text: string }> = {
    Clear: { 
      bg: isNight 
        ? "from-slate-900 via-slate-800 to-indigo-900" 
        : "from-amber-300 via-orange-400 to-rose-400",
      text: "text-amber-100"
    },
    Rain: { bg: "from-slate-800 via-blue-900 to-slate-900", text: "text-blue-100" },
    Clouds: { bg: "from-slate-300 via-slate-400 to-slate-500", text: "text-slate-100" },
    Snow: { bg: "from-blue-50 via-blue-100 to-white", text: "text-blue-800" },
    Thunderstorm: { bg: "from-slate-900 via-purple-900 to-slate-950", text: "text-purple-200" },
    Drizzle: { bg: "from-slate-600 via-slate-500 to-teal-700", text: "text-teal-100" },
    Mist: { bg: "from-gray-400 via-slate-400 to-zinc-400", text: "text-gray-100" },
    Fog: { bg: "from-gray-400 via-slate-400 to-zinc-400", text: "text-gray-100" },
    Default: { bg: "from-slate-900 via-zinc-900 to-slate-950", text: "text-slate-200" },
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      const currentSearchId = ++searchIdRef.current;
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        if (currentSearchId !== searchIdRef.current) return;
        const { latitude, longitude } = position.coords;
        try {
          const data = await getWeatherByCoords(latitude, longitude, language);
          if (currentSearchId !== searchIdRef.current) return;
          const regionState = await getStateFromCoords(latitude, longitude);
          if (currentSearchId !== searchIdRef.current) return;
          await handleSearch(undefined, { name: data.city, country: data.country, lat: latitude, lon: longitude, state: regionState || undefined });
        } catch (error) {
          if (currentSearchId === searchIdRef.current) {
            alert("Error al obtener ubicación.");
            setLoading(false);
          }
        }
      }, () => {
        if (currentSearchId === searchIdRef.current) {
          alert("Error al obtener ubicación.");
          setLoading(false);
        }
      });
    }
  };

  const handleSearch = async (e?: React.FormEvent, selectedCity?: { name: string, country: string, lat?: number, lon?: number, state?: string }) => {
    if (e) e.preventDefault();
    const cityToSearch = selectedCity ? `${selectedCity.name},${selectedCity.country}` : city;

    if (!cityToSearch) return;
    
    const currentSearchId = ++searchIdRef.current;
    
    setLoading(true);
    setSuggestions([]);

    try {
      let weatherData;
      if (selectedCity && selectedCity.lat && selectedCity.lon) {
        weatherData = await getWeatherByCoords(selectedCity.lat, selectedCity.lon, language);
        if (currentSearchId !== searchIdRef.current) return;
        weatherData.city = selectedCity.name; // Forzar el nombre seleccionado para evitar localizaciones extrañas de la API (ej: Cordova x Córdoba)
      } else {
        weatherData = await getWeatherData(cityToSearch, language);
        if (currentSearchId !== searchIdRef.current) return;
        if (selectedCity) weatherData.city = selectedCity.name;
      }
      const lat = selectedCity?.lat || weatherData.coord?.lat;
      const lon = selectedCity?.lon || weatherData.coord?.lon;

      if (!lat || !lon) throw new Error("Coordenadas no encontradas");

      let stateToSearch = selectedCity?.state;
      if (!stateToSearch) {
         stateToSearch = await getStateFromCoords(lat, lon) || undefined;
         if (currentSearchId !== searchIdRef.current) return;
      }

      const [imageUrl, extended, airInfo] = await Promise.all([
        getCityImage(weatherData.city, weatherData.country, stateToSearch),
        getExtendedForecast(lat, lon),
        getAirQuality(lat, lon)
      ]);

      if (currentSearchId !== searchIdRef.current) return;

      // Save raw extended data for time travel
      setFullExtendedData(extended);

      const currentHour = new Date().getHours();
      const hData = extended.hourly.time.map((t: string, i: number) => ({
        time: t,
        temp: extended.hourly.temperature_2m[i],
        code: extended.hourly.weathercode[i],
        uv: extended.hourly.uv_index[i],
        pop: extended.hourly.precipitation_probability[i],
        humidity: extended.hourly.relativehumidity_2m[i],
        vis: extended.hourly.visibility[i],
        pressure: extended.hourly.surface_pressure[i],
        wind: extended.hourly.windspeed_10m ? extended.hourly.windspeed_10m[i] : 0, 
      })).filter((d: any) => {
        const date = new Date(d.time);
        const now = new Date();
        return date >= now && date.getTime() < now.getTime() + 24 * 60 * 60 * 1000;
      });
      
      setCurrentHourly(hData); // Save "today" hourly

      const dData = extended.daily.time.map((t: string, i: number) => ({
        time: t,
        max: extended.daily.temperature_2m_max[i],
        min: extended.daily.temperature_2m_min[i],
        code: extended.daily.weathercode[i],
        rainSum: extended.daily.precipitation_sum[i]
      }));

      // Condition-based Fallbacks
      const conditionBackgrounds: Record<string, string> = {
        Clear: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=80&w=2000",
        Clouds: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=2000",
        Rain: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=2000",
        Snow: "https://images.unsplash.com/photo-1478265867543-94e81046cdac?q=80&w=2000",
        Thunderstorm: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=2000",
        Drizzle: "https://images.unsplash.com/photo-1541919329513-35f7af297129?q=80&w=2000",
        Fog: "https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=2000",
        Mist: "https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=2000",
        Default: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000"
      };

      const fallbackImage = conditionBackgrounds[weatherData.condition] || conditionBackgrounds.Default;
      const finalImage = imageUrl || fallbackImage;

      const weatherWithImage = { ...weatherData, image: finalImage };

      setWeather(weatherWithImage);
      setCurrentWeather(weatherWithImage); // Save "today" weather

      setCityImage(finalImage);
      setHourlyData(hData);
      setDailyData(dData);
      setChartData(hData.map((h: any) => ({ time: new Date(h.time).getHours() + ':00', temp: h.temp })));
      setAqi(airInfo.current?.us_aqi || 0);
      
      const hourIndex = extended.hourly.time.findIndex((t: string) => new Date(t).getHours() === currentHour);
      if (hourIndex !== -1) {
        setUvIndex(extended.hourly.uv_index[hourIndex]);
        setVis(extended.hourly.visibility ? extended.hourly.visibility[hourIndex] : 10000);
        setPressure(extended.hourly.surface_pressure ? extended.hourly.surface_pressure[hourIndex] : 1013);
      }

      setHistory(prev => {
        // @ts-ignore
        const filtered = prev.filter(item => item.city.toLowerCase() !== weatherData.city.toLowerCase());
        const newHistory = [weatherWithImage, ...filtered].slice(0, 3);
        localStorage.setItem("weatherHistoryFull", JSON.stringify(newHistory));
        return newHistory;
      });
      setCity("");
    } catch (error) {
      if (currentSearchId === searchIdRef.current) {
        console.error(error);
        alert(translate('searchError') || "Error");
      }
    } finally {
      if (currentSearchId === searchIdRef.current) {
        setLoading(false);
      }
    }
  };

  const toggleFavorite = () => {
    if (!weather) return;
    setFavorites(prev => {
      const isFav = prev.find(f => f.city === weather.city);
      const newFavs = isFav ? prev.filter(f => f.city !== weather.city) : [{...weather, image: cityImage || ""}, ...prev];
      localStorage.setItem("weatherFavorites", JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const removeFavorite = (cityName: string) => {
    setFavorites(prev => {
      const newFavs = prev.filter(f => f.city !== cityName);
      localStorage.setItem("weatherFavorites", JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const SidebarCard = ({ item, onRemove }: { item: WeatherInfo, onRemove: () => void }) => (
    <div className="glass-card glass-card-hover group relative rounded-2xl overflow-hidden mb-3 cursor-pointer" onClick={() => handleSearch(undefined, { name: item.city, country: item.country || '', lat: item.coord?.lat, lon: item.coord?.lon })}>
      {item.image && <img src={item.image} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-all duration-500 scale-100 group-hover:scale-110" alt="" />}
      <div className="relative z-10 w-full h-full p-4 flex items-center justify-between text-left">
        <div>
          <p className="text-white font-black text-sm drop-shadow-md tracking-wide">{item.city}</p>
          <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
             <WeatherIcon condition={item.condition} className="w-4 h-4 text-white/90" />
             <p className="text-white/80 text-[10px] uppercase font-bold tracking-wider">{translate(item.condition)}</p>
          </div>
        </div>
        <span className="text-white font-light mr-8 text-2xl drop-shadow-md display-font">{formatTemp(item.temp)}</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute z-20 right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );

  const isFavorite = weather && favorites.find(f => f.city === weather.city);
  const config = weather ? (weatherConfig[weather.condition] || weatherConfig.Default) : weatherConfig.Default;

  return (
    <div className={`min-h-screen w-full relative transition-all duration-1000 flex flex-col lg:flex-row items-center lg:items-start justify-center p-2 sm:p-4 lg:p-8 bg-gradient-to-br ${config.bg}`}>
      
      <AnimatePresence>
        {cityImage && (
          <motion.div key={cityImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-0 transition-opacity duration-1000">
            <img src={cityImage} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-[90rem] gap-4 sm:gap-8 animate-float">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col shrink-0 space-y-6 order-2 lg:order-1">

          <div className="glass-card p-6 rounded-3xl">
            <h3 className="text-white/60 text-xs uppercase tracking-[0.2em] font-black mb-4 flex items-center gap-2"><MapPin size={12}/> {translate('recent')}</h3>
            <div className="space-y-2">
              {history.map(item => <SidebarCard key={`hist-${item.city}`} item={item} onRemove={() => setHistory(history.filter(h => h.city !== item.city))} />)}
              {history.length === 0 && <p className="text-white/30 text-xs text-center py-4 italic">{translate('noHistory')}</p>}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
             <h3 className="text-white/60 text-xs uppercase tracking-[0.2em] font-black mb-4 flex items-center gap-2"><ThermometerSun size={12}/> {translate('favorites')}</h3>
             <div className="space-y-2">
              {favorites.map(item => <SidebarCard key={`fav-${item.city}`} item={item} onRemove={() => removeFavorite(item.city)} />)}
              {favorites.length === 0 && <p className="text-white/30 text-xs text-center py-4 italic">{translate('noFavorites')}</p>}
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative order-1 lg:order-2">
           <div className="glass-card p-4 sm:p-8 lg:p-12 min-h-[500px] lg:min-h-[800px] rounded-[2.5rem]">
             
             {/* Search Header */}
             <div className="flex flex-col sm:flex-row gap-3 mb-8 relative z-50">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="text-white/50" size={18} />
                  </div>
                  <form onSubmit={handleSearch}>
                    <input 
                      type="text" 
                      placeholder={translate('search')} 
                      className="w-full bg-white/5 border border-white/10 hover:border-white/30 focus:border-white/50 rounded-2xl py-3 pl-11 pr-32 text-white placeholder:text-white/30 text-base transition-all shadow-inner focus:outline-none focus:ring-4 focus:ring-white/5 h-12 backdrop-blur-md" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                    />
                  </form>
                  
                  {/* Buttons inside search bar */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button 
                      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} 
                      className="h-8 px-3 rounded-lg text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
                    >
                      {language.toUpperCase()}
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <button 
                      onClick={handleLocationClick} 
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-white/70 hover:text-amber-300 hover:bg-white/10 transition-all"
                      title={translate('currentLocation') || 'Ubicación actual'}
                    >
                      <MapPin size={18} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute w-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-80 overflow-y-auto">
                        {suggestions.map((sug, i) => (
                          <li key={i}>
                            <button onClick={() => handleSearch(undefined, sug)} className="w-full text-left px-6 py-4 hover:bg-white/10 flex justify-between items-center text-white border-b border-white/5 last:border-0 group-hover:pl-8 transition-all">
                              <div>
                                <b className="text-sm font-bold block">{sug.name}</b>
                                <span className="text-xs opacity-50 uppercase tracking-wide">{sug.full}</span>
                              </div>
                              <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold">{sug.country}</span>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
             </div>

             {/* Content Area */}
             {loading ? (
               <div className="flex flex-col items-center justify-center h-96 space-y-4">
                 <Loader2 className="w-16 h-16 text-white animate-spin" />
                 <p className="text-white/60 animate-pulse uppercase tracking-widest text-xs">{translate('loading')}</p>
               </div>
             ) : weather ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                 
                  {/* Top Banner for Future Date */}
                  <AnimatePresence>
                  {isViewingFuture && selectedDateDisplay && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full bg-indigo-500/20 glass-card border border-indigo-400/30 p-3 rounded-2xl mb-6 flex items-center justify-between">
                       <button onClick={handleResetToToday} className="text-white text-sm font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                         <span className="text-lg">←</span> {translate('backToToday') || "Back to Today"}
                       </button>
                       <span className="text-white font-mono text-sm sm:text-lg font-bold flex items-center gap-2">
                         📅 {selectedDateDisplay.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                       </span>
                       <div className="w-[100px]" /> {/* Spacer for centering */}
                    </motion.div>
                  )}
                  </AnimatePresence>

                 {/* Top Section: Main Weather */}
                 <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 text-center lg:text-left">
                    <div>
                      <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-2xl mb-2">{weather.city}</h1>
                      <div className="flex items-center justify-center lg:justify-start gap-4 text-white/80">
                         <span className="text-lg font-medium capitalize">{weather.description}</span>
                         <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                         <span className="text-lg font-medium capitalize">{new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      </div>
                      
                      {/* AI Summary Widget */}
                      <AISummary weather={{ ...weather, wind: weather.wind || 0, rainChance: hourlyData[0]?.pop || 0, uv: uvIndex, condition: weather.condition }} />
                      
                    </div>
                    
                    <div className="flex flex-col items-center lg:items-end">
                      <div className="flex items-center">
                         <WeatherIcon condition={weather.condition} className="w-20 h-20 lg:w-24 lg:h-24 text-white drop-shadow-lg mr-4" />
                         <span className="text-8xl lg:text-9xl font-thin text-white tracking-tighter drop-shadow-lg">{formatTemp(weather.temp)}</span>
                      </div>
                      <button 
                         onClick={toggleFavorite} 
                         className={`mt-4 px-6 py-2 rounded-full border text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${isFavorite ? 'bg-amber-400 border-amber-400 text-black' : 'border-white/30 text-white hover:bg-white/10'}`}
                      >
                        <Sun size={14} className={isFavorite ? "fill-current" : ""} />
                        {isFavorite ? translate('saved') : translate('addToFavorites')}
                      </button>
                    </div>
                 </div>

                 {/* Charts & Details Grid */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Hourly Forecast */}
                    <div className="lg:col-span-3">
                      <HourlyForecast data={hourlyData} />
                    </div>
                    
                    {/* Activity Advice - NEW */}
                    <div className="lg:col-span-3">
                      <ActivityAdvice weather={{ ...weather, wind: weather.wind || 0, uv: uvIndex, rainChance: hourlyData[0]?.pop || 0, code: hourlyData[0]?.code }} />
                    </div>

                    {/* Left Col: Chart & Details */}
                    <div className="lg:col-span-2 space-y-6">
                       <WeatherChart data={chartData} />
                       <WeatherDetails 
                         humidity={weather.humidity || 0} 
                         wind={weather.wind || 0} 
                         uv={uvIndex} 
                         aqi={aqi || undefined} 
                         vis={vis}
                         pressure={pressure}
                       />
                    </div>

                    {/* Right Col: 7 Day Forecast */}
                    <div className="lg:col-span-1">
                       <DailyForecast 
                         data={dailyData} 
                         onSelectDay={handleDaySelect}
                         activeDate={selectedDateDisplay}
                       />
                    </div>
                 </div>

               </motion.div>
             ) : (
               <div className="flex flex-col items-center justify-center h-[500px] text-white/30 space-y-6">
                 <CloudSunBig size={120} strokeWidth={1} />
                 <p className="uppercase tracking-[0.5em] font-light text-sm">{translate('explore')}</p>
               </div>
             )}
             
           </div>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <PreferencesProvider>
    <WeatherApp />
  </PreferencesProvider>
);

export default App;