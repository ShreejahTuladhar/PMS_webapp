/**
 * Cinematic ParkSathi Loading Screen
 * Pure CSS animations - no external dependencies
 * Author: Claude & Shreeraj Tuladhar
 */

import React, { useState, useEffect, useRef } from 'react';
import './CinematicLoadingScreen.css';

const CinematicLoadingScreen = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [discoveredLocations, setDiscoveredLocations] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [currentArea, setCurrentArea] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [realLocationData, setRealLocationData] = useState([]);
  const [totalRealLocations, setTotalRealLocations] = useState(224);
  const [totalRealCapacity, setTotalRealCapacity] = useState(15000);
  const [skipEnabled, setSkipEnabled] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(6);
  const canvasRef = useRef(null);

  const phases = [
    {
      name: 'INITIALIZING',
      title: 'Initializing ParkSathi Intelligence System',
      duration: 2500,
      area: 'Neural Network Core'
    },
    {
      name: 'HERITAGE_SCAN',
      title: 'Scanning UNESCO Heritage Sites',
      duration: 2000,
      area: 'Cultural Heritage Zone',
      landmarks: ['Kathmandu Durbar Square', 'Patan Durbar Square', 'Bhaktapur Durbar Square']
    },
    {
      name: 'TOURIST_SCAN',
      title: 'Mapping Tourist Districts',
      duration: 2000,
      area: 'Thamel Tourist Hub',
      landmarks: ['Garden of Dreams', 'Freak Street', 'Thamel Square']
    },
    {
      name: 'TRANSPORT_SCAN',
      title: 'Locating Transport Infrastructure',
      duration: 1800,
      area: 'Transport Network',
      landmarks: ['TIA Airport', 'Bus Stations', 'Ring Road Junctions']
    },
    {
      name: 'BUSINESS_SCAN',
      title: 'Analyzing Commercial Centers',
      duration: 1800,
      area: 'Business Districts',
      landmarks: ['New Road', 'Putalisadak', 'Baneshwor']
    },
    {
      name: 'OPTIMIZATION',
      title: 'Optimizing Navigation Matrix',
      duration: 1400,
      area: 'AI Route Processing'
    },
    {
      name: 'COMPLETE',
      title: 'ParkSathi System Online',
      duration: 500,
      area: 'All Systems Ready • Location Intelligence Active'
    }
  ];

  // Fetch real location data on component mount
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/locations?limit=200');
        if (response.ok) {
          const data = await response.json();
          setRealLocationData(data.locations || []);
          setTotalRealLocations(data.total || data.locations?.length || 224);
          
          // Calculate total capacity from real data
          const capacity = data.locations?.reduce((sum, loc) => sum + (loc.capacity || 50), 0) || 15000;
          setTotalRealCapacity(capacity);
        }
      } catch (error) {
        console.warn('Loading screen: Could not fetch real location data, using defaults');
      }
    };

    fetchLocationData();
  }, []);

  // Skip button countdown timer
  useEffect(() => {
    const skipTimer = setInterval(() => {
      setSkipCountdown(prev => {
        if (prev <= 1) {
          setSkipEnabled(true);
          clearInterval(skipTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(skipTimer);
  }, []);

  useEffect(() => {
    console.log(`🎬 Starting phase ${currentPhase + 1}: ${phases[currentPhase].name} (${phases[currentPhase].duration}ms)`);
    
    const timer = setTimeout(() => {
      if (currentPhase < phases.length - 1) {
        console.log(`🎬 Phase ${currentPhase + 1} completed, moving to phase ${currentPhase + 2}`);
        setCurrentPhase(prev => prev + 1);
      } else {
        console.log('🎬 All phases completed! Calling onComplete...');
        // Last phase completed - trigger completion
        if (onComplete) {
          onComplete();
        } else {
          console.error('🚨 onComplete callback is missing!');
        }
      }
    }, phases[currentPhase].duration);

    return () => clearTimeout(timer);
  }, [currentPhase, onComplete, phases]);

  useEffect(() => {
    // Simulate location discovery using real data
    const interval = setInterval(() => {
      if (currentPhase > 0) {
        // Update stats for all phases except the initial phase
        if (currentPhase < phases.length - 1) {
          setDiscoveredLocations(prev => {
            const increment = Math.floor(Math.random() * 4) + 1;
            const newCount = prev + increment;
            return Math.min(newCount, totalRealLocations);
          });
          
          setTotalCapacity(prev => {
            const increment = Math.floor(Math.random() * 200) + 50;
            const newCapacity = prev + increment;
            return Math.min(newCapacity, totalRealCapacity);
          });
        } else {
          // Final phase - ensure we show complete stats
          setDiscoveredLocations(totalRealLocations);
          setTotalCapacity(totalRealCapacity);
        }
        
        // Add terminal output with real location names
        const phase = phases[currentPhase];
        if (currentPhase === phases.length - 1) {
          // Final phase - show completion messages
          setTerminalOutput(prev => [
            ...prev.slice(-4),
            `[${new Date().toLocaleTimeString()}] ✅ SYSTEM INITIALIZATION COMPLETE`,
            `[${new Date().toLocaleTimeString()}] 🗺️  ${totalRealLocations} locations mapped successfully`,
            `[${new Date().toLocaleTimeString()}] 🚗 ${totalRealCapacity.toLocaleString()} parking spots available`,
            `[${new Date().toLocaleTimeString()}] 🚀 ParkSathi Intelligence System: ONLINE`
          ]);
        } else if (phase.landmarks) {
          const landmark = phase.landmarks[Math.floor(Math.random() * phase.landmarks.length)];
          setTerminalOutput(prev => [
            ...prev.slice(-6), // Keep last 6 lines
            `[${new Date().toLocaleTimeString()}] MAPPED: ${landmark} - Parking capacity analyzed`
          ]);
        } else if (realLocationData.length > 0) {
          // Use real location names when available
          const randomLocation = realLocationData[Math.floor(Math.random() * Math.min(realLocationData.length, 20))];
          const locationName = randomLocation?.name || randomLocation?.location?.address || 'Location';
          const capacity = randomLocation?.capacity || Math.floor(Math.random() * 100) + 20;
          setTerminalOutput(prev => [
            ...prev.slice(-6),
            `[${new Date().toLocaleTimeString()}] DISCOVERED: ${locationName} - ${capacity} spots available`
          ]);
        }
        
        setCurrentArea(phase.area);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [currentPhase, phases.length, realLocationData.length, totalRealLocations, totalRealCapacity]);

  useEffect(() => {
    // Create particle system
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.3
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 0.5;
      
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.hypot(
            particle.x - otherParticle.x,
            particle.y - otherParticle.y
          );
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
      
      // Draw particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`;
        ctx.fill();
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  // Calculate progress - ensure it reaches 100% at the last phase
  const progress = Math.min(((currentPhase + 1) / phases.length) * 100, 100);

  const handleSkip = () => {
    if (skipEnabled) {
      console.log('🎬 Skip button clicked, calling onComplete...');
      if (onComplete) {
        onComplete();
      } else {
        console.error('🚨 onComplete callback is missing in skip handler!');
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`cinematic-loading ${isVisible ? 'visible' : 'hidden'}`}>
      <canvas ref={canvasRef} className="particle-canvas" />
      
      {/* Main Container */}
      <div className="loading-container">
        
        {/* Header */}
        <div className="loading-header animate-slide-down">
          <div className="brand-logo">
            <span className="logo-icon animate-pulse-glow">🅿️</span>
            <span className="brand-text">ParkSathi</span>
          </div>
          <div className="tagline">Next-Generation Parking Intelligence</div>
        </div>

        {/* Center Content */}
        <div className="center-content">
          
          {/* Main Visualization */}
          <div className="main-visual animate-scale-in">
            <div className="map-display">
              <KathmanduMapVisualization currentPhase={currentPhase} />
              <div className="scanning-overlay">
                <div className="scan-line"></div>
              </div>
            </div>
            
            {/* Live Stats */}
            <div className="live-stats animate-slide-left">
              <div className="stat-card">
                <div className="stat-number">{discoveredLocations}</div>
                <div className="stat-label">Locations Found</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{totalCapacity.toLocaleString()}</div>
                <div className="stat-label">Total Capacity</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{Math.round(progress)}%</div>
                <div className="stat-label">System Ready</div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="terminal-display animate-slide-up">
            <div className="terminal-header">
              <span className="terminal-title">ParkSathi Discovery Engine v2.0</span>
              <span className="status-indicator online">● ONLINE</span>
            </div>
            <div className="terminal-body">
              {terminalOutput.map((line, index) => (
                <div key={index} className="terminal-line animate-fade-in">
                  <span className="prompt">$</span>
                  <span className="command">{line}</span>
                </div>
              ))}
              <div className="cursor-line">
                <span className="prompt">$</span>
                <span className="cursor">_</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="loading-footer">
          
          {/* Phase Info */}
          <div className="phase-info animate-fade-in">
            <h2 className="phase-title">{phases[currentPhase].title}</h2>
            <p className="phase-area">Processing: {currentArea}</p>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
              <div className="progress-glow"></div>
            </div>
            <div className="progress-text">{Math.round(progress)}% Complete</div>
          </div>

          {/* Phase Indicators */}
          <div className="phase-indicators">
            {phases.map((_, index) => (
              <div
                key={index}
                className={`phase-dot ${index <= currentPhase ? 'active' : ''}`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambient Effects */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="ambient-glow glow-3"></div>

      {/* YouTube-style Skip Button */}
      <div className="skip-button-container">
        <button
          className={`skip-button ${skipEnabled ? 'skip-enabled' : 'skip-disabled'}`}
          onClick={handleSkip}
          disabled={!skipEnabled}
        >
          {skipEnabled ? (
            <>
              <span className="skip-text">Skip</span>
              <svg className="skip-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </>
          ) : (
            <span className="skip-countdown">Skip in {skipCountdown}</span>
          )}
        </button>
      </div>
    </div>
  );
};

// Kathmandu Map Visualization Component
const KathmanduMapVisualization = ({ currentPhase }) => {
  const locations = [
    { id: 1, x: 45, y: 35, name: 'Thamel', phase: 2, type: 'tourist' },
    { id: 2, x: 50, y: 40, name: 'Durbar Square', phase: 1, type: 'heritage' },
    { id: 3, x: 35, y: 45, name: 'Patan', phase: 1, type: 'heritage' },
    { id: 4, x: 65, y: 35, name: 'Bhaktapur', phase: 1, type: 'heritage' },
    { id: 5, x: 70, y: 50, name: 'Airport', phase: 3, type: 'transport' },
    { id: 6, x: 55, y: 30, name: 'New Road', phase: 4, type: 'business' },
    { id: 7, x: 40, y: 25, name: 'Ratna Park', phase: 4, type: 'business' },
    { id: 8, x: 30, y: 55, name: 'Lagankhel', phase: 3, type: 'transport' },
  ];

  return (
    <svg viewBox="0 0 100 100" className="kathmandu-map">
      {/* Map outline */}
      <path
        d="M20,20 Q50,15 80,25 Q85,50 75,75 Q50,85 25,80 Q15,50 20,20"
        className="map-outline"
      />
      
      {/* Rivers */}
      <path
        d="M25,30 Q40,35 55,30 Q70,35 80,40"
        className="river-path"
      />
      
      {/* Location pins */}
      {locations.map((location) => (
        <g
          key={location.id}
          className={`location-pin ${currentPhase >= location.phase ? 'visible' : 'hidden'} ${location.type}`}
        >
          <circle
            cx={location.x}
            cy={location.y}
            r="1.5"
            className="pin-core"
          />
          <circle
            cx={location.x}
            cy={location.y}
            r="3"
            className="pin-pulse"
          />
          <text
            x={location.x}
            y={location.y - 4}
            textAnchor="middle"
            className="pin-label"
          >
            {location.name}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default CinematicLoadingScreen;