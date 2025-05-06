import React, { useState,useEffect } from "react";
import { Input, Select, Tag } from "antd";
import ATimePicker from "./timePicker";
import "../styles/setup_editor.css";
import { data } from "react-router-dom";

const ruleTypeOptions = [
  { value: "intrusion", label: "Intrusion", color: "red" },
  { value: "tripwire", label: "Tripwire", color: "cyan" },
  { value: "zoom", label: "Zoom", color: "yellow" },
];

const SetupEditor = ({
  dataSelectedROI,
  setDataSelectedROI,
  handleTimePickerChange,
  setSelectedTool,
  handleResetPoints,
  MAX_ZOOM_REGION
}) => {

  const defaultOption = dataSelectedROI?.type || ruleTypeOptions[1];

  const [selectedRuleType, setSelectedRuleType] = useState({
    value: defaultOption.value,
    label: <Tag color={defaultOption.color}>{defaultOption.label}</Tag>,
  });

  const handleRuleTypeChange = (option) => {
    const match = ruleTypeOptions.find(o => o.value === option.value);
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
  const matchedOption = ruleTypeOptions.find(
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
        <p>
            Parameters{dataSelectedROI?.name ? ` - ${dataSelectedROI.name}` : ""}
        </p>
      </div>

      {dataSelectedROI && (
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
                options={ruleTypeOptions.map(opt => ({
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
      )}
    </div>
  );
};

export default SetupEditor;
