import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimePicker, InputNumber, Select, Input } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import debounce from 'lodash/debounce'; // <-- **แก้ไขบรรทัดนี้**

dayjs.extend(customParseFormat);

function ScheduleControls({ onChangeAll, scheduleData }) {
  const [localStartTime, setLocalStartTime] = useState(scheduleData.startTime ? dayjs(scheduleData.startTime, 'HH:mm:ss') : null);
  const [localEndTime, setLocalEndTime] = useState(scheduleData.endTime ? dayjs(scheduleData.endTime, 'HH:mm:ss') : null);
  const [localConfidenceThreshold, setLocalConfidenceThreshold] = useState(scheduleData.confidenceThreshold ?? null);
  const [localThresholdDuration, setLocalThresholdDuration] = useState(scheduleData.duration_threshold_seconds ?? null);
  const [localDirection, setLocalDirection] = useState(scheduleData.direction ?? null); 
  const [localAIType, setLocalAIType] = useState(scheduleData.AIType ?? null);

  const optionsDirection = [
    { value: "Both", label: "Both" },
    { value: "A to B", label: "A to B" },
    { value: "B to A", label: "B to A" },
  ];

  const prevValues = useRef({});


  useEffect(() => {
    setLocalStartTime(scheduleData.startTime ? dayjs(scheduleData.startTime, 'HH:mm:ss') : null);
    setLocalEndTime(scheduleData.endTime ? dayjs(scheduleData.endTime, 'HH:mm:ss') : null);
    setLocalConfidenceThreshold(scheduleData.confidenceThreshold ?? null);
    setLocalThresholdDuration(scheduleData.duration_threshold_seconds ?? null);
    setLocalDirection(scheduleData.direction ?? null);
    setLocalAIType(scheduleData.AIType ?? null);
  }, [scheduleData]);

  useEffect(() => {
    const newValues = {
      startTime: localStartTime ? localStartTime.format('HH:mm:ss') : '',
      endTime: localEndTime ? localEndTime.format('HH:mm:ss') : '',
      confidenceThreshold: localConfidenceThreshold,
      duration_threshold_seconds: localThresholdDuration,
      AIType: localAIType,
      direction: localDirection, 
    };

    const prev = prevValues.current;
    const changed =
      prev.startTime !== newValues.startTime ||
      prev.endTime !== newValues.endTime ||
      prev.confidenceThreshold !== newValues.confidenceThreshold ||
      prev.duration_threshold_seconds !== newValues.duration_threshold_seconds ||
      prev.AIType !== newValues.AIType ||
      prev.direction !== newValues.direction; 

    if (changed) {
      prevValues.current = newValues;
      if (onChangeAll) {
        onChangeAll(newValues);
      }
    }
  }, [localStartTime, localEndTime, localConfidenceThreshold, localThresholdDuration, localDirection, localAIType]);

  const debouncedSetLocalAIType = useCallback(
    debounce((value) => {
      setLocalAIType(value);
    },30),
    []
  )

  return (
    <>
      <div className="items_input_timepicker">
        <label>Start Time</label>
        <TimePicker
          className='input_box'
          value={localStartTime}
          onChange={setLocalStartTime}
          format="HH:mm:ss"
          allowClear={false}
        />
      </div>
      <div className="items_input_timepicker">
        <label>End Time</label>
        <TimePicker
          className='input_box'
          value={localEndTime}
          onChange={setLocalEndTime}
          format="HH:mm:ss"
          allowClear={false}
        />
      </div>
      <div className="items_input_timepicker">
        <label>Direction</label>
        <Select
          placeholder="Select Direction"
          style={{ width: '100%' }}
          value={localDirection}
          onChange={setLocalDirection} 
          options={optionsDirection}
        />
      </div>
      <div className="items_input_timepicker">
        <label>Confidence Threshold</label>
        <InputNumber
          className='input_box'
          placeholder='0.00'
          step={0.01}
          min={0}
          max={1}
          value={localConfidenceThreshold}
          onChange={setLocalConfidenceThreshold}
        />
      </div>
      <div className="items_input_timepicker">
        <label>Threshold Duration (seconds)</label>
        <InputNumber
          className='input_box'
          placeholder='0.00'
          step={1}
          min={0}
          value={localThresholdDuration}
          onChange={setLocalThresholdDuration}
        />
      </div>
      <div className="items_input_timepicker">
        <label>AI Type</label>
        <Input
          className='input_box'
          placeholder="AI Type"
          value={localAIType}
          onChange={(e) => debouncedSetLocalAIType(e.target.value)}
        />
      </div>
    </>
  );
}

export default ScheduleControls;