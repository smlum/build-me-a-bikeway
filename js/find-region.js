
let adminBoundaries = null;
let contactList = null;
let dataLoaded = 0;

function onDataLoaded() {
    dataLoaded++;
    if (dataLoaded === 2) {
        document.getElementById('map-loading').style.display = 'none';
    }
}

fetch("data/admin_boundaries.geojson")
    .then(r => r.json())
    .then(data => { adminBoundaries = data; onDataLoaded(); })
    .catch(err => { console.error("Error loading admin boundaries:", err); onDataLoaded(); });

fetch("data/contact_list.json")
    .then(r => r.json())
    .then(data => { contactList = data; onDataLoaded(); })
    .catch(err => { console.error("Error loading contact list:", err); onDataLoaded(); });

document.addEventListener("DOMContentLoaded", () => {
    // Dropdown → email template
    const select = document.getElementById('infra-type-select');
    const infraSpan = document.getElementById('infrastructure-type');
    select.addEventListener('change', () => {
        infraSpan.textContent = select.value;
    });

    // Close button — also restores the hint
    document.getElementById('sheet-close').addEventListener('click', () => {
        document.getElementById('bottom-sheet').classList.remove('open');
        document.getElementById('map-hint').classList.remove('hidden');
    });
});

map.on('click', (e) => {
    try {
        const features = map.queryRenderedFeatures(e.point, { layers: roadLayers });
        if (features.length === 0) return;

        const road = features[0];
        const roadName = findRoadName(road, e);

        const pt = turf.point([e.lngLat.lng, e.lngLat.lat]);
        let adminName = null;

        if (adminBoundaries && adminBoundaries.features) {
            for (const feature of adminBoundaries.features) {
                if (turf.booleanPointInPolygon(pt, feature)) {
                    adminName = feature.properties.NOM_OFFICIEL;
                    break;
                }
            }
        }

        if (!adminName) return;

        const matchingContact = contactList
            ? contactList.find(c => c.Arrondissement.trim().toLowerCase() === adminName.trim().toLowerCase())
            : null;

        // Populate sheet header
        document.getElementById('sheet-road-name').textContent = roadName;
        document.getElementById('sheet-borough').textContent = adminName;

        // Populate email template
        document.getElementById('subject-content').textContent = `Bikeway Request — ${roadName}`;
        document.getElementById('road-name').textContent = roadName;
        document.getElementById('admin-boundary').textContent = adminName;

        // Populate contact info
        if (matchingContact) {
            document.getElementById('contact-info').style.display = 'block';

            const contactLink = document.getElementById('contact-link');
            contactLink.textContent = `${matchingContact.Genre} ${matchingContact.Nom}`;
            contactLink.href = matchingContact["URL source"];

            const contactEmailLink = document.getElementById('contact-email-link');
            contactEmailLink.textContent = matchingContact.Courriel;
            contactEmailLink.href = `mailto:${matchingContact.Courriel}`;

            const contactPhoneLink = document.getElementById('contact-phone-link');
            contactPhoneLink.textContent = matchingContact.phone;
            contactPhoneLink.href = `tel:${matchingContact.phone}`;

            document.getElementById('contact-greeting').textContent = `${matchingContact.Genre} ${matchingContact.Nom}`;
        } else {
            document.getElementById('contact-info').style.display = 'none';
        }

        // Highlight the clicked road segment
        const closestSegmentFeature = findClosestSegment(road, e.lngLat);
        if (closestSegmentFeature) {
            map.getSource("highlighted-road").setData({
                type: "FeatureCollection",
                features: [closestSegmentFeature]
            });
        }

        // Open the sheet and hide the hint
        document.getElementById('bottom-sheet').classList.add('open');
        document.getElementById('map-hint').classList.add('hidden');

    } catch (err) {
        console.error("Error in click event:", err);
    }
});
