// constants.ts

export const DEBUG_LAP_TIME = false; // Mettre à false en production

// Types de prédictions existants + nouveau type
export const predictionTypes = ["depassement", "pitstop", "pneu", "position", "laptime"] as const;

// Configuration des constantes
export const LAPTIME_CONFIG = {
  SHORT_WINDOW: 5,            // Fenêtre court terme
  MEDIUM_WINDOW: 10,          // Fenêtre moyen terme
  SHORT_TERM_WEIGHT: 0.70,    // Poids tendance court terme
  DAMPING_FACTOR: 0.70,       // Facteur d'atténuation
  PROGRESSION_FACTOR: 0.90,   // Facteur de progression
  ABNORMAL_THRESHOLD: 3.00,   // Seuil tours anormaux (secondes)
  FUTURE_LAPS: 10             // Nombre de tours futurs à prédire
} as const;

export const PREDICTION_CLASS_ORDER = {
  depassement: ['False', 'True'],
  pitstop: ['Never', '1-5', '5-15', '>15'],
  pneu: ['SOFT', 'MEDIUM', 'HARD', 'Unknown', 'WET', 'INTERMEDIATE'],
  position: Array.from({length: 20}, (_, i) => (i + 1).toString() + '.0'),
  laptime: Array.from({length: 10}, (_, i) => (i + 1).toString())  // Pour les 10 prochains tours
};

export const PREDICTION_TITLES = {
  depassement: 'Overtake prediction for next lap',
  pitstop: 'Pit stop window prediction',
  pneu: 'Next tire prediction',
  position: 'Final position prediction',
  laptime: 'Future lap times prediction'
};

// Nouvelles constantes pour le graphique de temps
export const LAPTIME_COLORS = {
  NORMAL: 'rgb(128, 128, 128)',    // Gris pour les tours normaux
  ABNORMAL: 'rgb(255, 255, 0)',    // Jaune pour les tours anormaux
  SELECTED: 'rgb(0, 255, 0)',      // Vert pour le tour sélectionné
  PREDICTED: 'rgb(255, 0, 0)',     // Rouge pour les prédictions
} as const;

// Format pour l'affichage des temps
export const TIME_FORMAT = {
  format: (time: number) => {
    if (!time || isNaN(time)) return '-';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);

    if (minutes === 0) {
      return `${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
};