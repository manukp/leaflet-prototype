import type { Case, Location, Event, Individual, Relationship } from '../types';

const BASE_URL = '/data';

export async function loadCases(): Promise<Case[]> {
  const response = await fetch(`${BASE_URL}/cases.json`);
  return response.json();
}

export async function loadLocations(): Promise<Location[]> {
  const response = await fetch(`${BASE_URL}/locations.json`);
  return response.json();
}

export async function loadEvents(): Promise<Event[]> {
  const response = await fetch(`${BASE_URL}/events.json`);
  return response.json();
}

export async function loadIndividuals(): Promise<Individual[]> {
  const response = await fetch(`${BASE_URL}/individuals.json`);
  return response.json();
}

export async function loadRelationships(): Promise<Relationship[]> {
  const response = await fetch(`${BASE_URL}/relationships.json`);
  return response.json();
}

export async function loadAllData() {
  const [cases, locations, events, individuals, relationships] = await Promise.all([
    loadCases(),
    loadLocations(),
    loadEvents(),
    loadIndividuals(),
    loadRelationships()
  ]);

  return { cases, locations, events, individuals, relationships };
}
