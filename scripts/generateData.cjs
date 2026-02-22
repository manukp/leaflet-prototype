const fs = require('fs');
const path = require('path');

// City coordinates
const cities = {
  phoenix: { lat: 33.4484, lng: -112.0740, name: 'Phoenix, AZ' },
  losAngeles: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
  tucson: { lat: 32.2226, lng: -110.9747, name: 'Tucson, AZ' }
};

// Helper functions
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

const locationTypes = ['crime_scene', 'suspect_residence', 'witness_residence', 'victim_residence', 'business', 'public_place', 'vehicle_location', 'meeting_point', 'evidence_location'];
const eventTypes = ['meeting', 'transaction', 'communication', 'arrest', 'incident', 'surveillance', 'interview', 'evidence_collection'];
const individualRoles = ['suspect', 'witness', 'victim', 'person_of_interest', 'informant', 'law_enforcement'];
const relationshipTypes = ['suspect-victim', 'witness-suspect', 'witness-victim', 'associate', 'family', 'employer-employee', 'business_partner', 'known_contact'];

const firstNames = ['James', 'Maria', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'William', 'Linda', 'David', 'Elizabeth', 'Carlos', 'Sofia', 'Daniel', 'Ana', 'Jose', 'Carmen', 'Juan', 'Rosa', 'Luis', 'Teresa', 'Miguel', 'Laura', 'Antonio', 'Gloria', 'Francisco', 'Alicia', 'Ricardo', 'Sandra', 'Eduardo', 'Martha'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Washington Blvd', 'Lincoln Ave', 'Jefferson St', 'Roosevelt Dr', 'Central Ave', 'Broadway', 'Park Ave', 'Market St', 'Industrial Blvd', 'Commerce Way', 'Desert View Rd', 'Cactus Dr', 'Sunset Blvd', 'Palm Ave'];

const businessNames = ['Desert Auto Parts', 'Valley Electronics', 'Southwest Trading Co', 'Cactus Bar & Grill', 'Sun City Warehouse', 'Mesa Storage', 'Phoenix Imports', 'LA Tech Solutions', 'Tucson Logistics', 'Border Supply Co'];

// Generate 15 cases
function generateCases() {
  const caseNames = [
    'Operation Desert Storm', 'The Martinez Conspiracy', 'Cross-Border Ring', 'Phoenix Rising',
    'LA Connection', 'Tucson Triangle', 'Highway 10 Network', 'The Garcia Family Case',
    'Southwest Syndicate', 'Valley Fraud Scheme', 'Border Town Investigation', 'The Warehouse Heist',
    'Digital Trail Case', 'The Informant Network', 'Operation Sunset'
  ];

  return caseNames.map((name, i) => ({
    id: `case-${String(i + 1).padStart(3, '0')}`,
    name,
    description: `Investigation into ${name.toLowerCase()} involving multiple suspects and locations across the Southwest region.`,
    status: i < 10 ? 'open' : (i < 13 ? 'pending' : 'closed'),
    startDate: new Date(2024, randomInt(0, 11), randomInt(1, 28)).toISOString(),
    endDate: i >= 13 ? new Date(2025, randomInt(0, 11), randomInt(1, 28)).toISOString() : undefined,
    locationIds: [],
    eventIds: [],
    individualIds: []
  }));
}

// Generate 150 locations
function generateLocations(cases) {
  const locations = [];
  const cityKeys = Object.keys(cities);

  for (let i = 0; i < 150; i++) {
    const cityKey = cityKeys[i % 3];
    const city = cities[cityKey];
    const locType = locationTypes[i % locationTypes.length];
    const streetNum = randomInt(100, 9999);
    const street = randomElement(streetNames);

    let name;
    if (locType === 'business') {
      name = randomElement(businessNames);
    } else if (locType === 'crime_scene') {
      name = `Crime Scene #${i + 1}`;
    } else {
      name = `${streetNum} ${street}`;
    }

    const assignedCases = randomElements(cases, randomInt(1, 3));

    locations.push({
      id: `loc-${String(i + 1).padStart(3, '0')}`,
      name,
      type: locType,
      description: `${locType.replace(/_/g, ' ')} location in ${city.name}`,
      geoLocation: {
        latitude: city.lat + randomBetween(-0.15, 0.15),
        longitude: city.lng + randomBetween(-0.15, 0.15)
      },
      address: `${streetNum} ${street}, ${city.name}`,
      relatedEventIds: [],
      relatedIndividualIds: [],
      caseIds: assignedCases.map(c => c.id)
    });
  }
  return locations;
}

// Generate 100 individuals
function generateIndividuals(cases) {
  const individuals = [];

  for (let i = 0; i < 100; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const role = individualRoles[i % individualRoles.length];
    const assignedCases = randomElements(cases, randomInt(1, 3));

    individuals.push({
      id: `ind-${String(i + 1).padStart(3, '0')}`,
      name: `${firstName} ${lastName}`,
      role,
      description: `${role.replace(/_/g, ' ')} in ongoing investigations`,
      alias: i % 5 === 0 ? `"${randomElement(['Shadow', 'Ghost', 'Runner', 'Doc', 'Slim', 'Boss', 'Kid', 'Red', 'Blue', 'Ace'])}"` : undefined,
      relatedEventIds: [],
      relatedLocationIds: [],
      caseIds: assignedCases.map(c => c.id)
    });
  }
  return individuals;
}

// Generate 300 events
function generateEvents(cases, locations, individuals) {
  const events = [];
  const eventDescriptions = {
    meeting: 'Observed meeting between subjects',
    transaction: 'Financial transaction recorded',
    communication: 'Intercepted communication',
    arrest: 'Subject taken into custody',
    incident: 'Incident reported at location',
    surveillance: 'Surveillance operation conducted',
    interview: 'Subject interviewed by investigators',
    evidence_collection: 'Evidence collected from scene'
  };

  for (let i = 0; i < 300; i++) {
    const eventType = eventTypes[i % eventTypes.length];
    const location = locations[i % locations.length];
    const assignedIndividuals = randomElements(individuals.filter(ind =>
      ind.caseIds.some(cid => location.caseIds.includes(cid))
    ), randomInt(1, 4));

    if (assignedIndividuals.length === 0) {
      assignedIndividuals.push(randomElement(individuals));
    }

    const timestamp = new Date(2024, randomInt(0, 11), randomInt(1, 28), randomInt(0, 23), randomInt(0, 59));

    events.push({
      id: `evt-${String(i + 1).padStart(3, '0')}`,
      name: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} #${i + 1}`,
      type: eventType,
      description: eventDescriptions[eventType],
      timestamp: timestamp.toISOString(),
      locationId: location.id,
      relatedIndividualIds: assignedIndividuals.map(ind => ind.id),
      caseIds: location.caseIds
    });
  }
  return events;
}

