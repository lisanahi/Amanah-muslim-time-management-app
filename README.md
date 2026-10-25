# Amanah – time management

Amanah is a Salah (prayer) centered time management app that helps Muslims organize their daily activities around prayer times.
The application combines a dynamic 12-hour circular clock, prayer time integration, and an activity planner to provide a visual overview of the day.
Developed as part of a university assignment exploring AI-assisted software development.

## Features

- Dynamic circular clock: Displays a rolling 12-hour window that automatically updates as time progresses, replacing past hours with upcoming ones.
- Prayer time integration: Retrieves prayer times from the AlAdhan API based on the user's location and selected calculation method.
- Activity planning: Create, edit, delete, and complete activities with custom time intervals.
- Visual scheduling: Activities are represented as colored segments on the circular clock, positioned according to their scheduled times.
- Customizable colors: Choose from predefined colors or enter custom HEX values.
- Prayer-related markers: Displays prayer times and the last third of the night.
- Responsive interface: Designed for desktop, tablet, and mobile devices.

## Getting Started

**Prerequisites**: Node.js and npm

Install dependencies and start the development server:

- npm install
- npm run dev

Open the local URL provided by Vite (typically http://localhost:5173).

To create a production build:

npm run build

## AI-Assisted Development

ChatGPT was used throughout the development process, including:
- Architecture and planning: Translating the initial concept into application features and component structures.
- Code generation: Assisting with React, TypeScript, CSS, and SVG implementations.
- Time calculations: Developing the logic for the rolling 12-hour clock and positioning activities and prayer markers.
- API integration: Assisting with retrieving and processing prayer times from AlAdhan.
- Debugging and refinement: Identifying issues, revising implementations, and improving the user interface through iterative feedback.


## Challenges and Reflections
One of the main challenges was implementing the circular clock, particularly converting time values into angular positions and handling transitions across midnight.

Accurately positioning activities and prayer-related markers required several iterations.

While AI accelerated the development process, generated solutions did not always match the intended behavior. Testing, debugging, and clear communication of requirements remained essential.

The project demonstrated both the potential and limitations of AI-assisted software development.


