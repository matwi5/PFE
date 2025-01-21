import { LaptimeConfig, PredictionData } from '../types';
import { LAPTIME_CONFIG } from '../constants';

export function calculateWeightedDelta(
    lapTimes: number[], 
    windowSize: number
  ): number {
    if (lapTimes.length < 2) return 0;
  
    // Prendre les derniers tours de la fenêtre
    const recentTimes = lapTimes.slice(-windowSize);
    
    // Calculer les différences entre temps consécutifs comme pandas diff()
    const deltas: number[] = [];
    for (let i = 1; i < recentTimes.length; i++) {
      deltas.push(recentTimes[i] - recentTimes[i-1]);
    }
  
    // Équivalent de np.linspace(-1, 0, len(deltas))
    const weights = deltas.map((_, i) => 
      -1 + (i * (1 / (deltas.length - 1)))
    ).map(x => Math.exp(x));  // np.exp()
    
    // Normaliser les poids (weights / weights.sum())
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const normalizedWeights = weights.map(w => w / weightSum);
  
    // Équivalent de (deltas * weights).sum()
    return deltas.reduce((sum, delta, i) => sum + (delta * normalizedWeights[i]), 0);
  }

export function isAbnormalLap(
  lapTime: number,
  referenceTimes: number[],
  threshold: number = LAPTIME_CONFIG.ABNORMAL_THRESHOLD
): boolean {
  if (referenceTimes.length === 0) return false;
  const referenceMean = referenceTimes.reduce((a, b) => a + b, 0) / referenceTimes.length;
  return lapTime > (referenceMean + threshold);
}

