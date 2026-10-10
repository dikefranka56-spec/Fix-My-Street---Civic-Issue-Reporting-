# FixMyStreet — Community Issue Reporting Dashboard

FixMyStreet is a responsive civic-tech frontend concept that helps people explore neighbourhood issues such as potholes, overflowing waste bins, broken streetlights, and damaged walkways. The interface demonstrates how reports can be submitted, browsed on a map, searched, filtered, and tracked through simple status labels.

## Why this project matters

Public problems are easier to discuss when residents can describe them clearly and see their status. This project explores a user-centred reporting flow designed for mobile-first use and community transparency.

## Features

- Responsive desktop and mobile layouts
- Interactive OpenStreetMap map using Leaflet
- Report creation form with validation and optional photo attachment
- Search by issue title, location, category, description, or report ID
- Filters for report status and issue category
- Expandable report details and status labels
- Dashboard statistics that update from local demo reports
- Browser `localStorage` persistence for reports
- Keyboard support for report cards and `Ctrl/Cmd + K` to focus search
- Accessible labels, focus states, and reduced-motion support

## Built with

- HTML5
- CSS3 (responsive layout, custom components, accessible states)
- Vanilla JavaScript (DOM events, filtering, localStorage, form handling)
- Leaflet.js
- OpenStreetMap tiles

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a browser. For best results, use a local server such as the VS Code Live Server extension.
3. Keep an internet connection available for the web fonts, Leaflet library, and map tiles.

## Deploy with GitHub Pages

1. Create a public GitHub repository, for example `fixmystreet-frontend`.
2. Upload the contents of this folder to the repository root. `index.html` must be at the root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/(root)`, then save.
6. Open the published URL shown by GitHub Pages.

## Important scope and limitations

This is a **frontend portfolio demo**, not a live civic reporting service. Sample reports and locations are illustrative and must not be treated as verified incidents. New reports are saved only in the current browser using `localStorage`; they are not sent to a council, authority, or server and are not shared with other visitors. The map and external fonts require internet access.

A production version would need a secure backend API, a database, authentication and abuse prevention where appropriate, server-side validation, image storage, real geolocation, moderation, and integrations with the responsible local authorities. It should also include a privacy policy and clear consent before collecting precise location or personal information.

## Suggested next improvements

- Add a backend API and database for shared reports
- Add moderation and duplicate-report detection
- Add secure user accounts and report history
- Add image upload to managed storage with file validation
- Add map-based location selection and geocoding
- Add tests for filtering, validation, and persistence
- Add automated deployment and accessibility checks

## Author

**Dike Frankjacob Chizurumoke**  
Frontend Development Portfolio Project
