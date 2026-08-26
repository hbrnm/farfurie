export type Exercise = {
  id: string;
  nameRo: string;
  nameEn: string;
  kcalPerMin: number;
  category: string;
};

export const exercises: Exercise[] = [
  {
    id: "walk",
    nameRo: "Plimbare",
    nameEn: "Walking",
    kcalPerMin: 4.2,
    category: "cardio",
  },
  {
    id: "run",
    nameRo: "Alergare",
    nameEn: "Running",
    kcalPerMin: 10,
    category: "cardio",
  },
  {
    id: "gym",
    nameRo: "Sală / greutăți",
    nameEn: "Weights / gym",
    kcalPerMin: 6.5,
    category: "strength",
  },
  {
    id: "bike",
    nameRo: "Bicicletă",
    nameEn: "Cycling",
    kcalPerMin: 7.5,
    category: "cardio",
  },
  {
    id: "hiit",
    nameRo: "HIIT acasă",
    nameEn: "Home HIIT",
    kcalPerMin: 9,
    category: "cardio",
  },
  {
    id: "yoga",
    nameRo: "Yoga",
    nameEn: "Yoga",
    kcalPerMin: 3.5,
    category: "mobility",
  },
  {
    id: "swim",
    nameRo: "Înot",
    nameEn: "Swimming",
    kcalPerMin: 8.5,
    category: "cardio",
  },
  {
    id: "housework",
    nameRo: "Treabă prin casă",
    nameEn: "Housework",
    kcalPerMin: 3.2,
    category: "daily",
  },
];

export type FastingProtocol = {
  id: string;
  label: string;
  fastHours: number;
  eatHours: number;
};

export const fastingProtocols: FastingProtocol[] = [
  { id: "16-8", label: "16:8", fastHours: 16, eatHours: 8 },
  { id: "14-10", label: "14:10", fastHours: 14, eatHours: 10 },
  { id: "18-6", label: "18:6", fastHours: 18, eatHours: 6 },
  { id: "omad", label: "OMAD", fastHours: 23, eatHours: 1 },
];
