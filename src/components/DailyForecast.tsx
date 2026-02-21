
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { weatherCodeToKey } from '../services/weatherService';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';

interface DailyData {
  time: string;
  max: number;
  min: number;
  code: number;
  rainSum: number;
}

const getWeatherIcon = (code: number) => {
  const condition = weatherCodeToKey(code);
  switch (condition) {
    case 'Clear': return <Sun className="text-yellow-400" />;
    case 'Clouds': return <Cloud className="text-gray-400" />;
    case 'Rain': return <CloudRain className="text-blue-400" />;
    case 'Snow': return <CloudSnow className="text-white" />;
    case 'Thunderstorm': return <CloudLightning className="text-purple-400" />;
    case 'Drizzle': return <CloudDrizzle className="text-blue-300" />;
    case 'Fog': return <CloudFog className="text-gray-300" />;
    default: return <Sun className="text-yellow-400" />;
  }
};

export const DailyForecast: React.FC<{ data: DailyData[], onSelectDay: (day: any) => void, activeDate?: Date | null }> = ({ data, onSelectDay, activeDate }) => {
  const { formatTemp, translate, language } = usePreferences();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <div className="glass-card rounded-3xl p-6 mt-6">
      <h3 className="text-white text-xl font-semibold mb-4">{translate('daily')}</h3>
      <div className="space-y-4">
        {data.map((day, idx) => {
          const isSelected = activeDate && new Date(day.time).toDateString() === activeDate.toDateString();
          return (
            <div 
              key={idx} 
              onClick={() => onSelectDay(day)} 
              className={`cursor-pointer grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4 text-white border-b border-white/5 last:border-0 p-3 sm:p-4 rounded-xl transition-all duration-300 group hover:scale-[1.02] ${isSelected ? 'bg-white/20 border-white/30 shadow-lg scale-[1.02]' : 'hover:bg-white/5'}`}
            >
              
              {/* Date & Rain grouped */}
              <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[160px]">
                <span className={`capitalize font-medium text-sm sm:text-base truncate ${isSelected ? 'text-amber-300 font-bold' : 'opacity-90'}`}>
                  {idx === 0 ? translate('today') : formatDate(day.time)}
                </span>
                {day.rainSum > 0 && (
                  <div className="flex items-center text-xs text-blue-100 bg-blue-500/20 px-1.5 py-0.5 rounded-md border border-blue-400/30 shrink-0 shadow-sm">
                    <CloudDrizzle size={10} className="mr-1 text-blue-300" />
                    <span className="font-semibold">{day.rainSum}</span>
                    <span className="opacity-70 ml-0.5 text-[10px]">mm</span>
                  </div>
                )}
              </div>

              {/* Icon + Condition */}
              <div className="flex items-center justify-center gap-2 overflow-hidden min-w-0">
                <div className="transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shrink-0">
                  {getWeatherIcon(day.code)}
                </div>
                <span className="text-xs sm:text-sm opacity-60 font-medium uppercase tracking-wide truncate hidden sm:block">
                  {translate(weatherCodeToKey(day.code))}
                </span>
              </div>

              {/* Temp */}
              <div className="text-right flex items-center justify-end gap-2 sm:gap-3 whitespace-nowrap min-w-[70px] sm:min-w-[90px] pr-2 sm:pr-4">
                <span className="font-bold text-base sm:text-xl drop-shadow-md">{formatTemp(day.max).replace(/(C|F)/, '')}</span>
                <span className="text-white/40 text-xs sm:text-sm font-medium">{formatTemp(day.min).replace(/(C|F)/, '')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
