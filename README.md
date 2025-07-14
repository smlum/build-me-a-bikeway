# Build me a Bikeway
A web app to help Montrealers request new cycling infrastructure.

The app lets users click on a map to select a segment of the road network that they'd like to request new cycling infrastructure on. It then connects them with contact details for their local official and helps to construct an email template for requesting the new infrastructure.

## Features

- **Interactive Map:** Click on a road segment to display its name and the corresponding administrative boundary.
- **Local Official Lookup:** Uses a GeoJSON file for administrative boundaries and a JSON file (converted from CSV) for contact information.
- **Pre-generated Email Template:** Provides a draft email that users can customize. The template includes dynamic placeholders for the road name, admin boundary, and desired bike infrastructure type.
- **Copy-to-Clipboard Functionality:** A button copies the email text.

## Roadmap

- Create a form for users to fill out requests
  - Questions like: what type of infrastructure would you like? 
- Develop functionality to view crowd sourced collective infrastructure requests (votes) 
   - e.g., see how many users have voted for improved infrastructure on a particular segment
   - Requires some sort of user validation to ensure the same user can't make multiple votes for the same 
- Develop user accounts
   - Interface for logic/ account setup
   - Database to securely store user login/ account details
   - Interface to view previous requests
 - Add FAQ/ definitions for cycle infrastructure

## Setup

## Design inspiration

- [Montreal bike network map](https://services.montreal.ca/en/maps/bike-paths)
- [Hoodmaps](https://hoodmaps.com/new-york-city-neighborhood-map)

