import React, { createContext, useContext, useState } from 'react';
import { useFlightData } from '../hooks/useFlightData';

const FlightContext = createContext(null);

export function FlightProvider({ children }) {
    const flightData = useFlightData();
    const [selectedPlane, setSelectedPlane] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <FlightContext.Provider
            value={{
                ...flightData,
                selectedPlane,
                setSelectedPlane,
                searchQuery,
                setSearchQuery,
            }}
        >
            {children}
        </FlightContext.Provider>
    );
}

export function useFlightContext() {
    const ctx = useContext(FlightContext);
    if (!ctx) throw new Error('useFlightContext must be used within FlightProvider');
    return ctx;
}
