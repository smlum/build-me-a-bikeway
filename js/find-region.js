
const CBICS_MAP = {
    'Bike Path':                { label: 'Protected lane',       color: '#035D29' },
    'Cycle Track':              { label: 'Protected lane',       color: '#035D29' },
    'Local Street Bikeway':     { label: 'Local street bikeway', color: '#34C759' },
    'Multi-Use Path':           { label: 'Multi-use path',       color: '#FF9500' },
    'Painted Bike Lane':        { label: 'Painted bike lane',    color: '#F17069' },
    'Non-Conforming Trail':     { label: 'Gravel trail',         color: '#A2845E' },
    'Non-Conforming Other':     { label: 'Shared road',          color: '#D3D3D3' },
    'Non-Conforming Major Road':{ label: 'Shared road',          color: '#D3D3D3' },
};

function getExistingInfra(e) {
    const bikeFeatures = map.queryRenderedFeatures(
        [[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]],
        { layers: ['bike-network-layer'] }
    );
    if (bikeFeatures.length === 0) return null;
    return CBICS_MAP[bikeFeatures[0].properties.CBICS_infr] || null;
}

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
    const sheet = document.getElementById('bottom-sheet');
    const overlay = document.getElementById('map-overlay');
    const hint = document.getElementById('map-hint');

    function openSheet() {
        sheet.classList.add('open');
        sheet.classList.remove('peek');
        overlay.classList.add('visible');
        hint.classList.add('hidden');
    }

    function peekSheet() {
        sheet.classList.add('peek');
        sheet.classList.remove('open');
        overlay.classList.remove('visible');
    }

    function closeSheet() {
        sheet.classList.remove('open', 'peek');
        overlay.classList.remove('visible');
        hint.classList.remove('hidden');
    }

    // Expose so the map click handler can call openSheet
    window._sheetControls = { openSheet, peekSheet, closeSheet };

    // Clicking the map overlay → peek
    overlay.addEventListener('click', peekSheet);

    // Handle toggles between open ↔ peek
    document.querySelector('.sheet-handle').addEventListener('click', (e) => {
        e.stopPropagation();
        if (sheet.classList.contains('open')) peekSheet();
        else if (sheet.classList.contains('peek')) openSheet();
    });

    // Clicking the sheet body while peeking → expand
    sheet.addEventListener('click', () => {
        if (sheet.classList.contains('peek')) openSheet();
    });

    // Close button → dismiss entirely
    document.getElementById('sheet-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeSheet();
    });

    // Dropdown → email template
    const select = document.getElementById('infra-type-select');
    const infraSpan = document.getElementById('infrastructure-type');
    select.addEventListener('change', () => {
        infraSpan.textContent = select.value;
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

        // Show existing infrastructure (or None)
        const existing = getExistingInfra(e);
        const dot = document.getElementById('existing-infra-dot');
        const valueEl = document.getElementById('existing-infra-value');
        if (existing) {
            valueEl.textContent = existing.label;
            dot.style.background = existing.color;
            dot.style.display = 'inline-block';
        } else {
            valueEl.textContent = 'None';
            dot.style.display = 'none';
        }

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

        // Open sheet (uses shared controls once DOM is ready)
        if (window._sheetControls) window._sheetControls.openSheet();

    } catch (err) {
        console.error("Error in click event:", err);
    }
});
