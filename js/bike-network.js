document.addEventListener("DOMContentLoaded", function () {
    const bikeNetworkURL = "data/bikenetwork.geojson";

    const colorMap = {
        'Protected lane': "#035D29",  // Bike Path + Cycle Track
        'Local street bikeway': "#34C759",
        'Multi-use path': "#FF9500",
        'Painted bike lane': "#F17069",
        'Gravel trail': "#A2845E",    // Non-Conforming Trail
        'Shared road': "#D3D3D3"      // Non-Conforming Other + Major Road
    };

    map.on('load', () => {
        map.addSource("bike-network", {
            type: "geojson",
            data: bikeNetworkURL
        });

        map.addLayer({
            id: "bike-network-layer",
            type: "line",
            source: "bike-network",
            paint: {
                "line-color": [
                    "match",
                    ["get", "CBICS_infr"],
                    ["Bike Path", "Cycle Track"], colorMap["Protected lane"],
                    "Local Street Bikeway", colorMap["Local street bikeway"],
                    "Multi-Use Path", colorMap["Multi-use path"],
                    "Painted Bike Lane", colorMap["Painted bike lane"],
                    "Non-Conforming Trail", colorMap["Gravel trail"],
                    ["Non-Conforming Other", "Non-Conforming Major Road"], colorMap["Shared road"],
                    "#CCCCCC"
                ],
                "line-width": 2
            }
        });

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
