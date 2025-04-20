import React, { useState, useEffect, useCallback} from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import Tools from './ToolsControl.jsx';
import TimePicker from './TimePicker.jsx';
import DrawingCanvas from './DrawingCanvas.jsx';
import NavbarSearch from './Navbar.jsx';
import ImageUploader from './ImageUploader.jsx';
import Sidebar from './SideBar.jsx';
import '../styles/App.css';


function App() {
  const [image, setImage] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  // image
  const [stageSize, setStageSize] = useState({ width: 800, height: 600, scale: 1 });
  // drawing
  const [selectedTool, setSelectedTool] = useState('line');
  const [currentPoints, setCurrentPoints] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [lines, setLines] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [shapesData, setShapesData] = useState({ polygons: [], lines: [], rectangles: [] }); 
  const [firstPoint, setFirstPoint] = useState(null); 
  const [selectedShape, setSelectedShape] = useState({ type: null, index: null });
  // timePicker
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');
  const [confidenceThreshold, setConfidentThreshold] = useState(0.5)
  // for get data point
  const [selectedCameraName, setSelectedCameraName] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
  
    if (selectedTool === 'poly' || selectedTool === 'line') {
      const updatedPoints = [...currentPoints, newPoint];
      setCurrentPoints(updatedPoints);
    } else if (selectedTool === 'rect') {
      if (firstPoint) {
        const rectPoints = [firstPoint, newPoint];
        setRectangles([...rectangles, rectPoints]);
        setShapesData({
          ...shapesData,
          rectangles: [...shapesData.rectangles, rectPoints],
        });
        addShapeToRegionAIConfig('zoom',rectPoints); // add shape to regionAIConfig
  
        setFirstPoint(null);
        setCurrentPoints([]);
      } else {
        setFirstPoint(newPoint);
        setCurrentPoints([newPoint]);
      }
    }
  };
  
  const handleContextMenu = (e) => {
    if (e && e.evt) {
      e.evt.preventDefault(); // ปิดเมนู context ปกติ
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
  // for add shape to regionAIConfig
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
    if (rectangles.length > 0) {
      const updated = [...rectangles];
      updated.pop();
      setRectangles(updated);
      setShapesData({ ...shapesData, rectangles: updated });
    } else if (lines.length > 0) {
      const updated = [...lines];
      updated.pop();
      setLines(updated);
      setShapesData({ ...shapesData, lines: updated });
    } else if (polygons.length > 0) {
      const updated = [...polygons];
      updated.pop();
      setPolygons(updated);
      setShapesData({ ...shapesData, polygons: updated });
    }
  };  

  const handleToolChange = (e) => {
    setSelectedTool(e.target.value);
    setCurrentPoints([]);
    setFirstPoint(null);
  };

  const handleImageUpload = (imgDataUrl) => {
    setImage(imgDataUrl);
    setPolygons([]);
    setLines([]);
    setRectangles([]);
    setCurrentPoints([]);
    setShapesData({ polygons: [], lines: [], rectangles: [] });
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
      confirmButtonText: 'Save',
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
  
      console.log("▶ ข้อมูลของ shape ที่เลือก:");
      console.log("startTime:", startTime);
      console.log("endTime:", endTime);
      console.log("confidence_threshold:", confidence);
  
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
  

  const handleTimePickerChange = (data) => {//for timepicker setdate
    console.log('⏱ Updated from TimePicker:', data);
    setStartTime(data.startTime);
    setEndTime(data.endTime);
    setConfidentThreshold(data.confidentThreshold);
  };

  useEffect(() =>{
    if(regionAIConfig){
      console.log("RegionAIConfig", JSON.stringify(regionAIConfig, null,2))
    }
  }),[regionAIConfig]

  // database get information
  useEffect(() => {
    if (!selectedCameraName) return;
  
    fetch(`http://localhost:5000/api/region-config?customer=${selectedCustomer}&cameraName=${selectedCameraName}`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched data from server:", data);
      
        const config = data[0]?.metthier_ai_config;
      
        if (!config || !Array.isArray(config.rule)) {
          console.warn("Invalid config structure:", config);
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
      })      
  }, [selectedCameraName]);
          

  return (
    <div className='contrainer'>
      <NavbarSearch onCameraSelect={setSelectedCameraName} onCustomerSelect={setSelectedCustomer} />
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
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
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
              <ImageUploader onUpload={handleImageUpload} />
            </div>
            <div>
              {(shapesData.polygons.length > 0 || shapesData.lines.length > 0 || shapesData.rectangles.length > 0) && (
                <button className="upload_button" onClick={handleUndo}>Undo</button>
              )}
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
}

export default App;
