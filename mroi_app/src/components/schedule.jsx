import React, { useState, useEffect, useCallback } from 'react';
import { TimePicker, InputNumber, Select, Input } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import debounce from 'lodash/debounce';

dayjs.extend(customParseFormat);

function ScheduleControls({ onChangeAll, scheduleData, roiType, disabledTimeRanges = [] }) {
  // --- **ส่วนที่แก้ไข: ใช้ scheduleData เป็นค่าเริ่มต้นแค่ครั้งเดียว** ---
  const [localStartTime, setLocalStartTime] = useState(() => scheduleData.startTime ? dayjs(scheduleData.startTime, 'HH:mm:ss') : null);
  const [localEndTime, setLocalEndTime] = useState(() => scheduleData.endTime ? dayjs(scheduleData.endTime, 'HH:mm:ss') : null);
  const [localConfidenceThreshold, setLocalConfidenceThreshold] = useState(() => scheduleData.confidenceThreshold ?? 0.5);
  const [localConfidenceZoom, setLocalConfidenceZoom] = useState(() => scheduleData.confidenceZoom ?? 0.5);
  const [localThresholdDuration, setLocalThresholdDuration] = useState(() => scheduleData.duration_threshold_seconds ?? 0);
  const [localDirection, setLocalDirection] = useState(() => scheduleData.direction ?? 'Both');
  const [localAIType, setLocalAIType] = useState(() => scheduleData.AIType ?? '');

  const optionsDirection = [
    { value: "Both", label: "Both" },
    { value: "A to B", label: "A to B" },
    { value: "B to A", label: "B to A" },
  ];

  // --- **ส่วนที่แก้ไข: ปรับปรุง Debounce ให้เสถียรขึ้น** ---
  const debouncedOnChangeAll = useCallback(
    debounce((values) => {
      if (onChangeAll) {
        onChangeAll(values);
      }
    }, 200),
    [onChangeAll]
  );

  useEffect(() => {
    const newValues = {
      startTime: localStartTime ? localStartTime.format('HH:mm:ss') : '',
      endTime: localEndTime ? localEndTime.format('HH:mm:ss') : '',
      confidenceThreshold: localConfidenceThreshold,
      confidenceZoom: localConfidenceZoom,
      duration_threshold_seconds: localThresholdDuration,
      AIType: localAIType,
      direction: localDirection,
    };
    debouncedOnChangeAll(newValues);
  }, [localStartTime, localEndTime, localConfidenceThreshold, localConfidenceZoom, localThresholdDuration, localDirection, localAIType, debouncedOnChangeAll]);

  const debouncedSetLocalAIType = useCallback(
    debounce((value) => {
      setLocalAIType(value);
    }, 300),
    []
  );

  const isTimeInDisabledRange = (time, ranges) => {
    for (const range of ranges) {
      if (time.isAfter(range.start) && time.isBefore(range.end)) {
        return true;
      }
    }
    return false;
  };

  const getDisabledTime = (pickerType) => (now) => {
    const ranges = disabledTimeRanges || [];
    const nextDisabledRangeStart = ranges
      .filter(range => localStartTime && range.start.isAfter(localStartTime))
      .sort((a, b) => a.start - b.start)[0]?.start;

    const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const disabledHours = new Set();
    for (let h = 0; h < 24; h++) {
        let isHourFullyDisabled = true;
        for (let m = 0; m < 60; m++) {
            if (!isTimeInDisabledRange(now.hour(h).minute(m), ranges)) {
                isHourFullyDisabled = false;
                break;
            }
        }
        if (isHourFullyDisabled) disabledHours.add(h);

        if (pickerType === 'end' && localStartTime && h < localStartTime.hour()) {
            disabledHours.add(h);
        }
        if (pickerType === 'end' && nextDisabledRangeStart && h > nextDisabledRangeStart.hour()) {
            disabledHours.add(h);
        }
    }

    return {
      disabledHours: () => Array.from(disabledHours),
      disabledMinutes: (h) => {
        if (pickerType === 'end' && localStartTime && h === localStartTime.hour()) {
          return range(0, localStartTime.minute());
        }
        if (pickerType === 'end' && nextDisabledRangeStart && h === nextDisabledRangeStart.hour()) {
           return range(nextDisabledRangeStart.minute(), 59);
        }
        const disabled = new Set();
        for (let m = 0; m < 60; m++) {
            if (isTimeInDisabledRange(now.hour(h).minute(m), ranges)) {
                disabled.add(m);
            }
        }
        return Array.from(disabled);
      },
      disabledSeconds: (h, m) => {
        if (pickerType === 'end' && localStartTime && h === localStartTime.hour() && m === localStartTime.minute()) {
          return range(0, localStartTime.second());
        }
        return [];
      }
    };
  };

  return (
    <>
      <div className="items_input_timepicker">
        <label>Start Time</label>
        <TimePicker
          className='input_box'
          value={localStartTime}
          onChange={(time) => {
            setLocalStartTime(time);
            if (localEndTime && time && localEndTime.isBefore(time)) {
              setLocalEndTime(time);
            }
          }}
          format="HH:mm:ss"
          allowClear={false}
          disabledTime={getDisabledTime('start')}
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
          disabledTime={getDisabledTime('end')}
        />
      </div>
      {roiType !== 'zoom' && (
        <>
          <div className="items_input_timepicker">
            <label>Direction</label>
            <Select placeholder="Select Direction" style={{ width: '100%' }} value={localDirection} onChange={setLocalDirection} options={optionsDirection} />
          </div>
          <div className="items_input_timepicker">
            <label>Confidence Threshold</label>
            <InputNumber className='input_box' placeholder='0.00' step={0.01} min={0} max={1} value={localConfidenceThreshold} onChange={setLocalConfidenceThreshold} />
          </div>
          <div className="items_input_timepicker">
            <label>Confidence Zoom</label>
            <InputNumber className='input_box' placeholder='0.00' step={0.01} min={0} max={1} value={localConfidenceZoom} onChange={setLocalConfidenceZoom} />
          </div>
          <div className="items_input_timepicker">
            <label>Threshold Duration (seconds)</label>
            <InputNumber className='input_box' placeholder='0.00' step={1} min={0} value={localThresholdDuration} onChange={setLocalThresholdDuration} />
          </div>
          <div className="items_input_timepicker">
            <label>AI Type</label>
            <Input className='input_box' placeholder="AI Type" defaultValue={localAIType} onChange={(e) => debouncedSetLocalAIType(e.target.value)} />
          </div>
        </>
      )}
    </>
  );
}

export default ScheduleControls;