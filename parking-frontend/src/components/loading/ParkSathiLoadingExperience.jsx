/**
 * ParkSathi Loading Experience
 * The ultimate jaw-dropping loading screen
 * Author: Shreejah Tuladhar
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EpicLoadingScreen from './EpicLoadingScreen';
import LocationDiscoveryEngine from './LocationDiscoveryEngine';
import './ParkSathiLoadingExperience.css';

const ParkSathiLoadingExperience = ({ onComplete, skipIntro = false }) => {
  const [currentStage, setCurrentStage] = useState('INTRO');
  const [discoveredLocations, setDiscoveredLocations] = useState([]);
  const [systemReady, setSystemReady] = useState(false);
  const [finalCountdown, setFinalCountdown] = useState(false);
  const audioRef = useRef(null);

  const stages = {
    INTRO: 'Brand Introduction',
    DISCOVERY: 'Location Discovery',
    PROCESSING: 'Data Processing',
    OPTIMIZATION: 'Route Optimization', 
    READY: 'System Ready'
  };

  useEffect(() => {
    if (skipIntro) {
      setCurrentStage('DISCOVERY');
      return;
    }

    // Brand intro stage
    const introTimer = setTimeout(() => {
      setCurrentStage('DISCOVERY');
    }, 3000);

    return () => clearTimeout(introTimer);
  }, [skipIntro]);

  const handleLocationDiscovered = (location) => {
    setDiscoveredLocations(prev => [...prev, location]);
    
    // Play discovery sound (optional)
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  const handleDiscoveryComplete = () => {
    setCurrentStage('PROCESSING');
    
    setTimeout(() => {
      setCurrentStage('OPTIMIZATION');
      
      setTimeout(() => {
        setCurrentStage('READY');
        setSystemReady(true);
        
        setTimeout(() => {
          setFinalCountdown(true);
          
          setTimeout(() => {
            onComplete && onComplete();
          }, 2000);
        }, 1500);
      }, 2000);
    }, 1500);
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 'INTRO':
        return <BrandIntroduction />;
      
      case 'DISCOVERY':
        return (
          <>
            <EpicLoadingScreen 
              onComplete={handleDiscoveryComplete}
              discoveredLocations={discoveredLocations}
            />
            <LocationDiscoveryEngine
              onLocationDiscovered={handleLocationDiscovered}
              onComplete={handleDiscoveryComplete}
            />
          </>
        );
      
      case 'PROCESSING':
        return <DataProcessingStage discoveredLocations={discoveredLocations} />;
      
      case 'OPTIMIZATION':
        return <RouteOptimizationStage />;
      
      case 'READY':
        return <SystemReadyStage finalCountdown={finalCountdown} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="parksathi-loading-experience">
      {/* Audio element for sound effects */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/discovery-beep.mp3" type="audio/mpeg" />
      </audio>

      {/* Stage indicator */}
      <motion.div
        className="stage-indicator"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="stage-progress">
          {Object.entries(stages).map(([key, label], index) => (
            <div
              key={key}
              className={`stage-step ${currentStage === key ? 'active' : ''} ${
                Object.keys(stages).indexOf(currentStage) > index ? 'completed' : ''
              }`}
            >
              <div className="step-indicator" />
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main content area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          className="stage-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {renderStageContent()}
        </motion.div>
      </AnimatePresence>

      {/* System status */}
      <motion.div
        className="system-status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="status-item">
          <span className="status-label">Locations:</span>
          <span className="status-value">{discoveredLocations.length}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Stage:</span>
          <span className="status-value">{stages[currentStage]}</span>
        </div>
        <div className="status-item">
          <span className="status-label">System:</span>
          <span className={`status-value ${systemReady ? 'ready' : 'loading'}`}>
            {systemReady ? 'READY' : 'INITIALIZING'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

// Brand Introduction Component
const BrandIntroduction = () => {
  return (
    <motion.div
      className="brand-introduction"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="brand-logo-large"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          duration: 1.5, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
      >
        🅿️
      </motion.div>
      
      <motion.h1
        className="brand-title"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        ParkSathi
      </motion.h1>
      
      <motion.p
        className="brand-subtitle"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Next-Generation Parking Intelligence Platform
      </motion.p>

      <motion.div
        className="brand-features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <div className="feature">🤖 AI-Powered Location Discovery</div>
        <div className="feature">🗺️ Real-Time Space Mapping</div>
        <div className="feature">⚡ Instant Route Optimization</div>
      </motion.div>
    </motion.div>
  );
};

// Data Processing Stage
const DataProcessingStage = ({ discoveredLocations }) => {
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessedCount(prev => {
        const next = prev + Math.floor(Math.random() * 5) + 1;
        return Math.min(next, discoveredLocations.length);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [discoveredLocations.length]);

  return (
    <motion.div
      className="data-processing-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="processing-header">
        <h2>Processing Location Data</h2>
        <p>Analyzing {discoveredLocations.length} parking facilities</p>
      </div>

      <div className="processing-visualization">
        <div className="data-flow">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="data-particle"
              animate={{
                x: [0, 200, 400],
                y: [0, Math.sin(i) * 50, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
        
        <div className="processing-stats">
          <div className="stat">
            <span className="stat-number">{processedCount}</span>
            <span className="stat-label">Processed</span>
          </div>
          <div className="stat">
            <span className="stat-number">{discoveredLocations.length - processedCount}</span>
            <span className="stat-label">Remaining</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Route Optimization Stage
const RouteOptimizationStage = () => {
  return (
    <motion.div
      className="route-optimization-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="optimization-header">
        <h2>Optimizing Navigation Routes</h2>
        <p>Computing shortest paths and traffic patterns</p>
      </div>

      <div className="route-visualization">
        <svg viewBox="0 0 400 300" className="route-map">
          {/* Route lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M${50 + i * 40},50 Q${150 + i * 20},${100 + i * 10} ${300 + i * 10},${200 + i * 15}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.2 }}
            />
          ))}
          
          {/* Connection nodes */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.circle
              key={i}
              cx={50 + (i % 4) * 100}
              cy={75 + Math.floor(i / 4) * 75}
              r="4"
              fill="#06b6d4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </svg>
      </div>

      <div className="optimization-metrics">
        <div className="metric">
          <span className="metric-value">847</span>
          <span className="metric-label">Routes Calculated</span>
        </div>
        <div className="metric">
          <span className="metric-value">23.4s</span>
          <span className="metric-label">Avg Travel Time</span>
        </div>
        <div className="metric">
          <span className="metric-value">98.7%</span>
          <span className="metric-label">Optimization Rate</span>
        </div>
      </div>
    </motion.div>
  );
};

// System Ready Stage
const SystemReadyStage = ({ finalCountdown }) => {
  return (
    <motion.div
      className="system-ready-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="ready-indicator"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        ✅
      </motion.div>

      <motion.h1
        className="ready-title"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        System Ready
      </motion.h1>

      <motion.p
        className="ready-message"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        ParkSathi intelligence network is now online
      </motion.p>

      {finalCountdown && (
        <motion.div
          className="countdown"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p>Launching experience...</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ParkSathiLoadingExperience;