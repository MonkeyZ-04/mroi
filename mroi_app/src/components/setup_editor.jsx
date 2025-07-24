import React, { useState, useEffect } from "react";
import { Input, Select, Tag, Button, Modal } from "antd";
import ScheduleControls from "./schedule.jsx";
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import "../styles/setup_editor.css";
import { DeleteOutlined, PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { PiCookie, PiCrosshairSimpleBold } from "react-icons/pi";
import { CiPlay1, CiPause1, CiWavePulse1, CiClock1 } from "react-icons/ci";
import { HiMiniArrowsUpDown } from "react-icons/hi2";
import { GoCpu } from "react-icons/go";

const SetupEditor = ({
  dataSelectedROI,
  setDataSelectedROI,
  setSelectedTool,
  handleResetPoints,
  MAX_ZOOM_REGION,
  zoomCount
}) => {

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openZoomModal, setOpenZoomModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [disabledTimeRanges, setDisabledTimeRanges] = useState([]);
  
  const [scheduleData, setScheduleData] = useState({
    startTime: '00:00:00',
    endTime: '23:59:59',
    confidenceThreshold: null,
    confidenceZoom: null,
    duration_threshold_seconds: null,
    direction: null,
    AIType: ""
  });

  const filteredRuleTypeOptions = [
    { value: "intrusion", label: "Intrusion", color: "red" },
    { value: "tripwire", label: "Tripwire", color: "cyan" },
    { value: "zoom", label: "Zoom", color: "gold" },
    { value: "density", label: "Density", color: "geekblue" }
  ];
  
  const [selectedRuleType, setSelectedRuleType] = useState(null);
  
  useEffect(() => {
    if (dataSelectedROI?.roi_type) {
      const matched = filteredRuleTypeOptions.find(opt => opt.value === dataSelectedROI.roi_type);
      if (matched) {
        setSelectedRuleType({ value: matched.value, label: <Tag color={matched.color}>{matched.label}</Tag> });
      }
    } else {
        setSelectedRuleType(null);
    }
  }, [dataSelectedROI]);

  const calculateDisabledRanges = (currentIndex = -1) => {
    if (!dataSelectedROI || !dataSelectedROI.schedule) return [];
    return dataSelectedROI.schedule
      .filter((_, index) => index !== currentIndex)
      .map(sch => ({
        start: dayjs(sch.start_time, 'HH:mm:ss'),
        end: dayjs(sch.end_time, 'HH:mm:ss'),
      }));
  };

  const findNextAvailableSlot = (ranges) => {
    const sortedRanges = ranges.sort((a, b) => a.start.diff(b.start));
    let lastEndTime = dayjs('00:00:00', 'HH:mm:ss');

    for (const range of sortedRanges) {
      if (lastEndTime.isBefore(range.start)) {
        return lastEndTime.format('HH:mm:ss');
      }
      if (range.end.isAfter(lastEndTime)) {
        lastEndTime = range.end;
      }
    }

    if (lastEndTime.isBefore(dayjs('23:59:59', 'HH:mm:ss'))) {
      return lastEndTime.format('HH:mm:ss');
    }

    return null;
  };

  const updateSelectedSchedule = (index) => {
    const schedule = dataSelectedROI.schedule[index];
    setScheduleData({
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      confidenceThreshold: schedule.confidence_threshold,
      confidenceZoom: schedule.confidence_zoom,
      duration_threshold_seconds: schedule.duration_threshold_seconds,
      direction: schedule.direction,
      AIType: schedule.ai_type
    });
    setEditingIndex(index);
  };

  // --- **ส่วนที่แก้ไข: จัดการข้อมูลตอนเปลี่ยน Rule Type** ---
  const handleRuleTypeChange = (option) => {
    const match = filteredRuleTypeOptions.find(o => o.value === option.value);
    if (match) {
      setSelectedRuleType({ value: option.value, label: <Tag color={match.color}>{match.label}</Tag> });

      setDataSelectedROI(prev => {
        const newRule = { ...prev, roi_type: option.value };
        
        // ถ้าเปลี่ยนเป็น Zoom
        if (option.value === 'zoom') {
          delete newRule.schedule;
          delete newRule.roi_status;
          newRule.surveillance_id = newRule.surveillance_id || uuidv4();
        } 
        // ถ้าเปลี่ยนจาก Zoom เป็นอย่างอื่น
        else if (prev.roi_type === 'zoom' && option.value !== 'zoom') {
          delete newRule.surveillance_id;
          newRule.roi_status = 'OFF';
          newRule.schedule = [{
            surveillance_id: uuidv4(), ai_type: "intrusion", start_time: "00:00:00",
            end_time: "23:59:59", direction: "Both", confidence_threshold: 0.5,
            confidence_zoom: 0.5, duration_threshold_seconds: 0
          }];
        }
        return newRule;
      });
    }
  };

  const handleNameChange = (e) => {
    setDataSelectedROI(prev => ({ ...prev, name: e.target.value }));
  };

  const showModalCreate = () => {
    const ranges = calculateDisabledRanges();
    const nextSlot = findNextAvailableSlot(ranges);

    if (nextSlot === null) {
      Modal.warning({ title: "No available time slots left." });
      return;
    }

    setDisabledTimeRanges(ranges);
    setScheduleData({
      startTime: nextSlot,
      endTime: nextSlot,
      confidenceThreshold: 0.5,
      confidenceZoom: 0.5,
      duration_threshold_seconds: 0,
      direction: 'Both',
      AIType: ""
    });
    setEditingIndex(Date.now());
    setOpenCreateModal(true);
  };

  const showModalUpdate = (index) => {
    setDisabledTimeRanges(calculateDisabledRanges(index));
    updateSelectedSchedule(index);
    setOpenUpdateModal(true);
  };

  const handleCreateSchedule = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpenCreateModal(false);
      setConfirmLoading(false);
      addSchedule(scheduleData);
    }, 200);
  };

  const handleUpdateSchedule = () => {
    const updatedSchedule = {
      ...dataSelectedROI.schedule[editingIndex],
      start_time: scheduleData.startTime,
      end_time: scheduleData.endTime,
      confidence_threshold: scheduleData.confidenceThreshold,
      confidence_zoom: scheduleData.confidenceZoom,
      duration_threshold_seconds: scheduleData.duration_threshold_seconds,
      direction: scheduleData.direction,
      ai_type: scheduleData.AIType
    };
    const newScheduleList = [...dataSelectedROI.schedule];
    newScheduleList[editingIndex] = updatedSchedule;
    setDataSelectedROI({ ...dataSelectedROI, schedule: newScheduleList });
    setOpenUpdateModal(false);
  };

  const handleCancel = () => {
    setOpenCreateModal(false);
    setOpenUpdateModal(false);
  };

  const addSchedule = (data) => {
    const newSchedule = {
      surveillance_id: uuidv4(),
      start_time: data.startTime,
      end_time: data.endTime,
      confidence_threshold: data.confidenceThreshold,
      confidence_zoom: data.confidenceZoom,
      duration_threshold_seconds: data.duration_threshold_seconds,
      direction: data.direction,
      ai_type: data.AIType
    };
    setDataSelectedROI(prev => ({ ...prev, schedule: [...(prev.schedule || []), newSchedule] }));
  };

  const deleteSchedule = (index) => {
    const newList = dataSelectedROI.schedule.filter((_, i) => i !== index);
    setDataSelectedROI({ ...dataSelectedROI, schedule: newList });
  };

  const handleCheckzoom = (option) =>{
    if ((option.value === "zoom") && zoomCount >= MAX_ZOOM_REGION && dataSelectedROI?.roi_type !== 'zoom'){
      setOpenZoomModal(true);
    } else {
      handleRuleTypeChange(option);
      setSelectedTool(option.value);
      handleResetPoints();
    }
  }

  return (
    <div className="container_setup">
      {dataSelectedROI ? (
        <>
          <div className="parameter_box">
            <div className="header_parameter_box">
              <div className="title">Parameters - {dataSelectedROI.name || ""}</div>
            </div>
            <div className="body_parameter_box">
              <div className="body_parameter_have_data">
                <div className="items_input">
                  <label>Rule Name</label>
                  <Input style={{ width: "50%", height: '38px' }} placeholder="Enter rule name" value={dataSelectedROI.name || ""} onChange={handleNameChange} />
                </div>
                <div className="items_input">
                  <label>Rule Type</label>
                  <Select
                    style={{ width: "50%", height: '38px' }}
                    labelInValue
                    value={selectedRuleType}
                    onChange={handleCheckzoom}
                    options={filteredRuleTypeOptions.map(opt => ({ value: opt.value, label: <Tag color={opt.color}>{opt.label}</Tag> }))}
                  />
                  <Modal title={<span><ExclamationCircleFilled style={{ color: 'red', fontSize: '24px', marginRight: 8 }} /> Limit Region</span>} open={openZoomModal} footer={[<Button key="ok" className="custom-ok-button-create" onClick={() => setOpenZoomModal(false)}>OK</Button>]}>
                    <p>Only one Zoom region can be created.</p>
                  </Modal>
                </div>
                <div className="items_input_alert">
                  <div className="text_alert_change_type"></div>
                  <div className="text_alert_change_type"><p>Changing rule type will remove the drawn rule. Please enable draw mode to redraw.</p></div>
                </div>
                <div className="items_input">
                  <label>Date Created</label>
                  <div className="create_by_label"><p>{dataSelectedROI.created_date}</p></div>
                </div>
                <div className="items_input">
                  <label>Created By</label>
                  <div className="create_by_label"><p>{dataSelectedROI.created_by || "Prasit Paisan"}</p></div>
                </div>
              </div>
            </div>
          </div>

          {dataSelectedROI.roi_type !== 'zoom' && (
            <div className="schedule_box">
              <div className="header_schedule_box">
                <div className="title">Schedule - {dataSelectedROI.name}</div>
              </div>
              <div className="body_schedule_box">
                <div className="body_schedule_wrapper">
                  {Array.isArray(dataSelectedROI.schedule) && dataSelectedROI.schedule.length > 0 ? (
                    <div className="body_schedule_have_data">
                      {dataSelectedROI.schedule.map((item, index) => (
                        <div key={index} className="items_schedule" onClick={() => showModalUpdate(index)}>
                          <div className="info_schedule"><CiPlay1 />{item.start_time}</div>
                          <div className="info_schedule"><CiPause1 />{item.end_time}</div>
                          <div className="info_schedule_shot"><HiMiniArrowsUpDown />{item.direction}</div>
                          <div className="info_schedule_shot"><CiWavePulse1 />{item.confidence_threshold}</div>
                          <div className="info_schedule_shot"><PiCrosshairSimpleBold />{item.confidence_zoom}</div>
                          <div className="info_schedule_shot"><CiClock1 />{item.duration_threshold_seconds}</div>
                          <div className="info_schedule_long"><GoCpu />{item.ai_type}</div>
                          <div className="info_schedule_shot delete_box">
                            <span className='bin' onClick={(e) => { e.stopPropagation(); deleteSchedule(index); }}>
                              <DeleteOutlined className='delete_icon' />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="body_parameter_no_data"><p>No schedule created for this rule.</p></div>
                  )}
                  <Button onClick={showModalCreate} className="button_create_schedule"><PlusOutlined /> Create a New Schedule</Button>
                  {openCreateModal && <Modal title="Create a New Schedule" open={openCreateModal} onOk={handleCreateSchedule} okText="Create" confirmLoading={confirmLoading} onCancel={handleCancel} okButtonProps={{ className: 'custom-ok-button-create' }} cancelButtonProps={{ className: 'custom-cancel-button' }}>
                    <ScheduleControls key={editingIndex} scheduleData={scheduleData} onChangeAll={setScheduleData} roiType={dataSelectedROI.roi_type} disabledTimeRanges={disabledTimeRanges} />
                  </Modal>}
                  {openUpdateModal && <Modal title="Edit Schedule" open={openUpdateModal} onOk={handleUpdateSchedule} okText="Save" confirmLoading={confirmLoading} onCancel={handleCancel} okButtonProps={{ className: 'custom-ok-button-update' }} cancelButtonProps={{ className: 'custom-cancel-button' }}>
                    <ScheduleControls key={editingIndex} scheduleData={scheduleData} onChangeAll={setScheduleData} roiType={dataSelectedROI.roi_type} disabledTimeRanges={disabledTimeRanges} />
                  </Modal>}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="parameter_box">
            <div className="header_parameter_box">
              <div className="title">Parameters</div>
            </div>
            <div className="body_parameter_box">
              <div className="body_parameter_no_data">
                  <PiCookie style={{ fontSize: '32px' }} />
                  <p>No Data, Please Select any Rules</p>
              </div>
            </div>
          </div>
          <div className="schedule_box" />
        </>
      )}
    </div>
  );
};

export default SetupEditor;