// Generate relationships
function generateRelationships(individuals, cases) {
  const relationships = [];
  let relId = 1;

  // Create relationships based on roles
  const suspects = individuals.filter(i => i.role === 'suspect');
  const victims = individuals.filter(i => i.role === 'victim');
  const witnesses = individuals.filter(i => i.role === 'witness');

  // Suspect-victim relationships
  suspects.forEach(suspect => {
    const matchingVictims = victims.filter(v =>
      v.caseIds.some(cid => suspect.caseIds.includes(cid))
    );
    matchingVictims.slice(0, 2).forEach(victim => {
      relationships.push({
        id: `rel-${String(relId++).padStart(3, '0')}`,
        sourceIndividualId: suspect.id,
        targetIndividualId: victim.id,
        relationshipType: 'suspect-victim',
        description: 'Suspect linked to victim in case',
        caseIds: suspect.caseIds.filter(cid => victim.caseIds.includes(cid)),
        eventIds: []
      });
    });
  });

  // Witness-suspect relationships
  witnesses.forEach(witness => {
    const matchingSuspects = suspects.filter(s =>
      s.caseIds.some(cid => witness.caseIds.includes(cid))
    );
    matchingSuspects.slice(0, 1).forEach(suspect => {
      relationships.push({
        id: `rel-${String(relId++).padStart(3, '0')}`,
        sourceIndividualId: witness.id,
        targetIndividualId: suspect.id,
        relationshipType: 'witness-suspect',
        description: 'Witness identified suspect',
        caseIds: witness.caseIds.filter(cid => suspect.caseIds.includes(cid)),
        eventIds: []
      });
    });
  });

  // Associate relationships between suspects
  for (let i = 0; i < suspects.length - 1; i++) {
    if (suspects[i].caseIds.some(cid => suspects[i + 1].caseIds.includes(cid))) {
      relationships.push({
        id: `rel-${String(relId++).padStart(3, '0')}`,
        sourceIndividualId: suspects[i].id,
        targetIndividualId: suspects[i + 1].id,
        relationshipType: 'associate',
        description: 'Known associates',
        caseIds: suspects[i].caseIds.filter(cid => suspects[i + 1].caseIds.includes(cid)),
        eventIds: []
      });
    }
  }

  return relationships;
}

