export interface PRTAlert {
  id: string;
  domain: string;
  keyword: string;
  combinacion?: string;
  url?: string;
  alertPosition: number;
  day?: number | string;
  week?: number | string;
  month?: number | string;
  threeMonths?: number | string;
  sixMonths?: number | string;
  volumen?: string;
  currentPosition?: number;
  status: 'pending' | 'checking' | 'recovered-top10' | 'recovered-top100' | 'still-down-top10' | 'still-down-top100' | 'error';
  lastChecked?: Date;
  extraColumns?: string[];
  urlTermId?: string | number;
  urlId?: string | number;
  history?: { date: string; rank: number; url?: string }[];
}

export interface PRTRankingResponse {
  data: {
    term_id: number;
    url: string;
    term: string;
    rankings: {
      google?: {
        day: number;
      };
    };
  }[];
}
