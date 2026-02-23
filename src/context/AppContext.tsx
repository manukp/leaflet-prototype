import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  Case, Location, Event, Individual, Relationship,
  FilterState, MapBounds, LocationType, EventType, IndividualRole
} from '../types';
import { loadAllData } from '../services/dataService';

interface AppContextType {
  // Data
  cases: Case[];
  locations: Location[];
  events: Event[];
  individuals: Individual[];
  relationships: Relationship[];
  loading: boolean;

  // Filters
  filters: FilterState;
  setSelectedCases: (caseIds: string[]) => void;
  setSelectedLocationTypes: (types: LocationType[]) => void;
  setSelectedEventTypes: (types: EventType[]) => void;
  setSelectedIndividualRoles: (roles: IndividualRole[]) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  setCurrentTimePoint: (time: Date | null) => void;

  // Map state
  mapBounds: MapBounds | null;
  setMapBounds: (bounds: MapBounds | null) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;

  // Selection state
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  selectedIndividualId: string | null;
  setSelectedIndividualId: (id: string | null) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  // Computed/filtered data
  filteredLocations: Location[];
  filteredEvents: Event[];
  filteredIndividuals: Individual[];
  visibleIndividuals: Individual[];

  // Actions
  panToIndividual: (individualId: string) => void;
  panToLocationCallback: ((lat: number, lng: number) => void) | null;
  setPanToLocationCallback: (callback: ((lat: number, lng: number) => void) | null) => void;
}

