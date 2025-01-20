export interface PredictionData {
    predictions: {
      prediction: number | string;
      [key: string]: number | string;
    };
  }
  
  export interface FormattedPredictionData {
    name: string;
    probability: number;
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