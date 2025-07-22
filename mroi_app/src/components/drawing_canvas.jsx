import React from 'react';
import { Stage, Layer, Image, Line, Text, Rect } from 'react-konva';

const DrawingCanvas = ({
  imageObj,
  snapshotError,
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
  const scaledCurrentPoints = Array.isArray(currentPoints) && currentPoints.length > 0 && currentPoints[0] instanceof Array
    ? currentPoints.flatMap(([x, y]) => [x * stageSize.scale, y * stageSize.scale])
    : [];

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
        {snapshotError ? (
          <Rect
            x={0}
            y={0}
            width={stageSize.width}
            height={stageSize.height}
            fill="black"
          />
        ) : (
          imageObj && <Image
            image={imageObj}
            width={stageSize.width}
            height={stageSize.height}
          />
        )}

        {regionAIConfig?.rule?.map((dataRegion, index) => {
          if (Array.isArray(dataRegion.points) && dataRegion.points.length > 0) {
            
            const isSelected = selectedShape?.index === index;
            let strokeColor = snapshotError ? '#FFFFFF' : '#000000';
            if (isSelected) {
                strokeColor = 
                    dataRegion.roi_type === 'tripwire' ? 'rgb(36, 233, 255)' : 
                    dataRegion.roi_type === 'density' ? 'rgb(30, 57, 195)' :
                    dataRegion.roi_type === 'zoom' ? 'gold' : 'red';
            }

            const fillColor = isSelected ?
                (dataRegion.roi_type === 'density' ? 'rgba(173, 198, 255, 0.4)' :
                 dataRegion.roi_type === 'intrusion' ? 'rgba(247, 35, 35, 0.15)' :
                 dataRegion.roi_type === 'zoom' ? 'rgba(247, 227, 47, 0.2)' : 'rgba(0, 0, 0, 0)')
              : 'rgba(0, 0, 0, 0)';

            if (dataRegion.roi_type === 'tripwire') {
              const points = dataRegion.points.flatMap(([x, y]) => [x * stageSize.scale, y * stageSize.scale]);
              const [labelX, labelY] = dataRegion.points[0].map(v => v * stageSize.scale);

              return (
                <React.Fragment key={`tripwire-${index}`}>
                  <Line points={points} stroke={strokeColor} strokeWidth={4} />
                  <Text x={labelX + 10} y={labelY - 17} text={dataRegion.name} fontSize={17} fontFamily="Tahoma" fill={strokeColor} shadowOffset={{ x: 1, y: 1 }} shadowColor="black" shadowBlur={2} />
                </React.Fragment>
              );
            }
            if (['intrusion', 'density'].includes(dataRegion.roi_type)) {
                const points = dataRegion.points.flatMap(([x, y]) => [x * stageSize.scale, y * stageSize.scale]);
                const [labelX, labelY] = dataRegion.points[0].map(v => v * stageSize.scale);

                return (
                    <React.Fragment key={`${dataRegion.roi_type}-${index}`}>
                        <Line points={points} stroke={strokeColor} strokeWidth={4} closed fill={fillColor} />
                        <Text x={labelX} y={labelY - 25} text={dataRegion.name} fontSize={17} fontFamily="Tahoma" fill={strokeColor} shadowOffset={{ x: 1, y: 1 }} shadowColor="black" shadowBlur={2} />
                    </React.Fragment>
                );
            }
             if (dataRegion.roi_type === 'zoom' && dataRegion.points.length > 0) {
              const [[x1, y1]] = dataRegion.points;
              const width = 640 * stageSize.scale;
              const height = 384 * stageSize.scale;
              
              return (
                <React.Fragment key={`zoom-${index}`}>
                    <Rect x={x1 * stageSize.scale} y={y1 * stageSize.scale} width={width} height={height} stroke={strokeColor} strokeWidth={4} fill={fillColor} />
                    <Text x={x1 * stageSize.scale} y={(y1 * stageSize.scale) - 20} text={dataRegion.name} fontSize={17} fontFamily="Tahoma" fill={strokeColor} shadowOffset={{ x: 1, y: 1 }} shadowColor="black" shadowBlur={2} />
                </React.Fragment>
              );
            }
          }
          return null;
        })}

        {currentPoints.length > 0 && mousePosition && (
          <Line
            points={[
              currentPoints[currentPoints.length - 1][0] * stageSize.scale,
              currentPoints[currentPoints.length - 1][1] * stageSize.scale,
              mousePosition.x,
              mousePosition.y
            ]}
            stroke={selectedTool === 'tripwire' ? '#00ffff' : selectedTool === 'density' ? '#1E39C3' : 'red'}
            strokeWidth={2}
            dash={[10, 5]}
          />
        )}
        {scaledCurrentPoints.length > 0 &&
          <Line points={scaledCurrentPoints} stroke={selectedTool === 'tripwire' ? '#00ffff' : selectedTool === 'density' ? '#1E39C3' : 'red'} strokeWidth={3} />
        }
      </Layer>
    </Stage>
  );
};

export default DrawingCanvas;