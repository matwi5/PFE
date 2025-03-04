import { Key } from "react";

export interface GP {
    circuit_key: number;
    circuit_short_name: string;
    country_code: string;
    country_key: number;
    country_name: string;
    date_start: string;
    dist_course: string;
    gmt_offset: string;
    location: string;
    long_circuit: string;
    meeting_code: string;
    meeting_key: number;
    session_key: number;
    meeting_name: string;
    nb_tours: number;
    podium: string[];
    qualif: string[];
    year: number;
    grand_prix: string;
}

export interface Driver {
    id: Key | null | undefined;
    flagColors: string[];
    broadcast_name: string;
    country_code: string;
    driver_number: number;
    first_name: string;
    headshot_url: string;
    last_name: string;
    team_name: string;
    team_colour: string;
    name: string;
    flag_url: string;
    year: number[];
    NumberOfPodiums: number;
    NumberOfVictories: number;
    WorldChampionships: number;
}

export interface Team {
    name: string;
    color: string;
    logo_url: string;
    base: string;
    team_principal: string;
    championships: number;
    power_unit: string;
    country: string;
    country_flag: string;
    pilote1_url: string;
    pilote2_url: string;
    car_image: string;
}

export interface GrandPrix {
    grand_prix: string;
    pays_flag: string;
    ville: string;
    nombre_de_tours: number;
    particularites: string;
    record_de_circuit: string;
    recordman_circuit: string;
    image_circuit: string;
}

export interface Meeting {
    id: Key | null | undefined;
    meeting_key: number;
    meeting_name: string;
    year: number;
    // Ajoutez d'autres propriétés si nécessaire
}