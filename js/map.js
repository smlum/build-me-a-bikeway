
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
    const refPt = turf.point([e.lngLat.lng, e.lngLat.lat]);

    // Road geometry features (transportation layer) carry no name properties —
    // names live in the separate transportation_name source layer.
    // querySourceFeatures reads loaded tile data regardless of zoom or label visibility.
    try {
        const style = map.getStyle();
        const nameDef = style.layers.find(l => nameLayers.includes(l.id));

        if (nameDef) {
            const candidates = map.querySourceFeatures(nameDef.source, {
                sourceLayer: nameDef['source-layer']
            });

            let bestName = null;
            let minDist = Infinity;

            for (const f of candidates) {
                const name = f.properties.name_fr || f.properties.name || f.properties.name_en || f.properties.ref;
                if (!name) continue;

                try {
                    // nearestPointOnLine gives true perpendicular distance,
                    // preventing parallel streets from matching
                    const nearest = turf.nearestPointOnLine(f, refPt);
                    const dist = nearest.properties.dist;
                    if (dist < minDist) {
                        minDist = dist;
                        bestName = name;
                    }
                } catch {}
            }

            if (bestName && minDist < 0.05) return bestName; // within 50m
        }
    } catch (err) {
        console.error("Error querying source features for road name:", err);
    }

    // Fallback: rendered label query (works when labels are visible)
    try {
        const nameFeatures = map.queryRenderedFeatures(
            [[e.point.x - 10, e.point.y - 10], [e.point.x + 10, e.point.y + 10]],
            { layers: nameLayers }
        );
        if (nameFeatures.length > 0) {
            const n = nameFeatures[0].properties;
            return n.name_fr || n.name || n.name_en || "Unnamed road";
        }
    } catch (err) {
        console.error("Error finding road name:", err);
    }

    return "Unnamed road";
}
