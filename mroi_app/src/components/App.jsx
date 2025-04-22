import React, { useState, useEffect, useCallback} from 'react';
import { CiSaveDown1 } from "react-icons/ci";
import { DownloadOutlined } from '@ant-design/icons';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { LuUndo2 } from "react-icons/lu";
import { Button } from "antd";
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import Tools from './ToolsControl.jsx';
import TimePicker from './TimePicker.jsx';
import DrawingCanvas from './DrawingCanvas.jsx';
import NavbarSearch from './Navbar.jsx';
import Sidebar from './SideBar.jsx';
import '../styles/App.css';


function App() {
  const [maxTotalResion,setMaxTotalRegion] = useState(6);
  const [maxZoomRegion, setMaxZoomRegion] = useState(1);

  const [image, setImage] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  // imageobj
  const [stageSize, setStageSize] = useState({ width: 800, height: 600, scale: 1 });
  // drawing
  const [selectedTool, setSelectedTool] = useState('line');
  const [currentPoints, setCurrentPoints] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [lines, setLines] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [shapesData, setShapesData] = useState({ polygons: [], lines: [], rectangles: [] }); 
  const [selectedShape, setSelectedShape] = useState({ type: null, index: null });
  // timePicker
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');
  const [confidenceThreshold, setConfidentThreshold] = useState(0.5)
  // for get data point
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerSite, setSelectedCustomerSite] = useState(null)
  const [selectedCameraName, setSelectedCameraName] = useState(null);

  // data config region database
  const [regionAIConfig, setRegionAIConfig] = useState({rule: []})

  const handleMouseDown = (e) => {
    // ตรวจสอบว่าเป็นคลิกซ้ายเท่านั้น
    //0 = คลิกซ้าย
    //1 = กลาง (scroll)
    //2 = ขวา
    if (!imageObj || e.evt.button !== 0) return;
  
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();

    // reascale for get a real values of position
    const realX = mousePos.x / stageSize.scale;
    const realY = mousePos.y / stageSize.scale;
    const newPoint = [realX, realY];

    const totalShapesCount = shapesData.polygons.length + shapesData.lines.length + shapesData.rectangles.length;

    if (totalShapesCount >= maxTotalResion) {
      Swal.fire({
        icon: 'warning',
        title: 'Shape limit reached',
        text: 'You can draw up to 6 shapes only.',
      });
      return;
    }

    if (selectedTool === 'rect' && shapesData.rectangles.length >= maxZoomRegion) {
      Swal.fire({
        icon: 'info',
        title: 'Zoom already added',
        text: 'You can add only one zoom region.',
      });
      return;
    }
  
    if (selectedTool === 'poly' || selectedTool === 'line') {
      const updatedPoints = [...currentPoints, newPoint];
      setCurrentPoints(updatedPoints);
    } else if (selectedTool === 'rect') {
      const [x1, y1] = newPoint;
    
      const rectPoints = [x1,y1];
      
    
      setRectangles([...rectangles, rectPoints]);
      setShapesData({
        ...shapesData,
        rectangles: [...shapesData.rectangles, rectPoints],
      });
    
      addShapeToRegionAIConfig('zoom', rectPoints); // add just x1,y1
    
      setCurrentPoints([]); // clear
      // setFirstPoint(null);  // clear
    }
  };
  
  const handleContextMenu = (e) => {
    if (e && e.evt) {
      e.evt.preventDefault(); // ปิดเมนู context ปกติ
    }
    
    const totalShapesCount = shapesData.polygons.length + shapesData.lines.length + shapesData.rectangles.length;

    if (totalShapesCount >= 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Shape limit reached',
        text: 'You can draw up to 6 shapes only.',
      });
      return;
    }

    if (selectedTool === 'poly' && currentPoints.length >= 3) {
      // สำหรับ Polygon: เมื่อคลิกขวาและมีจุดตั้งแต่ 3 จุดขึ้นไป
      setPolygons([...polygons, currentPoints]);
      setShapesData({
        ...shapesData,
        polygons: [...shapesData.polygons, currentPoints],
      });
      addShapeToRegionAIConfig('intrusion',currentPoints);
      
      setCurrentPoints([]); // รีเซ็ต currentPoints เพื่อเริ่มการวาดใหม่
    } else if (selectedTool === 'line' && currentPoints.length >= 2) {
      // สำหรับ Line: เมื่อคลิกขวาและมีจุดตั้งแต่ 2 จุดขึ้นไป
      setLines([...lines, currentPoints]);
      setShapesData({
        ...shapesData,
        lines: [...shapesData.lines, currentPoints],
      });
      addShapeToRegionAIConfig('tripwire',currentPoints);
      
      setCurrentPoints([]); // รีเซ็ต currentPoints เพื่อเริ่มการวาดใหม่
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
    setSelectedTool(e.target.value);
    setCurrentPoints([]);
    setFirstPoint(null);
  };

  const handleDeleteShape = (type, index) => {
    let updated;
    if (type === 'poly') {
      updated = polygons.filter((_, i) => i !== index);
      setPolygons(updated);
      setShapesData({ ...shapesData, polygons: updated });
      removeShapeFromRegionAIConfig('intrusion',polygons[index]);// remove shape in regionAiConfig
    } else if (type === 'line') {
      updated = lines.filter((_, i) => i !== index);
      setLines(updated);
      setShapesData({ ...shapesData, lines: updated });
      removeShapeFromRegionAIConfig('tripwire',lines[index]);
    } else if (type === 'rect') {
      updated = rectangles.filter((_, i) => i !== index);
      setRectangles(updated);
      setShapesData({ ...shapesData, rectangles: updated });
      removeShapeFromRegionAIConfig('zoom', rectangles[index]);
    }

    if (selectedShape?.type === type && selectedShape?.index === index) {
      setSelectedShape({ type: null, index: null });
    }
  };
  
  const handleEditShape = async (index, regionAIConfig, setRegionAIConfig, type) => {
    console.log('Editing shape:', type, index);
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
        const timeFormat = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/; // RegEx สำหรับเวลาในรูปแบบ HH:mm:ss
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
      const actualIndex = regionAIConfig.rule.findIndex(rule =>
        rule.type === targetType &&
        JSON.stringify(rule.points) === JSON.stringify(selectedRule.points)
      );
  
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
        window.innerWidth * 0.8 / imageObj.width,
        window.innerHeight * 0.8 / imageObj.height
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
    setConfidentThreshold(data.confidentThreshold);
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

  useEffect(() => {// ดักข้อมูลของ shape ที่เลือก
    if (!regionAIConfig || !selectedShape.type || selectedShape.index === null) return;
  
    const { type, index } = selectedShape;
  
    // Map ประเภท shape ไปเป็น type ของ rule
    const typeMap = {
      poly: 'intrusion',
      line: 'tripwire',
      rect: 'zoom',
    };
  
    const targetType = typeMap[type];
  
    const matchingRules = regionAIConfig.rule.filter(rule => rule.type === targetType);
  
    const selectedRule = matchingRules[index];
  
    if (selectedRule) {
      const startTime = selectedRule.schedule?.start_time || '';
      const endTime = selectedRule.schedule?.end_time || '';
      const confidence = selectedRule.confidence_threshold || 0;

  
      // ตั้งค่าลง state ถ้าต้องการ
      setStartTime(startTime);
      setEndTime(endTime);
      setConfidentThreshold(confidence);
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

  // fetch data from server
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
  
        const intrusionShapes = [];
        const tripwireShapes = [];
        const zoomShapes = [];
  
        config.rule.forEach(rule => {
          const { type, points, schedule } = rule;
  
          if (!Array.isArray(points)) return;
  
          if (type === 'intrusion') {
            intrusionShapes.push(points);
          } else if (type === 'tripwire') {
            tripwireShapes.push(points);
          } else if (type === 'zoom' && points.length === 2) {
            zoomShapes.push(points);
          }
  
          if (schedule?.start_time && !startTime) setStarttime(schedule.start_time);
          if (schedule?.end_time && !endTime) setEndTime(schedule.end_time);
        });
  
        setPolygons(intrusionShapes);
        setLines(tripwireShapes);
        setRectangles(zoomShapes);
        setShapesData({
          polygons: intrusionShapes,
          lines: tripwireShapes,
          rectangles: zoomShapes,
        });
      });
  }, [selectedCameraName, selectedCustomerSite]);

  return (
    <div className='contrainer'>
      <NavbarSearch onSiteSelect={setSelectedCustomerSite} onCameraSelect={setSelectedCameraName} onCustomerSelect={setSelectedCustomer} />
      <div className='body_tools'>
        <Sidebar
          polygons={polygons}
          lines={lines}
          rectangles={rectangles}
          setSelectedShape={setSelectedShape}
          handleDeleteShape={handleDeleteShape}
          regionAIConfig={regionAIConfig}
          setRegionAIConfig={setRegionAIConfig}
          handleEditShape={handleEditShape}
        />
        <div className="image_input">
          {imageObj && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', cursor: 'crosshair'}}>
              <DrawingCanvas
                imageObj={imageObj}
                stageSize={stageSize}
                selectedTool={selectedTool}
                currentPoints={currentPoints}
                onCanvasClick={handleMouseDown}
                onRightClick={handleContextMenu}
                polygons={polygons}
                lines={lines}
                rectangles={rectangles}
                selectedShape={selectedShape}
              />
            </div>
          )}

          <div className='button_control_image'>
            <div>
              {(shapesData.polygons.length > 0 || shapesData.lines.length > 0 || shapesData.rectangles.length > 0) && (
                // <button className="Save_button" onClick={handleSave} ><CiSaveDown1 className='save_logo'/> Save</button>
                <Button type="primary" onClick={handleSave} shape="round" icon={<CiSaveDown1 className='save_logo' />} style={{ padding:'20px'}}>
                  Save
                </Button>
              )}
            </div>
            <div>
              {(shapesData.polygons.length > 0 || shapesData.lines.length > 0 || shapesData.rectangles.length > 0) && (
                <button className="upload_button" 
                  onClick={() => {
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
                >
                  <LuUndo2 className='save_logo'/> Undo
                </button>
              )}
            </div>
          </div>
          {(selectedCameraName)&& (
            
            <div className="toolbar">
              <Tools selectedTool={selectedTool} onChange={handleToolChange} />
              <TimePicker 
                startTime={startTime}
                endTime={endTime}
                confidentThreshold={confidenceThreshold}
                onChangeAll={handleTimePickerChange}
                regionAIConfig={regionAIConfig}
                setRegionAIConfig={setRegionAIConfig}
                handleEditShape={handleEditShape}
              />
            </div>
          )}
        </div>
      </div>
      {/* <DotLottieReact
        src="https://lottie.host/ae539215-9ce0-4972-a17d-41e340fb6344/Dboe3wtnUL.lottie"
        loop
        autoplay
      /> */}
    </div>
  );
}

export default App;
