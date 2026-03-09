import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene from './components/Scene';
import HUD from './components/HUD';
import { FlightProvider } from './context/FlightContext';

export default function App() {
    return (
        <FlightProvider>
            <div className="canvas-container">
                <Canvas
                    camera={{
                        position: [0, 0, 2.5],
                        fov: 50,
                        near: 0.01,
                        far: 1000,
                    }}
                    raycaster={{ params: { Line: { threshold: 0.02 } } }}
                    gl={{
                        antialias: true,
                        toneMapping: THREE.ACESFilmicToneMapping,
                        toneMappingExposure: 1.2,
                        outputColorSpace: THREE.SRGBColorSpace,
                    }}
                    dpr={[1, 2]}
                >
                    <Scene />
                </Canvas>
            </div>
            <HUD />
        </FlightProvider>
    );
}
