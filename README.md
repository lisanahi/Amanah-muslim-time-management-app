# Amanah – Salah-Centered Time Management

Amanah is a Salah (prayer) centered time management web application that helps Muslims organize their daily activities around prayer times.
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

Prerequisites: Node.js and npm
Install dependencies and start the development server:
npm install
npm run dev

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

## Development Process
The development followed an iterative AI-assisted workflow:
1. Define the intended functionality and requirements.
2. Generate or modify implementations with AI assistance.
3. Integrate and test the changes locally.
4. Identify unexpected behavior and refine the solution through further prompts.
A key challenge was ensuring accurate positioning of time-based elements on the circular clock, particularly across midnight and during transitions between displayed hours.
AI-generated solutions required multiple iterations and testing to achieve the intended behavior.

## Academic Context
This project was developed for a university assignment investigating the practical use of generative AI in application development.
The project explores both the capabilities and limitations of AI-generated code, with an emphasis on iterative development, testing, and human oversight.


