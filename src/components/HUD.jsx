import React from 'react';
import { useFlightContext } from '../context/FlightContext';

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function PlaneIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent-cyan)' }}>
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
    );
}

export default function HUD() {
    const { stats, loading, error, selectedPlane, setSelectedPlane, searchQuery, setSearchQuery, isDemo } = useFlightContext();

    const formatTime = (date) => {
        if (!date) return '--:--:--';
        return date.toLocaleTimeString('en-US', { hour12: false });
    };

    return (
        <div className="hud-overlay">
            {/* Top Left: Title & Stats */}
            <div className="hud-top-left">
                <div className="hud-title">
                    <PlaneIcon />
                    <h1>Flight Tracker 3D</h1>
                    {stats.count > 0 && <span className="pulse-dot" />}
                </div>

                <div className="hud-stats">
                    <div className="stat-chip">
                        ✈ Aircraft: <span className="stat-value">{stats.count.toLocaleString()}</span>
                    </div>
                    <div className="stat-chip">
                        ⏱ Updated: <span className="stat-value">{formatTime(stats.lastUpdate)}</span>
                    </div>
                    {isDemo && (
                        <div className="stat-chip" style={{ borderColor: 'rgba(251, 191, 36, 0.4)', color: 'var(--accent-amber)' }}>
                            ⚡ DEMO MODE
                        </div>
                    )}
                </div>
            </div>

            {/* Top Right: Search */}
            <div className="hud-top-right">
                <div className="search-box">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Search callsign, ICAO, country…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Center: Loading / Error */}
            {loading && !stats.count && (
                <div className="hud-center">
                    <div className="loading-indicator">
                        <div className="spinner" />
                        <p>Fetching live flight data…</p>
                    </div>
                </div>
            )}

            {error && !stats.count && (
                <div className="hud-center">
                    <div className="error-banner">
                        ⚠ {error}
                        <br />
                        <small>Retrying automatically every 10 s…</small>
                    </div>
                </div>
            )}

            {/* Bottom Left: Altitude Legend */}
            {stats.count > 0 && (
                <div className="hud-bottom-left">
                    <div className="altitude-legend">
                        <span className="legend-title">Altitude</span>
                        <div className="legend-bar" />
                        <div className="legend-labels">
                            <span>0 m</span>
                            <span>13 000 m+</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Center: Selected Plane Card */}
            {selectedPlane && (
                <div className="selected-plane-card">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="callsign">{selectedPlane.callsign || 'N/A'}</span>
                            <span className="icao">{selectedPlane.icao24}</span>
                        </div>
                        <button className="close-btn" onClick={() => setSelectedPlane(null)} title="Close">
                            ✕
                        </button>
                    </div>
                    <div className="card-details">
                        <div className="detail-item">
                            <span className="detail-label">Altitude</span>
                            <span className="detail-value">
                                {selectedPlane.baroAlt != null ? `${Math.round(selectedPlane.baroAlt).toLocaleString()} m` : '—'}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Speed</span>
                            <span className="detail-value">
                                {selectedPlane.velocity != null ? `${Math.round(selectedPlane.velocity * 3.6)} km/h` : '—'}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Heading</span>
                            <span className="detail-value">
                                {selectedPlane.heading != null ? `${Math.round(selectedPlane.heading)}°` : '—'}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Country</span>
                            <span className="detail-value">{selectedPlane.originCountry || '—'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
