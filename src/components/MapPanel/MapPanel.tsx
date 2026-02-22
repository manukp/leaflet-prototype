import { useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../../context/AppContext';
import type { Location, LocationType } from '../../types';
import 'leaflet/dist/leaflet.css';
import './MapPanel.css';

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons by location type
const markerColors: Record<LocationType, string> = {
  crime_scene: '#e74c3c',
  suspect_residence: '#9b59b6',
  witness_residence: '#3498db',
  victim_residence: '#1abc9c',
  business: '#f39c12',
  public_place: '#95a5a6',
  vehicle_location: '#e67e22',
  meeting_point: '#2ecc71',
  evidence_location: '#c0392b'
};

function createCustomIcon(type: LocationType): L.DivIcon {
  const color = markerColors[type];
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
}

// Component to handle map events
function MapEventHandler() {
  const { setMapBounds, setMapZoom, setPanToLocationCallback } = useAppContext();
  const map = useMap();

  const updateBounds = useCallback(() => {
    const bounds = map.getBounds();
    setMapBounds({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    });
    setMapZoom(map.getZoom());
  }, [map, setMapBounds, setMapZoom]);

  useMapEvents({
    moveend: updateBounds,
    zoomend: updateBounds
  });

  // Set up pan callback
  useEffect(() => {
    const panTo = (lat: number, lng: number) => {
      map.setView([lat, lng], 12);
    };
    setPanToLocationCallback(() => panTo);
    updateBounds();

    return () => setPanToLocationCallback(null);
  }, [map, setPanToLocationCallback, updateBounds]);

  return null;
}

// Location popup content
function LocationPopup({ location }: { location: Location }) {
  const { events, individuals } = useAppContext();

  const relatedEvents = events.filter(e => location.relatedEventIds.includes(e.id));
  const relatedIndividuals = individuals.filter(i => location.relatedIndividualIds.includes(i.id));

  return (
    <div className="location-popup">
      <h3>{location.name}</h3>
      <p className="location-type">{location.type.replace(/_/g, ' ')}</p>
      <p className="location-address">{location.address}</p>
      <p className="location-description">{location.description}</p>

      {relatedEvents.length > 0 && (
        <div className="popup-section">
          <h4>Events ({relatedEvents.length})</h4>
          <ul>
            {relatedEvents.slice(0, 3).map(e => (
              <li key={e.id}>{e.name} - {new Date(e.timestamp).toLocaleDateString()}</li>
            ))}
            {relatedEvents.length > 3 && <li>...and {relatedEvents.length - 3} more</li>}
          </ul>
        </div>
      )}

      {relatedIndividuals.length > 0 && (
        <div className="popup-section">
          <h4>Individuals ({relatedIndividuals.length})</h4>
          <ul>
            {relatedIndividuals.slice(0, 3).map(i => (
              <li key={i.id}>{i.name} ({i.role})</li>
            ))}
            {relatedIndividuals.length > 3 && <li>...and {relatedIndividuals.length - 3} more</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export function MapPanel() {
  const { filteredLocations, loading } = useAppContext();
  const mapRef = useRef<L.Map | null>(null);

  // Center on Southwest US (covers Phoenix, LA, Tucson)
  const center: [number, number] = [33.5, -114.0];
  const defaultZoom = 6;

  if (loading) {
    return <div className="map-loading">Loading map data...</div>;
  }

  return (
    <div className="map-panel">
      <MapContainer
        center={center}
        zoom={defaultZoom}
        className="map-container"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler />

        {filteredLocations.map(location => (
          <Marker
            key={location.id}
            position={[location.geoLocation.latitude, location.geoLocation.longitude]}
            icon={createCustomIcon(location.type)}
          >
            <Popup maxWidth={300}>
              <LocationPopup location={location} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