const defaultFilters: FilterState = {
  selectedCaseIds: [],
  selectedLocationTypes: [],
  selectedEventTypes: [],
  selectedIndividualRoles: [],
  dateRange: { start: null, end: null },
  currentTimePoint: null
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // Data state
  const [cases, setCases] = useState<Case[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Map state
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [mapZoom, setMapZoom] = useState(6);

  // Selection state
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedIndividualId, setSelectedIndividualId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Pan callback
  const [panToLocationCallback, setPanToLocationCallback] = useState<((lat: number, lng: number) => void) | null>(null);

  // Load data on mount
  useEffect(() => {
    loadAllData().then(data => {
      setCases(data.cases);
      setLocations(data.locations);
      setEvents(data.events);
      setIndividuals(data.individuals);
      setRelationships(data.relationships);

      // Set initial date range from events
      const timestamps = data.events.map(e => new Date(e.timestamp).getTime());
      const minDate = new Date(Math.min(...timestamps));
      const maxDate = new Date(Math.max(...timestamps));
      setFilters(prev => ({
        ...prev,
        dateRange: { start: minDate, end: maxDate },
        currentTimePoint: maxDate
      }));

      setLoading(false);
    });
  }, []);

  // Filter setters
  const setSelectedCases = useCallback((caseIds: string[]) => {
    setFilters(prev => ({ ...prev, selectedCaseIds: caseIds }));
  }, []);

  const setSelectedLocationTypes = useCallback((types: LocationType[]) => {
    setFilters(prev => ({ ...prev, selectedLocationTypes: types }));
  }, []);

  const setSelectedEventTypes = useCallback((types: EventType[]) => {
    setFilters(prev => ({ ...prev, selectedEventTypes: types }));
  }, []);

  const setSelectedIndividualRoles = useCallback((roles: IndividualRole[]) => {
    setFilters(prev => ({ ...prev, selectedIndividualRoles: roles }));
  }, []);

  const setDateRange = useCallback((start: Date | null, end: Date | null) => {
    setFilters(prev => ({ ...prev, dateRange: { start, end } }));
  }, []);

  const setCurrentTimePoint = useCallback((time: Date | null) => {
    setFilters(prev => ({ ...prev, currentTimePoint: time }));
  }, []);

  // Computed filtered data
  const filteredEvents = events.filter(evt => {
    // Case filter
    if (filters.selectedCaseIds.length > 0) {
      if (!evt.caseIds.some(cid => filters.selectedCaseIds.includes(cid))) return false;
    }
    // Event type filter
    if (filters.selectedEventTypes.length > 0) {
      if (!filters.selectedEventTypes.includes(evt.type)) return false;
    }
    // Time filters
    if (filters.currentTimePoint) {
      const eventTime = new Date(evt.timestamp).getTime();
      if (eventTime > filters.currentTimePoint.getTime()) return false;
    }
    if (filters.dateRange.start) {
      const eventTime = new Date(evt.timestamp).getTime();
      if (eventTime < filters.dateRange.start.getTime()) return false;
    }
    return true;
  });

  // Get location IDs and individual IDs that have events within the filtered time range
  const locationIdsWithFilteredEvents = new Set(filteredEvents.map(evt => evt.locationId));
  const individualIdsWithFilteredEvents = new Set(
    filteredEvents.flatMap(evt => evt.relatedIndividualIds)
  );

  const filteredLocations = locations.filter(loc => {
    // Case filter - if cases selected, location must belong to one of them
    if (filters.selectedCaseIds.length > 0) {
      if (!loc.caseIds.some(cid => filters.selectedCaseIds.includes(cid))) return false;
    }
    // Location type filter
    if (filters.selectedLocationTypes.length > 0) {
      if (!filters.selectedLocationTypes.includes(loc.type)) return false;
    }
    // Time filter - only apply if no specific case is selected
    // When a case is selected, show all locations for that case regardless of time
    if (filters.selectedCaseIds.length === 0) {
      if (!locationIdsWithFilteredEvents.has(loc.id)) return false;
    }
    return true;
  });

  const filteredIndividuals = individuals.filter(ind => {
    // Case filter - if cases selected, individual must belong to one of them
    if (filters.selectedCaseIds.length > 0) {
      if (!ind.caseIds.some(cid => filters.selectedCaseIds.includes(cid))) return false;
    }
    // Role filter
    if (filters.selectedIndividualRoles.length > 0) {
      if (!filters.selectedIndividualRoles.includes(ind.role)) return false;
    }
    // Time filter - only apply if no specific case is selected
    // When a case is selected, show all individuals for that case regardless of time
    if (filters.selectedCaseIds.length === 0) {
      if (!individualIdsWithFilteredEvents.has(ind.id)) return false;
    }
    return true;
  });

  // Visible individuals based on map bounds
  const visibleIndividuals = filteredIndividuals.filter(ind => {
    if (!mapBounds) return true;

    // Get locations associated with this individual
    const indLocations = filteredLocations.filter(loc =>
      loc.relatedIndividualIds.includes(ind.id)
    );

    // Check if any of their locations are within map bounds
    return indLocations.some(loc => {
      const { latitude, longitude } = loc.geoLocation;
      return (
        latitude >= mapBounds.south &&
        latitude <= mapBounds.north &&
        longitude >= mapBounds.west &&
        longitude <= mapBounds.east
      );
    });
  });

  // Pan to individual's associated location
  const panToIndividual = useCallback((individualId: string) => {
    const individual = individuals.find(i => i.id === individualId);
    if (!individual || !panToLocationCallback) return;

    // Find first associated location
    const locationId = individual.relatedLocationIds[0];
    if (!locationId) return;

    const location = locations.find(l => l.id === locationId);
    if (!location) return;

    panToLocationCallback(location.geoLocation.latitude, location.geoLocation.longitude);
  }, [individuals, locations, panToLocationCallback]);

  const value: AppContextType = {
    cases,
    locations,
    events,
    individuals,
    relationships,
    loading,
    filters,
    setSelectedCases,
    setSelectedLocationTypes,
    setSelectedEventTypes,
    setSelectedIndividualRoles,
    setDateRange,
    setCurrentTimePoint,
    mapBounds,
    setMapBounds,
    mapZoom,
    setMapZoom,
    selectedLocationId,
    setSelectedLocationId,
    selectedIndividualId,
    setSelectedIndividualId,
    selectedEventId,
    setSelectedEventId,
    filteredLocations,
    filteredEvents,
    filteredIndividuals,
    visibleIndividuals,
    panToIndividual,
    panToLocationCallback,
    setPanToLocationCallback
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
