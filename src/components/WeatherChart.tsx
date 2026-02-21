import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePreferences } from '../context/PreferencesContext';

interface WeatherChartProps {
  data: { time: string; temp: number }[];
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  const { translate } = usePreferences();
  return (
    <div className="w-full h-64 glass-card rounded-3xl p-4 flex flex-col">
      <h3 className="text-white text-lg font-semibold mb-4 ml-2">{translate('temperatureTrend')}</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="#e5e5e5" 
              tick={{ fill: '#e5e5e5', fontSize: 12, dy: 10, dx: 25, textAnchor: 'middle' }}
              tickLine={false}
              axisLine={false}
              padding={{ left: 20, right: 20 }}
              interval={2}
            />
            <YAxis 
              hide={true} 
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '10px', border: 'none', color: '#fff' }}
              itemStyle={{ color: '#fbbf24' }}
              formatter={(value: any) => [`${value}°`, translate('temperature') || 'Temp']}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#fbbf24" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
