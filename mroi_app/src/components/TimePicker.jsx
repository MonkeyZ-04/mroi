import React, { useState, useEffect, useRef } from 'react';
import '../styles/TimePicker.css';

function TimePicker({ onChangeAll, startTime, endTime, confidentThreshold }) {
  const [localStartTime, setLocalStartTime] = useState(startTime || '');
  const [localEndTime, setLocalEndTime] = useState(endTime || '');
  const [localConfidentThreshold, setLocalConfidentThreshold] = useState(confidentThreshold ?? 0.5);

  const prevValues = useRef({});

  // Sync external props to local state when props change
  useEffect(() => {
    setLocalStartTime(startTime || '');
  }, [startTime]);

  useEffect(() => {
    setLocalEndTime(endTime || '');
  }, [endTime]);

  useEffect(() => {
    setLocalConfidentThreshold(confidentThreshold ?? 0.5);
  }, [confidentThreshold]);

  // Send updated values if they changed
  useEffect(() => {
    const newValues = {
      startTime: localStartTime,
      endTime: localEndTime,
      confidentThreshold: localConfidentThreshold,
    };

    const prev = prevValues.current;
    const changed =
      prev.startTime !== newValues.startTime ||
      prev.endTime !== newValues.endTime ||
      prev.confidentThreshold !== newValues.confidentThreshold;

    if (changed) {
      prevValues.current = newValues;
      if (onChangeAll) {
        onChangeAll(newValues);
      }
    }
  }, [localStartTime, localEndTime, localConfidentThreshold, onChangeAll]);

  // Handlers
  const handleStartTimeChange = (e) => {
    setLocalStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setLocalEndTime(e.target.value);
  };

  const handleConfidentChange = (e) => {
    setLocalConfidentThreshold(parseFloat(e.target.value));
  };

  return (
    <div className='time_box'>
      <p className='title'>Time</p>

      <div className="time">
        <label>Start Time:</label>
        <input
          type="time"
          step="1"
          value={localStartTime}
          onChange={handleStartTimeChange}
          required
        />
      </div>

      <div className="time">
        <label>End Time:</label>
        <input
          type="time"
          step="1"
          value={localEndTime}
          onChange={handleEndTimeChange}
          required
        />
      </div>

      <div className="time">
        <label>Confidence:</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={localConfidentThreshold}
          onChange={handleConfidentChange}
          required
        />
      </div>
    </div>
  );
}

export default TimePicker;
