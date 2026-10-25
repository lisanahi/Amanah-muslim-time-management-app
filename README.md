# Sakinah — Salah-centered daily planner

A responsive daily time-management app built with React, TypeScript and Vite. It uses a fixed-position 12-hour circular timeline: as each hour passes, the hour 12 hours ahead replaces it in the same position. Prayer markers and activities are shown only when they fall in the visible window.

## Run

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. For a production build, run `npm run build`.

## Features

- Live clock and 12-hour circular timeline with upcoming hours, prayer markers and activity arcs
- Prayer times fetched from AlAdhan by city/country and selected calculation method
- Location and calculation-method settings
- Add, edit, complete and delete activities, including activities that cross midnight
- Daily schedule, activity duration and remaining time
- Date navigation and a time-preview mode to demonstrate the rolling timeline
- Responsive desktop and mobile layout
- Browser localStorage persistence for settings and activities

## Notes and limitations

- An internet connection is required to retrieve prayer times. Times are not guaranteed to match local mosque schedules, especially at high latitudes. Users choose their own calculation method.
- Activities are a repeating daily plan stored in this browser, not cloud-synced. They are not tied to specific dates.
- The date navigator displays prayer times for the selected day. To preview the clock for another date, enable **Test et tidspunkt**.
- Overlapping activities are displayed on the same ring and may visually overlap.
- This is a school-project prototype, not a source of authoritative religious timings.
