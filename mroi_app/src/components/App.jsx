import React, { useState, useEffect, useCallback} from 'react';
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
  const [startTime, setStarttime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [confidence_threshold, setConfidentThreshold] = useState(0.5);
  const [selectedCameraName, setSelectedCameraName] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // data config region database
  const [regionAIConfig, setRegionAIConfig] = useState(null)

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
      setCurrentPoints([]); // รีเซ็ต currentPoints เพื่อเริ่มการวาดใหม่
    } else if (selectedTool === 'line' && currentPoints.length >= 2) {
      // สำหรับ Line: เมื่อคลิกขวาและมีจุดตั้งแต่ 2 จุดขึ้นไป
      setLines([...lines, currentPoints]);
      setShapesData({
        ...shapesData,
        lines: [...shapesData.lines, currentPoints],
      });
      setRegionAIConfig(convertShapesToRegionAIConfig());
      setCurrentPoints([]); // รีเซ็ต currentPoints เพื่อเริ่มการวาดใหม่
    }
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
    } else if (type === 'line') {
      updated = lines.filter((_, i) => i !== index);
      setLines(updated);
      setShapesData({ ...shapesData, lines: updated });
    } else if (type === 'rect') {
      updated = rectangles.filter((_, i) => i !== index);
      setRectangles(updated);
      setShapesData({ ...shapesData, rectangles: updated });
    }

    if (selectedShape?.type === type && selectedShape?.index === index) {
      setSelectedShape({ type: null, index: null });
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

  const convertShapesToRegionAIConfig = () => {
    const newRules = [];
  
    shapesData.polygons.forEach(points => {
      newRules.push({
        type: 'intrusion',
        points,
        schedule: {
          start_time: startTime || "00:00:00",
          end_time: endTime || "23:59:59",
        },
        confidence_threshold: 0.5, // หรือกำหนดจาก UI ก็ได้
      });
    });
  
    shapesData.lines.forEach(points => {
      newRules.push({
        type: 'tripwire',
        points,
        schedule: {
          start_time: startTime || "00:00:00",
          end_time: endTime || "23:59:59",
        },
        confidence_threshold: 0.5,
      });
    });
  
    shapesData.rectangles.forEach(points => {
      newRules.push({
        type: 'zoom',
        points,
        schedule: {
          start_time: startTime || "00:00:00",
          end_time: endTime || "23:59:59",
        },
        confidence_threshold: 0.5,
      });
    });
  
    return { rule: newRules };
  };  

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
    console.log('Region in this Image', JSON.stringify(shapesData, null, 2));
  }, [shapesData]);

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
              onStartTimeChange={setStarttime}
              onEndTimeChange={setEndTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
