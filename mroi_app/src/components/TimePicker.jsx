import React, { useState } from 'react';
import '../styles/TimePicker.css';

function TimePicker({ onAdd }) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [confidentThreshold, setConfidentThreshold] = useState(0.5);

  const handleAdd = () => {
    if (!startTime || !endTime || confidentThreshold < 0 || confidentThreshold > 1) return;
    onAdd({
      start_time: startTime,
      end_time: endTime,
      confidence_threshold: confidentThreshold,
    });
  };

  return (
    <div className='time_box'>
      <p className='title'>Time & Confidence</p>
      <div className="time">
        <label>Start Time:</label>
        <input
          type="time"
          step="1"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div className="time">
        <label>End Time:</label>
        <input
          type="time"
          step="1"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <div className="time">
        <label>Confident:</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={confidentThreshold}
          onChange={(e) => setConfidentThreshold(parseFloat(e.target.value))}
        />
      </div>
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}

export default TimePicker;
