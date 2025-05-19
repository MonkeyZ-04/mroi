import React, { useState, useEffect, useRef } from 'react';
import { TimePicker, InputNumber } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

function ATimePicker({ onChangeAll, startTime, endTime, confidenceThreshold }) {
  
  const [localStartTime, setLocalStartTime] = useState(startTime ? dayjs(startTime, 'HH:mm:ss') : null);
  const [localEndTime, setLocalEndTime] = useState(endTime ? dayjs(endTime, 'HH:mm:ss') : null);
  const [localConfidenceThreshold, setLocalConfidenceThreshold] = useState(confidenceThreshold ?? 0.5);

  const prevValues = useRef({});

  // Sync external props to local state
  useEffect(() => {
    setLocalStartTime(startTime ? dayjs(startTime, 'HH:mm:ss') : null);
  }, [startTime]);

  useEffect(() => {
    setLocalEndTime(endTime ? dayjs(endTime, 'HH:mm:ss') : null);
  }, [endTime]);

  useEffect(() => {
    setLocalConfidenceThreshold(confidenceThreshold ?? 0.5);
  }, [confidenceThreshold]);

useEffect(() => {
  const newValues = {
      startTime: localStartTime ? localStartTime.format('HH:mm:ss') : '',
      endTime: localEndTime ? localEndTime.format('HH:mm:ss') : '',
      confidenceThreshold: localConfidenceThreshold,
  };

  const prev = prevValues.current;
  const changed =
      prev.startTime !== newValues.startTime ||
      prev.endTime !== newValues.endTime ||
      prev.confidenceThreshold !== newValues.confidenceThreshold;

  if (changed) {
      prevValues.current = newValues;
      if (onChangeAll) {
          onChangeAll(newValues);  // ส่งค่ากลับไปยัง parent
      }
  }
}, [localStartTime, localEndTime, localConfidenceThreshold, onChangeAll]);


  return (
    <>
      <div className="items_input">
        <label>Start Time:</label>
          <TimePicker
            className='input_box'
            value={localStartTime}
            onChange={setLocalStartTime}
            format="HH:mm:ss"
            allowClear={false}
          />
      </div>
      <div className="items_input">
          <label>End Time:</label>
          <TimePicker
            className='input_box'
            value={localEndTime}
            onChange={setLocalEndTime}
            format="HH:mm:ss"
            allowClear={false}
          />
      </div>
      <div className="items_input">
          <label>Confidence:</label>
          <InputNumber
            className='input_box'
            step={0.01}
            min={0}
            max={1}
            value={localConfidenceThreshold}
            onChange={setLocalConfidenceThreshold}
          />
      </div>
    </>
    
  );
}

export default ATimePicker;
