import React, { useState, useEffect, useCallback} from 'react';
import {v4 as uuidv4} from 'uuid';
import { Button ,Breadcrumb,Collapse } from "antd";
import { LeftOutlined,RightOutlined, SaveOutlined, SignatureOutlined , InfoCircleOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

import DrawingCanvas from './drawing_canvas.jsx';
import Sidebar from './sideBar.jsx';
import SetupEditor from './setup_editor.jsx';
import '../styles/tools.css';
import { useLocation } from 'react-router-dom';


function Tools() {
  const navigate = useNavigate();
  const location = useLocation();
  const deviceData = location.state?.deviceData;

  useEffect(() =>{
    if(deviceData){
      setSelectedCustomer(deviceData.workspace);
      setSelectedCustomerSite(deviceData.department);
      setSelectedCameraName(deviceData.device_name)
    }
  },[deviceData])


  const MAX_TOTAL_REGION = 6;
  const MAX_ZOOM_REGION = 1;

  // data config region database
  const [regionAIConfig, setRegionAIConfig] = useState({rule: []})

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
  // timePicker
  const [statusSelected,setStatusSelected] = useState('OFF')
  // for get data point
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerSite, setSelectedCustomerSite] = useState(null)
  const [selectedCameraName, setSelectedCameraName] = useState(null);

  const [mousePosition, setMousePosition] = useState(null);

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    setMousePosition(pointer);
  };

  const handleEditRegionZoom = (e) =>{
    if (!dataSelectedROI || e.evt.button !== 0 || enableDraw ===false) return;

    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();
  
    // reascale for get a real values of position
    const realX = mousePos.x / stageSize.scale;
    const realY = mousePos.y / stageSize.scale;
    const newPoint = [realX, realY];
  
    const totalShapesCount = regionAIConfig.rule.length;
    const totalZoom = regionAIConfig.rule.filter((item) => item.type === 'zoom').length;

    if (selectedTool === 'intrusion' || selectedTool === 'tripwire') {
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
  
  const handleEditRegionTripwireAndIntrusion = (e) => {
    if (!dataSelectedROI || enableDraw === false) return;

    if (e && e.evt) {
      e.evt.preventDefault();
    }
    
    const totalShapesCount = regionAIConfig.rule.length;

    if (selectedTool === 'intrusion' && currentPoints.length >= 3) {
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
  

  const addShapeToRegionAIConfig = (type, points) => {
    const index = regionAIConfig.rule.length;
    if (points === undefined && type === undefined){
      points = []
      type = 'tripwire'
    }
    const default_name = 'New Rule'+(index+1);
    const newRule = {
      points: points,
      type: type,
      schedule: {
        start_time: '00:00:00',
        end_time: '23:59:59',
      },
      created_date:new Date().toLocaleDateString("en-GB"),
      roi_id: uuidv4(),
      status:'OFF',
      created_by:"Prasit Paisan",
      name: default_name,
      confidence_threshold: 0.5,
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
    const activeStatus = formValues.status === true ? 'ON':'OFF';
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
      } else {
        Swal.fire({
          title: 'Success!!',
          text: `This snapshot Scale : ${imageObj.width} x ${imageObj.height}`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
          draggable: true
        });
      }
  
      let widthFactor = 0.54;//monitor
      if (window.innerWidth > 1200 && window.innerWidth < 1600){
        widthFactor = 0.523;//mac
      }else if (window.innerWidth >= 900 && window.innerWidth <= 1200) {
        widthFactor = 0.89;//ipad pro
      }else if (window.innerWidth >= 786 && window.innerWidth <900){
        widthFactor = 0.99;//pad air
      }
  
      const scale = Math.min(
        window.innerWidth * widthFactor / imageObj.width,
        window.innerHeight * 0.615 / imageObj.height
      );
  
      setStageSize({
        width: imageObj.width * scale,
        height: imageObj.height * scale,
        scale: scale,
      });
    }
  }, [imageObj]);
  

  const handleTimePickerChange = (data) => {//for timepicker setdate
    const updatedSelectedROI = {
      ...dataSelectedROI,
      schedule: {
        start_time: data.startTime,
        end_time: data.endTime,
      },
      confidence_threshold: data.confidenceThreshold,
    };
  
    setDataSelectedROI(updatedSelectedROI);
  };

  const handleSave = async () =>{
    const result = await Swal.fire({
      title: "Confirm Save",
      text: 'Do you want to save the changes?',
      icon: 'question',
      showCancelButton:true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/save-region-config?customer=${selectedCustomer}&customerSite=${selectedCustomerSite}&cameraName=${selectedCameraName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regionAIConfig),
        });
  
        if (response.ok) {
          Swal.fire('Success!', 'Configuration saved successfully.', 'success');
        } else {
          Swal.fire('Error!', 'Failed to save configuration.', 'error');
        }
      } catch (error) {
        Swal.fire('Error!', 'An error occurred while saving.', 'error');
        console.error(error);
      }
    }
  };

  const handleResetPoints = () =>{
    setDataSelectedROI(prev =>({
        ...prev,
        points:[],
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
  }, [selectedShape, regionAIConfig]);
  
  
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

  useEffect(() =>{//show regionData
    if(regionAIConfig){
      console.log("RegionAIConfig", JSON.stringify(regionAIConfig, null,2))
    }
  }),[regionAIConfig]

  
  useEffect(() => {
    if (!selectedCameraName || !selectedCustomerSite) return;
    fetch(`http://localhost:5000/api/region-config?customer=${selectedCustomer}&customerSite=${selectedCustomerSite}&cameraName=${selectedCameraName}`)
      .then(res => res.json())
      .then( async data => {
        let config = data.config;
        const rtsp_link = data.rtsp;

        if (config === null) {// if dont have data 
          config = {
            rule: [],
          };
        }
  
        if (!config || !Array.isArray(config.rule)) {
          console.warn("Invalid config structure:", config);
          return;
        }

        try {
          const res = await fetch(`http://localhost:5000/snapshot?rtsp=${encodeURIComponent(rtsp_link)}`);
          const blob = await res.blob();
          const imageUrl = URL.createObjectURL(blob);
          setImage(imageUrl);
        } catch (err) {
          console.error("Failed to fetch snapshot:", err);
          return;
        }
  
        setRegionAIConfig(config);

      });
  }, [selectedCameraName, selectedCustomerSite]);

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
                    <span >All Devices</span>
                  </>
                ),
              },
              {
                href: '',
                title: (
                  <>
                    <span className='active_title'>{selectedCameraName}</span>
                  </>
                ),
              },
              
            ]}
          />
          <div className="device_control">
            <a href="/" >
              <p className='cameraName_title'><LeftOutlined /> {selectedCameraName}</p>
            </a>
          </div>
        </div>
        <div className="tools_box_main">
          <div className="canvas_box">
            <div className="draw_image">
              {imageObj && (
                <div style={{ display: 'flex', justifyContent: 'center', cursor: 'crosshair', border: enableDraw ? '4px solid #3c82f6' : '4px solid #eff1f5'}}>
                  <DrawingCanvas
                    imageObj={imageObj}
                    stageSize={stageSize}
                    selectedTool={selectedTool}
                    currentPoints={currentPoints}
                    onCanvasClick={handleEditRegionZoom}
                    onRightClick={handleEditRegionTripwireAndIntrusion}
                    selectedShape={selectedShape}
                    regionAIConfig={regionAIConfig}
                    mousePosition={mousePosition}
                    onMouseMove={handleMouseMove}
                  />
                </div>
              )}
            </div>
            {enableDraw === true  ? (
              <div className="button_control">
                <div className="box_text_guild_drawEnd">
                  <SignatureOutlined /> Draw the Rule on Camera Canvas & <strong>RIGHT-CLICK</strong> to Finish
                </div>
                <div className="box_button_control_drawwing">
                  <Button onClick ={() => { handleEditRegionTripwireAndIntrusion(),setEnableDraw(false)}} style={{ minWidth: '120px' }} className='save_button' variant="solid">
                    <SaveOutlined /> Save
                  </Button >
                  <Button disabled={selectedShape.index === null}  style={{ minWidth: '120px' }} onClick={()=>{handleResetPoints()}} color="danger" variant="outlined">
                    clear
                  </Button>
                </div>
              </div>
            ):(
              <div className="button_control">
                <div className="box_text_guild_drawwing">
                  <InfoCircleOutlined /> Enable Draw Mode to Draw the Rules
                </div>
                <div className="box_button_control_drawwing">
                  <Button onClick={() =>((setEnableDraw(true)))} color="primary" variant="solid">
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
            handleTimePickerChange={handleTimePickerChange}
            dataSelectedROI={dataSelectedROI}
            setDataSelectedROI={setDataSelectedROI}
            cameraName={selectedCameraName}
            setSelectedTool={setSelectedTool}
            handleResetPoints={handleResetPoints}
            MAX_ZOOM_REGION={MAX_ZOOM_REGION}
          />  
        </div>
      </div>
      <div className="footer_bar">
          <div className="box_bottom_save">
            <Button  style={{ minWidth: '120px' }}color="danger" variant="outlined">
              Discard Change
            </Button>
            <Button onClick={() =>{handleSave()}} style={{ minWidth: '120px' }} className='save_button' variant="solid">
                Apply
            </Button >
          </div>
        </div>
    </>
  );
}

export default Tools;
