import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Tools from './ToolsControl';
import TimePicker from './TimePicker';
import DrawingCanvas from './DrawingCanvas';
import NavbarSearch from './Navbar';
import ImageUploader from './ImageUploader';
import Sidebar from './SideBar';
import '../styles/App.css';


function App() {
  const [image, setImage] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600, scale: 1 });
  const [selectedTool, setSelectedTool] = useState('poly');

  const [currentPoints, setCurrentPoints] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [lines, setLines] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [shapesData, setShapesData] = useState({ polygons: [], lines: [], rectangles: [] }); 
  const [firstPoint, setFirstPoint] = useState(null); 
  const [selectedShape, setSelectedShape] = useState({ type: null, index: null });

  const handleMouseDown = (e) => {
    // ตรวจสอบว่าเป็นคลิกซ้ายเท่านั้น
    //0 = คลิกซ้าย
    //1 = กลาง (scroll)
    //2 = ขวา
    if (!imageObj || e.evt.button !== 0) return;
  
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();
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

  const handleClosePolygon = () => {
    if (currentPoints.length >= 6) {
      const pointPairs = [];
      for (let i = 0; i < currentPoints.length; i += 2) {
        pointPairs.push([currentPoints[i], currentPoints[i + 1]]);
      }
  
      setPolygons([...polygons, pointPairs]);
      setShapesData({
        ...shapesData,
        polygons: [...shapesData.polygons, pointPairs]
      });
      setCurrentPoints([]);
    }
  };
  
  const updateStageSize = () => {
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
  }, [imageObj]);

  useEffect(() => {
    console.log('ROI in this Image', JSON.stringify(shapesData, null, 2));
  }, [shapesData]);

  return (
    <div className='contrainer'>
      <NavbarSearch />
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
            <TimePicker />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
