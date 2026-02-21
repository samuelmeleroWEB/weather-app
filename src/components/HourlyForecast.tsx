
import React, { useEffect, useRef } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { weatherCodeToKey } from '../services/weatherService';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';
import { motion } from 'framer-motion';

interface HourlyData {
  time: string;
  temp: number;
  code: number;
}

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'Clear': return <Sun size={20} className="text-yellow-400 group-hover:scale-125 transition-transform" />;
    case 'Clouds': return <Cloud size={20} className="text-gray-400" />;
    case 'Rain': return <CloudRain size={20} className="text-blue-400" />;
    case 'Snow': return <CloudSnow size={20} className="text-white" />;
    case 'Thunderstorm': return <CloudLightning size={20} className="text-purple-400" />;
    case 'Drizzle': return <CloudDrizzle size={20} className="text-blue-300" />;
    case 'Fog': return <CloudFog size={20} className="text-gray-300" />;
    default: return <Sun size={20} className="text-yellow-400" />;
  }
};

export const HourlyForecast: React.FC<{ data: HourlyData[] }> = ({ data }) => {
  const { formatTemp, translate } = usePreferences();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollContainerRef.current) {
        // Find the "current" element (highlighted) and scroll to it if needed.
        // For simplicity, just ensure the start is visible or scroll to index 0 (which is "now")
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [data]);

  return (
    <div className="glass-card p-6 rounded-3xl">
      <h3 className="text-white text-lg font-semibold mb-4 ml-1">{translate('hourly')}</h3>
      
      {/* Scroll Container */}
      <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pb-6 px-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 snap-x snap-mandatory">
        {data.map((hour, idx) => {
          const isCurrent = idx === 0; 
          const date = new Date(hour.time);
          const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`
                relative flex flex-col items-center justify-between w-[100px] h-36 p-4 rounded-2xl snap-start shrink-0 cursor-default group transition-all duration-300
                ${isCurrent ? 'bg-white/20 border-white/40 shadow-lg ring-2 ring-white/20' : 'hover:bg-white/5 border-transparent'}
                border
              `}
            >
              <span className={`text-sm font-medium ${isCurrent ? 'text-white font-bold' : 'text-white/70'}`}>
                {isCurrent ? translate('now') || timeString : timeString}
              </span>
              
              <div className="my-2 p-2 bg-black/20 rounded-full shadow-inner transform group-hover:rotate-12 transition-transform">
                {getWeatherIcon(weatherCodeToKey(hour.code))}
              </div>
              
              <span className="text-white font-bold text-lg">
                {formatTemp(hour.temp).replace(/(C|F)/, '')}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
