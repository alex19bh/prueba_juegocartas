// Card type constants with their details for the "Virus!" card game
// Based on the original game which has 68 cards + 2 blank cards

// Card types
export const CARD_TYPES = {
  ORGAN: 'organ',
  VIRUS: 'virus',
  MEDICINE: 'medicine',
  TREATMENT: 'treatment'
};

// Card colors
export const CARD_COLORS = {
  BLUE: 'blue',
  RED: 'red',
  GREEN: 'green',
  YELLOW: 'yellow',
  MULTI: 'multicolor',
  NONE: 'no-color' // For treatment cards that don't have a specific color
};

// Organ status constants
export const ORGAN_STATUS = {
  HEALTHY: 'healthy',
  INFECTED: 'infected',
  VACCINATED: 'vaccinated',
  IMMUNIZED: 'immunized'
};

// Treatment effects
export const TREATMENT_EFFECTS = {
  TRANSPLANT: 'transplant',
  ORGAN_THEFT: 'organ-theft',
  CONTAGION: 'contagion',
  LATEX_GLOVE: 'latex-glove',
  MEDICAL_ERROR: 'medical-error',
  SPREADING: 'spreading'
};

// Complete card definitions
export const CARDS = [
  // Organs (5 of each color = 20 total)
  ...Array(5).fill().map((_, i) => ({
    id: `organ-blue-${i}`,
    type: CARD_TYPES.ORGAN,
    color: CARD_COLORS.BLUE,
    name: "Órgano Azul",
    imageUrl: "/assets/images/cards/organ-blue.png",
  })),
  ...Array(5).fill().map((_, i) => ({
    id: `organ-red-${i}`,
    type: CARD_TYPES.ORGAN,
    color: CARD_COLORS.RED,
    name: "Órgano Rojo",
    imageUrl: "/assets/images/cards/organ-red.png",
  })),
  ...Array(5).fill().map((_, i) => ({
    id: `organ-green-${i}`,
    type: CARD_TYPES.ORGAN,
    color: CARD_COLORS.GREEN,
    name: "Órgano Verde",
    imageUrl: "/assets/images/cards/organ-green.png",
  })),
  ...Array(5).fill().map((_, i) => ({
    id: `organ-yellow-${i}`,
    type: CARD_TYPES.ORGAN,
    color: CARD_COLORS.YELLOW,
    name: "Órgano Amarillo",
    imageUrl: "/assets/images/cards/organ-yellow.png",
  })),
  
  // Multicolor organ (1 total)
  {
    id: 'organ-multi',
    type: CARD_TYPES.ORGAN,
    color: CARD_COLORS.MULTI,
    name: "Órgano Multicolor",
    imageUrl: "/assets/images/cards/organ-multi.png",
  },
  
  // Viruses (4 of each color = 16 total)
  ...Array(4).fill().map((_, i) => ({
    id: `virus-blue-${i}`,
    type: CARD_TYPES.VIRUS,
    color: CARD_COLORS.BLUE,
    name: "Virus Azul",
    imageUrl: "/assets/images/cards/virus-blue.png",
  })),
  ...Array(4).fill().map((_, i) => ({
    id: `virus-red-${i}`,
    type: CARD_TYPES.VIRUS,
    color: CARD_COLORS.RED,
    name: "Virus Rojo",
    imageUrl: "/assets/images/cards/virus-red.png",
  })),
  ...Array(4).fill().map((_, i) => ({
    id: `virus-green-${i}`,
    type: CARD_TYPES.VIRUS,
    color: CARD_COLORS.GREEN,
    name: "Virus Verde",
    imageUrl: "/assets/images/cards/virus-green.png",
  })),
  ...Array(4).fill().map((_, i) => ({
    id: `virus-yellow-${i}`,
    type: CARD_TYPES.VIRUS,
    color: CARD_COLORS.YELLOW,
    name: "Virus Amarillo",
    imageUrl: "/assets/images/cards/virus-yellow.png",
  })),
  
  // Medicines (4 of each color = 16 total)
  ...Array(4).fill().map((_, i) => ({
    id: `medicine-blue-${i}`,
    type: CARD_TYPES.MEDICINE,
    color: CARD_COLORS.BLUE,
    name: "Medicina Azul",
    imageUrl: "/assets/images/cards/medicine-blue.png",
  })),
  ...Array(4).fill().map((_, i) => ({
    id: `medicine-red-${i}`,
    type: CARD_TYPES.MEDICINE,
    color: CARD_COLORS.RED,
    name: "Medicina Roja",
    imageUrl: "/assets/images/cards/medicine-red.png",
  })),
  ...Array(4).fill().map((_, i) => ({
    id: `medicine-green-${i}`,
    type: CARD_TYPES.MEDICINE,
    color: CARD_COLORS.GREEN,
    name: "Medicina Verde",
    imageUrl: "/assets/images/cards/medicine-green.png",
  })),
  ...Array(4).fill().map((_, i) => ({
    id: `medicine-yellow-${i}`,
    type: CARD_TYPES.MEDICINE,
    color: CARD_COLORS.YELLOW,
    name: "Medicina Amarilla",
    imageUrl: "/assets/images/cards/medicine-yellow.png",
  })),
  
  // Treatment cards (15 total)
  // Organ Transplant (2)
  ...Array(2).fill().map((_, i) => ({
    id: `treatment-transplant-${i}`,
    type: CARD_TYPES.TREATMENT,
    color: CARD_COLORS.NONE,
    effect: TREATMENT_EFFECTS.TRANSPLANT,
    name: "Trasplante de Órganos",
    imageUrl: "/assets/images/cards/treatment-transplant.png",
  })),
  
  // Organ Theft (3)
  ...Array(3).fill().map((_, i) => ({
    id: `treatment-theft-${i}`,
    type: CARD_TYPES.TREATMENT,
    color: CARD_COLORS.NONE,
    effect: TREATMENT_EFFECTS.ORGAN_THEFT,
    name: "Robo de Órganos",
    imageUrl: "/assets/images/cards/treatment-theft.png",
  })),
  
  // Contagion (2)
  ...Array(2).fill().map((_, i) => ({
    id: `treatment-contagion-${i}`,
    type: CARD_TYPES.TREATMENT,
    color: CARD_COLORS.NONE,
    effect: TREATMENT_EFFECTS.CONTAGION,
    name: "Contagio",
    imageUrl: "/assets/images/cards/treatment-contagion.png",
  })),
  
  // Latex Glove (3)
  ...Array(3).fill().map((_, i) => ({
    id: `treatment-glove-${i}`,
    type: CARD_TYPES.TREATMENT,
    color: CARD_COLORS.NONE,
    effect: TREATMENT_EFFECTS.LATEX_GLOVE,
    name: "Guante de Látex",
    imageUrl: "/assets/images/cards/treatment-glove.png",
  })),
  
  // Medical Error (3)
  ...Array(3).fill().map((_, i) => ({
    id: `treatment-error-${i}`,
    type: CARD_TYPES.TREATMENT,
    color: CARD_COLORS.NONE,
    effect: TREATMENT_EFFECTS.MEDICAL_ERROR,
    name: "Error Médico",
    imageUrl: "/assets/images/cards/treatment-error.png",
  })),
  
  // Spreading (2)
  ...Array(2).fill().map((_, i) => ({
    id: `treatment-spreading-${i}`,
    type: CARD_TYPES.TREATMENT,
    color: CARD_COLORS.NONE,
    effect: TREATMENT_EFFECTS.SPREADING,
    name: "Propagación",
    imageUrl: "/assets/images/cards/treatment-spreading.png",
  })),
  
  // The 2 blank cards that come with the game
  {
    id: 'blank-1',
    type: 'blank',
    name: "Carta en Blanco",
    imageUrl: "/assets/images/cards/blank.png",
  },
  {
    id: 'blank-2',
    type: 'blank',
    name: "Carta en Blanco",
    imageUrl: "/assets/images/cards/blank.png",
  }
];