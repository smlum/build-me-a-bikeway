# Build me a Bikeway
A web app to help Montrealers request new cycling infrastructure.

Click a road on the map to get your local official's contact info and generate a ready-to-send email asking for better bike infrastructure.

## Running locally

Requires [Node.js](https://nodejs.org).

```bash
npm install
npm start
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

> `npm start` uses `http-server` to serve the files statically. You need this because the app loads local GeoJSON files via `fetch`, which browsers block when opening `index.html` directly from the filesystem.

## Features

- **Interactive map** — click any road to identify it and its arrondissement
- **Local official lookup** — surfaces the relevant borough mayor's name, email, and phone
- **Email template** — pre-filled with road name, borough, and official's name, ready to copy
- **Existing bike network overlay** — shows Montreal's current cycling infrastructure by type

## Roadmap

- Infrastructure type dropdown in the email template
- French language support
- Mobile layout
- Crowdsourced request voting (how many people want a bikeway on a given segment)
- User accounts and request history

## Design inspiration

- [Montreal bike network map](https://services.montreal.ca/en/maps/bike-paths)
- [Hoodmaps](https://hoodmaps.com/new-york-city-neighborhood-map)

