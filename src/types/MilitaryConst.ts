import type { MilitaryType } from "./militaryTypes";
export const MILITARY_LABELS: Record<MilitaryType, string> = {
  barracks: "Koszary",
  naval_base: "Baza morska",
  airfield: "Lotnisko wojskowe",
  training_area: "Poligon",
  range: "Strzelnica",
  bunker: "Bunkier",
  danger_area: "Strefa niebezpieczna",
  checkpoint: "Punkt kontrolny",
  office: "Biuro/Dowództwo"
};

export const MILITARY_TYPES: MilitaryType[] = [
   "barracks",
   "naval_base",
   "airfield",
   "training_area",
   "range", 
   "bunker",
   "danger_area",
   "checkpoint",
   "office"
];