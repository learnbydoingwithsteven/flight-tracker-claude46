import React, { Suspense } from 'react';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Earth from './Earth';
import Atmosphere from './Atmosphere';
import Aircraft from './Aircraft';

export default function Scene() {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.15} color="#8899cc" />
            <directionalLight
                position={[5, 3, 5]}
                intensity={1.8}
                color="#ffffff"
                castShadow={false}
            />
            <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4488ff" />

            {/* Camera controls */}
            <OrbitControls
                enablePan={false}
                enableDamping
                dampingFactor={0.08}
                rotateSpeed={0.5}
                zoomSpeed={0.8}
                minDistance={1.3}
                maxDistance={4}
                minPolarAngle={0.1}
                maxPolarAngle={Math.PI - 0.1}
            />

            {/* Starfield */}
            <Stars
                radius={100}
                depth={80}
                count={6000}
                factor={4}
                saturation={0.2}
                fade
                speed={0.5}
            />

            {/* Earth & atmosphere */}
            <Suspense fallback={null}>
                <Earth />
            </Suspense>
            <Atmosphere />

            {/* Aircraft layer */}
            <Aircraft />

            {/* Post-processing */}
            <EffectComposer>
                <Bloom
                    intensity={0.5}
                    luminanceThreshold={0.6}
                    luminanceSmoothing={0.4}
                    mipmapBlur
                />
                <Vignette offset={0.3} darkness={0.6} />
            </EffectComposer>
        </>
    );
}
