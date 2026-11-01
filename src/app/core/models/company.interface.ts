export interface Company {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface CompanyDetails extends Company {
  description: string;
  headquarters: string;
  homepage: string;
  parent_company: Company | null;
}

export interface CompanyResponse {
  page: number;
  results: Company[];
  total_pages: number;
  total_results: number;
}
