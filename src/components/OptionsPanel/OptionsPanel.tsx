import { useAppContext } from '../../context/AppContext';
import type { LocationType, EventType, IndividualRole } from '../../types';
import './OptionsPanel.css';

const locationTypeLabels: Record<LocationType, string> = {
  crime_scene: 'Crime Scene',
  suspect_residence: 'Suspect Residence',
  witness_residence: 'Witness Residence',
  victim_residence: 'Victim Residence',
  business: 'Business',
  public_place: 'Public Place',
  vehicle_location: 'Vehicle Location',
  meeting_point: 'Meeting Point',
  evidence_location: 'Evidence Location'
};

const eventTypeLabels: Record<EventType, string> = {
  meeting: 'Meeting',
  transaction: 'Transaction',
  communication: 'Communication',
  arrest: 'Arrest',
  incident: 'Incident',
  surveillance: 'Surveillance',
  interview: 'Interview',
  evidence_collection: 'Evidence Collection'
};

const roleLabels: Record<IndividualRole, string> = {
  suspect: 'Suspect',
  witness: 'Witness',
  victim: 'Victim',
  person_of_interest: 'Person of Interest',
  informant: 'Informant',
  law_enforcement: 'Law Enforcement'
};

export function OptionsPanel() {
  const {
    cases,
    filters,
    setSelectedCases,
    setSelectedLocationTypes,
    setSelectedEventTypes,
    setSelectedIndividualRoles
  } = useAppContext();

  const handleCaseToggle = (caseId: string) => {
    const newSelection = filters.selectedCaseIds.includes(caseId)
      ? filters.selectedCaseIds.filter(id => id !== caseId)
      : [...filters.selectedCaseIds, caseId];
    setSelectedCases(newSelection);
  };

  const handleLocationTypeToggle = (type: LocationType) => {
    const newSelection = filters.selectedLocationTypes.includes(type)
      ? filters.selectedLocationTypes.filter(t => t !== type)
      : [...filters.selectedLocationTypes, type];
    setSelectedLocationTypes(newSelection);
  };

  const handleEventTypeToggle = (type: EventType) => {
    const newSelection = filters.selectedEventTypes.includes(type)
      ? filters.selectedEventTypes.filter(t => t !== type)
      : [...filters.selectedEventTypes, type];
    setSelectedEventTypes(newSelection);
  };

  const handleRoleToggle = (role: IndividualRole) => {
    const newSelection = filters.selectedIndividualRoles.includes(role)
      ? filters.selectedIndividualRoles.filter(r => r !== role)
      : [...filters.selectedIndividualRoles, role];
    setSelectedIndividualRoles(newSelection);
  };

  const clearAllFilters = () => {
    setSelectedCases([]);
    setSelectedLocationTypes([]);
    setSelectedEventTypes([]);
    setSelectedIndividualRoles([]);
  };

  return (
    <div className="options-panel">
      <div className="options-header">
        <h2>Filters</h2>
        <button className="clear-btn" onClick={clearAllFilters}>Clear All</button>
      </div>

      <div className="filter-section">
        <h3>Cases</h3>
        <div className="filter-list">
          {cases.map(caseItem => (
            <label key={caseItem.id} className="filter-item">
              <input
                type="checkbox"
                checked={filters.selectedCaseIds.includes(caseItem.id)}
                onChange={() => handleCaseToggle(caseItem.id)}
              />
              <span className={`status-badge ${caseItem.status}`}>{caseItem.status}</span>
              {caseItem.name}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Location Types</h3>
        <div className="filter-list">
          {(Object.keys(locationTypeLabels) as LocationType[]).map(type => (
            <label key={type} className="filter-item">
              <input
                type="checkbox"
                checked={filters.selectedLocationTypes.includes(type)}
                onChange={() => handleLocationTypeToggle(type)}
              />
              {locationTypeLabels[type]}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Event Types</h3>
        <div className="filter-list">
          {(Object.keys(eventTypeLabels) as EventType[]).map(type => (
            <label key={type} className="filter-item">
              <input
                type="checkbox"
                checked={filters.selectedEventTypes.includes(type)}
                onChange={() => handleEventTypeToggle(type)}
              />
              {eventTypeLabels[type]}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Individual Roles</h3>
        <div className="filter-list">
          {(Object.keys(roleLabels) as IndividualRole[]).map(role => (
            <label key={role} className="filter-item">
              <input
                type="checkbox"
                checked={filters.selectedIndividualRoles.includes(role)}
                onChange={() => handleRoleToggle(role)}
              />
              {roleLabels[role]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
