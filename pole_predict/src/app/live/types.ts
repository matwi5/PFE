// types.ts
export interface PredictionData {
    predictions: {
      prediction: number | string;
      [key: string]: number | string;
    };
    // Ajout des champs spécifiques pour laptime
    lap_predictions?: Array<{
      lap_number: number;
      predicted_time: number;
      actual_time?: number;
    }>;
    is_abnormal?: boolean;
}

export interface FormattedPredictionData {
    name: string;
    probability: number;
}

export interface LaptimeData {
    lap_number: number;
    predicted_time: number;
    actual_time?: number;
    is_abnormal?: boolean;
}

export interface TimelineProps {
    laps: string[];
    selectedLap: string;
    onLapChange: (lap: string) => void;
    disabled: boolean;
}

export interface PredictionCache {
    [lapNumber: string]: {
      depassement?: PredictionData;
      pitstop?: PredictionData;
      pneu?: PredictionData;
      position?: PredictionData;
      laptime?: PredictionData;  // Ajout du nouveau type
    };
}

export interface PredictionWidgetProps {
    type: string;
    data: PredictionData | null;
    className?: string;
    isExpertMode: boolean;
}

export interface ExpertModeToggleProps {
    isExpertMode: boolean;
    onToggle: (checked: boolean) => void;
}

// Nouvelles interfaces pour les calculs de temps au tour
export interface LaptimeConfig {
    SHORT_WINDOW: number;
    MEDIUM_WINDOW: number;
    SHORT_TERM_WEIGHT: number;
    DAMPING_FACTOR: number;
    PROGRESSION_FACTOR: number;
    ABNORMAL_THRESHOLD: number;
}

export interface LaptimeCalculation {
    future_laps: number[];
    predicted_times: number[];
    abnormal_laps: number[];
}