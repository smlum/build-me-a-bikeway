

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

// ==========================================================
// AUTHENTICATION LOGIC - UPDATED FOR DYNAMIC UI
// ==========================================================

const authBtn = document.getElementById('auth-btn');
const authModal = document.getElementById('auth-modal');
const closeBtn = document.querySelector('.modal-content .close-btn');

const loggedOutView = document.getElementById('logged-out-view');
const loggedInView = document.getElementById('logged-in-view');
const currentUsernameSpan = document.getElementById('current-username');

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const protectedButton = document.getElementById('protectedButton');
const logoutButton = document.getElementById('logoutButton');

// Function to toggle UI based on login state
function toggleAuthState() {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        // User is logged in
        authBtn.textContent = 'Profile'; // Change button text
        loggedOutView.style.display = 'none';
        loggedInView.style.display = 'block';

        // Decode the token to get the username
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUsernameSpan.textContent = payload.username;
    } else {
        // User is logged out
        authBtn.textContent = 'Log In / Register';
        loggedOutView.style.display = 'block';
        loggedInView.style.display = 'none';

        // Hide the modal after logout
        authModal.style.display = 'none';
    }
}

// Initial UI setup on page load
toggleAuthState();

// Show the modal
authBtn.addEventListener('click', () => {
    authModal.style.display = 'flex';
});

// Hide the modal
closeBtn.addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Hide modal if user clicks outside of the content
window.addEventListener('click', (event) => {
    if (event.target === authModal) {
        authModal.style.display = 'none';
    }
});

// --- User Registration Logic ---
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById('registerUsername');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await axios.post('http://localhost:3000/api/register', { username, email, password });
        alert('Registration successful! You can now log in.');
        usernameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        alert('Registration failed: ' + (error.response ? error.response.data.message : 'Server error'));
    }
});


// --- User Login Logic ---
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const response = await axios.post('http://localhost:3000/api/login', { username, password });
        localStorage.setItem('jwtToken', response.data.token);
        toggleAuthState(); // Update the UI after successful login
        alert('Login successful!');
    } catch (error) {
        alert('Login failed: ' + (error.response ? error.response.data.message : 'Server error'));
    }
});


// --- Log Out Logic ---
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('jwtToken');
    toggleAuthState(); // Update the UI after logout
    alert('You have been logged out.');
});

// --- Logic for Accessing a Protected Route ---
protectedButton.addEventListener('click', async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert('You must be logged in to access this resource.');
        return;
    }

    try {
        const response = await axios.get('http://localhost:3000/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Protected data accessed: ' + JSON.stringify(response.data));
    } catch (error) {
        alert('Failed to access protected resource: ' + (error.response ? error.response.data.message : 'Server error'));
    }
});
