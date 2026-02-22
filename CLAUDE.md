## Project Overview
This is a prototype of a visualization tool for an investigative agency. It is a web-based application
that uses a map interface to display various data points related to investigations, such as locations of interest, timelines of events, and connections between individuals. The tool is designed to help investigators quickly identify patterns and relationships in their data, ultimately aiding in the resolution of cases.

## Requirements
- Data for the application will be provided in the form of static JSON files, which will include information about locations, events, and individuals involved in investigations. The application should be able to read this data and display it in an intuitive and interactive manner on the map interface.
- All Data objects must have a geo-location and a timestamp to allow for accurate mapping and timeline visualization.
- Data objects include:
  - Locations: Points of interest such as crime scenes, suspect residences, and other relevant locations.
  - Events: Incidents or activities that are relevant to the investigation, such as meetings, transactions, or communications.
  - Individuals: People involved in the investigation, including suspects, witnesses, and victims. The data object for an individual need not have a geo-location or a timestamp, but it should have a unique identifier that can be used to link it to events and locations.
- The web application must have 3 panels side by side (panel 1 to 3 from left to right):
  - Panel 1: An options panel that allows users to filter and customize the data displayed on the map, timeline, and network graph. Filter options include:
    - Filter by case
    - Filter by location type (crime scene, suspect residence, etc.)
    - Filter by individual role (suspect, witness, victim)
    - Filter by event type
  - Panel 2: Sub-divided into two sections:
    - Section a: A map that displays the locations of interest, with markers indicating the type of location (e.g., crime scene, suspect residence). Users should be able to click on markers to view more information about the location and related events or individuals via a tooltip/popover near the clicked element.
    - Section b: Contains a date picker, a slider and a second date picker, from left to right. The left date picker allows the user to select a start date, while the right date picker allows the user to select an end date. The slider in the middle is a static point-in-time selector (not an animation control) that allows the user to select a specific point in time within the selected date range. As the user adjusts the date pickers and slider, the map and network graph should update to reflect the data relevant to the selected time frame.
  - Panel 3: A network graph that displays individuals involved in the investigation. Nodes in the graph represent individuals. Edges represent obvious/known relationships between individuals (e.g., suspect to victim, witness to suspect) - additional relationships can be added by investigators as they discover them during their investigation. As the user interacts with the date pickers and the slider in Panel 2b, the network graph should update to show relevant individuals and relationships based on the selected time frame. Users should be able to click on nodes and edges in the network graph to view more information via a tooltip/popover. When clicking on an individual node, the map in Panel 2a should pan to show the associated events/locations for that individual.
  - As the user zooms in and out of the map in Panel 2a, the level of detail displayed should adjust accordingly. For example, when zoomed out, only major locations may be shown, while zooming in may reveal more specific details about each location and related events or individuals.
  - Panel 3 must also update dynamically based on the zoom level and visible area of the map in Panel 2a. The network graph should only show individuals who are connected to locations currently visible on the map. As the user zooms in or pans the map, the network graph filters to display only the relevant individuals and their relationships within the visible map area.

## Acceptance Criteria
- The application should successfully read and display data from the provided static JSON files.
- The map should accurately display the locations of interest with appropriate markers, and clicking on these markers should display a tooltip/popover with detailed information about the location and related events or individuals.
- The date pickers and slider should allow users to filter the displayed data based on the selected time frame, and the map and network graph should update accordingly to reflect the relevant data.
- The network graph should clearly illustrate the individuals and their obvious/known relationships, and clicking on nodes and edges should display a tooltip/popover with detailed information. Clicking on an individual node should also pan the map to show the associated events/locations for that individual.
- The network graph should dynamically filter to show only individuals connected to locations currently visible on the map.
- The application should be responsive and user-friendly, allowing investigators to easily navigate and interact with the data visualizations.

## Tech Stack & Architecture Decisions
- Frontend: React with TypeScript for building the user interface, utilizing libraries such as Leaflet for map visualization and D3.js for data visualization.
- Backend: Static JSON files to simulate data retrieval, with the potential for future integration with a real backend API.
- Deployment: The application will be deployed on a static hosting service such as GitHub Pages or Netlify for easy access by investigators.
- State Management: React's built-in state management will be used for managing the application state, with the potential for future integration of a state management library like Redux if the application complexity increases.
- Project Structure: The application will be organized into components based on functionality, with separate folders for components, services (for data fetching), and utilities (for helper functions). This structure will promote modularity and maintainability of the codebase. Create a separate folder for the static JSON files to keep the data organized and easily accessible.
- Create the following JSON data objects:
  - locations.json: Contains an array of location objects, each with properties such as id, name, type (e.g., crime scene, suspect residence), geo-location (latitude and longitude), and related events or individuals.
  - events.json: Contains an array of event objects, each with properties such as id, name, type (e.g., meeting, transaction), timestamp, and related locations or individuals.
  - individuals.json: Contains an array of individual objects, each with properties such as id, name, role (e.g., suspect, witness), and related events or locations.
  - cases.json: Contains an array of case objects, each with properties such as id, name, description, and related locations, events, and individuals. This will allow for better organization and filtering of data based on specific cases.
  - relationships.json: Contains an array of relationship objects defining obvious/known connections between individuals (e.g., suspect to victim, witness to suspect). Each relationship object should have properties such as id, sourceIndividualId, targetIndividualId, relationshipType (e.g., "suspect-victim", "witness-suspect", "associate"), and optionally related case or event IDs.
- Create 15 cases, with interconnected data across the locations, events, and individuals to demonstrate the functionality of the application and provide a rich dataset for testing and exploration.
- Create 150 locations, spread acrose Phoenix, Arizona, LA, California, and Tucson, Arizona, with a mix of crime scenes, suspect residences, and other relevant locations to provide a diverse dataset for the map visualization.
- Create 300 events, with a variety of types (e.g., meetings, transactions, communications) and timestamps to allow for comprehensive testing of the timeline filtering functionality.
- Create 100 individuals, with a mix of suspects, witnesses, and victims, and ensure that they are interconnected with the events and locations to demonstrate the functionality of the network graph and the ability to explore relationships between individuals.
- Create a README file that provides an overview of the project, instructions for setting up and running the application, and any other relevant information for users and developers.

## Coding Conventions
- Use consistent naming conventions for variables, functions, and components (e.g., camelCase for variables and functions, PascalCase for React components).
- Write modular and reusable code by breaking down the application into smaller components and functions.
- Include comments and documentation to explain the purpose and functionality of code sections, especially for complex logic or data transformations.
- Follow best practices for React development, such as using hooks for state and side effects, and avoiding direct manipulation of the DOM.
- Ensure that the code is clean and well-organized, with proper indentation and spacing for readability.

## Out of Scope
- Real-time data updates: The application will not support real-time data updates, as it relies on static JSON files for data.
- User authentication and authorization: The application will not include features for user authentication or role-based access control, as it is intended for use within a secure investigative agency environment.
- Advanced analytics: The application will not include advanced analytics features such as machine learning or predictive modeling, as it is focused on data visualization and exploration rather than data analysis.
