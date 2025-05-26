import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Modal, Space, Breadcrumb } from 'antd';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { LeftOutlined, SaveOutlined, SignatureOutlined, InfoCircleOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

import DrawingCanvas from './drawing_canvas.jsx';
import Sidebar from './sidebar.jsx';
import SetupEditor from './setup_editor.jsx';
import '../styles/tools.css';
import { useLocation } from 'react-router-dom';


function Tools() {
  const navigate = useNavigate();
  const location = useLocation();
  const deviceData = location.state?.deviceData;


  // Receive data from data device Table
  useEffect(() => {
    if (!deviceData?.rtsp) return;
  
    setSelectedCustomer(deviceData.workspace);
    setSelectedCustomerSite(deviceData.department);
    setSelectedCameraName(deviceData.device_name);
    setRegionAIConfig(deviceData.regionAIconfig);

    console.log(deviceData.regionAIconfig)
  
    const fetchSnapshot = async () => {
      try {
        const test_rtsp_link = 'rtsp://mioc_cms:Mi0C2023Cms@10.54.1.3:554/cam/realmonitor?channel=5&subtype=0'
        // const res = await fetch(`http://localhost:5000/api/snapshot?rtsp=${encodeURIComponent(deviceData.rtsp)}`);
        const res = await fetch(`http://localhost:5000/api/snapshot?rtsp=${encodeURIComponent(test_rtsp_link)}`);
        const blob = await res.blob();
        const imageUrl = URL.createObjectURL(blob);
        setImage(imageUrl);
      } catch (err) {
        console.error(" Failed to fetch snapshot:", err);
      }
    };
  
    fetchSnapshot();
  }, [deviceData?.rtsp]);


  const MAX_TOTAL_REGION = 6;
  const MAX_ZOOM_REGION = 1;

  // data config region database
  const [regionAIConfig, setRegionAIConfig] = useState({ rule: [] })

  const [image, setImage] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  // imageobj
  const [stageSize, setStageSize] = useState({ width: 800, height: 600, scale: 1 });
  // drawing
  const [enableDraw, setEnableDraw] = useState(false);
  const [selectedTool, setSelectedTool] = useState('tripwire');
  const [currentPoints, setCurrentPoints] = useState([]);
  const [selectedShape, setSelectedShape] = useState({ type: null, index: null });
  const [dataSelectedROI, setDataSelectedROI] = useState(null);
  const [zoomCount, setZoomCount] = useState(0);
  // timePicker
  const [statusSelected, setStatusSelected] = useState('OFF')
  // for get data point
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerSite, setSelectedCustomerSite] = useState(null)
  const [selectedCameraName, setSelectedCameraName] = useState(null);
  // for show line when drow
  const [mousePosition, setMousePosition] = useState(null);

  // Modal 
  const [openSaveModal, setOpenSaveModal] = useState(false)
  const [openDiscardModal, setOpenDiscardModal] = useState(false)

  const showModalSave = () =>{
    setOpenSaveModal(true)
  }
  const showModalDiscard = () =>{
    setOpenDiscardModal(true)
  }

  const closeModal = () =>{
    setOpenDiscardModal(false)
    setOpenSaveModal(false)
  }
  //================END================


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

    const totalShapesCount = regionAIConfig.rule.length;

    if ((selectedTool === 'intrusion'|| selectedTool === 'density') && currentPoints.length >= 3) {
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

  const handleDiscard = async ()=>{
    setRegionAIConfig(deviceData.regionAIconfig);
    setOpenDiscardModal(false)
  }

  // create new item in rule 
  const addShapeToRegionAIConfig = (type, points) => {
    const index = regionAIConfig.rule.length;
    if (points === undefined && type === undefined) {
      points = []
      type = 'tripwire'
    }
    const default_name = 'New Rule' + (index + 1);
    const newRule = {
      points: points,
      type: type,
      schedule: [{ 
        surveillance_id: uuidv4(), 
        ai_type: "intrusion",
        start_time: "00:00:00", 
        end_time : "23:59:59",
        direction:"Both",
        confidence_threshold: 0.5,
        duration_threshold_seconds : 0 }],
      created_date: new Date().toLocaleDateString("en-GB"),
      roi_id: uuidv4(),
      status: 'OFF',
      created_by: "Prasit Paisan",
      name: default_name,
    };

    const updatedConfig = {
      ...regionAIConfig,
      rule: [...(regionAIConfig?.rule || []), newRule],
    };

    setRegionAIConfig(updatedConfig);
  };

  const handleDeleteShape = (type, index) => {
    setRegionAIConfig(prevConfig => {
      const updatedRules = prevConfig.rule.filter((_, i) => i !== index);
      return {
        ...prevConfig,
        rule: updatedRules
      };
    });


    if (selectedShape?.type === type && selectedShape?.index === index) {
      setSelectedShape({ type: null, index: null });
      setDataSelectedROI(null)
    }
  };

  const handleChangeStatus = async (index, regionAIConfig, formValues) => {
    if (!regionAIConfig?.rule || index < 0 || index >= regionAIConfig.rule.length) {
      Swal.fire('Error', 'Selected rule not found.', 'error');
      return;
    }

    if (!formValues?.status && formValues.status !== false) {
      Swal.fire('Error', 'Invalid status value.', 'error');
      return;
    }
    const activeStatus = formValues.status === true ? 'ON' : 'OFF';
    const updatedRules = [...regionAIConfig.rule];
    updatedRules[index] = {
      ...updatedRules[index],
      status: activeStatus,
    };

    setRegionAIConfig({
      ...regionAIConfig,
      rule: updatedRules,
    });
  };

  const updateStageSize = useCallback(() => {
    if (imageObj) {
      if (imageObj.width < 800 || imageObj.height < 800) {
        Swal.fire({
          title: 'Warning',
          text: `This snapshot looks like it is from a sub stream camera! Scale : ${imageObj.width} x ${imageObj.height}`,
          icon: "warning",
          draggable: true
        });
      }else {
        Swal.fire({
          title: 'Success!!',
          text: `This snapshot Scale : ${imageObj.width} x ${imageObj.height}`,
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
          draggable: true
        });
      }

      let widthFactor = 0.54;//monitor
      if (window.innerWidth > 1200 && window.innerWidth < 1600) {
        widthFactor = 0.53;//mac 
      } else if (window.innerWidth >= 900 && window.innerWidth <= 1200) {
        widthFactor = 0.89;//ipad pro
      } else if (window.innerWidth >= 786 && window.innerWidth < 900) {
        widthFactor = 0.99;//pad air
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
      const response = await fetch(`http://localhost:5000/api/save-region-config?customer=${selectedCustomer}&customerSite=${selectedCustomerSite}&cameraName=${selectedCameraName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regionAIConfig),
      });

      if (response.ok) {
        Swal.fire({
          title: 'Success!!',
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
          draggable: true
        });
        //close modal
        setOpenSaveModal(false);
      } else {
        Swal.fire('Error!', 'Failed to save configuration.', 'error');
      }
    } catch (error) {
      Swal.fire('Error!', 'An error occurred while saving.', 'error');
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
    if (!regionAIConfig || !selectedShape.type || selectedShape.index === null) return;

    const { type, index } = selectedShape;
    const selectedRule = regionAIConfig.rule[index]

    if (selectedRule) {
      setDataSelectedROI(selectedRule);
    }
  }, [selectedShape]);
  //=====Problem Max Re-render======
  // }, [selectedShape, regionAIConfig]);ลบออกไปเพราะคิดว่า region ai config ไม่จำเป็นในการ set new data selected ROI

  useEffect(() => {
    if (image) {
      const img = new window.Image();
      img.src = image;
      img.onload = () => setImageObj(img);
    }
  }, [image]);

  useEffect(() => {
    updateStageSize();
    window.addEventListener("resize", updateStageSize);
    return () => window.removeEventListener("resize", updateStageSize);
  }, [updateStageSize]);

  useEffect(() => {
    if (!dataSelectedROI) return;
    setSelectedTool(dataSelectedROI.type)
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

  useEffect(() =>{
    const zoomCount = regionAIConfig.rule?.filter(item => item.type === 'zoom').length || 0;
    setZoomCount(zoomCount);

  },[regionAIConfig.rule])

  return (
    <>

      {imageObj ? (
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
                {imageObj && (
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
              zoomCount = {zoomCount}
            />
          </div>

          <div className="footer_bar">
            <div className="box_bottom_save">

              {/* Discard button and Modal */}
              <Button 
                style={{ minWidth: '120px' }}
                color="danger" 
                variant="outlined"
                onClick={()=>{
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
                onOk={() =>{
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
                <p>    This action cannot be undone</p>
                
              </Modal>

              {/* Save button and Modal */}

              <Button
                onClick={()=>{
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
                onOk={() =>{
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
    </>
  );

}

export default Tools;