// Update cross-references
function updateReferences(cases, locations, events, individuals, relationships) {
  // Update locations with event and individual references
  events.forEach(event => {
    const location = locations.find(l => l.id === event.locationId);
    if (location && !location.relatedEventIds.includes(event.id)) {
      location.relatedEventIds.push(event.id);
    }
    event.relatedIndividualIds.forEach(indId => {
      if (location && !location.relatedIndividualIds.includes(indId)) {
        location.relatedIndividualIds.push(indId);
      }
    });
  });

  // Update individuals with event and location references
  events.forEach(event => {
    event.relatedIndividualIds.forEach(indId => {
      const individual = individuals.find(i => i.id === indId);
      if (individual) {
        if (!individual.relatedEventIds.includes(event.id)) {
          individual.relatedEventIds.push(event.id);
        }
        if (!individual.relatedLocationIds.includes(event.locationId)) {
          individual.relatedLocationIds.push(event.locationId);
        }
      }
    });
  });

  // Update cases with all references
  cases.forEach(caseObj => {
    caseObj.locationIds = locations.filter(l => l.caseIds.includes(caseObj.id)).map(l => l.id);
    caseObj.eventIds = events.filter(e => e.caseIds.includes(caseObj.id)).map(e => e.id);
    caseObj.individualIds = individuals.filter(i => i.caseIds.includes(caseObj.id)).map(i => i.id);
  });
}

// Main execution
const cases = generateCases();
const locations = generateLocations(cases);
const individuals = generateIndividuals(cases);
const events = generateEvents(cases, locations, individuals);
const relationships = generateRelationships(individuals, cases);

updateReferences(cases, locations, events, individuals, relationships);

// Write files
const dataDir = path.join(__dirname, '..', 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'cases.json'), JSON.stringify(cases, null, 2));
fs.writeFileSync(path.join(dataDir, 'locations.json'), JSON.stringify(locations, null, 2));
fs.writeFileSync(path.join(dataDir, 'events.json'), JSON.stringify(events, null, 2));
fs.writeFileSync(path.join(dataDir, 'individuals.json'), JSON.stringify(individuals, null, 2));
fs.writeFileSync(path.join(dataDir, 'relationships.json'), JSON.stringify(relationships, null, 2));

console.log('Data generation complete!');
console.log(`Cases: ${cases.length}`);
console.log(`Locations: ${locations.length}`);
console.log(`Events: ${events.length}`);
console.log(`Individuals: ${individuals.length}`);
console.log(`Relationships: ${relationships.length}`);
