export type Sport = "basketball" | "soccer" | "tennis" | "volleyball" | "pickleball";

export interface Venue {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  sports: Sport[];
  description: string;
  priceRange: string;
  phone: string;
  website: string;
  indoor: boolean;
  courtCount: number;
}

export interface Lead {
  id: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  sport: Sport;
  preferredDate: string;
  preferredTime: string;
  groupSize: number;
  message: string;
  venueId: string | null;
  createdAt: string;
  matchedVenueIds: string[];
  unlockedByVenueIds: string[];
}

export interface LeadRequest {
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  sport: Sport;
  preferredDate: string;
  preferredTime: string;
  groupSize: number;
  message: string;
  venueId: string | null;
}
