
export interface SeriesCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface SeriesCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface SeriesCredits {
  id: number;
  cast: SeriesCastMember[];
  crew: SeriesCrewMember[];
}
