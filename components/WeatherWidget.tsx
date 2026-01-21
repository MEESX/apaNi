
import React from 'react';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  accentClass: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, accentClass }) => {
  if (!weather) return <div className="animate-pulse text-gray-400">Loading skies...</div>;

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-3xl bg-white/50 border border-white/20 shadow-sm backdrop-blur-sm`}>
      <span className="text-5xl mb-2 drop-shadow-sm">{weather.icon}</span>
      <div className="text-center">
        <span className={`text-2xl font-bold ${accentClass}`}>{weather.temp}°C</span>
        <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Kuala Lumpur</p>
        <p className="text-gray-400 text-[10px] italic">{weather.condition}</p>
      </div>
    </div>
  );
};

export default WeatherWidget;
