let map = null;
let soloPathLayers = [];
let sharedPathLayer = null;
let markers = [];
let pinMode = { active: false, type: null, callback: null };
let activeFormPins = { pickup: null, dropoff: null };

export function initMap() {
    map = L.map('map').setView([28.6139, 77.2090], 12);
    
    // High contrast light tiles with clear road labels and geometries
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO'
    }).addTo(map);

    map.on('click', (e) => {
        if (pinMode.active && pinMode.callback) {
            const lat = e.latlng.lat;
            const lon = e.latlng.lng;
            
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`)
                .then(r => r.json())
                .then(data => {
                    const label = data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : 'Dropped Pin';
                    pinMode.callback({ lat, lon, label });
                    
                    if (activeFormPins[pinMode.type]) {
                        map.removeLayer(activeFormPins[pinMode.type]);
                    }
                    
                    const m = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();
                    activeFormPins[pinMode.type] = m;
                    
                    // Reset mode
                    pinMode.active = false;
                    document.getElementById('map').style.cursor = '';
                });
        }
    });
}

export function startPinPlacement(type, callback) {
    pinMode = { active: true, type, callback };
    document.getElementById('map').style.cursor = 'crosshair';
}

export function drawSoloRoute(intent, color) {
    if (intent.routeGeometry) {
        clearMarkers();
        const latlngs = intent.routeGeometry.map(c => [c[1], c[0]]);
        const polyline = L.polyline(latlngs, { color: color, weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(map);
        
        // Add duration tooltip
        const durationMins = Math.round(intent.soloDurationSec / 60);
        polyline.bindTooltip(`${durationMins} mins solo route`, { permanent: true, direction: 'center', className: 'solo-tooltip' }).openTooltip();
        
        soloPathLayers.push(polyline);
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        
        // Draw 1 & 2 sequence markers
        [{lat: intent.pickupLat, lon: intent.pickupLon}, {lat: intent.dropoffLat, lon: intent.dropoffLon}].forEach((wp, idx) => {
            const icon = L.divIcon({
                className: 'solo-marker',
                html: `<div style="background-color:${color}; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);">${idx + 1}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            const marker = L.marker([wp.lat, wp.lon], { icon }).addTo(map);
            markers.push(marker);
        });
    }
}

export function drawSharedRoute(geometry, waypointsArray) {
    if (sharedPathLayer) map.removeLayer(sharedPathLayer);
    clearMarkers();
    
    const latlngs = geometry.map(c => [c[1], c[0]]);
    sharedPathLayer = L.polyline(latlngs, { color: '#9d4edd', weight: 6, opacity: 0.9 }).addTo(map);
    map.fitBounds(sharedPathLayer.getBounds(), { padding: [50, 50] });
    
    // Draw numbered sequence markers
    if (waypointsArray) {
        waypointsArray.forEach((wp, idx) => {
            const icon = L.divIcon({
                className: 'sequence-marker',
                html: `<div style="background-color:#9d4edd; color:white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:bold; border:3px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.4);">${idx + 1}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });
            const marker = L.marker([wp.lat, wp.lon], { icon }).addTo(map);
            markers.push(marker);
        });
    }
}

export function clearAllRoutes() {
    soloPathLayers.forEach(l => map.removeLayer(l));
    soloPathLayers = [];
    if (sharedPathLayer) {
        map.removeLayer(sharedPathLayer);
        sharedPathLayer = null;
    }
    clearMarkers();
}

function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}

export function clearFormPins() {
    if (activeFormPins.pickup) map.removeLayer(activeFormPins.pickup);
    if (activeFormPins.dropoff) map.removeLayer(activeFormPins.dropoff);
    activeFormPins = { pickup: null, dropoff: null };
}
