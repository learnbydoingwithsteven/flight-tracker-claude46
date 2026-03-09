import * as THREE from 'three';

const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 1; // unit sphere

/**
 * Convert lat/lon/altitude to a THREE.Vector3 on the globe.
 * Altitude is in meters; we scale it so 12 000 m ≈ 0.03 units above surface.
 */
export function latLonAltToVector3(lat, lon, altMeters = 0, radius = EARTH_RADIUS) {
    const altScale = altMeters / 400000; // exaggerate a bit so planes are visible
    const r = radius + altScale;
    const phi = (90 - lat) * DEG2RAD;
    const theta = (lon + 180) * DEG2RAD;

    return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
    );
}

/**
 * Get a quaternion that orients a plane icon tangent to the globe
 * and pointing along its heading.
 */
export function headingToQuaternion(heading, lat, lon) {
    const pos = latLonAltToVector3(lat, lon, 0);
    const up = pos.clone().normalize();

    // North tangent at this point
    const north = new THREE.Vector3(0, 1, 0);
    const east = new THREE.Vector3().crossVectors(north, up).normalize();
    const northTangent = new THREE.Vector3().crossVectors(up, east).normalize();

    // Rotate heading around the up axis
    const headingRad = -heading * DEG2RAD;
    const forward = new THREE.Vector3()
        .addScaledVector(northTangent, Math.cos(headingRad))
        .addScaledVector(east, Math.sin(headingRad))
        .normalize();

    const right = new THREE.Vector3().crossVectors(forward, up).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(right, forward).normalize();

    const m = new THREE.Matrix4();
    m.makeBasis(right, correctedUp, forward.negate());
    return new THREE.Quaternion().setFromRotationMatrix(m);
}

/**
 * Altitude (meters) → color for the altitude gradient.
 * Low (0) = cyan, mid (6000) = blue/violet, high (12000+) = rose/red
 */
export function altitudeToColor(altMeters) {
    const t = Math.min(altMeters / 13000, 1);

    if (t < 0.33) {
        const s = t / 0.33;
        return new THREE.Color().lerpColors(
            new THREE.Color(0x22d3ee), // cyan
            new THREE.Color(0x3b82f6), // blue
            s
        );
    } else if (t < 0.66) {
        const s = (t - 0.33) / 0.33;
        return new THREE.Color().lerpColors(
            new THREE.Color(0x3b82f6), // blue
            new THREE.Color(0x8b5cf6), // violet
            s
        );
    } else {
        const s = (t - 0.66) / 0.34;
        return new THREE.Color().lerpColors(
            new THREE.Color(0x8b5cf6), // violet
            new THREE.Color(0xf43f5e), // rose
            s
        );
    }
}

/**
 * Lerp two Vector3 positions.
 */
export function lerpVector3(a, b, t) {
    return new THREE.Vector3().lerpVectors(a, b, Math.max(0, Math.min(1, t)));
}
