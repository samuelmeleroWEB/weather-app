
import React from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { 
  Footprints, Car, Umbrella, 
  ThermometerSun
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityProps {
  weather: {
    temp: number;
    wind: number;
    rainChance: number;
    uv: number;
    code: number;
  };
}

const ActivityCard = ({ icon: Icon, label, score, reason }: { icon: any, label: string, score: 'good' | 'moderate' | 'bad', reason: string }) => {
  const colors = {
    good: 'bg-green-500/20 border-green-400/30 text-green-100',
    moderate: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-100',
    bad: 'bg-red-500/20 border-red-400/30 text-red-100'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden p-4 rounded-xl border backdrop-blur-sm flex items-center justify-between ${colors[score]}`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-full">
          <Icon size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-wide">{label}</h4>
          <p className="text-[10px] opacity-80 uppercase font-medium">{reason}</p>
        </div>
      </div>
      <div className={`w-2 h-2 rounded-full ${score === 'good' ? 'bg-green-400' : score === 'moderate' ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`} />
    </motion.div>
  );
};

export const ActivityAdvice: React.FC<ActivityProps> = ({ weather }) => {
  const { translate } = usePreferences();
  
  // Logic to determine suitability
  const getRunningScore = () => {
    if (weather.temp > 30 || weather.rainChance > 70) return { score: 'bad', reason: translate('aiHot') || 'Too hot/wet' };
    if (weather.temp > 25 || weather.wind > 20) return { score: 'moderate', reason: translate('aiWindy') || 'Warm/Windy' };
    return { score: 'good', reason: translate('good') };
  };

  const getDrivingScore = () => {
    if (weather.rainChance > 80 || weather.code > 90) return { score: 'bad', reason: translate('aiRain') || 'Stormy' };
    if (weather.rainChance > 40) return { score: 'moderate', reason: translate('moderate') };
    return { score: 'good', reason: translate('good') };
  };

  const getOutdoorScore = () => {
    if (weather.uv > 8) return { score: 'bad', reason: translate('aiHot') + ' ' + translate('uv') };
    if (weather.uv > 5) return { score: 'moderate', reason: translate('moderate') };
    return { score: 'good', reason: translate('good') };
  };

  const run = getRunningScore();
  const drive = getDrivingScore();
  const out = getOutdoorScore();

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-white/80 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
        <ThermometerSun size={14} />
        {translate('activity')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ActivityCard 
          icon={Footprints} 
          label={translate('running')} 
          score={run.score as any} 
          reason={run.reason} 
        />
        <ActivityCard 
          icon={Car} 
          label={translate('driving')} 
          score={drive.score as any} 
          reason={drive.reason} 
        />
        <ActivityCard 
          icon={Umbrella} 
          label={translate('outdoor')} 
          score={out.score as any} 
          reason={out.reason} 
        />
      </div>
    </div>
  );
};
