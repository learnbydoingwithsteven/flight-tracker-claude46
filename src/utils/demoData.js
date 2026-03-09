/**
 * Generate mock flight data for demo/fallback when the OpenSky API is unavailable.
 * Creates realistic-looking aircraft distributed across major flight routes.
 */

const AIRLINES = [
    'DLH', 'BAW', 'AFR', 'KLM', 'UAL', 'DAL', 'AAL', 'SWA', 'RYR', 'EZY',
    'THY', 'SIA', 'CPA', 'QFA', 'ANA', 'JAL', 'CSN', 'CES', 'ACA', 'ETH',
    'UAE', 'QTR', 'SVA', 'ELY', 'TAP', 'SAS', 'FIN', 'LOT', 'AZA', 'IBE',
];

const COUNTRIES = [
    'Germany', 'United Kingdom', 'France', 'Netherlands', 'United States',
    'Turkey', 'Singapore', 'Hong Kong', 'Australia', 'Japan', 'China',
    'Canada', 'Ethiopia', 'United Arab Emirates', 'Qatar', 'Spain', 'Italy',
];

// Major airport hubs (lat, lon) to cluster aircraft around realistic routes
const HUBS = [
    [51.47, -0.46],   // London Heathrow
    [48.35, 11.78],   // Munich
    [49.01, 2.55],    // Paris CDG
    [52.31, 4.76],    // Amsterdam
    [40.64, -73.78],  // New York JFK
    [33.94, -118.41], // Los Angeles
    [41.98, -87.90],  // Chicago
    [25.25, 55.36],   // Dubai
    [1.36, 103.99],   // Singapore
    [35.55, 139.78],  // Tokyo Narita
    [22.31, 113.91],  // Hong Kong
    [-33.95, 151.18], // Sydney
    [41.26, 28.74],   // Istanbul
    [55.97, 37.41],   // Moscow
    [40.47, -3.57],   // Madrid
    [45.46, 9.27],    // Milan
    [37.62, -122.38], // San Francisco
    [33.43, -112.01], // Phoenix
    [25.80, -80.29],  // Miami
    [9.01, 38.80],    // Addis Ababa
];

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function generateFlightNumber(airline) {
    return airline + Math.floor(Math.random() * 9000 + 100);
}

/**
 * Generate a set of demo planes distributed around the globe, 
 * clustered near major hubs with some random scatter.
 */
export function generateDemoPlanes(count = 800) {
    const planes = [];

    for (let i = 0; i < count; i++) {
        // Pick two random hubs and interpolate for a "route"
        const hubFrom = HUBS[Math.floor(Math.random() * HUBS.length)];
        const hubTo = HUBS[Math.floor(Math.random() * HUBS.length)];
        const t = Math.random(); // position along route

        const lat = hubFrom[0] + (hubTo[0] - hubFrom[0]) * t + randomBetween(-5, 5);
        const lon = hubFrom[1] + (hubTo[1] - hubFrom[1]) * t + randomBetween(-5, 5);

        // Calculate heading from hub to hub
        const dLon = hubTo[1] - hubFrom[1];
        const dLat = hubTo[0] - hubFrom[0];
        const heading = ((Math.atan2(dLon, dLat) * 180) / Math.PI + 360) % 360;

        const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];

        planes.push({
            icao24: Math.random().toString(16).substr(2, 6),
            callsign: generateFlightNumber(airline),
            originCountry: country,
            timePosition: Date.now() / 1000,
            lastContact: Date.now() / 1000,
            lon: Math.max(-180, Math.min(180, lon)),
            lat: Math.max(-90, Math.min(90, lat)),
            baroAlt: randomBetween(3000, 12500),
            onGround: false,
            velocity: randomBetween(180, 280), // m/s
            heading: heading + randomBetween(-10, 10),
            verticalRate: randomBetween(-2, 2),
            geoAlt: randomBetween(3000, 12500),
        });
    }

    return planes;
}

/**
 * Slightly perturb existing demo planes to simulate movement.
 */
export function evolveDemoPlanes(planes) {
    return planes.map((p) => ({
        ...p,
        lat: p.lat + (Math.cos((p.heading * Math.PI) / 180) * p.velocity * 10) / 111000,
        lon: p.lon + (Math.sin((p.heading * Math.PI) / 180) * p.velocity * 10) / (111000 * Math.cos((p.lat * Math.PI) / 180)),
        heading: p.heading + randomBetween(-1, 1),
        baroAlt: Math.max(1000, p.baroAlt + randomBetween(-50, 50)),
        geoAlt: Math.max(1000, p.geoAlt + randomBetween(-50, 50)),
        velocity: Math.max(150, p.velocity + randomBetween(-5, 5)),
        lastContact: Date.now() / 1000,
    }));
}
