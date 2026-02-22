# Investigative Visualization Tool

A web-based visualization tool for investigative agencies that displays case data on an interactive map interface with network graph analysis capabilities.

## Features

- **Interactive Map (Panel 2a)**: Displays locations of interest with custom markers indicating location types (crime scenes, residences, businesses, etc.)
- **Timeline Controls (Panel 2b)**: Date range picker and time slider to filter data by specific time periods
- **Network Graph (Panel 3)**: Visualizes relationships between individuals involved in investigations
- **Filter Panel (Panel 1)**: Filter data by case, location type, event type, and individual role

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leaflet-prototype
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- **React** with TypeScript
- **Vite** for build tooling
- **Leaflet** / react-leaflet for map visualization
- **D3.js** for network graph visualization
- **react-datepicker** for date selection

## Project Structure

```
src/
├── components/
│   ├── MapPanel/        # Map visualization component
│   ├── NetworkGraph/    # D3.js network graph component
│   ├── OptionsPanel/    # Filter controls
│   └── TimelineControls/# Date pickers and slider
├── context/
│   └── AppContext.tsx   # Global state management
├── services/
│   └── dataService.ts   # Data loading utilities
├── types/
│   └── index.ts         # TypeScript interfaces
└── App.tsx              # Main application component

public/
└── data/                # Static JSON data files
    ├── cases.json
    ├── events.json
    ├── individuals.json
    ├── locations.json
    └── relationships.json
```

## Data Model

- **Cases**: Investigation cases with related locations, events, and individuals
- **Locations**: Geographic points of interest with coordinates
- **Events**: Time-stamped activities (meetings, transactions, etc.)
- **Individuals**: People involved in investigations (suspects, witnesses, victims)
- **Relationships**: Connections between individuals

## Usage

1. Use the **Options Panel** on the left to filter data by case, location type, event type, or individual role
2. The **Map** displays filtered locations with color-coded markers by type
3. Click on map markers to see location details in a popup
4. Adjust the **Timeline Controls** to filter events by time period
5. The **Network Graph** shows individuals connected to locations visible on the map
6. Click on network nodes to pan the map to that individual's associated locations

## License

This project is for internal use within investigative agencies.
