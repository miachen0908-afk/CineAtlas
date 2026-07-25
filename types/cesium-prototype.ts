export type CesiumDayNightMode = "day" | "night";

export type CesiumTestCity = {
  id: string;
  nameZh: string;
  longitude: number;
  latitude: number;
};

export type CesiumCameraSnapshot = {
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
};
