import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Modal, Breadcrumb } from 'antd';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { LeftOutlined, SaveOutlined, SignatureOutlined, InfoCircleOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import DrawingCanvas from './drawing_canvas.jsx';
import Sidebar from './sidebar.jsx';
import SetupEditor from './setup_editor.jsx';
import '../styles/tools.css';
import { useLocation } from 'react-router-dom';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const CREATOR = import.meta.env.VITE_CREATOR;

function Tools() {
  const location = useLocation();
  const deviceData = location.state?.deviceData;

  const MAX_TOTAL_REGION = 6;
  const MAX_ZOOM_REGION = 1;

  // data config region database
  const [regionAIConfig, setRegionAIConfig] = useState({ rule: [] })
  const [backupData, setBackupData] = useState(null);
  const [image, setImage] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  // imageobj
  const [stageSize, setStageSize] = useState({ width: 800, height: 600, scale: 1 });
  // drawing
  const [enableDraw, setEnableDraw] = useState(false);
  const [selectedTool, setSelectedTool] = useState('tripwire');
  const [currentPoints, setCurrentPoints] = useState([]);
  const [selectedShape, setSelectedShape] = useState({ roi_type: null, index: null });
  const [dataSelectedROI, setDataSelectedROI] = useState(null);
  const [zoomCount, setZoomCount] = useState(0);
  // for get data point
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerSite, setSelectedCustomerSite] = useState(null)
  const [selectedCameraName, setSelectedCameraName] = useState(null);
  // for show line when drow
  const [mousePosition, setMousePosition] = useState(null);

  // Modal 
  const [openSaveModal, setOpenSaveModal] = useState(false)
  const [openDiscardModal, setOpenDiscardModal] = useState(false)

  const showModalSave = () => {
    setOpenSaveModal(true)
  }
  const showModalDiscard = () => {
    setOpenDiscardModal(true)
  }

  const closeModal = () => {
    setOpenDiscardModal(false)
    setOpenSaveModal(false)
  }
  //================END================

  const checked_metthier_ai_config = (metthier_ai_config) => {
    // Check if data is null or undefined
    if (!metthier_ai_config) {
      error_fetct(
        'Data Error',
        <div>
          <p style={{ marginBottom: '8px', color: '#ff4d4f' }}>
            No configuration data received
          </p>
          <small style={{ color: '#666' }}>
            Initializing with empty configuration
          </small>
        </div>
      );
      return { rule: [] };
    }

    // Check if data has the correct structure
    if (!Array.isArray(metthier_ai_config.rule)) {
      error_fetct(
        'Invalid Data Format',
        <div>
          <p style={{ marginBottom: '8px', color: '#ff4d4f' }}>
            Invalid configuration format received from database
          </p>
          <small style={{ color: '#666' }}>
            Expected 'rule' array in configuration
          </small>
        </div>
      );
      return { rule: [] };
    }

    // Validate each rule in the array
    const isValidRule = (rule) => {
      return rule &&
        typeof rule === 'object' &&
        Array.isArray(rule.points) &&
        typeof rule.roi_type === 'string' &&
        Array.isArray(rule.schedule) &&
        typeof rule.roi_id === 'string' &&
        typeof rule.roi_status === 'string';
    };

    if (!metthier_ai_config.rule.every(isValidRule)) {
      error_fetct(
        'Invalid Rule Format',
        <div>
          <p style={{ marginBottom: '8px', color: '#ff4d4f' }}>
            One or more rules have invalid format
          </p>
          <small style={{ color: '#666' }}>
            Rules must contain: points, roi_type, schedule, roi_id, and roi_status but it not , Will reset to new format.
          </small>
        </div>
      );
      return { rule: [] };
    }

    // If all validations pass, return the original data
    return metthier_ai_config;
  };

  const error_fetct = (Title, Content) => {
    Modal.error({
      title: Title,
      content: Content,
      okButtonProps: {
        className: 'custom-ok-button-error'
      }
    });
  };

  // Fetch Data and Image of camera
  useEffect(() => {
    if (!deviceData?.rtsp) return;

    setSelectedCustomer(deviceData.workspace);
    setSelectedCustomerSite(deviceData.department);
    setSelectedCameraName(deviceData.device_name);

    const fetchROIData = async () => {
      try {
        const res = await fetch(
          `${API_ENDPOINT}/fetch/roi/data?schema=${deviceData.workspace}&key=${deviceData.key}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          console.log('error data ==>',errorData)
          error_fetct(
            'Error Fetching Rules',
            <div>
              <p style={{ marginBottom: '8px', color: '#ff4d4f' }}>
                Failed to fetch rule data
              </p>
              <small style={{ color: '#666', display: 'block', marginTop: '8px' }}>
                Error status {errorData.status} details: {errorData.message || res.statusText}
              </small>
            </div>
          );
          return;
        }

        const data = await res.json();
        setRegionAIConfig(checked_metthier_ai_config(data));
        setBackupData(regionAIConfig);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        error_fetct(
          'Error',
          <div>
            <p>Failed to fetch rule data</p>
            <small style={{ color: '#666', display: 'block', marginTop: '8px' }}>
              {err.message}
            </small>
          </div>
        );
      }
    };

    const fetchSnapshot = async () => {
      try {
        const rtspLink = deviceData.rtsp;
        console.log('rtsp link ==> :',rtspLink)
        const res = await fetch(`${API_ENDPOINT}/snapshot?rtsp=${encodeURIComponent(rtspLink)}`);
        
        console.log('Original RTSP Link:', rtspLink);
        console.log('Encoded RTSP Link:', encodeURIComponent(rtspLink));

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Camera error:", errorData);
          // Create error content based on error code
          const getErrorHint = (code) => {
            switch (code) {
              case 'AUTH_ERROR':
                return 'Please verify the username and password in the RTSP URL. Authentication failed.';
              case 'TIMEOUT_ERROR':
                return 'Try increasing the timeout value or check if the camera is accessible.';
              case 'SERVER_ERROR':
                return 'The camera server is not responding properly. Please check the camera status.';
              case 'INVALID_STREAM':
                return 'The RTSP URL format is invalid or the stream is not available.';
              default:
                return 'Please check your camera connection and try again.';
            }
          };

          error_fetct(
            'Camera Connection Error',
            <div>
              <p style={{ marginBottom: '8px', color: '#ff4d4f' }}>{errorData.message}</p>
              <small style={{ color: '#999', display: 'block' }}>
                {getErrorHint(errorData.code)}
              </small>
              <small style={{ color: '#666', display: 'block', marginTop: '8px' }}>
                Error details: {errorData.details}
              </small>
            </div>
          );
          return;
        }

        const blob = await res.blob();
        if (blob.size === 0) {
          error_fetct(
            'Empty Response',
            'Received empty response from camera. Please check if the camera is streaming correctly.'
          );
          return;
        }

        const imageUrl = URL.createObjectURL(blob);
        setImage(imageUrl);
      } catch (err) {
        console.error("Snapshot error:", err);
        error_fetct(
          'Connection Error',
          <div>
            <p>Failed to connect to the camera.</p>
            <small style={{ color: '#999', display: 'block' }}>
              Please check your network connection and camera status.
            </small>
          </div>
        );
      }
    };

    fetchSnapshot();
    fetchROIData();
  }, [deviceData]);

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    setMousePosition(pointer);
  };

  const handleEditRegionZoom = (e) => {
    if (!dataSelectedROI || e.evt.button !== 0 || enableDraw === false) return;

    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();

    // reascale for get a real values of position
    const realX = mousePos.x / stageSize.scale;
    const realY = mousePos.y / stageSize.scale;
    const newPoint = [realX, realY];

    if (selectedTool === 'intrusion' || selectedTool === 'tripwire' || selectedTool === 'density') {
      const updatedPoints = [...currentPoints, newPoint];
      setCurrentPoints(updatedPoints);
    } else if (selectedTool === 'zoom') {
      const [x1, y1] = newPoint;
      const rectPoints = [x1, y1];

      setDataSelectedROI(prev => ({
        ...prev,
        points: rectPoints,
      }));

      setCurrentPoints([]);
    }
  }

  const handleEditIntrusion = (e) => {
    if (!dataSelectedROI || enableDraw === false) return;

    if (e && e.evt) {
      e.evt.preventDefault();
    }

    if ((selectedTool === 'intrusion' || selectedTool === 'density') && currentPoints.length >= 3) {
      setDataSelectedROI(prev => ({
        ...prev,
        points: currentPoints,
      }));
      setCurrentPoints([]);
    } else if (selectedTool === 'tripwire' && currentPoints.length >= 2) {
      setDataSelectedROI(prev => ({
        ...prev,
        points: currentPoints,
      }));
      setCurrentPoints([]);
    }
  };

  const handleDiscard = async () => {
    setRegionAIConfig(backupData || { rule: [] });
    setOpenDiscardModal(false)
    setDataSelectedROI(null)
  }

  // create new item in rule 
  const addShapeToRegionAIConfig = (roi_type, points) => {
    const index = regionAIConfig.rule.length;
    if (points === undefined && roi_type === undefined) {
      points = []
      roi_type = 'tripwire'
    }
    const default_name = 'New Rule' + (index + 1);
    const newRule = {
      points: points,
      roi_type: roi_type,
      schedule: [{
        surveillance_id: uuidv4(),
        ai_type: "intrusion",
        start_time: "00:00:00",
        end_time: "23:59:59",
        direction: "Both",
        confidence_threshold: 0.5,
        duration_threshold_seconds: 0
      }],
      created_date: new Date().toLocaleDateString("en-GB"),
      roi_id: uuidv4(),
      roi_status: 'OFF',
      created_by: CREATOR,
      name: default_name,
    };

    const updatedConfig = {
      ...regionAIConfig,
      rule: [...(regionAIConfig?.rule || []), newRule],
    };

    setRegionAIConfig(updatedConfig);
  };

  const handleDeleteShape = (roi_type, index) => {
    setRegionAIConfig(prevConfig => {
      const updatedRules = prevConfig.rule.filter((_, i) => i !== index);
      return {
        ...prevConfig,
        rule: updatedRules
      };

    });
    if (selectedShape?.roi_type === roi_type && selectedShape?.index === index) {
      setSelectedShape({ roi_type: null, index: null });
      setDataSelectedROI(null)
    }
  };

  const handleChangeStatus = async (index, regionAIConfig, formValues) => {
    if (!regionAIConfig?.rule || index < 0 || index >= regionAIConfig.rule.length) {
      Modal.error({
        title: 'Error',
        content: "Selected rule not found.",
      })
      return;
    }

    if (!formValues?.roi_status && formValues.roi_status !== false) {
      Modal.error({
        title: "Error",
        content: "Invalid status value."
      })
      return;
    }
    const activeStatus = formValues.roi_status === true ? 'ON' : 'OFF';
    const updatedRules = [...regionAIConfig.rule];
    updatedRules[index] = {
      ...updatedRules[index],
      roi_status: activeStatus,
    };

    setRegionAIConfig({
      ...regionAIConfig,
      rule: updatedRules,
    });
  };

  const updateStageSize = useCallback(() => {
    if (imageObj) {
      if (imageObj.width < 800 || imageObj.height < 800) {
        Modal.warning({
          title: 'Warning',
          content: `This snapshot looks like it is from a sub stream camera! Scale : ${imageObj.width} x ${imageObj.height}`
        })
      } else {
        const modal = Modal.success({
          title: 'Success!!',
          content: `This snapshot Scale : ${imageObj.width} x ${imageObj.height}`,
          footer: null
        })

        setTimeout(() => {
          modal.destroy();
        }, 1000)
      }

      let widthFactor = 0.54;//monitor
      if (window.innerWidth > 1200 && window.innerWidth < 1600) {
        widthFactor = 0.53;//mac 
      } else if (window.innerWidth >= 768 && window.innerWidth <= 1200) {
        widthFactor = 0.89;//ipad 
      } 

      const scale = Math.min(
        window.innerWidth * widthFactor / imageObj.width,
        window.innerHeight * 0.612 / imageObj.height
      );

      setStageSize({
        width: imageObj.width * scale,
        height: imageObj.height * scale,
        scale: scale,
      });
    }
  }, [imageObj]);

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_ENDPOINT}/save-region-config?customer=${selectedCustomer}&customerSite=${selectedCustomerSite}&cameraName=${selectedCameraName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regionAIConfig),
      });

      if (response.ok) {
        const modal = Modal.success({
          title: 'Success',
          content: 'Successfully Saved Configuration',
          footer: null,

        })
        setTimeout(() => {
          modal.destroy();
        }, 1500);
        //close modal
        setOpenSaveModal(false);
      } else {
        Modal.error({
          title: 'Error',
          content: 'Failed to save configuration. Please try again later.'
        })
      }
    } catch (error) {
      Modal.error({
        title: "Error",
        content: `An error occurred while saving the configuration : ${error.message}`
      })
      console.error(error);
    }
  };

  const handleResetPoints = () => {
    setDataSelectedROI(prev => ({
      ...prev,
      points: [],
    }));
    setCurrentPoints([]);
  }

  useEffect(() => {
    if (!regionAIConfig || !selectedShape.roi_type || selectedShape.index === null) return;

    const { roi_type, index } = selectedShape;
    const selectedRule = regionAIConfig.rule[index]

    if (selectedRule) {
      setDataSelectedROI(selectedRule);
    }
  }, [selectedShape]);

  useEffect(() => {
    if (image) {
      const img = new window.Image();
      img.src = image;
      img.onload = () => setImageObj(img);
      console.log(imageObj)
    }
  }, [image]);

  useEffect(() => {
    updateStageSize();
    window.addEventListener("resize", updateStageSize);
    return () => window.removeEventListener("resize", updateStageSize);
  }, [updateStageSize]);

  useEffect(() => {
    if (!dataSelectedROI) return;
    setSelectedTool(dataSelectedROI.roi_type)
    setRegionAIConfig(prevConfig => {
      const currentRule = prevConfig.rule[selectedShape.index];
      const isSame = JSON.stringify(currentRule) === JSON.stringify(dataSelectedROI);
      if (isSame) return prevConfig;

      const updatedRules = [...prevConfig.rule];
      updatedRules[selectedShape.index] = dataSelectedROI;

      return {
        ...prevConfig,
        rule: updatedRules,
      };
    });
  }, [dataSelectedROI]);

  useEffect(() => {
    const zoomCount = regionAIConfig?.rule?.filter(item => item.roi_type === 'zoom').length || 0;
    setZoomCount(zoomCount);

    console.log("Main data : ", regionAIConfig)

  }, [regionAIConfig.rule])

  return (
    <>
      <div className="container_tools">
        <div className="header_tools_nav">
          <Breadcrumb
            items={[
              {
                href: '/',
                title: (
                  <>
                    <span>All Devices</span>
                  </>
                ),
              },
              {
                href: '',
                title: (
                  <>
                    <span className="active_title">{selectedCameraName}</span>
                  </>
                ),
              },
            ]}
          />
          <div className="device_control">
            <a href="/">
              <p className="cameraName_title">
                <LeftOutlined /> {selectedCameraName}
              </p>
            </a>
          </div>
        </div>

        <div className="tools_box_main">
          <div className="canvas_box">
            <div className="draw_image">
              {imageObj ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'crosshair',
                    border: enableDraw
                      ? '4px solid #3c82f6'
                      : '4px solid #eff1f5',
                  }}
                >
                  <DrawingCanvas
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
              ) : (
                <div className='loading_waiting_imageObj'>
                  <div>
                    <DotLottieReact
                      src="https://lottie.host/5833f292-1a94-4c8a-ba9e-80f2c5745a76/D1olOXEce6.lottie"
                      loop
                      autoplay
                    />
                  </div>
                </div>
              )}
            </div>

            {enableDraw === true ? (
              <div className="button_control">
                <div className="box_text_guild_drawEnd">
                  <SignatureOutlined /> Draw the Rule on Camera Canvas &{' '}
                  <strong>RIGHT-CLICK</strong> to Finish
                </div>
                <div className="box_button_control_drawwing">
                  <Button
                    onClick={() => {
                      handleEditIntrusion();
                      setEnableDraw(false);
                    }}
                    style={{ minWidth: '120px' }}
                    className="save_button"
                    variant="solid"
                  >
                    <SaveOutlined /> Save
                  </Button>



                  <Button
                    disabled={selectedShape.index === null}
                    style={{ minWidth: '120px' }}
                    onClick={() => {
                      handleResetPoints();
                    }}
                    color="danger"
                    variant="outlined"
                  >
                    clear
                  </Button>
                </div>
              </div>
            ) : (
              <div className="button_control">
                <div className="box_text_guild_drawwing">
                  <InfoCircleOutlined /> Enable Draw Mode to Draw the Rules
                </div>
                <div className="box_button_control_drawwing">
                  <Button
                    onClick={() => setEnableDraw(true)}
                    color="primary"
                    variant="solid"
                  >
                    <SignatureOutlined /> Enable Draw Mode
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="tools_side">
            <Sidebar
              maxTotalRegion={MAX_TOTAL_REGION}
              setSelectedShape={setSelectedShape}
              handleDeleteShape={handleDeleteShape}
              addShapeToRegionAIConfig={addShapeToRegionAIConfig}
              regionAIConfig={regionAIConfig}
              setRegionAIConfig={setRegionAIConfig}
              selectedShape={selectedShape}
              handleChangeStatus={handleChangeStatus}
            />
          </div>
        </div>

        <div className="edit_box">
          <SetupEditor
            dataSelectedROI={dataSelectedROI}
            setDataSelectedROI={setDataSelectedROI}
            cameraName={selectedCameraName}
            setSelectedTool={setSelectedTool}
            handleResetPoints={handleResetPoints}
            MAX_ZOOM_REGION={MAX_ZOOM_REGION}
            zoomCount={zoomCount}
          />
        </div>

        <div className="footer_bar">
          <div className="box_bottom_save">

            {/* Discard button and Modal */}
            <Button
              style={{ minWidth: '120px' }}
              color="danger"
              variant="outlined"
              onClick={() => {
                showModalDiscard();
              }}
            >
              Discard Change
            </Button>
            <Modal
              title={
                <span>
                  <ExclamationCircleFilled style={{ color: '#faad14', marginRight: 8 }} />
                  Are you sure you want to discard changes?
                </span>
              }
              open={openDiscardModal}
              onOk={() => {
                handleDiscard();
              }}
              onCancel={closeModal}
              okText="Discard"
              cancelText="Cancel"
              okButtonProps={{
                className: 'custom-ok-button-discard',
              }}
              cancelButtonProps={{
                className: 'custom-cancel-button',
              }}
            >
              <p>  This action cannot be undone</p>

            </Modal>

            {/* Save button and Modal */}

            <Button
              onClick={() => {
                showModalSave();
              }}
              style={{ minWidth: '120px' }}
              className="save_button"
              variant="solid"
            >
              Apply
            </Button>
            <Modal
              title={
                <span>
                  <ExclamationCircleFilled style={{ color: '#faad14', marginRight: 8 }} />
                  Do you want to apply all these changes?
                </span>
              }
              open={openSaveModal}
              onOk={() => {
                handleSave();
              }}
              onCancel={closeModal}
              okText="Confirm"
              cancelText="Cancel"
              okButtonProps={{
                className: 'custom-ok-button-save',
              }}
              cancelButtonProps={{
                className: 'custom-cancel-button',
              }}
            >
              <p>    This will update your data & restart the device</p>

            </Modal>
          </div>
        </div>
      </div>
    </>
  );

}

export default Tools;
