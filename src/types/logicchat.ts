export interface IMLogicSettingsData {
  id: string;
  name: string;
  horse_weight: number;
  jockey_weight: number;
  item_weights: {
    '1_distance_aptitude': number;
    '2_bloodline_evaluation': number;
    '3_jockey_compatibility': number;
    '4_trainer_evaluation': number;
    '5_track_aptitude': number;
    '6_weather_aptitude': number;
    '7_popularity_factor': number;
    '8_weight_impact': number;
    '9_horse_weight_impact': number;
    '10_corner_specialist': number;
    '11_margin_analysis': number;
    '12_time_index': number;
  };
}

export interface LogicChatSessionMeta {
  id: string;
  venue: string;
  race_number: number;
  race_name: string;
  horses: string[];
  jockeys: string[];
  posts: number[];
  horse_numbers: number[];
  locked_at?: string;
}

export interface AnalysisResult {
  analysis_type: 'imlogic' | 'viewlogic';
  timestamp: string;
  results?: Array<{
    rank: number;
    horse_number: number;
    lane: number;
    racer: string;
    branch?: string;
    total_score: number | null;
    data_status?: 'ok' | 'no_data';
  }>;
  summary?: {
    top_racer: {
      name: string;
      score: number;
    };
    score_distribution: {
      highest: number;
      lowest: number;
      average: number;
    };
  };
  error?: string;
}
