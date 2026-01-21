
import { WeatherData } from "../types";
import { KL_COORDS } from "../constants";

export const fetchKLWeather = async (): Promise<WeatherData> => {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${KL_COORDS.lat}&longitude=${KL_COORDS.lon}&current=temperature_2m,weather_code&timezone=Asia%2FKuala_Lumpur`);
    const data = await res.json();
    
    const code = data.current.weather_code;
    const temp = Math.round(data.current.temperature_2m);
    
    // Simple mapping of WMO codes
    let condition = "Clear";
    let icon = "☀️";
    
    if (code >= 1 && code <= 3) { icon = "⛅"; condition = "Partly Cloudy"; }
    else if (code >= 45 && code <= 48) { icon = "🌫️"; condition = "Foggy"; }
    else if (code >= 51 && code <= 67) { icon = "🌧️"; condition = "Rainy"; }
    else if (code >= 71 && code <= 86) { icon = "🌨️"; condition = "Snowy"; }
    else if (code >= 95) { icon = "⛈️"; condition = "Thunderstorm"; }

    return { temp, condition, icon };
  } catch (e) {
    return { temp: 28, condition: "Sunny", icon: "☀️" };
  }
};
