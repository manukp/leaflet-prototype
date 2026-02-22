// Data model interfaces for the investigative visualization tool

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export type LocationType =
  | 'crime_scene'
  | 'suspect_residence'
  | 'witness_residence'
  | 'victim_residence'
  | 'business'
  | 'public_place'
  | 'vehicle_location'
  | 'meeting_point'
  | 'evidence_location';

export type EventType =
  | 'meeting'
  | 'transaction'
  | 'communication'
  | 'arrest'
  | 'incident'
  | 'surveillance'
  | 'interview'
  | 'evidence_collection';

export type IndividualRole =
  | 'suspect'
  | 'witness'
  | 'victim'
  | 'person_of_interest'
  | 'informant'
  | 'law_enforcement';

export type RelationshipType =
  | 'suspect-victim'
  | 'witness-suspect'
  | 'witness-victim'
  | 'associate'
  | 'family'
  | 'employer-employee'
  | 'business_partner'
  | 'known_contact';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  geoLocation: GeoLocation;
  address?: string;
  relatedEventIds: string[];
  relatedIndividualIds: string[];
  caseIds: string[];
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  description: string;
  timestamp: string; // ISO 8601 format
  locationId: string;
  relatedIndividualIds: string[];
  caseIds: string[];
}

export interface Individual {
  id: string;
  name: string;
  role: IndividualRole;
  description: string;
  alias?: string;
  relatedEventIds: string[];
  relatedLocationIds: string[];
  caseIds: string[];
}

export interface Relationship {
  id: string;
  sourceIndividualId: string;
  targetIndividualId: string;
  relationshipType: RelationshipType;
  description?: string;
  caseIds: string[];
  eventIds?: string[];
}

export interface Case {
  id: string;
  name: string;
  description: string;
  status: 'open' | 'closed' | 'pending';
  startDate: string; // ISO 8601 format
  endDate?: string;
  locationIds: string[];
  eventIds: string[];
  individualIds: string[];
}

// Filter state interface
export interface FilterState {
  selectedCaseIds: string[];
  selectedLocationTypes: LocationType[];
  selectedEventTypes: EventType[];
  selectedIndividualRoles: IndividualRole[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  currentTimePoint: Date | null;
}

// Map bounds interface for tracking visible area
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Application state interface
export interface AppState {
  cases: Case[];
  locations: Location[];
  events: Event[];
  individuals: Individual[];
  relationships: Relationship[];
  filters: FilterState;
  mapBounds: MapBounds | null;
  mapZoom: number;
  selectedLocationId: string | null;
  selectedIndividualId: string | null;
  selectedEventId: string | null;
}
