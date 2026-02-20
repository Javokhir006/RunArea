/**
 * RunArea - Fitness Tracker Core Logic
 * Senior Frontend Developer Implementation
 */

// --- Configuration & State ---
const FERGANA_COORDS = [40.3833, 71.7833];
const MAP_ZOOM = 15;

let map;
let pathPolyline;
let watchId = null;
let runCoords = [];
let isTracking = false;

// --- DOM Elements ---
const startBtn = document.getElementById('start-btn');
const distanceEl = document.getElementById('distance');
const durationEl = document.getElementById('duration');

// --- Initialization ---
function initMap() {
    // Initialize Leaflet map
    map = L.map('map').setView(FERGANA_COORDS, MAP_ZOOM);

    // Add OpenStreetMap tiles (Dark Mode variant via CartoDB)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Initialize the polyline for the running path
    pathPolyline = L.polyline([], {
        color: '#39ff14', // Neon Green
        weight: 5,
        opacity: 0.8,
        lineJoin: 'round'
    }).addTo(map);
}

// --- Tracking Logic ---
function toggleTracking() {
    if (!isTracking) {
        startTracking();
    } else {
        stopTracking();
    }
}

function startTracking() {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }

    // Reset State
    runCoords = [];
    pathPolyline.setLatLngs([]);
    isTracking = true;
    startBtn.textContent = "Stop Run";
    startBtn.style.backgroundColor = "#ff4444"; // Visual feedback for stop

    // Start watching position
    watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
}

function stopTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    
    isTracking = false;
    startBtn.textContent = "Start Run";
    startBtn.style.backgroundColor = ""; // Revert to CSS default
    alert("Run finished! Path saved to map.");
}

function handleSuccess(position) {
    const { latitude, longitude, accuracy } = position.coords;
    const newPos = [latitude, longitude];

    // Log coordinates
    runCoords.push(newPos);

    // Update Polyline
    pathPolyline.setLatLngs(runCoords);

    // Center Map on User
    map.setView(newPos, map.getZoom());

    // Update UI Stats (Distance calculation)
    updateStats();
}

function handleError(error) {
    console.error(`Error (${error.code}): ${error.message}`);
    let msg = "Could not get your location.";
    
    if (error.code === 1) msg = "Please enable location permissions to track your run.";
    if (error.code === 3) msg = "GPS signal timed out.";
    
    alert(msg);
    stopTracking();
}

// --- Helper Functions ---
function updateStats() {
    if (runCoords.length < 2) return;

    let totalDistance = 0;
    for (let i = 0; i < runCoords.length - 1; i++) {
        const p1 = L.latLng(runCoords[i]);
        const p2 = L.latLng(runCoords[i+1]);
        totalDistance += p1.distanceTo(p2); // Returns meters
    }

    // Convert to KM and update UI
    const km = (totalDistance / 1000).toFixed(2);
    distanceEl.textContent = km;
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', initMap);
startBtn.addEventListener('click', toggleTracking);