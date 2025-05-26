import React, { useState, useEffect } from "react";
import { Input, Select, Tag, Button, Modal } from "antd";
import ScheduleControls from "./schedule.jsx";
import { v4 as uuidv4 } from 'uuid';
import "../styles/setup_editor.css";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { PiCookie } from "react-icons/pi";
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
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    startTime: '00:00:00',
    endTime: '23:59:59',
    confidenceThreshold: null,
    duration_threshold_seconds: null,
    direction: null,
    AIType: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const updateSelectedSchedule = (index) => {
    const schedule = dataSelectedROI.schedule[index];
    setScheduleData({
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      confidenceThreshold: schedule.confidence_threshold,
      duration_threshold_seconds: schedule.duration_threshold_seconds,
      direction: schedule.direction,
      AIType: schedule.ai_type
    });
    setEditingIndex(index);
  };

  const filteredRuleTypeOptions = [
    { value: "intrusion", label: "Intrusion", color: "red" },
    { value: "tripwire", label: "Tripwire", color: "cyan" },
    { value: "zoom", label: "Zoom", color: "gold" },
    { value: "density", label: "Density", color: "geekblue"}
  ];

  const defaultOption = dataSelectedROI?.type || filteredRuleTypeOptions[1];

  const [selectedRuleType, setSelectedRuleType] = useState({
    value: defaultOption.value,
    label: <Tag color={defaultOption.color}>{defaultOption.label}</Tag>,
  });

  const handleRuleTypeChange = (option) => {
    const match = filteredRuleTypeOptions.find(o => o.value === option.value);
    setSelectedRuleType({
      value: option.value,
      label: <Tag color={match.color}>{match.label}</Tag>,
    });

    setDataSelectedROI(prev => ({
      ...prev,
      type: option.value,
    }));
  };

  const handleNameChange = (e) => {
    setDataSelectedROI(prev => ({
      ...prev,
      name: e.target.value,
    }));
  };

  useEffect(() => {
    const matched = filteredRuleTypeOptions.find(
      (opt) => opt.value === dataSelectedROI?.type
    );
    if (matched) {
      setSelectedRuleType({
        value: matched.value,
        label: <Tag color={matched.color}>{matched.label}</Tag>,
      });
    }
  }, [dataSelectedROI?.type]);

  const handleCreateScheduleData = (data) => {
    setScheduleData(data);
  };

  const handleUpdateScheduleData = (data) => {
    setScheduleData(data);
  };

  const showModalCreate = () => {
    setScheduleData({
      startTime: '00:00:00',
      endTime: '23:59:59',
      confidenceThreshold: null,
      duration_threshold_seconds: null,
      direction: null,
      AIType: ""
    });
    setOpenCreateModal(true);
  };

  const showModalUpdate = () => {
    setOpenUpdateModal(true);
  };

  const handleCreateSchedule = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpenCreateModal(false);
      setConfirmLoading(false);
    }, 200);
    addSchedule(scheduleData);
  };

  const handleUpdateSchedule = () => {
    const updatedSchedule = {
      ...dataSelectedROI.schedule[editingIndex],
      start_time: scheduleData.startTime,
      end_time: scheduleData.endTime,
      confidence_threshold: scheduleData.confidenceThreshold,
      duration_threshold_seconds: scheduleData.duration_threshold_seconds,
      direction: scheduleData.direction,
      ai_type: scheduleData.AIType
    };

    const newScheduleList = [...dataSelectedROI.schedule];
    newScheduleList[editingIndex] = updatedSchedule;

    setDataSelectedROI({
      ...dataSelectedROI,
      schedule: newScheduleList
    });

    setOpenUpdateModal(false);
  };

  const handleCancel = () => {
    setOpenCreateModal(false);
    setOpenUpdateModal(false);
  };

  const addSchedule = ({
    startTime,
    endTime,
    confidenceThreshold,
    duration_threshold_seconds,
    direction,
    AIType
  }) => {
    const newSchedule = {
      surveillance_id: uuidv4(),
      start_time: startTime,
      end_time: endTime,
      confidence_threshold: confidenceThreshold,
      duration_threshold_seconds:duration_threshold_seconds,
      direction:direction,
      ai_type: AIType
    };

    setDataSelectedROI({
      ...dataSelectedROI,
      schedule: [...dataSelectedROI.schedule, newSchedule]
    });
  };

  const deleteSchedule = (index) => {
    const newList = dataSelectedROI.schedule.filter((_, i) => i !== index);
    setDataSelectedROI({
      ...dataSelectedROI,
      schedule: newList
    });
  };

  return (
    <div className="container_setup">
      <div className="parameter_box">
        <div className="header_parameter_box">
          <div className="title">
            Parameters{dataSelectedROI?.name ? ` - ${dataSelectedROI.name}` : ""}
          </div>
        </div>
        <div className="body_parameter_box">
          {dataSelectedROI ? (
            <div className="body_parameter_have_data">
              <div className="items_input">
                <label>Rule Name</label>
                <Input
                  style={{ width: "50%", height: '38px' }}
                  placeholder="Enter rule name"
                  value={dataSelectedROI.name || ""}
                  onChange={handleNameChange}
                />
              </div>
              <div className="items_input">
                <label>Rule Type</label>
                <Select
                  style={{ width: "50%", height: '38px' }}
                  labelInValue
                  value={selectedRuleType}
                  onChange={(option) => {
                    handleRuleTypeChange(option);
                    setSelectedTool(option.value);
                    handleResetPoints();
                  }}
                  options={filteredRuleTypeOptions.map(opt => ({
                    value: opt.value,
                    label: <Tag color={opt.color}>{opt.label}</Tag>,
                  }))}
                />
              </div>
              <div className="items_input_alert">
                <div className="text_alert_change_type">
                </div>
                <div className="text_alert_change_type">
                  <p>Changing rule type will remove the drawn rule. Please enable draw mode to redraw.</p>
                </div>
              </div>
              <div className="items_input">
                <label>Date Created</label>
                <div className="create_by_label">
                  <p>{dataSelectedROI.created_date}</p>
                </div>
              </div>
              <div className="items_input">
                <label>Created By</label>
                <div className="create_by_label">
                  <p>{dataSelectedROI.created_by || "Prasit Paisan"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="body_parameter_no_data">
              <PiCookie style={{ fontSize: '32px' }} />
              <p>No Data, Please Select any Rules</p>
            </div>
          )}
        </div>
      </div>

      <div className="schedule_box">
        <div className="header_schedule_box">
          <div className="title">
            Schedule{dataSelectedROI?.name ? ` - ${dataSelectedROI.name}` : ""}
          </div>
        </div>
        <div className="body_schedule_box">

          {dataSelectedROI ? (
            <div className="body_schedule_wrapper">
              {Array.isArray(dataSelectedROI?.schedule) && dataSelectedROI.schedule.length > 0 ? (
                <div className="body_schedule_have_data">
                  {dataSelectedROI.schedule.map((item, index) => (
                    <div
                      key={index}
                      className="items_schedule"
                      onClick={() => {
                        updateSelectedSchedule(index);
                        showModalUpdate();
                      }}
                    >
                      <div className="info_schedule"><CiPlay1 />{item.start_time}</div>
                      <div className="info_schedule"><CiPause1 />{item.end_time}</div>
                      <div className="info_schedule_shot"><HiMiniArrowsUpDown />{item.direction}</div>
                      <div className="info_schedule_shot"><CiWavePulse1 />{item.confidence_threshold}</div>
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
                <div className="body_parameter_no_data">
                  <PiCookie style={{ fontSize: '32px' }} />
                  <p>No Data, Please Select any Rules</p>
                </div>
              )}

              <Button onClick={showModalCreate} className="button_create_schedule">
                <PlusOutlined /> Create a New Schedule
              </Button>


              {/* Create Modal */}
              <Modal
                title="Create a New Schedule"
                open={openCreateModal}
                onOk={handleCreateSchedule}
                okText="Create"
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                okButtonProps={{
                  className: 'custom-ok-button-create',
                }}
                cancelButtonProps={{
                  className: 'custom-cancel-button',
                }}
              >
                <ScheduleControls
                  scheduleData={scheduleData}
                  onChangeAll={handleCreateScheduleData}
                />
              </Modal>

              {/* Update Modal */}
              <Modal
                title="Edit Schedule"
                open={openUpdateModal}
                onOk={handleUpdateSchedule}
                okText="Save"
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                okButtonProps={{
                  className: 'custom-ok-button-update',
                }}
                cancelButtonProps={{
                  className: 'custom-cancel-button',
                }}
              >
                <ScheduleControls
                  scheduleData={scheduleData}
                  onChangeAll={handleUpdateScheduleData}
                />
              </Modal>
            </div>
          ) : (
            <div className="body_parameter_no_data">
              <PiCookie style={{ fontSize: '32px' }} />
              <p>No Data, Please Select any Rules</p>
            </div>
          )
          }

        </div>
      </div>
    </div>
  );
};

export default SetupEditor;
