
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [-73.5673, 45.5017],
    zoom: 11
});

const roadLayers = ["highway_minor", "highway_major_inner", "highway_major_subtle", "highway_motorway_inner"];
const nameLayers = ["highway-name-minor", "highway-name-major"];

map.on('load', () => {
    map.addSource("highlighted-road", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
    });

    map.addLayer({
        id: "highlighted-road-layer",
        type: "line",
        source: "highlighted-road",
        paint: {
            "line-color": "#ff0000",
            "line-width": 4
        }
    });
});

function getDistance(coord1, coord2) {
    if (!Array.isArray(coord1) || !Array.isArray(coord2)) return Infinity;
    return turf.distance(turf.point(coord1), turf.point(coord2));
}

function findClosestSegment(feature, clickLngLat) {
    let closestSegment = null;
    let minDistance = Infinity;

    if (feature.geometry.type === "MultiLineString") {
        for (const segment of feature.geometry.coordinates) {
            if (segment.length < 2) continue;

            const firstCoord = segment[0];
            const lastCoord = segment[segment.length - 1];

            if (!firstCoord || !lastCoord) continue;

            const midpoint = [
                (firstCoord[0] + lastCoord[0]) / 2,
                (firstCoord[1] + lastCoord[1]) / 2
            ];

            const distance = getDistance(midpoint, [clickLngLat.lng, clickLngLat.lat]);

            if (distance < minDistance) {
                minDistance = distance;
                closestSegment = segment;
            }
        }
    } else {
        closestSegment = feature.geometry.coordinates;
    }

    return closestSegment ? {
        type: "Feature",
        geometry: { type: "LineString", coordinates: closestSegment },
        properties: feature.properties
    } : null;
}

function findRoadName(road, e) {
    // Road vector tiles carry the name directly — works at any zoom level
    if (road.properties && road.properties.name) {
        return road.properties.name;
    }

    try {
        const nameFeatures = map.queryRenderedFeatures(
            [[e.point.x - 10, e.point.y - 10], [e.point.x + 10, e.point.y + 10]],
            { layers: nameLayers }
        );

        if (nameFeatures.length > 0) {
            return nameFeatures[0].properties.name || "Unknown Road";
        }

        const firstCoord = road.geometry.coordinates[0];
        const lastCoord = road.geometry.coordinates[road.geometry.coordinates.length - 1];

        if (!firstCoord || !lastCoord) return "Unknown Road";

        const midpoint = map.project([
            (firstCoord[0] + lastCoord[0]) / 2,
            (firstCoord[1] + lastCoord[1]) / 2
        ]);

        const midpointNameFeatures = map.queryRenderedFeatures(midpoint, { layers: nameLayers });
        if (midpointNameFeatures.length > 0) {
            return midpointNameFeatures[0].properties.name || "Unknown Road";
        }
    } catch (err) {
        console.error("Error finding road name:", err);
    }

    return "Unknown Road";
}
