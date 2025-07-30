import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Modal, Breadcrumb, notification } from 'antd';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Link } from 'react-router-dom'; // 1. เพิ่มการ import Link เข้ามา
import {
  LeftOutlined,
  SaveOutlined,
  SignatureOutlined,
  InfoCircleOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';

import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/tools.css';

import DrawingCanvas from './drawing_canvas.jsx';
import Sidebar from './sidebar.jsx';
import SetupEditor from './setup_editor.jsx';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const CREATOR = import.meta.env.VITE_CREATOR;
const MAX_TOTAL_REGION = parseInt(import.meta.env.VITE_MAX_TOTAL_REGION) ;
const MAX_ZOOM_REGION = parseInt(import.meta.env.VITE_MAX_ZOOM_REGION);

const migrateRuleFormat = (rule, index) => {
  const isNewFormat = !!rule.roi_type;
  const roiType = isNewFormat ? rule.roi_type : rule.type;

  if (roiType === 'zoom') {
    const newRule = {
      points: rule.points,
      roi_type: 'zoom',
      name: rule.name || `Rule ${index + 1}`,
      roi_id: rule.roi_id || uuidv4(),
      created_date: rule.created_date || new Date().toLocaleDateString("en-GB"),
      created_by: rule.created_by || CREATOR,
      surveillance_id: rule.surveillance_id || (rule.schedule && rule.schedule.surveillance_id) || uuidv4(),
    };
    if (Array.isArray(rule.points) && !Array.isArray(rule.points[0])) {
      newRule.points = [rule.points];
    }
    return newRule;
  }

  if (isNewFormat) return rule;

  const newRule = {
    points: rule.points,
    roi_type: rule.type,
    name: `Rule ${index + 1}`,
    roi_id: uuidv4(),
    created_date: new Date().toLocaleDateString("en-GB"),
    created_by: CREATOR,
    roi_status: rule.status || 'OFF',
    schedule: [],
  };

  if (rule.schedule && typeof rule.schedule === 'object' && !Array.isArray(rule.schedule)) {
    newRule.schedule.push({
      surveillance_id: uuidv4(),
      ai_type: "intrusion",
      start_time: rule.schedule.start_time || "00:00:00",
      end_time: rule.schedule.end_time || "23:59:59",
      direction: "Both",
      confidence_threshold: rule.confidence_threshold || 0.5,
      confidence_zoom: 0.5,
      duration_threshold_seconds: 0,
    });
  }

  return newRule;
};


function Tools() {
  const [regionAIConfig, setRegionAIConfig] = useState({ rule: [] });
  const [backupData, setBackupData] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [snapshotError, setSnapshotError] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600, scale: 1 });
  const [enableDraw, setEnableDraw] = useState(false);
  const [selectedTool, setSelectedTool] = useState('tripwire');
  const [currentPoints, setCurrentPoints] = useState([]);
  const [selectedShape, setSelectedShape] = useState({ roi_type: null, index: null });
  const [dataSelectedROI, setDataSelectedROI] = useState(null);
  const [zoomCount, setZoomCount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [selectedCameraName, setSelectedCameraName] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openDiscardModal, setOpenDiscardModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const showModalSave = () => setOpenSaveModal(true);
  const showModalDiscard = () => setOpenDiscardModal(true);
  const closeModal = () => {
    setOpenDiscardModal(false);
    setOpenSaveModal(false);
  }
  
  const showNotification = (type, title, message, details = '') => {
    notification[type]({
      message: title,
      description: (
        <div>
          <p>{message}</p>
          {details && <small style={{ color: '#999' }}>{details}</small>}
        </div>
      ),
      placement: 'topRight',
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deviceData = JSON.parse(decodeURIComponent(params.get('data')));
    if (!deviceData) return;

    setSelectedCustomer(deviceData.workspace);
    setSelectedCameraId(deviceData.key);
    setSelectedCameraName(deviceData.device_name);

    const fetchROIData = async () => {
      if (!deviceData.workspace || !deviceData.key) return;
      try {
        const res = await fetch(`${API_ENDPOINT}/fetch/roi/data?schema=${deviceData.workspace}&key=${deviceData.key}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        const data = await res.json();

        if (data && Array.isArray(data.rule)) {
          const migratedRules = data.rule.map((rule, index) => migrateRuleFormat(rule, index));
          const checkedData = { rule: migratedRules };
          setRegionAIConfig(checkedData);
          setBackupData(JSON.parse(JSON.stringify(checkedData)));
        } else {
          setRegionAIConfig({ rule: [] });
          setBackupData({ rule: [] });
        }
      } catch (err) {
        showNotification('error', 'Error Fetching Rules', 'Failed to fetch rule data.', err.message);
      }
    };

    const fetchSnapshot = async () => {
      if (!deviceData.rtsp) {
          setSnapshotError(true);
          showNotification('error', 'Camera Error', 'RTSP link is missing.');
          return;
      };
      try {
        const rtspLink = deviceData.rtsp;
        const res = await fetch(`${API_ENDPOINT}/snapshot?rtsp=${encodeURIComponent(rtspLink)}`, {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Failed to parse error response.' }));
          throw new Error(errorData.message || `Camera returned status ${res.status}`);
        }

        const blob = await res.blob();
        if (blob.size === 0) {
          throw new Error('Empty response from camera.');
        }

        const imageUrl = URL.createObjectURL(blob);
        const img = new window.Image();
        img.src = imageUrl;
        img.onload = () => {
            setImageObj(img);
            setSnapshotError(false);
        };
        img.onerror = () => {
            throw new Error('Failed to load image from blob.');
        };

      } catch (err) {
        console.error("Snapshot error:", err);
        setSnapshotError(true);
        setImageObj(null);
        showNotification('error', 'Camera Connection Error', 'Could not load camera snapshot.', err.message);
      }
    };

    fetchSnapshot();
    fetchROIData();
  }, []);
  
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    setMousePosition(pointer);
  };

  const handleEditRegionZoom = (e) => {
    if (!dataSelectedROI || e.evt.button !== 0 || enableDraw === false) return;
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();
    const realX = mousePos.x / stageSize.scale;
    const realY = mousePos.y / stageSize.scale;
    const newPoint = [realX, realY];

    if (['intrusion', 'tripwire', 'density'].includes(selectedTool)) {
      setCurrentPoints(prev => [...prev, newPoint]);
    } else if (selectedTool === 'zoom') {
      setDataSelectedROI(prev => ({ ...prev, points: [newPoint] }));
      setCurrentPoints([]);
    }
  }

  const handleEditIntrusion = (e) => {
    if (!dataSelectedROI || enableDraw === false) return;
    if (e && e.evt) e.evt.preventDefault();
    if ((['intrusion', 'density'].includes(selectedTool) && currentPoints.length >= 3) || (selectedTool === 'tripwire' && currentPoints.length >= 2)) {
      setDataSelectedROI(prev => ({ ...prev, points: currentPoints }));
      setCurrentPoints([]);
    }
  };

  const handleDiscard = async () => {
    setRegionAIConfig(backupData || { rule: [] });
    setOpenDiscardModal(false);
    setDataSelectedROI(null);
  }

  const addShapeToRegionAIConfig = (roi_type = 'tripwire', points = []) => {
    const index = regionAIConfig.rule.length;
    const isZoom = roi_type === 'zoom';

    let newRule = {
      points,
      roi_type,
      name: `New Rule ${index + 1}`,
      roi_id: uuidv4(),
      created_date: new Date().toLocaleDateString("en-GB"),
      created_by: CREATOR,
    };

    if (isZoom) {
      newRule.surveillance_id = uuidv4();
    } else {
      newRule.roi_status = 'OFF';
      newRule.schedule = [{
        surveillance_id: uuidv4(),
        ai_type: "intrusion",
        start_time: "00:00:00",
        end_time: "23:59:59",
        direction: "Both",
        confidence_threshold: 0.5,
        confidence_zoom: 0.5,
        duration_threshold_seconds: 0,
      }];
    }

    setRegionAIConfig(prev => ({ ...prev, rule: [...(prev.rule || []), newRule] }));
  };

  const handleDeleteShape = (roi_type, index) => {
    setRegionAIConfig(prevConfig => ({
      ...prevConfig,
      rule: prevConfig.rule.filter((_, i) => i !== index)
    }));
    if (selectedShape?.index === index) {
      setSelectedShape({ roi_type: null, index: null });
    }
  };

  const handleChangeStatus = (index, formValues) => {
    if (!regionAIConfig?.rule || index < 0 || index >= regionAIConfig.rule.length || formValues?.roi_status === undefined) return;
    const activeStatus = formValues.roi_status ? 'ON' : 'OFF';
    const updatedRules = [...regionAIConfig.rule];
    updatedRules[index] = { ...updatedRules[index], roi_status: activeStatus };
    setRegionAIConfig({ ...regionAIConfig, rule: updatedRules });
  };
  
  const updateStageSize = useCallback(() => {
    const imageToUse = imageObj || { width: 1280, height: 720 }; 
    let widthFactor = 0.54;
    if (window.innerWidth > 1200 && window.innerWidth < 1600) widthFactor = 0.53;
    else if (window.innerWidth >= 768 && window.innerWidth <= 1200) widthFactor = 0.89;

    const scale = Math.min(
      (window.innerWidth * widthFactor) / imageToUse.width,
      (window.innerHeight * 0.612) / imageToUse.height
    );
    setStageSize({ width: imageToUse.width * scale, height: imageToUse.height * scale, scale });
  }, [imageObj]);

  const handleSave = async () => {
    setIsSaving(true);
    const configToSave = JSON.parse(JSON.stringify(regionAIConfig));

    // configToSave.docker_info = `ssh linaro@192.168.1.100 "docker restart ${selectedCameraName}"`;
    configToSave.docker_info = `docker restart cam3`;

    const reorderedRules = configToSave.rule.map(rule => {
      if (rule.roi_type === 'zoom') {
        const { schedule, roi_status, ...zoomRule } = rule;
        return zoomRule;
      }
      
      if (Array.isArray(rule.schedule)) {
        const reorderedSchedules = rule.schedule.map(sch => ({
          surveillance_id: sch.surveillance_id,
          ai_type: sch.ai_type ? sch.ai_type.toLowerCase() : "",
          start_time: sch.start_time,
          end_time: sch.end_time,
          direction: sch.direction,
          confidence_threshold: sch.confidence_threshold,
          confidence_zoom: sch.confidence_zoom,
          duration_threshold_seconds: sch.duration_threshold_seconds,
        }));
        return { ...rule, schedule: reorderedSchedules };
      }
      return rule;
    });

    configToSave.rule = reorderedRules;

    try {
      const response = await fetch(`${API_ENDPOINT}/save-region-config?customer=${selectedCustomer}&cameraId=${selectedCameraId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(configToSave),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Save failed');
      }
      showNotification('success', 'Success', 'Configuration saved successfully.');
      setOpenSaveModal(false);
    } catch (error) {
      showNotification('error', 'Save Error', 'An error occurred while saving.', error.message);
      setOpenSaveModal(false);
    } finally {
        setIsSaving(false);
    }
  };

  const handleResetPoints = () => {
    setDataSelectedROI(prev => ({ ...prev, points: [] }));
    setCurrentPoints([]);
  }

  useEffect(() => {
    if (regionAIConfig?.rule && selectedShape.index !== null && regionAIConfig.rule[selectedShape.index]) {
      setDataSelectedROI(regionAIConfig.rule[selectedShape.index]);
    } else {
      setDataSelectedROI(null);
    }
  }, [selectedShape, regionAIConfig]);

  useEffect(() => {
    updateStageSize();
    window.addEventListener("resize", updateStageSize);
    return () => window.removeEventListener("resize", updateStageSize);
  }, [updateStageSize]);

  useEffect(() => {
    if (!dataSelectedROI || selectedShape.index === null) return;
    setRegionAIConfig(prevConfig => {
      const updatedRules = [...prevConfig.rule];
      updatedRules[selectedShape.index] = dataSelectedROI;
      return { ...prevConfig, rule: updatedRules };
    });
    setSelectedTool(dataSelectedROI.roi_type);
  }, [dataSelectedROI]);

  useEffect(() => {
    setZoomCount(regionAIConfig?.rule?.filter(item => item.roi_type === 'zoom').length || 0);
  }, [regionAIConfig.rule]);

  const isLoading = !imageObj && !snapshotError;

  return (
    <>
      <div className="container_tools">
        <div className="header_tools_nav">
          {/* 2. แก้ไข Breadcrumb */}
          <Breadcrumb 
            items={[
              { 
                title: <Link to="/">All Devices</Link>
              }, 
              { 
                title: <span className="active_title">{selectedCameraName}</span> 
              }
            ]} 
          />
          <div className="device_control">
            {/* 3. เปลี่ยนจาก a href เป็น Link to */}
            <Link to="/">
              <p className="cameraName_title"><LeftOutlined /> {selectedCameraName}</p>
            </Link>
          </div>
        </div>
        <div className="tools_box_main">
          <div className="canvas_box">
            <div className="draw_image">
              {isLoading ? (
                <div className='loading_waiting_imageObj'>
                  <DotLottieReact src="https://lottie.host/5833f292-1a94-4c8a-ba9e-80f2c5745a76/D1olOXEce6.lottie" loop autoplay />
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', cursor: 'crosshair', border: enableDraw ? '4px solid #3c82f6' : '4px solid #eff1f5' }}>
                  <DrawingCanvas
                    snapshotError={snapshotError}
                    imageObj={imageObj}
                    stageSize={stageSize}
                    selectedTool={selectedTool}
                    currentPoints={currentPoints}
                    onCanvasClick={handleEditRegionZoom}
                    onRightClick={handleEditIntrusion}
                    selectedShape={selectedShape}
                    regionAIConfig={regionAIConfig}
                    mousePosition={mousePosition}
                    onMouseMove={handleMouseMove}
                  />
                </div>
              )}
            </div>
            <div className="button_control">
              {enableDraw ? (
                <>
                  <div className="box_text_guild_drawEnd"><SignatureOutlined /> Draw the Rule & <strong>RIGHT-CLICK</strong> to Finish</div>
                  <div className="box_button_control_drawwing">
                    <Button onClick={() => { handleEditIntrusion(); setEnableDraw(false); }} className="save_button"><SaveOutlined /> Save</Button>
                    <Button disabled={!dataSelectedROI} onClick={handleResetPoints} danger>Clear</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="box_text_guild_drawwing"><InfoCircleOutlined /> Enable Draw Mode to Draw the Rules</div>
                  <div className="box_button_control_drawwing">
                    <Button onClick={() => setEnableDraw(true)} type="primary"><SignatureOutlined /> Enable Draw Mode</Button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="tools_side">
            <Sidebar
              maxTotalRegion={MAX_TOTAL_REGION}
              setSelectedShape={setSelectedShape}
              handleDeleteShape={handleDeleteShape}
              addShapeToRegionAIConfig={addShapeToRegionAIConfig}
              regionAIConfig={regionAIConfig}
              selectedShape={selectedShape}
              handleChangeStatus={handleChangeStatus}
            />
          </div>
        </div>
        <div className="edit_box">
          <SetupEditor {...{ dataSelectedROI, setDataSelectedROI, setSelectedTool, handleResetPoints, MAX_ZOOM_REGION, zoomCount }} />
        </div>
        <div className="footer_bar">
          <div className="box_bottom_save">
            <Button onClick={showModalDiscard} danger>Discard Change</Button>
            <Modal title={<span><ExclamationCircleFilled style={{ color: '#faad14', marginRight: 8 }} /> Discard Changes?</span>} open={openDiscardModal} onOk={handleDiscard} onCancel={closeModal} okText="Discard" cancelText="Cancel" okButtonProps={{ danger: true }}>
              <p>This action cannot be undone.</p>
            </Modal>
            <Button onClick={showModalSave} type="primary">Apply</Button>
            <Modal 
              title={<span><ExclamationCircleFilled style={{ color: '#faad14', marginRight: 8 }} /> Apply Changes?</span>} 
              open={openSaveModal} 
              onOk={handleSave} 
              onCancel={closeModal} 
              okText="Confirm" 
              cancelText="Cancel"
              confirmLoading={isSaving}
            >
              <p>This will update your data & restart the device.</p>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
}

export default Tools;