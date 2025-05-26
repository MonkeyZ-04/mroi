import React, { useState,useEffect } from "react";
import { Input, Select, Tag , Button, Dropdown, Space} from "antd";
import ATimePicker from "./time_picker.jsx";
import "../styles/setup_editor.css";
import {FileExcelOutlined, DownOutlined, ClockCircleOutlined } from '@ant-design/icons';


const SetupEditor = ({
  dataSelectedROI,
  setDataSelectedROI,
  handleTimePickerChange,
  setSelectedTool,
  handleResetPoints,
  MAX_ZOOM_REGION,
  zoomCount
}) => {

  // Schedule Items
  const handleSelectSchedule = (e) => {
    const selectedIndex = Number(e.key);
    console.log('Selected index:', selectedIndex);
    setSelectedSchedule(dataSelectedROI.schedule[0]);
  };
  
  const [scheduleOptions,setScheduleOptions] = useState([])
  const [selectedSchedule,setSelectedSchedule] = useState({index:0,schedule:{}})

  useEffect(() => {
    if (dataSelectedROI?.schedule) {
      const schedule = dataSelectedROI.schedule;
  
      const newItems = schedule.map((item, index) => ({
        key: `${index}`,
        label: `${item.ai_type} (${item.start_time} - ${item.end_time})`,
        icon: <ClockCircleOutlined />,
      }));
      
      console.log(newItems[0].label)
      setScheduleOptions(newItems);
       
    }
  }, [dataSelectedROI?.schedule]);

  const menuProps = {
    items: scheduleOptions, 
    onClick: handleSelectSchedule,
  };
  //========END============

  // Config type zoom can have just one
  const ruleTypeOptions = [
    { value: "intrusion", label: "Intrusion", color: "red" },
    { value: "tripwire", label: "Tripwire", color: "cyan" },
    { value: "zoom", label: "Zoom", color: "yellow" },
  ]
  const filteredRuleTypeOptions =
    zoomCount >= MAX_ZOOM_REGION
      ? ruleTypeOptions.filter((opt) => opt.value !== "zoom")
      : ruleTypeOptions;
   //========END============

  const defaultOption = dataSelectedROI?.type || filteredRuleTypeOptions[1];

  const [selectedRuleType, setSelectedRuleType] = useState({
    value: defaultOption.value,
    label: <Tag color={defaultOption.color}>{defaultOption.label}</Tag>,
  });

  //change type  
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
   //=========END============

  //change name realtime
  const handleNameChange = (e) => {
    setDataSelectedROI(prev => ({
      ...prev,
      name: e.target.value,
    }));
  };
  //=========END============

useEffect(() => {
  const matchedOption = filteredRuleTypeOptions.find(
    (opt) => opt.value === dataSelectedROI?.type
  );

  if (matchedOption) {
    setSelectedRuleType({
      value: matchedOption.value,
      label: <Tag color={matchedOption.color}>{matchedOption.label}</Tag>,
    });
  }
}, [dataSelectedROI?.type]);


  return (
    <div className="container_setup">
      <div className="setup_header">
        <div>
        <p>
            Parameters{dataSelectedROI?.name ? ` - ${dataSelectedROI.name}` : ""}
        </p>
        </div>
          {dataSelectedROI?.schedule?.length > 0 && (
              <Dropdown menu={menuProps}>
                <Button>
                  <Space>
                    {scheduleOptions?.[selectedSchedule]?.label || 'menu'}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            )}
        </div>

      {dataSelectedROI ? (
        <div className="setup_body_box">
          <div className="setup_input_left">
            <div className="items_input">
              <label>Rule Name</label>
              <Input
                style={{ width: "50%" }}
                placeholder="Enter rule name"
                value={dataSelectedROI.name || ""}
                onChange={handleNameChange}
              />
            </div>

            <div className="items_input">
              <label>Rule Type</label>
              <Select
                style={{ width: "50%", height: "100%" }}
                labelInValue
                value={selectedRuleType}
                onChange={(option) =>{
                    handleRuleTypeChange(option),
                    setSelectedTool(option.value),
                    handleResetPoints()}}
                options={filteredRuleTypeOptions.map(opt => ({
                  value: opt.value,
                  label: <Tag color={opt.color}>{opt.label}</Tag>,
                }))}
              />
            </div>

            <div className="items_input">
              <div className="text_alert_change_type">
                <p>
                  Changing rule type will remove the drawn rule. Please enable draw mode to redraw.
                </p>
              </div>
            </div>

            <ATimePicker
              startTime={dataSelectedROI.schedule?.start_time }
              endTime={dataSelectedROI.schedule?.end_time  }
              confidenceThreshold={dataSelectedROI.confidence_threshold  }
              onChangeAll={handleTimePickerChange}
            />
          </div>

          <div className="setup_input_right">
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
        </div>
      ):(
        <div className="box_no_data">
          <div >
            <FileExcelOutlined className="no_data_icon"/>
          </div>
          <div className="no_data_alert">
            No Data, Please Select any Rules
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupEditor;






// Timer picker 

const handleTimePickerChange = (data) => {//for timepicker setdate
    console.log('now i fig in handle timer picker change function ')
    const updatedSelectedROI = {
      ...dataSelectedROI,
      // schedule: {
      //   start_time: data.startTime,
      //   end_time: data.endTime,
      // },
      confidence_threshold: data.confidenceThreshold,
    };