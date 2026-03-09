import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export default function Earth() {
    const earthRef = useRef();
    const cloudsRef = useRef();

    // Procedurally generate textures since we don't have NASA imagery files
    const earthTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Ocean base (deep blue gradient)
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGrad.addColorStop(0, '#0c2d6b');
        oceanGrad.addColorStop(0.3, '#0a3d8f');
        oceanGrad.addColorStop(0.5, '#0e4a8a');
        oceanGrad.addColorStop(0.7, '#0a3d8f');
        oceanGrad.addColorStop(1, '#0c2d6b');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw simplified continents
        ctx.fillStyle = '#2d5a27';
        drawContinents(ctx, canvas.width, canvas.height);

        // Add ice caps
        ctx.fillStyle = '#d4e5f7';
        ctx.fillRect(0, 0, canvas.width, 60);
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);

    const bumpTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add noise-based bump
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const v = Math.random() * 30;
            imageData.data[i] = v;
            imageData.data[i + 1] = v;
            imageData.data[i + 2] = v;
            imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

        return new THREE.CanvasTexture(canvas);
    }, []);

    const nightTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // City lights — random bright dots in continental areas
        ctx.fillStyle = '#ffcc66';
        for (let i = 0; i < 8000; i++) {
            const x = Math.random() * canvas.width;
            const y = 100 + Math.random() * (canvas.height - 200);
            const s = Math.random() * 2 + 0.5;
            ctx.globalAlpha = Math.random() * 0.8 + 0.2;
            ctx.fillRect(x, y, s, s);
        }
        ctx.globalAlpha = 1;

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);

    const cloudTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Wispy cloud patterns
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const rx = Math.random() * 80 + 20;
            const ry = Math.random() * 30 + 10;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15 + 0.05})`;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    }, []);

    useFrame((_, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.015;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.02;
        }
    });

    return (
        <group>
            {/* Main Earth sphere */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhongMaterial
                    map={earthTexture}
                    bumpMap={bumpTexture}
                    bumpScale={0.02}
                    emissiveMap={nightTexture}
                    emissive={new THREE.Color(0xffcc66)}
                    emissiveIntensity={0.4}
                    specular={new THREE.Color(0x333333)}
                    shininess={15}
                />
            </mesh>

            {/* Cloud layer */}
            <mesh raycast={() => null}>
                <sphereGeometry args={[1.005, 64, 64]} />
                <meshStandardMaterial
                    map={cloudTexture}
                    transparent
                    opacity={0.4}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

/**
 * Draw simplified continent shapes on a 2D canvas (equirectangular projection).
 */
function drawContinents(ctx, w, h) {
    const continents = [
        // North America
        () => {
            ctx.beginPath();
            ctx.moveTo(w * 0.1, h * 0.2);
            ctx.lineTo(w * 0.17, h * 0.15);
            ctx.lineTo(w * 0.25, h * 0.18);
            ctx.lineTo(w * 0.28, h * 0.25);
            ctx.lineTo(w * 0.3, h * 0.35);
            ctx.lineTo(w * 0.27, h * 0.42);
            ctx.lineTo(w * 0.22, h * 0.45);
            ctx.lineTo(w * 0.18, h * 0.42);
            ctx.lineTo(w * 0.15, h * 0.38);
            ctx.lineTo(w * 0.12, h * 0.3);
            ctx.closePath();
            ctx.fill();
        },
        // South America
        () => {
            ctx.beginPath();
            ctx.moveTo(w * 0.27, h * 0.5);
            ctx.lineTo(w * 0.3, h * 0.48);
            ctx.lineTo(w * 0.33, h * 0.55);
            ctx.lineTo(w * 0.34, h * 0.65);
            ctx.lineTo(w * 0.32, h * 0.75);
            ctx.lineTo(w * 0.28, h * 0.82);
            ctx.lineTo(w * 0.26, h * 0.75);
            ctx.lineTo(w * 0.25, h * 0.6);
            ctx.closePath();
            ctx.fill();
        },
        // Europe
        () => {
            ctx.beginPath();
            ctx.moveTo(w * 0.47, h * 0.2);
            ctx.lineTo(w * 0.52, h * 0.18);
            ctx.lineTo(w * 0.55, h * 0.22);
            ctx.lineTo(w * 0.54, h * 0.3);
            ctx.lineTo(w * 0.5, h * 0.33);
            ctx.lineTo(w * 0.47, h * 0.3);
            ctx.lineTo(w * 0.46, h * 0.25);
            ctx.closePath();
            ctx.fill();
        },
        // Africa
        () => {
            ctx.beginPath();
            ctx.moveTo(w * 0.47, h * 0.35);
            ctx.lineTo(w * 0.55, h * 0.33);
            ctx.lineTo(w * 0.58, h * 0.4);
            ctx.lineTo(w * 0.57, h * 0.55);
            ctx.lineTo(w * 0.55, h * 0.65);
            ctx.lineTo(w * 0.52, h * 0.7);
            ctx.lineTo(w * 0.48, h * 0.65);
            ctx.lineTo(w * 0.46, h * 0.5);
            ctx.closePath();
            ctx.fill();
        },
        // Asia
        () => {
            ctx.beginPath();
            ctx.moveTo(w * 0.55, h * 0.15);
            ctx.lineTo(w * 0.7, h * 0.12);
            ctx.lineTo(w * 0.82, h * 0.18);
            ctx.lineTo(w * 0.85, h * 0.28);
            ctx.lineTo(w * 0.78, h * 0.35);
            ctx.lineTo(w * 0.7, h * 0.38);
            ctx.lineTo(w * 0.62, h * 0.4);
            ctx.lineTo(w * 0.58, h * 0.35);
            ctx.lineTo(w * 0.55, h * 0.22);
            ctx.closePath();
            ctx.fill();
        },
        // Australia
        () => {
            ctx.beginPath();
            ctx.moveTo(w * 0.78, h * 0.6);
            ctx.lineTo(w * 0.85, h * 0.58);
            ctx.lineTo(w * 0.88, h * 0.63);
            ctx.lineTo(w * 0.86, h * 0.7);
            ctx.lineTo(w * 0.8, h * 0.72);
            ctx.lineTo(w * 0.77, h * 0.67);
            ctx.closePath();
            ctx.fill();
        },
    ];

    // Add some color variation
    const colors = ['#2d5a27', '#3a6b34', '#24502a', '#1e4620', '#377a37', '#2a5c2a'];
    continents.forEach((draw, i) => {
        ctx.fillStyle = colors[i % colors.length];
        draw();
    });
}