export function predictFutureLaptimes(
    historicalLaps: { lap_number: number; lap_duration: number; is_abnormal: boolean }[],
    currentLap: number,
    config: LaptimeConfig = LAPTIME_CONFIG
): PredictionData {
    const sortedLaps = [...historicalLaps].sort((a, b) => a.lap_number - b.lap_number);
    
    // Ajout du log pour voir tous les tours anormaux
    const abnormalLaps = sortedLaps.filter(lap => lap.is_abnormal);
    console.log('Tours anormaux détectés:', abnormalLaps.map(lap => ({
        lap_number: lap.lap_number,
        lap_duration: lap.lap_duration
    })));
    
    if (sortedLaps.length === 0) {
      return {
        predictions: { prediction: 0 },
        lap_predictions: []
      };
    }

    const validLaps = sortedLaps.filter(lap => 
        lap.lap_number <= currentLap && 
        !lap.is_abnormal && 
        !isNaN(lap.lap_duration)
      );

      console.log('[PREDICT] Tours valides utilisés:', 
        validLaps.map(l => `${l.lap_number} (${l.lap_duration}s)`).join(', ')
      );

    if (validLaps.length === 0) {
      return {
        predictions: { prediction: 0 },
        lap_predictions: []
      };
    }

    // Ajouter une vérification finale
    if (validLaps.length === 0) {
        console.error('[PREDICT] Aucun tour valide pour calculer les prédictions!');
        return { predictions: { prediction: 0 }, lap_predictions: [] };
    }

    let lastLaptime = validLaps[validLaps.length - 1].lap_duration;
    const validTimes = validLaps.map(l => l.lap_duration);

    const shortTermDelta = calculateWeightedDelta(validTimes, Math.min(config.SHORT_WINDOW, validTimes.length));
    const mediumTermDelta = calculateWeightedDelta(validTimes, Math.min(config.MEDIUM_WINDOW, validTimes.length));
    const combinedDelta = (shortTermDelta * config.SHORT_TERM_WEIGHT) + 
                         (mediumTermDelta * (1 - config.SHORT_TERM_WEIGHT));

                         const shortWindow = Math.min(config.SHORT_WINDOW, validTimes.length);
    const mediumWindow = Math.min(config.MEDIUM_WINDOW, validTimes.length);

                         // Log détaillé des deltas
    console.log('\n[DELTA RESULTS]');
    console.log(`Short-term delta: ${shortTermDelta.toFixed(3)}s`, 
        `(sur ${shortWindow} tours: [${validTimes.slice(-shortWindow).join(', ')}])`);
    console.log(`Medium-term delta: ${mediumTermDelta.toFixed(3)}s`,
        `(sur ${mediumWindow} tours: [${validTimes.slice(-mediumWindow).join(', ')}])`);
    console.log(`Combined delta: ${combinedDelta.toFixed(3)}s`,
        `(pondération: ${config.SHORT_TERM_WEIGHT*100}% short / ${(1-config.SHORT_TERM_WEIGHT)*100}% medium)`);
    
    const futureLapsCount = Math.min(config.FUTURE_LAPS, 10);
  
    const predictions = [];
    for (let lapOffset = 1; lapOffset <= futureLapsCount; lapOffset++) {
      const attenuatedDelta = combinedDelta * Math.pow(config.DAMPING_FACTOR, lapOffset);
      const progression = Math.log1p(lapOffset * config.PROGRESSION_FACTOR);
      const deltaChange = attenuatedDelta * progression;
      
      const predictedTime = lastLaptime + deltaChange;
      const futureLapNumber = currentLap + lapOffset;
  
      const actualLap = sortedLaps.find(l => l.lap_number === futureLapNumber);
  
      predictions.push({
        lap_number: futureLapNumber,
        predicted_time: predictedTime,
        actual_time: actualLap?.lap_duration,
        is_abnormal: actualLap?.is_abnormal
      });
  
      lastLaptime = predictedTime;
    }
  
    return {
      predictions: { prediction: predictions[0]?.predicted_time || 0 },
      lap_predictions: predictions
    };
  }

  export function cleanLaptimeData(
    laps: { lap_number: number; lap_duration: number }[],
    threshold: number = LAPTIME_CONFIG.ABNORMAL_THRESHOLD
): { lap_number: number; lap_duration: number; is_abnormal: boolean }[] {
    if (laps.length === 0) return [];

    console.log('\n=== Début du nettoyage des temps au tour ===');
    console.log(`Seuil utilisé: ${threshold}s`);
    console.log(`Nombre de tours entrants: ${laps.length}`);

    const sortedLaps = [...laps].sort((a, b) => a.lap_number - b.lap_number);
    const lapsWithAbnormal = sortedLaps.map(lap => ({
        ...lap,
        is_abnormal: false
    }));

    // Traitement de tous les tours sauf le premier
    for (let idx = 1; idx < lapsWithAbnormal.length; idx++) {
        const currentLap = lapsWithAbnormal[idx];
        const previousLap = lapsWithAbnormal[idx - 1];
        const delta = currentLap.lap_duration - previousLap.lap_duration;
        
        currentLap.is_abnormal = delta > threshold;
        
        if (currentLap.is_abnormal) {
            console.log(
                `Tour anormal détecté (lap ${currentLap.lap_number}):\n` +
                `  Temps actuel: ${currentLap.lap_duration}s\n` +
                `  Tour précédent (lap ${previousLap.lap_number}): ${previousLap.lap_duration}s\n` +
                `  Delta: +${delta.toFixed(2)}s`
            );
        }
    }

    // Récapitulatif final
    const abnormalCount = lapsWithAbnormal.filter(lap => lap.is_abnormal).length;
    console.log(
        `\n=== Résultat final ===\n` +
        `Tours analysés: ${lapsWithAbnormal.length}\n` +
        `Tours anormaux détectés: ${abnormalCount}\n` +
        `Tours marqués anormaux: ${JSON.stringify(lapsWithAbnormal.filter(lap => lap.is_abnormal).map(l => l.lap_number))}\n` +
        `=== Fin du nettoyage ===\n`
    );

    return lapsWithAbnormal;
}