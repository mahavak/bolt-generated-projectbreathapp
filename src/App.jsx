import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const PHASES = ['Inhale', 'Hold', 'Exhale', 'Hold'];
const REWARDS = [
  "Great job! Keep up the good work!",
  "You're doing amazing! Feel the calm.",
  "Fantastic session! Your mind thanks you.",
  "Awesome work! Stress doesn't stand a chance.",
  "Brilliant! You're mastering the art of relaxation.",
  "Superb effort! Your focus is improving.",
  "Excellent! You're building a great habit.",
  "Wonderful! Your body and mind are in harmony.",
  "Impressive! You're becoming a breathing expert.",
  "Terrific! Your stress-busting skills are leveling up!"
];

function App() {
  const [phaseDuration, setPhaseDuration] = useState(4);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phaseDuration * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionStart, setSessionStart] = useState(null);
  const [reward, setReward] = useState(null);
  const [totalStars, setTotalStars] = useState(0);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setCurrentPhase(0);
    setTimeLeft(phaseDuration * 1000);
    setSessionStart(null);
    setReward(null);
  }, [phaseDuration]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 10) {
            setCurrentPhase((prevPhase) => (prevPhase + 1) % PHASES.length);
            return phaseDuration * 1000;
          }
          return prevTime - 10;
        });
      }, 10);
    } else if (sessionStart) {
      const duration = Math.round((Date.now() - sessionStart) / 1000);
      const newHistory = [...history, { start: sessionStart, duration }];
      setHistory(newHistory);
      setSessionStart(null);
      const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
      setReward(randomReward);
      setTotalStars(stars => stars + 1);
    }
    return () => clearInterval(timer);
  }, [isRunning, phaseDuration, sessionStart, history]);

  useEffect(() => {
    resetTimer();
  }, [phaseDuration, resetTimer]);

  const toggleTimer = () => {
    setIsRunning(prev => {
      if (!prev) {
        setSessionStart(Date.now());
        setReward(null);
      }
      return !prev;
    });
  };

  const handleDurationChange = (e) => {
    const newDuration = Math.max(1, Math.min(60, parseInt(e.target.value, 10) || 1));
    setPhaseDuration(newDuration);
  };

  const progress = ((phaseDuration * 1000 - timeLeft) / (phaseDuration * 1000)) * 100;

  const getProgressStyle = () => {
    const sideLength = 100;
    const adjustedProgress = (progress + (100 * currentPhase)) % 400;

    if (adjustedProgress <= sideLength) {
      return { width: `${adjustedProgress}%`, height: '4px', bottom: '0', left: '0' };
    } else if (adjustedProgress <= sideLength * 2) {
      return { width: '4px', height: `${adjustedProgress - sideLength}%`, top: '0', right: '0' };
    } else if (adjustedProgress <= sideLength * 3) {
      return { width: `${sideLength * 3 - adjustedProgress}%`, height: '4px', top: '0', right: '0' };
    } else {
      return { width: '4px', height: `${sideLength * 4 - adjustedProgress}%`, bottom: '0', left: '0' };
    }
  };

  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  return (
    <div className="App">
      <h1>Box Breathing</h1>
      <div className="breathing-container">
        <div className="breathing-box">
          <div className="progress-bar" style={getProgressStyle()}></div>
          <div className="phase-text">{PHASES[currentPhase]}</div>
          <div className="time-left">{(timeLeft / 1000).toFixed(1)}s</div>
        </div>
      </div>
      <div className="controls">
        <button className={isRunning ? 'active' : ''} onClick={toggleTimer}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      <div className="time-input">
        <label htmlFor="duration">Phase Duration (seconds): </label>
        <input
          type="number"
          id="duration"
          min="1"
          max="60"
          value={phaseDuration}
          onChange={handleDurationChange}
          disabled={isRunning}
        />
      </div>
      {reward && (
        <div className="reward">
          <p>{reward}</p>
          <div className="star">⭐</div>
        </div>
      )}
      <div className="total-stars">
        Total Stars: {totalStars}
      </div>
      <div className="history-toggle">
        <button onClick={toggleHistory}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      {showHistory && (
        <div className="history-list">
          <h2>Session History</h2>
          {history.length === 0 ? (
            <p>No sessions recorded yet.</p>
          ) : (
            <ul>
              {history.map((session, index) => (
                <li key={index}>
                  {new Date(session.start).toLocaleString()}: {session.duration} seconds
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
