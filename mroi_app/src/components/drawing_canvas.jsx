import React, { useEffect } from 'react';
import { Stage, Layer, Image, Line,Text } from 'react-konva';

const DrawingCanvas = ({
  imageObj,
  stageSize,
  currentPoints,
  selectedTool,
  onCanvasClick,
  onRightClick,
  selectedShape,
  regionAIConfig,
  mousePosition,
  onMouseMove
}) => {
  // แปลง currentPoints เป็นค่าที่ปรับขนาดแล้ว
  const scaledCurrentPoints = Array.isArray(currentPoints) && currentPoints[0] instanceof Array
    ? currentPoints.flatMap(([x, y]) => [x * stageSize.scale, y * stageSize.scale])
    : [];

  useEffect(() => {
    if (regionAIConfig) {
      console.log(regionAIConfig);
    }
  }, [regionAIConfig]);

  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={onCanvasClick}
      onMouseMove={onMouseMove}
      onContextMenu={(e) => {
        e.evt.preventDefault();
        if (onRightClick) onRightClick();
      }}
      style={{ border: '1px solid #ccc' }}
    >
      <Layer>
        {/* รูปภาพ */}
        <Image
          image={imageObj}
          width={stageSize.width}
          height={stageSize.height}
        />

        {/* วาด region จาก config */}
        {regionAIConfig?.rule?.map((dataRegion, index) => {
          if (Array.isArray(dataRegion.points)) {
            if (dataRegion.type === 'tripwire') {
              const points = dataRegion.points.flatMap(([x, y]) => [x * stageSize.scale, y * stageSize.scale]);

              let labelX = 0;
              let labelY = 0;

              if (dataRegion.points.length >= 2 && Array.isArray(dataRegion.points[0]) && Array.isArray(dataRegion.points[1])) {
                const [x1, y1] = dataRegion.points[0].map((v) => v * stageSize.scale);
                labelX = (x1 );
                labelY = (y1 ) ;
              }
                    
              return (
                <React.Fragment key={`tripwire-${index}`}>
                  <Line
                    points={points}
                    stroke={selectedShape?.type === 'tripwire' && selectedShape.index === index ? 'rgb(36, 233, 255)' : 'black'}
                    strokeWidth={4}
                  />
                  <Text
                    x={labelX + 10}
                    y={labelY - 17}
                    text={`${dataRegion.name}`}
                    fontSize={16}
                    strokeWidth={40}
                    fill={selectedShape?.type === 'tripwire' && selectedShape.index === index ? 'rgb(36, 233, 255)' : 'black'}
                  />
                </React.Fragment>
              );
            }
            if (dataRegion.type === 'intrusion') {
              const points = dataRegion.points.flatMap(([x, y]) => [x * stageSize.scale, y * stageSize.scale]);
          
              let labelX = 0;
              let labelY = 0;

              if (dataRegion.points.length >= 2 && Array.isArray(dataRegion.points[0]) && Array.isArray(dataRegion.points[1])) {
                const [x1, y1] = dataRegion.points[0].map((v) => v * stageSize.scale);
                labelX = (x1 );
                labelY = (y1 ) ;
              }
            
              return (
                <React.Fragment key={`intrusion-${index}`}>
                  <Line
                    points={points}
                    stroke={selectedShape?.type === 'intrusion' && selectedShape.index === index ? 'red' : 'black'}
                    strokeWidth={4}
                    closed
                    fill={selectedShape?.type === 'intrusion' && selectedShape.index === index ? 'rgba(247, 35, 35, 0.15)' : 'rgba(0, 0, 0, 0)'}
                  />
                  <Text
                    x={labelX + 5}
                    y={labelY - 17}
                    text={`${dataRegion.name}`}
                    fontSize={16}
                    fill={selectedShape?.type === 'intrusion' && selectedShape.index === index ? 'red' : 'black'}
                  />
                </React.Fragment>
              );
            }
            

            if (dataRegion.type === 'zoom') {
              if (dataRegion.points.length !== 2) return null;

              const [x1, y1] = dataRegion.points;
              const width = 640;
              const height = 384;
              const x2 = x1 + width;
              const y2 = y1 + height;

              const rectPolygon = [
                x1, y1,
                x2, y1,
                x2, y2,
                x1, y2
              ].map((v) => (v * stageSize.scale));

              const labelX = (x1 ) * stageSize.scale;
              const labelY = (y1-40 ) * stageSize.scale;

              return (
                <React.Fragment key={`zoom-${index}`}>
                  <Line
                    points={rectPolygon}
                    stroke={selectedShape?.type === 'zoom' && selectedShape.index === index ? 'gold' : 'black'}
                    strokeWidth={4}
                    closed
                    fill={selectedShape?.type === 'zoom' && selectedShape.index === index ? 'rgba(247, 227, 47, 0.2)' : 'rgba(0, 0, 0, 0)'}
                  />
                  <Text
                    x={labelX}
                    y={labelY}
                    text={`${dataRegion.name}`}
                    fontSize={16}
                    fill={selectedShape?.type === 'zoom' && selectedShape.index === index ? 'gold' : 'black'}
                  />
                </React.Fragment>
              );

            }
          }
          return null;
        })}

        {/* เส้นโยงจากจุดล่าสุดกับตำแหน่งเมาส์ */}
        {(selectedTool === 'tripwire' || selectedTool === 'intrusion') && currentPoints.length > 0 && mousePosition && (
          <Line
            points={[
              currentPoints[currentPoints.length - 1][0] * stageSize.scale,
              currentPoints[currentPoints.length - 1][1] * stageSize.scale,
              mousePosition.x,
              mousePosition.y
            ]}
            stroke={selectedTool === 'tripwire' ? 'blue' : 'red'}
            strokeWidth={2}
            dash={[10, 5]}
          />
        )}

        {/* วาดรูปร่างจริงที่กำลังสร้าง */}
        {selectedTool === 'intrusion' && scaledCurrentPoints.length >= 4 && (
          <Line
            points={scaledCurrentPoints}
            stroke="red"
            strokeWidth={3}
          />
        )}

        {selectedTool === 'tripwire' && scaledCurrentPoints.length >= 2 && (
          <Line
            points={scaledCurrentPoints}
            stroke="blue"
            strokeWidth={3}
          />
        )}

        {/* วาดกล่อง zoom */}
        {selectedTool === 'zoom' && currentPoints.length === 1 && (
          (() => {
            const [x1, y1] = currentPoints[0].map((v) => v * stageSize.scale);
            const x2 = x1 + 640;
            const y2 = y1 + 384;
            const rectPoints = [x1, y1, x2, y1, x2, y2, x1, y2];
            return (
              <Line
                points={rectPoints}
                stroke="gold"
                strokeWidth={3}
                closed
                fill="rgba(250, 227, 135, 0.2)"
              />
            );
          })()
        )}
      </Layer>
    </Stage>
  );
};

export default DrawingCanvas;
