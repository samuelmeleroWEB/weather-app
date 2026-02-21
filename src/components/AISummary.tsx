
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { Sparkles } from 'lucide-react';

interface AIProps {
  weather: {
    temp: number;
    rainChance: number;
    uv: number;
    wind: number;
    condition: string;
  };
}

export const AISummary: React.FC<AIProps> = ({ weather }) => {
  const { translate } = usePreferences();
  
  // Logic to generate a "smart" summary based on multiple factors
  const getInsight = () => {
    const insights: string[] = [];

    // Temperature & UV
    if (weather.uv > 7) insights.push(translate('aiHot'));
    else if (weather.temp > 30) insights.push(translate('aiHot'));
    else if (weather.temp < 10) insights.push(translate('aiCold'));

    // Precipitation
    if (weather.rainChance > 40) insights.push(translate('aiRain'));
    
    // Wind
    if (weather.wind > 25) insights.push(translate('aiWindy'));

    // Default Good Day
    if (insights.length === 0) {
        // If it's just cloudy but not raining/windy/extreme
        if (weather.condition === 'Clouds') return translate('aiCloudy') || translate('aiGoodDay'); // Fallback if aiCloudy not exists
        return translate('aiGoodDay');
    }

    // Join with localized "and" or just space
    return insights.join(' ');
  };

  return (
    <div className="relative overflow-hidden p-6 rounded-3xl glass-card bg-gradient-to-r from-violet-600/20 to-indigo-600/20 mt-6 group hover:shadow-indigo-500/20 transition-all duration-500">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles size={80} className="text-white animate-pulse" />
      </div>
      
      <div className="flex items-start gap-4 z-10 relative">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg border border-white/20">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
            {translate('aiSummaryTitle')}
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">AI Beta</span>
          </h3>
          <p className="text-white/80 text-sm leading-relaxed font-medium">
            "{getInsight()}"
          </p>
        </div>
      </div>
    </div>
  );
};
