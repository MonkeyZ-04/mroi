import React from 'react';
import { Stage, Layer, Image, Line } from 'react-konva';

const DrawingCanvas = ({
  imageObj,
  stageSize,
  currentPoints,
  selectedTool,
  onCanvasClick,
  onRightClick,
  polygons,
  lines,
  rectangles,
  selectedShape
}) => {
  const scaledCurrentPoints = currentPoints.flatMap(([x, y]) => [x * stageSize.scale, y * stageSize.scale]);

  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={onCanvasClick}
      onContextMenu={e => {
        e.evt.preventDefault(); // ปิด context menu
        if (onRightClick) onRightClick(); // เรียก callback
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

        {/* Polygons */}
        {polygons.map((poly, i) => (
          <Line
            key={`poly-${i}`}
            points={poly.flatMap(([x, y]) => [x * stageSize.scale, y * stageSize.scale])}
            stroke={selectedShape?.type === 'poly' && selectedShape.index === i ? 'rgba(45, 244, 0, 1)' : 'red'}
            strokeWidth={selectedShape?.type === 'poly' && selectedShape.index === i ? 6:3}
            closed
            fill={selectedShape?.type === 'poly' && selectedShape.index === i ? 'rgba(45, 244, 0, 0.4)' : 'rgba(251, 126, 126, 0.2)'}
          />
        ))}

        {/* Lines */}
        {lines.map((line, i) => (
          <Line
            key={`line-${i}`}
            points={line.flatMap(([x, y]) => [x * stageSize.scale, y * stageSize.scale])}
            stroke={selectedShape?.type === 'line' && selectedShape.index === i ? 'rgba(45, 244, 0, 1)' : 'blue'}
            strokeWidth={selectedShape?.type === 'line' && selectedShape.index === i ? 6:3}
          />
        ))}

        {/* Rectangles */}
        {rectangles.map((rect, i) => {
          if (rect.length !== 2) return null;
          const [x1, y1] = rect;
          const width = 640;  
          const height = 384;
        
          const x2 = x1 + width;
          const y2 = y1 + height;

          const rectPolygon = [
            x1, y1,
            x2, y1,
            x2, y2,
            x1, y2
          ].map((v, idx) => (v * stageSize.scale)); // for map real scale

          return (
            <Line
              key={`rect-${i}`}
              points={rectPolygon}
              stroke={selectedShape?.type === 'rect' && selectedShape.index === i ? 'rgba(45, 244, 0, 1)' : 'gold'}
              strokeWidth={selectedShape?.type === 'rect' && selectedShape.index === i ? 6:3}
              closed
              fill={selectedShape?.type === 'rect' && selectedShape.index === i ? 'rgba(45, 244, 0, 0.4)' : 'rgba(246, 227, 149, 0.2)'}
            />
          );
        })}

        {/* Preview ขณะวาด */}
        {selectedTool === 'poly' && scaledCurrentPoints.length >= 4 && (
          <Line
            points={scaledCurrentPoints}
            stroke="red"
            strokeWidth={3}
          />
        )}

        {selectedTool === 'line' && scaledCurrentPoints.length >= 4 && (
          <Line
            points={scaledCurrentPoints}
            stroke="blue"
            strokeWidth={3}
          />
        )}

        {selectedTool === 'rect' && scaledCurrentPoints.length === 2 && (() => {
          let [x1, y1] = scaledCurrentPoints[0];
          let [x2, y2] = [x1+640, y1+384]
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
        })()}
      </Layer>
    </Stage>
  );
};

export default DrawingCanvas;
