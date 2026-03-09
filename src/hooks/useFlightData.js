import { useState, useEffect, useRef, useCallback } from 'react';
import { generateDemoPlanes, evolveDemoPlanes } from '../utils/demoData';

const POLL_INTERVAL = 10000; // 10 seconds

/**
 * Parse one OpenSky state vector array into a clean object.
 */
function parseState(s) {
    return {
        icao24: s[0],
        callsign: (s[1] || '').trim(),
        originCountry: s[2],
        timePosition: s[3],
        lastContact: s[4],
        lon: s[5],
        lat: s[6],
        baroAlt: s[7],
        onGround: s[8],
        velocity: s[9],
        heading: s[10],
        verticalRate: s[11],
        geoAlt: s[13],
    };
}

export function useFlightData() {
    const [current, setCurrent] = useState(null);
    const [previous, setPrevious] = useState(null);
    const [timestamps, setTimestamps] = useState({ current: 0, previous: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ count: 0, lastUpdate: null });
    const [isDemo, setIsDemo] = useState(false);
    const intervalRef = useRef(null);
    const failCountRef = useRef(0);
    const demoRef = useRef(null);

    const activateDemo = useCallback(() => {
        // Generate initial demo data
        const demo = generateDemoPlanes(800);
        demoRef.current = demo;
        const now = Date.now();

        setCurrent(demo);
        setPrevious(null);
        setTimestamps({ previous: now - POLL_INTERVAL, current: now });
        setStats({ count: demo.length, lastUpdate: new Date() });
        setLoading(false);
        setIsDemo(true);
        setError(null);

        console.log('🛩️ OpenSky API unavailable — switched to demo mode with', demo.length, 'simulated aircraft');
    }, []);

    const evolveDemoData = useCallback(() => {
        if (!demoRef.current) return;
        const evolved = evolveDemoPlanes(demoRef.current);
        demoRef.current = evolved;
        const now = Date.now();

        setCurrent((prev) => {
            setPrevious(prev);
            setTimestamps((ts) => ({ previous: ts.current, current: now }));
            return evolved;
        });
        setStats({ count: evolved.length, lastUpdate: new Date() });
    }, []);

    const fetchData = useCallback(async () => {
        // If already in demo mode, evolve demo data instead of fetching
        if (isDemo) {
            evolveDemoData();
            return;
        }

        try {
            const res = await fetch('/api/opensky');

            if (res.status === 429) {
                failCountRef.current += 1;
                // After 2 consecutive rate-limit failures, switch to demo mode
                if (failCountRef.current >= 2) {
                    activateDemo();
                    return;
                }
                throw new Error('Rate limited (HTTP 429). Retrying…');
            }

            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            const data = await res.json();

            if (!data.states || data.states.length === 0) {
                throw new Error('No flight data received');
            }

            const planes = data.states
                .map(parseState)
                .filter((p) => p.lat != null && p.lon != null && !p.onGround);

            const now = Date.now();
            failCountRef.current = 0; // reset on success

            setCurrent((prev) => {
                setPrevious(prev);
                setTimestamps((ts) => ({ previous: ts.current, current: now }));
                return planes;
            });

            setStats({ count: planes.length, lastUpdate: new Date() });
            setError(null);
            setLoading(false);
            setIsDemo(false);
        } catch (err) {
            console.warn('Flight data fetch error:', err.message);
            setError(err.message);
            setCurrent((prev) => {
                if (prev) setLoading(false);
                return prev;
            });
        }
    }, [isDemo, evolveDemoData, activateDemo]);

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [fetchData]);

    return { planes: current, prevPlanes: previous, timestamps, loading, error, stats, isDemo };
}
