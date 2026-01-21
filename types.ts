
export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

export interface IdiomData {
  idiom: string;
  meaning: string;
  type: 'positive' | 'cynical' | 'motivational';
}

export interface CalendarState {
  currentDate: Date;
  isTorn: boolean;
  canTear: boolean;
}
