import React from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import '../styles/SideBar.css';
const Sidebar = ({ polygons, lines, rectangles, setSelectedShape, handleDeleteShape }) => {
  return (
    <div className='side_bar'>
      <h5 style={{ padding: '15px' }}>ROI Zone</h5>

      <div style={{ padding: '10px' }}>
        {polygons.map((poly, index) => (
          <div key={`poly-${index}`} className='items_in_sidebar'>
            <span className='item' onClick={() => setSelectedShape({ type: 'poly', index })}>
              Polygon {index + 1}
            </span>
            <span className='bin' onClick={() => handleDeleteShape('poly', index)} style={{ color: 'red', marginLeft: '10px' }}>
              <MdDeleteOutline className='delete_icon'/>
            </span>
          </div>
        ))}

        {lines.map((line, index) => (
          <div key={`line-${index}`} className='items_in_sidebar'>
            <span className='item' onClick={() => setSelectedShape({ type: 'line', index })}>
              Line {index + 1}
            </span>
            <span className='bin' onClick={() => handleDeleteShape('line', index)} style={{ color: 'red', marginLeft: '10px' }}>
              <MdDeleteOutline className='delete_icon'/>
            </span>
          </div>
        ))}

        {rectangles.map((rect, index) => (
          <div key={`rect-${index}`} className='items_in_sidebar'>
            <span className='item' onClick={() => setSelectedShape({ type: 'rect', index })}>
              Rectangle {index + 1}
            </span>
            <span className='bin' onClick={() => handleDeleteShape('rect', index)} style={{ color: 'red', marginLeft: '10px' }}>
              <MdDeleteOutline className='delete_icon'/>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
