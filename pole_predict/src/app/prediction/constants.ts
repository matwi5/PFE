export const predictionTypes = ["depassement", "pitstop", "pneu", "position"] as const;

export const PREDICTION_CLASS_ORDER = {
    depassement: ['False', 'True'],
    pitstop: ['Never', '1-5', '5-15', '>15'],
    pneu: ['SOFT', 'MEDIUM', 'HARD', 'Unknown', 'WET', 'INTERMEDIATE'],
    position: Array.from({length: 20}, (_, i) => (i + 1).toString() + '.0')
  };
  
  export const PREDICTION_TITLES = {
    depassement: 'Overtake prediction for next lap',
    pitstop: 'Pit stop window prediction',
    pneu: 'Next tire prediction',
    position: 'Final position prediction'
  };