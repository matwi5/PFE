export interface Race {
    id: number;
    dates: {
      fp1: string;
      fp2: string;
      fp3: string;
      sprint_qualifying: string;
      sprint_race: string;
      qualifying: string;
      race: string;
    };
    vital_statistics: {
      first_grand_prix: string;
      track_length: string;
      lap_record: {
        time: string;
        driver: string;
        team: string;
        year: string;
      };
      most_pole_positions: {
        driver: string;
        poles: number;
      };
      most_wins: {
        drivers: string[];
        wins: number;
      };
      trivia: string;
      pole_run_to_turn1_braking_point: number;
      overtakes_2023: number;
      safety_car_probability: number;
      virtual_safety_car_probability: number;
      pit_stop_time_loss: number;
      notes: string;
    };
    last_five_pole_sitters: { year: string; driver: string; team: string }[];
    last_five_winners: { year: string; driver: string; team: string }[];
    tyre_strategy_insight: string[];
    current_form: string[];
    iconic_moment: string;
    qualifying_prediction: {
      position: number;
      constructor: string;
      driver: string;
    }[];
    race_prediction: {
      position: number;
      constructor: string;
      driver: string;
    }[];
    circuit_layout: string;
  }