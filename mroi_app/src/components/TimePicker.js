
import React, { useState } from 'react';
import '../styles/TimePicker.css';

function TimePicker() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  return (
    <div className='time_box'>
        <p className='title'> Time</p>
        <div className="time">
            <label>
            Start Time:
            </label>
            <input
                type="time"
                step="1" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
            />
        </div>

        <div className="time">
            <label>
            End Time:
            </label>
            <input
                type="time"
                step="1" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
            />
        </div>

      {/* <div className="summary">
        <p>Start: {startTime}</p>
        <p>End: {endTime}</p>
      </div> */}
    </div>
  );
}

export default TimePicker;
