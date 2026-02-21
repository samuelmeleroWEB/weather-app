
import React from 'react';
import { 
  Sun, Wind, Droplet, Eye, Activity, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreferences } from '../context/PreferencesContext';

interface MetricProps {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
  delay?: number;
}

const MetricCard: React.FC<MetricProps> = ({ label, value, unit, icon, color = 'bg-white/10', delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`glass-card glass-card-hover p-4 rounded-3xl ${color} flex flex-col items-center justify-center space-y-2 group`}
  >
    <div className="text-white/80 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <div className="text-white text-lg font-black tracking-tighter">
      {value}
      <span className="text-[10px] text-white/50 ml-1 font-medium">{unit}</span>
    </div>
    <div className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-bold">{label}</div>
  </motion.div>
);

export const WeatherDetails = ({ 
  humidity, 
  wind, 
  uv, 
  vis, 
  aqi, 
  pressure 
}: { 
  humidity: number; 
  wind: number; 
  uv: number; 
  vis?: number; 
  aqi?: number; 
  pressure?: number;
}) => {
  const { translate } = usePreferences();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      <MetricCard 
        label={translate('humidity')} 
        value={humidity.toString()} 
        unit="%" 
        icon={<Droplet size={24} />} 
        delay={0.1}
      />
      <MetricCard 
        label={translate('wind')} 
        value={wind.toString()} 
        unit="km/h" 
        icon={<Wind size={24} />} 
        delay={0.2}
      />
      <MetricCard 
        label={translate('uv')} 
        value={uv.toFixed(1)} 
        unit="" 
        icon={<Sun size={24} />} 
        color={uv > 5 ? 'bg-amber-500/20 shadow-amber-500/10' : 'bg-white/10'}
        delay={0.3}
      />
      {vis && (
        <MetricCard 
          label={translate('visibility')} 
          value={(vis / 1000).toFixed(1)} 
          unit="km" 
          icon={<Eye size={24} />} 
          delay={0.4}
        />
      )}
      {aqi && (
        <MetricCard 
          label={translate('airQuality')} 
          value={aqi.toString()} 
          unit="US AQI" 
          icon={<Activity size={24} />} 
          color={aqi > 100 ? 'bg-red-500/20 shadow-red-500/10' : 'bg-green-500/20 shadow-green-500/10'}
          delay={0.5}
        />
      )}
      {pressure && (
        <MetricCard 
          label={translate('pressure')} 
          value={pressure.toString()} 
          unit="hPa" 
          icon={<Gauge size={24} />} 
          delay={0.6}
        />
      )}
    </div>
  );
};
