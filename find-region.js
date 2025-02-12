
let adminBoundaries = null;

// Load the admin boundaries GeoJSON file
fetch("data/admin_boundaries.geojson")
    .then(response => response.json())
    .then(data => {
        adminBoundaries = data;
        console.log("Admin boundaries loaded:", adminBoundaries);
    })
    .catch(error => console.error("Error loading admin boundaries:", error));

// Load the contact list JSON and store it in a global variable
let contactList = null;
fetch("data/contact_list.json")
    .then(response => response.json())
    .then(data => {
        contactList = data;
        console.log("Contact List loaded:", contactList);
    })
    .catch(error => console.error("Error loading contact list:", error));

// Assuming adminBoundaries is already loaded as shown before
// and Turf.js is available for spatial queries

map.on('click', (e) => {
    try {
        const features = map.queryRenderedFeatures(e.point, { layers: roadLayers });
        if (features.length > 0) {
            const road = features[0];
            console.log("Clicked Road Feature:", road);
            const roadName = findRoadName(road, e);
            console.log("Detected Road Name:", roadName);

            // Get the admin boundary for the clicked point
            const pt = turf.point([e.lngLat.lng, e.lngLat.lat]);
            let adminName = "";
            let boundaryFound = false;
            if (adminBoundaries && adminBoundaries.features) {
                for (const feature of adminBoundaries.features) {
                    if (turf.booleanPointInPolygon(pt, feature)) {
                        adminName = feature.properties.NOM_OFFICIEL;
                        console.log("Admin Official Name:", adminName);
                        boundaryFound = true;
                        break;
                    }
                }
            }
            if (!boundaryFound) {
                console.log("No admin boundary found at this location.");
                return;
            }

            // Lookup the contact info based on Arrondissement matching the adminName
            let matchingContact = null;
            if (contactList) {
                matchingContact = contactList.find(contact =>
                    contact.Arrondissement.trim().toLowerCase() === adminName.trim().toLowerCase()
                );
            }

            // Update the email template and contact info if a matching contact is found
            const subjectContentEl = document.getElementById('subject-content');
            const contactGreeting = document.getElementById('contact-greeting');
            const roadNameSpan = document.getElementById('road-name');
            const adminBoundarySpan = document.getElementById('admin-boundary');

            // Update the subject line dynamically
            subjectContentEl.textContent = `New Bikeway Request for ${roadName}`;

            // Update road name and admin boundary details in the email template
            roadNameSpan.textContent = roadName;
            adminBoundarySpan.textContent = adminName;

            // Update and reveal the contact info section if we have a matching contact
            const contactInfoDiv = document.getElementById('contact-info');
            if (matchingContact) {
                contactInfoDiv.style.display = 'block';

                // Update the local mayor hyperlink with the name and URL
                const contactLink = document.getElementById('contact-link');
                contactLink.textContent = `${matchingContact.Genre} ${matchingContact.Nom}`;
                contactLink.href = matchingContact["URL source"];

                // Update the email link (using mailto:)
                const contactEmailLink = document.getElementById('contact-email-link');
                contactEmailLink.textContent = matchingContact.Courriel;
                contactEmailLink.href = `mailto:${matchingContact.Courriel}`;

                // Update the phone link (using tel:)
                const contactPhoneLink = document.getElementById('contact-phone-link');
                contactPhoneLink.textContent = matchingContact.phone;
                contactPhoneLink.href = `tel:${matchingContact.phone}`;

                // Also update the salutation in the email template
                contactGreeting.textContent = `${matchingContact.Genre} ${matchingContact.Nom}`;
            } else {
                contactInfoDiv.style.display = 'none';
            }

            // (Optional) Highlight the clicked road segment
            const closestSegmentFeature = findClosestSegment(road, e.lngLat);
            if (!closestSegmentFeature) {
                console.warn("No valid road segment found for highlighting.");
                return;
            }
            map.getSource("highlighted-road").setData({
                type: "FeatureCollection",
                features: [closestSegmentFeature]
            });
        }
    } catch (err) {
        console.error("Error in click event:", err);
    }
    // After dynamically updating the sidebar content:
    window.dispatchEvent(new Event('resize'));

});


