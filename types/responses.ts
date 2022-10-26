export interface NearestCityResponse {
  status: string;
  data: Data;
}

interface Data {
  city: string;
  state: string;
  country: string;
  location: Location;
  current: Current;
}

interface Current {
  pollution: Pollution;
  weather: Weather;
}

interface Weather {
  ts: string;
  tp: number;
  pr: number;
  hu: number;
  ws: number;
  wd: number;
  ic: string;
}

interface Pollution {
  ts: string;
  aqius: number;
  mainus: string;
  aqicn: number;
  maincn: string;
}

interface Location {
  type: string;
  coordinates: number[];
}
