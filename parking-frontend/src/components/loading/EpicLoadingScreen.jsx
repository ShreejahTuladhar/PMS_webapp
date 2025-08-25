/**
 * Epic ParkSathi Loading Screen
 * Jaw-dropping location discovery animation
 * Author: Shreejah Tuladhar
 */

import React, { useState, useEffect, useRef } from 'react';
import './EpicLoadingScreen.css';

const EpicLoadingScreen = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [discoveredLocations, setDiscoveredLocations] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [currentArea, setCurrentArea] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);
  const mapRef = useRef(null);

  const phases = [
    {
      name: 'INITIALIZING_SYSTEM',
      title: 'Initializing ParkSathi Intelligence',
      duration: 2000,
      area: 'System Core'
    },
    {
      name: 'SCANNING_THAMEL',
      title: 'Discovering Thamel Tourist Hub',
      duration: 3000,
      area: 'Thamel District',
      landmarks: ['Garden of Dreams', 'Freak Street', 'Thamel Square']
    },
    {
      name: 'SCANNING_DURBAR',
      title: 'Mapping Heritage Sites',
      duration: 3500,
      area: 'Cultural Triangle',
      landmarks: ['Kathmandu Durbar Square', 'Patan Durbar Square', 'Bhaktapur Durbar Square']
    },
    {
      name: 'SCANNING_TRANSPORT',
      title: 'Locating Transport Hubs',
      duration: 2800,
      area: 'Transport Network',
      landmarks: ['TIA Airport', 'Bus Stations', 'Ring Road Junctions']
    },
    {
      name: 'SCANNING_BUSINESS',
      title: 'Analyzing Business Districts',
      duration: 2500,
      area: 'Commercial Zones',
      landmarks: ['New Road', 'Putalisadak', 'Baneshwor']
    },
    {
      name: 'OPTIMIZING',
      title: 'Optimizing Routes & Capacity',
      duration: 2000,
      area: 'AI Processing'
    },
    {
      name: 'COMPLETE',
      title: 'ParkSathi Ready',
      duration: 1000,
      area: 'System Online'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPhase < phases.length - 1) {
        setCurrentPhase(prev => prev + 1);
      } else {
        setTimeout(() => onComplete(), 1000);
      }
    }, phases[currentPhase].duration);

    return () => clearTimeout(timer);
  }, [currentPhase, onComplete, phases]);

  useEffect(() => {
    // Simulate location discovery
    const interval = setInterval(() => {
      if (currentPhase > 0 && currentPhase < phases.length - 1) {
        setDiscoveredLocations(prev => {
          const newCount = prev + Math.floor(Math.random() * 5) + 1;
          return Math.min(newCount, 224);
        });
        
        setTotalCapacity(prev => prev + Math.floor(Math.random() * 150) + 50);
        
        // Add terminal output
        const phase = phases[currentPhase];
        if (phase.landmarks) {
          const landmark = phase.landmarks[Math.floor(Math.random() * phase.landmarks.length)];
          setTerminalOutput(prev => [
            ...prev.slice(-8), // Keep last 8 lines
            `[${new Date().toLocaleTimeString()}] DISCOVERED: ${landmark} - Parking facilities mapped`
          ]);
        }
        
        setCurrentArea(phase.area);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [currentPhase, phases]);

  useEffect(() => {
    // Particle animation
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connection lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1;
      
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.hypot(
            particle.x - otherParticle.x,
            particle.y - otherParticle.y
          );
          
          if (distance < 150) {
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
        
        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.opacity += particle.opacityDirection * 0.01;
        
        if (particle.opacity <= 0.2 || particle.opacity >= 0.8) {
          particle.opacityDirection *= -1;
        }
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      
      requestAnimationFrame(animateParticles);
    };

    // Generate particles
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      opacityDirection: Math.random() > 0.5 ? 1 : -1
    }));
    
    setParticles(newParticles);
    animateParticles();
  }, []);

  const progress = ((currentPhase + 1) / phases.length) * 100;

  return (
    <div className="epic-loading-screen">
      <canvas ref={canvasRef} className="particle-canvas" />
      
      {/* Main Content */}
      <div className="loading-content">
        {/* Header */}
        <motion.div
          className="loading-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="brand-logo">
            <span className="logo-icon">🅿️</span>
            <span className="brand-text">ParkSathi</span>
          </div>
          <div className="tagline">Advanced Parking Intelligence Platform</div>
        </motion.div>

        {/* Main Animation Area */}
        <div className="main-animation">
          {/* Kathmandu Map Visualization */}
          <motion.div
            ref={mapRef}
            className="map-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="map-backdrop">
              <KathmanduMapSVG currentPhase={currentPhase} discoveredLocations={discoveredLocations} />
            </div>
            
            {/* Scanning Effect */}
            <motion.div
              className="scanner-line"
              animate={{
                x: ['-100%', '100%'],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>

          {/* Stats Dashboard */}
          <motion.div
            className="stats-dashboard"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="stat-item">
              <div className="stat-value">{discoveredLocations}</div>
              <div className="stat-label">Locations Mapped</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{totalCapacity.toLocaleString()}</div>
              <div className="stat-label">Total Capacity</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{Math.round(progress)}%</div>
              <div className="stat-label">System Ready</div>
            </div>
          </motion.div>
        </div>

        {/* Terminal Output */}
        <motion.div
          className="terminal-output"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="terminal-header">
            <span className="terminal-title">ParkSathi Discovery Engine</span>
            <span className="terminal-status">● ACTIVE</span>
          </div>
          <div className="terminal-content">
            <AnimatePresence>
              {terminalOutput.map((line, index) => (
                <motion.div
                  key={index}
                  className="terminal-line"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="terminal-cursor">_</div>
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          className="progress-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="progress-info">
            <h2 className="current-phase">{phases[currentPhase].title}</h2>
            <p className="current-area">Scanning: {currentArea}</p>
          </div>
          
          <div className="progress-bar-container">
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
              <div className="progress-glow" />
            </div>
            <div className="progress-text">{Math.round(progress)}% Complete</div>
          </div>
        </motion.div>

        {/* Loading Phases Indicator */}
        <div className="phases-indicator">
          {phases.map((phase, index) => (
            <motion.div
              key={index}
              className={`phase-dot ${index <= currentPhase ? 'active' : ''}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Ambient Effects */}
      <div className="ambient-effects">
        <div className="glow-effect glow-1" />
        <div className="glow-effect glow-2" />
        <div className="glow-effect glow-3" />
      </div>
    </div>
  );
};

// Simplified Kathmandu Map SVG Component
const KathmanduMapSVG = ({ currentPhase, discoveredLocations }) => {
  const locations = [
    { id: 1, x: 45, y: 35, name: 'Thamel', phase: 1 },
    { id: 2, x: 50, y: 40, name: 'Durbar Square', phase: 2 },
    { id: 3, x: 35, y: 45, name: 'Patan', phase: 2 },
    { id: 4, x: 65, y: 35, name: 'Bhaktapur', phase: 2 },
    { id: 5, x: 70, y: 50, name: 'Airport', phase: 3 },
    { id: 6, x: 55, y: 30, name: 'New Road', phase: 4 },
    { id: 7, x: 40, y: 25, name: 'Ratna Park', phase: 4 },
    { id: 8, x: 30, y: 55, name: 'Lagankhel', phase: 3 },
  ];

  return (
    <svg viewBox="0 0 100 100" className="kathmandu-map">
      {/* Map outline */}
      <path
        d="M20,20 Q50,15 80,25 Q85,50 75,75 Q50,85 25,80 Q15,50 20,20"
        fill="rgba(59, 130, 246, 0.1)"
        stroke="rgba(59, 130, 246, 0.3)"
        strokeWidth="0.5"
      />
      
      {/* Rivers */}
      <path
        d="M25,30 Q40,35 55,30 Q70,35 80,40"
        fill="none"
        stroke="rgba(59, 130, 246, 0.4)"
        strokeWidth="0.3"
      />
      
      {/* Location pins */}
      {locations.map((location) => (
        <motion.g
          key={location.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: currentPhase >= location.phase ? 1 : 0,
            opacity: currentPhase >= location.phase ? 1 : 0
          }}
          transition={{ duration: 0.5, delay: location.id * 0.1 }}
        >
          <circle
            cx={location.x}
            cy={location.y}
            r="1.5"
            fill="#3b82f6"
            className="location-pin"
          />
          <motion.circle
            cx={location.x}
            cy={location.y}
            r="3"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.3"
            animate={{ r: [3, 5, 3], opacity: [0.7, 0.3, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <text
            x={location.x}
            y={location.y - 3}
            textAnchor="middle"
            fontSize="2"
            fill="#3b82f6"
            className="location-label"
          >
            {location.name}
          </text>
        </motion.g>
      ))}
    </svg>
  );
};

export default EpicLoadingScreen;