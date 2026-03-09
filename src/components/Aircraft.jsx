import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useFlightContext } from '../context/FlightContext';
import { latLonAltToVector3, altitudeToColor } from '../utils/geo';

const MAX_INSTANCES = 8000;
const CONE_RADIUS = 0.015;
const CONE_HEIGHT = 0.03;
const POLL_INTERVAL = 10000;

const dummy = new THREE.Object3D();
const tempVec = new THREE.Vector3();
const colorHelper = new THREE.Color();

export default function Aircraft() {
    const meshRef = useRef();
    const { planes, prevPlanes, timestamps, searchQuery, setSelectedPlane } = useFlightContext();

    const prevMap = useMemo(() => {
        if (!prevPlanes) return {};
        const map = {};
        for (const p of prevPlanes) {
            map[p.icao24] = p;
        }
        return map;
    }, [prevPlanes]);

    const filteredPlanes = useMemo(() => {
        if (!planes) return [];
        if (!searchQuery) return planes;
        const q = searchQuery.toLowerCase();
        return planes.filter(
            (p) =>
                p.callsign.toLowerCase().includes(q) ||
                p.icao24.toLowerCase().includes(q) ||
                p.originCountry.toLowerCase().includes(q)
        );
    }, [planes, searchQuery]);

    const geometry = useMemo(() => {
        const geo = new THREE.ConeGeometry(CONE_RADIUS, CONE_HEIGHT, 4);
        geo.rotateX(Math.PI / 2);
        return geo;
    }, []);

    // Ensure the instanceColor attribute exists
    useEffect(() => {
        if (meshRef.current) {
            const colors = new Float32Array(MAX_INSTANCES * 3).fill(1);
            meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
        }
    }, []);

    useFrame(() => {
        if (!meshRef.current || !filteredPlanes || filteredPlanes.length === 0) return;

        const mesh = meshRef.current;
        const now = Date.now();
        const elapsed = now - timestamps.current;
        const duration = timestamps.current - timestamps.previous || POLL_INTERVAL;
        const t = Math.min(elapsed / Math.max(duration, 1000), 2);

        const count = Math.min(filteredPlanes.length, MAX_INSTANCES);

        for (let i = 0; i < count; i++) {
            const plane = filteredPlanes[i];
            const alt = plane.baroAlt || plane.geoAlt || 0;
            const heading = plane.heading || 0;

            // Sane altitude offset to clear clouds (1.005) and atmosphere (1.03)
            // We'll put them at ~1.04 for absolute visibility
            const visualAlt = alt + 250000; // 250km for clarity
            const posNow = latLonAltToVector3(plane.lat, plane.lon, visualAlt);

            const prev = prevMap[plane.icao24];
            let finalPos;

            if (prev && prev.lat != null && prev.lon != null && t < 1.5) {
                const prevAlt = (prev.baroAlt || prev.geoAlt || 0) + 250000;
                const posPrev = latLonAltToVector3(prev.lat, prev.lon, prevAlt);
                finalPos = tempVec.lerpVectors(posPrev, posNow, Math.min(t, 1.2));
            } else {
                finalPos = posNow;
            }

            dummy.position.copy(finalPos);
            const up = finalPos.clone().normalize();
            const forward = new THREE.Vector3(0, 1, 0);
            dummy.quaternion.setFromUnitVectors(forward, up);

            const headingQuat = new THREE.Quaternion().setFromAxisAngle(up, -(heading * Math.PI) / 180);
            dummy.quaternion.premultiply(headingQuat);

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);

            // Force bright colors
            const color = altitudeToColor(alt);
            mesh.setColorAt(i, color);
        }

        mesh.count = count;
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });

    const handleClick = (e) => {
        e.stopPropagation();
        if (!filteredPlanes) return;
        const id = e.instanceId;
        if (id !== undefined && id < filteredPlanes.length) {
            setSelectedPlane(filteredPlanes[id]);
        }
    };

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, null, MAX_INSTANCES]}
            frustumCulled={false}
            onClick={handleClick}
            onPointerMissed={() => setSelectedPlane(null)}
        >
            <meshBasicMaterial vertexColors={true} toneMapped={false} />
        </instancedMesh>
    );
}
