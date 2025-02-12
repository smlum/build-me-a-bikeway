document.addEventListener("DOMContentLoaded", function () {
    const bikeNetworkURL = "data/bikenetwork.geojson"; // Your local file or hosted URL

    const colorMap = {
        'Bike Path': "#035D29", // Green
        'Cycle Track': "#34C759", // Light Green
        'Local Street Bikeway': "#29B6F6", // Blue
        'Multi-Use Path': "#FF9500", // Orange
        'Painted Bike Lane': "#FF3B30", // Red
        'Non-Conforming Trail': "#A2845E", // Brown
        'Non-Conforming Other': "#8E8E93", // Grey
        'Non-Conforming Major Road': "#48484A", // Dark Grey
    };

    map.on('load', () => {
        // Add the bike network GeoJSON source
        map.addSource("bike-network", {
            type: "geojson",
            data: bikeNetworkURL
        });

        // Add a layer for bike lanes
        map.addLayer({
            id: "bike-network-layer",
            type: "line",
            source: "bike-network",
            paint: {
                "line-color": ["match", ["get", "CBICS_infr"],
                    "Bike Path", colorMap["Bike Path"],
                    "Cycle Track", colorMap["Cycle Track"],
                    "Local Street Bikeway", colorMap["Local Street Bikeway"],
                    "Multi-Use Path", colorMap["Multi-Use Path"],
                    "Painted Bike Lane", colorMap["Painted Bike Lane"],
                    "Non-Conforming Trail", colorMap["Non-Conforming Trail"],
                    "Non-Conforming Other", colorMap["Non-Conforming Other"],
                    "Non-Conforming Major Road", colorMap["Non-Conforming Major Road"],
                    "#CCCCCC" // Default fallback color
                ],
                "line-width": 2
            }
        });

        // Create the legend dynamically
        const legend = document.getElementById("legend");

        for (const [category, color] of Object.entries(colorMap)) {
            const legendItem = document.createElement("div");
            legendItem.className = "legend-item";

            const colorBox = document.createElement("span");
            colorBox.className = "legend-color";
            colorBox.style.backgroundColor = color;

            const label = document.createElement("span");
            label.textContent = category;

            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        }
    });
});
