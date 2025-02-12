

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/positron',
    center: [-73.5673, 45.5017],
    zoom: 11
});

const roadLayers = ["highway_minor", "highway_major_inner", "highway_major_subtle", "highway_motorway_inner"];
const nameLayers = ["highway-name-minor", "highway-name-major"];
const infoBox = document.getElementById("info-box");

map.on('load', () => {
    console.log("Map loaded successfully!");
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
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    return Math.sqrt((lon1 - lon2) ** 2 + (lat1 - lat2) ** 2);
}

function findClosestSegment(feature, clickLngLat) {
    let closestSegment = null;
    let minDistance = Infinity;

    if (feature.geometry.type === "MultiLineString") {
        for (const segment of feature.geometry.coordinates) {
            if (segment.length < 2) continue;

            const firstCoord = segment[0];
            const lastCoord = segment[segment.length - 1];

            if (!firstCoord || !lastCoord) continue; // Ensure valid coordinates

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
        geometry: {
            type: "LineString",
            coordinates: closestSegment
        },
        properties: feature.properties
    } : null;
}

function findRoadName(road, e) {
    try {
        // Expand search area slightly
        const nameFeatures = map.queryRenderedFeatures(
            [[e.point.x - 10, e.point.y - 10], [e.point.x + 10, e.point.y + 10]],
            { layers: nameLayers }
        );

        if (nameFeatures.length > 0) {
            console.log("Found Name Layer Features:", nameFeatures);
            return nameFeatures[0].properties.name || "Unknown Road";
        }

        // Try querying near the road midpoint
        const firstCoord = road.geometry.coordinates[0];
        const lastCoord = road.geometry.coordinates[road.geometry.coordinates.length - 1];

        if (!firstCoord || !lastCoord) return "Unknown Road"; // Prevent NaN issues

        const midpoint = map.project([
            (firstCoord[0] + lastCoord[0]) / 2,
            (firstCoord[1] + lastCoord[1]) / 2
        ]);

        const midpointNameFeatures = map.queryRenderedFeatures(midpoint, { layers: nameLayers });
        if (midpointNameFeatures.length > 0) {
            console.log("Found Midpoint Name Layer Features:", midpointNameFeatures);
            return midpointNameFeatures[0].properties.name || "Unknown Road";
        }
    } catch (err) {
        console.error("Error finding road name:", err);
    }

    return "Unknown Road";
}


// map.on('click', (e) => {
//     try {
//         const features = map.queryRenderedFeatures(e.point, { layers: roadLayers });
//         if (features.length > 0) {

//             const road = features[0];
//             console.log("Clicked Road Feature:", road);

//             const roadName = findRoadName(road, e);
//             console.log("Detected Road Name:", roadName);

//             const closestSegmentFeature = findClosestSegment(road, e.lngLat);

//             if (!closestSegmentFeature) {
//                 console.warn("No valid road segment found for highlighting.");
//                 return;
//             }

//             infoBox.innerHTML = `<strong>Road Name:</strong> ${roadName} <br> <strong>Type:</strong> ${road.properties.class || "Unknown"}`;
//             infoBox.style.display = "block";

//             map.getSource("highlighted-road").setData({
//                 type: "FeatureCollection",
//                 features: [closestSegmentFeature]
//             });
//         }
//     } catch (err) {
//         console.error("Error in click event:", err);
//     }
// });


document.addEventListener("DOMContentLoaded", function () {
    const dropdownBtn = document.querySelector(".dropdown-btn");
    const dropdownContent = document.querySelector(".dropdown-content");

    dropdownBtn.addEventListener("click", function () {
        dropdownContent.classList.toggle("show");

        if (dropdownContent.classList.contains("show")) {
            dropdownBtn.innerHTML = "🛠 How It Works ▲";
            dropdownContent.style.maxHeight = dropdownContent.scrollHeight + "px"; // Auto expand
        } else {
            dropdownBtn.innerHTML = "🛠 How It Works ▼";
            dropdownContent.style.maxHeight = "0px"; // Collapse
        }
    });
});


