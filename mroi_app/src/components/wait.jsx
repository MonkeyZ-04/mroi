import React, { useState, useEffect, useCallback} from 'react';
import { Button ,Breadcrumb,Collapse } from "antd";
import { LeftOutlined,RightOutlined  } from '@ant-design/icons';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import DrawingCanvas from './drawing_canvas.jsx';
import Sidebar from './sideBar.jsx';
import '../styles/tools.css';
import { useLocation } from 'react-router-dom';


function Tools() {

  const location = useLocation();
  const deviceData = location.state?.deviceData;

  useEffect(() =>{
    if(deviceData){
      setSelectedCustomer(deviceData.workspace);
      setSelectedCustomerSite(deviceData.department);
      setSelectedCameraName(deviceData.device_name)
    }
  })


  const [maxTotalResion,setMaxTotalRegion] = useState(6);
  const [maxZoomRegion, setMaxZoomRegion] = useState(1);

  const [image, setImage] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  // imageobj
  const [stageSize, setStageSize] = useState({ width: 800, height: 600, scale: 1 });
  // drawing
  const [selectedTool, setSelectedTool] = useState('tripwire');
  const [currentPoints, setCurrentPoints] = useState([]);
  const [shapesData, setShapesData] = useState({ polygons: [], lines: [], rectangles: [] }); 
  const [selectedShape, setSelectedShape] = useState({ type: null, index: null });
  // timePicker
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [regionType,setRegionType] = useState("null")
  const [statusSelected,setStatusSelected] = useState('OFF')
  // for get data point
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerSite, setSelectedCustomerSite] = useState(null)
  const [selectedCameraName, setSelectedCameraName] = useState(null);

  // data config region database
  const [regionAIConfig, setRegionAIConfig] = useState({rule: []})

  const handleMouseDown = (e) => {
    // ตรวจสอบว่าเป็นคลิกซ้ายเท่านั้น
    if (!imageObj || e.evt.button !== 0) return;
  
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();
  
    // reascale for get a real values of position
    const realX = mousePos.x / stageSize.scale;
    const realY = mousePos.y / stageSize.scale;
    const newPoint = [realX, realY];
  
    const totalShapesCount = regionAIConfig.rule.length;
    const totalZoom = regionAIConfig.rule.filter((item) => item.type === 'zoom').length;
  
    if (totalShapesCount >= maxTotalResion) {
      Swal.fire({
        icon: 'warning',
        title: 'Region limit reached',
        text: 'You can draw up to 6 region only.',
      });
      return;
    }
  
    if (selectedTool === 'zoom' && totalZoom >= maxZoomRegion) {
      Swal.fire({
        icon: 'info',
        title: 'Zoom already added',
        text: 'You can add only one zoom region.',
      });
      return;
    }
  
    if (selectedTool === 'intrusion' || selectedTool === 'tripwire') {
      const updatedPoints = [...currentPoints, newPoint];
      setCurrentPoints(updatedPoints);
    } else if (selectedTool === 'zoom') {
      const [x1, y1] = newPoint;
      const rectPoints = [x1, y1];
  
      addShapeToRegionAIConfig('zoom', rectPoints); // บันทึกแค่ x1, y1
      setCurrentPoints([]);
    }
  };
  
  
  const handleContextMenu = (e) => {
    if (e && e.evt) {
      e.evt.preventDefault(); // ปิดเมนู context ปกติ
    }
    
    const totalShapesCount = regionAIConfig.rule.length;

    if (totalShapesCount >= 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Region limit reached',
        text: 'You can draw up to 6 region only.',
      });
      return;
    }

    if (selectedTool === 'intrusion' && currentPoints.length >= 3) {
      addShapeToRegionAIConfig('intrusion',currentPoints);
      
      setCurrentPoints([]); // รีเซ็ต currentPoints เพื่อเริ่มการวาดใหม่
    } else if (selectedTool === 'tripwire' && currentPoints.length >= 2) {
      addShapeToRegionAIConfig('tripwire',currentPoints);
      setCurrentPoints([]); // รีเซ็ต currentPoints เพื่อเริ่มการวาดใหม่ๆๆๆๆๆ
    }
  };
  
  const addShapeToRegionAIConfig = (type, points) => {
    const newRule = {
      points: points,
      type: type,
      schedule: {
        start_time: startTime,
        end_time: endTime,
      },
      confidence_threshold: confidenceThreshold,
    };
  
    const updatedConfig = {
      ...regionAIConfig,
      rule: [...(regionAIConfig?.rule || []), newRule],
    };
  
    setRegionAIConfig(updatedConfig);
  };
  const removeShapeFromRegionAIConfig = (type, pointsToRemove) => {
    if (!regionAIConfig || !Array.isArray(regionAIConfig.rule)) return;
  
    const updatedRules = regionAIConfig.rule.filter(rule => {
      if (rule.type !== type) return true;
  
      // Compare points (check exact match)
      const pointsMatch = JSON.stringify(rule.points) === JSON.stringify(pointsToRemove);
      return !pointsMatch;
    });
  
    setRegionAIConfig({
      ...regionAIConfig,
      rule: updatedRules,
    });
  };
  
  const handleUndo = () => {
    if(regionAIConfig.rule.length > 0 ){
      const lastRule = regionAIConfig.rule[regionAIConfig.rule.length -1];
      const lastType = lastRule.type;
      const lastPoints = lastRule.points;

      removeShapeFromRegionAIConfig(lastType, lastPoints);

      if (lastType === 'zoom') {
        const updated = rectangles.slice(0, -1);
        setRectangles(updated);
        setShapesData(prev => ({ ...prev, rectangles: updated }));
      } else if (lastType === 'tripwire') {
        const updated = lines.slice(0, -1);
        setLines(updated);
        setShapesData(prev => ({ ...prev, lines: updated }));
      } else if (lastType === 'intrusion') {
        const updated = polygons.slice(0, -1);
        setPolygons(updated);
        setShapesData(prev => ({ ...prev, polygons: updated }));
      }  
    }
  };  

  const handleToolChange = (e) => {
    setCurrentPoints([]);
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
  
  const handleEditShape = async (index, regionAIConfig, setRegionAIConfig, type) => {;
  
    const targetType = type;
 
    const selectedRule = regionAIConfig.rule[index];

    console.log(selectedRule)
  
    if (!selectedRule) {
      Swal.fire('Error', 'Selected rule not found.', 'error');
      return;
    }
  
    const { value: formValues } = await Swal.fire({
      title: 'Edit Shape Settings',
      html:
        `<label for="swal-confidence">Confidence Threshold (0-1)</label><input id="swal-confidence" class="swal2-input" placeholder="Confidence Threshold" value="${selectedRule.confidence_threshold}">` +
        `<label for="swal-start">Start Time (HH:mm:ss)</label><input id="swal-start" class="swal2-input" placeholder="Start Time (HH:mm:ss)" value="${selectedRule.schedule.start_time}">` +
        `<label for="swal-end">End Time (HH:mm:ss)</label><input id="swal-end" class="swal2-input" placeholder="End Time (HH:mm:ss)" value="${selectedRule.schedule.end_time}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Edited',
      cancelButtonText: 'Cancel',
      
      preConfirm: () => {
        const confidence = document.getElementById('swal-confidence').value;
        const startTime = document.getElementById('swal-start').value;
        const endTime = document.getElementById('swal-end').value;
  
        // ตรวจสอบว่า confidence อยู่ในช่วง 0-1 หรือไม่
        if (!confidence || !startTime || !endTime) {
          Swal.showValidationMessage('Please fill all fields');
          return;
        }
        if (isNaN(confidence) || confidence < 0 || confidence > 1) {
          Swal.showValidationMessage('Confidence must be between 0 and 1');
          return;
        }

        // ตรวจสอบรูปแบบเวลา HH:mm:ss และให้อยู่ในช่วง 00:00:00 ถึง 23:59:59
        const timeFormat = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/; 
        if (!timeFormat.test(startTime)) {
          Swal.showValidationMessage('Start Time must be in HH:mm:ss format and within 00:00:00 to 23:59:59');
          return;
        }
        if (!timeFormat.test(endTime)) {
          Swal.showValidationMessage('End Time must be in HH:mm:ss format and within 00:00:00 to 23:59:59');
          return;
        }

        return { confidence, startTime, endTime };
      }
    });
  
    if (formValues) {
      // หาตำแหน่งจริงใน rule (จาก rule ทั้งหมด)
      const actualIndex = index
  
      if (actualIndex !== -1) {
        const updatedRules = [...regionAIConfig.rule];
        updatedRules[actualIndex] = {
          ...updatedRules[actualIndex],
          confidence_threshold: parseFloat(formValues.confidence),
          schedule: {
            start_time: formValues.startTime,
            end_time: formValues.endTime,
          }
        };
  
        setRegionAIConfig({
          ...regionAIConfig,
          rule: updatedRules
        });
        
        Swal.fire('Saved!', 'Shape settings updated.', 'success');
      } else {
        Swal.fire('Error', 'Could not find the shape to update.', 'error');
      }
    }
  };

  const handleChangeStatus = async (index, regionAIConfig, setRegionAIConfig, type) =>{
    const typeMap = {
      poly: 'intrusion',
      line: 'tripwire',
      rect: 'zoom',
    };

    const targetType = typeMap[type];
    const matchingRules = regionAIConfig.rule.filter(rule => rule.type === targetType);
    const selectedRule = matchingRules[index];

    if (!selectedRule) {
      Swal.fire('Error', 'Selected rule not found.', 'error');
      return;
    }

    if (formValues) {
      // หาตำแหน่งจริงใน rule (จาก rule ทั้งหมด)
      const actualIndex = regionAIConfig.rule.findIndex(rule =>
        rule.type === targetType &&
        JSON.stringify(rule.points) === JSON.stringify(selectedRule.points)
      );
  
      if (actualIndex !== -1) {
        const updatedRules = [...regionAIConfig.rule];
        updatedRules[actualIndex] = {
          ...updatedRules[actualIndex],
          status:formValues.status,
          
        };
  
        setRegionAIConfig({
          ...regionAIConfig,
          rule: updatedRules
        });
        
        Swal.fire('Saved!', 'Shape settings updated.', 'success');
      } else {
        Swal.fire('Error', 'Could not find the shape to update.', 'error');
      }
    }

  }

  const updateStageSize = useCallback(() => {
    if (imageObj) {
      if(imageObj.width<800 || imageObj.height<800){
        Swal.fire({
          title:'Warning',
          text:`This snapshot looks like it is from a sub stream camera! Scale : ${imageObj.width} x ${imageObj.height}`,
          icon: "warning",
          draggable: true
        });
      }
      else{
        Swal.fire({
          title:'Success!!',
          text:`This snapshot Scale : ${imageObj.width} x ${imageObj.height}`,
          icon: "success",
          timer:3000,
          showConfirmButton: false,
          draggable: true
        });
      }

      const scale = Math.min(
        window.innerWidth * 0.62 / imageObj.width,
        window.innerHeight * 0.62 / imageObj.height
      );
      setStageSize({
        width: imageObj.width * scale,
        height: imageObj.height * scale,
        scale: scale,
      });
    }
  }, [imageObj]);

  const handleTimePickerChange = (data) => {//for timepicker setdate
    setStartTime(data.startTime);
    setEndTime(data.endTime);
    setConfidenceThreshold(data.confidenceThreshold);
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

  useEffect(() => {
    if (!regionAIConfig || !selectedShape.type || selectedShape.index === null) return;
  
    const { type, index } = selectedShape;
    console.log(index, type)
  
    // const targetType = type;
    // const matchingRules = regionAIConfig.rule.filter(rule => rule.type === targetType);
    // const selectedRule = matchingRules[index];
    const selectedRule = regionAIConfig.rule[index]
  
    if (selectedRule) {
      console.log("useEffect selectedshape : ",selectedRule)
      const startTime = selectedRule.schedule?.start_time || '';
      const endTime = selectedRule.schedule?.end_time || '';
      const confidence = selectedRule.confidence_threshold || 0;
      const regionType = selectedRule.type || '';
      const status = selectedRule.status || '';
  
      // Set values into state
      setStartTime(startTime);
      setEndTime(endTime);
      setConfidenceThreshold(confidence);
      setRegionType(regionType);
      setStatusSelected(status);
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

  return (
    <>
      <div className="container_tools">
        <div className="header_tools_nav">
          <Breadcrumb
            items={[
              {
                href: '',
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
                    <span className='active_title'>{selectedCameraName}</span>
                  </>
                ),
              },
              
            ]}
          />
          <div className="device_control">
            <a href="" >
              <p className='cameraName_title'><LeftOutlined /> {selectedCameraName}</p>
            </a>
            <div className="box_button_control_device">
              <Button onClick={handleSave} className='button_control_device' color="orange" variant="solid">
                Save & Restart This Device
              </Button>
              <Button onClick={() => {
                    Swal.fire({
                      title: 'Are you sure?',
                      text: 'Do you want to undo the last shape?',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#3085d6',
                      cancelButtonColor: '#d33',
                      confirmButtonText: 'Yes, undo it!',
                      cancelButtonText: 'Cancel'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        handleUndo(); // Call your undo function
                        Swal.fire('Undone!', 'The last shape has been removed.', 'success');
                      }
                    });
                  }}
                   className='button_control_device' color="orange" variant="outlined">
                Discard Change
              </Button>
            </div>
          </div>
        </div>
        <div className="tools_box_main">
          <div className="tools_side">
            <Sidebar
              startTime={startTime}
              endTime={endTime}
              confidenceThreshold={confidenceThreshold}
              onChangeAll={handleTimePickerChange}
              setSelectedShape={setSelectedShape}
              handleDeleteShape={handleDeleteShape}
              regionAIConfig={regionAIConfig}
              setRegionAIConfig={setRegionAIConfig}
              handleEditShape={handleEditShape}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
              setConfidenceThreshold={setConfidenceThreshold}
              setSelectedTool={setSelectedTool}
              selectedTools={selectedTool}
              onChange={handleToolChange}
            />
          </div>
          <div className="canvas_box">
            <div className="draw_image">
              {imageObj && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', cursor: 'crosshair',}}>
                  <DrawingCanvas
                    imageObj={imageObj}
                    stageSize={stageSize}
                    selectedTool={selectedTool}
                    currentPoints={currentPoints}
                    onCanvasClick={handleMouseDown}
                    onRightClick={handleContextMenu}
                    selectedShape={selectedShape}
                    regionAIConfig={regionAIConfig}
                  />
                </div>
              )}
            </div>
            <div className="camera_info_box">
              <Collapse
                defaultActiveKey={['1']}
                bordered={true}
                expandIconPosition="end"
                items={[
                  {
                    key: '1',
                    label: (
                      <div className='collapse_label_box'>
                        ROI Info - {selectedCameraName}
                      </div>
                    ),
                    children: (
                      <div className="info_box">
                        <div className='info_box_left'>
                          <div className='box_text_info'>Region Type: <p className='text_info'>{regionType || null}</p></div>
                          <div className='box_text_info'>Start Time: <p className='text_info'>{startTime || null}</p></div>
                          <div className='box_text_info'>End Time: <p className='text_info'>{endTime || null }</p></div>
                          <div className='box_text_info'>Confidence: <p className='text_info'>{confidenceThreshold || null}</p></div>
                        </div>
                        <div className="info_box_right">
                          <div className='box_text_info'>Date Created: <p className='text_info'>{'12/12/12' }</p></div>
                          <div className='box_text_info'> Created by: <p className='text_info'>{" prasit"}</p></div>
                          <div className='box_text_info'>Status: <p className='text_info'>{statusSelected || null}</p></div>
                        </div>
                      </div>
                    ),
                  }
                ]}
              />

            </div>
          </div>
        </div>

        {/* new upper */}
      </div>
    </>
  );
}

export default Tools;
