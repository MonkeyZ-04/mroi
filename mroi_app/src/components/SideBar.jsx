import React from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { BiSolidEditAlt } from 'react-icons/bi';
import Swal from 'sweetalert2';
import '../styles/SideBar.css';

const Sidebar = ({ polygons, lines, rectangles, setSelectedShape, handleDeleteShape, regionAIConfig,
  setRegionAIConfig, handleEditShape}) => {
  const confirmDelete = async (type, index) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Thisaction cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      handleDeleteShape(type, index);
      Swal.fire('Deleted!', 'The item has been successfully deleted.', 'success');
    }
  };
 
  return (
    <div className='side_bar'>
      <h5 style={{ padding: '15px' }}>ROI Zone</h5>

      <div style={{ padding: '10px' }}>
        {polygons.map((poly, index) => (
          <div key={`poly-${index}`} className='items_in_sidebar'>
            <span className='item' onClick={() => setSelectedShape({ type: 'poly', index })}>
              Intrusion {index + 1}
            </span>
            <span className='edit' onClick={() => handleEditShape(index, regionAIConfig, setRegionAIConfig,'poly')}>
              <BiSolidEditAlt className='Edit_icon' />
            </span>
            <span className='bin' onClick={() => confirmDelete('poly', index)}>
              <MdDeleteOutline className='delete_icon' />
            </span>
          </div>
        ))}

        {lines.map((line, index) => (
          <div key={`line-${index}`} className='items_in_sidebar'>
            <span className='item' onClick={() => setSelectedShape({ type: 'line', index })}>
              Tripwire {index + 1}
            </span>
            <span className='edit'>
              <BiSolidEditAlt className='Edit_icon' onClick={() => handleEditShape(index, regionAIConfig, setRegionAIConfig, 'line')}/>
            </span>
            <span className='bin' onClick={() => confirmDelete('line', index)}>
              <MdDeleteOutline className='delete_icon' />
            </span>
          </div>
        ))}

        {rectangles.map((rect, index) => (
          <div key={`rect-${index}`} className='items_in_sidebar'>
            <span className='item' onClick={() => setSelectedShape({ type: 'rect', index })}>
              Zoom {index + 1}
            </span>
            <span className='edit'>
              <BiSolidEditAlt className='Edit_icon' onClick={() => handleEditShape(index, regionAIConfig, setRegionAIConfig, 'rect')}/>
            </span>
            <span className='bin' onClick={() => confirmDelete('rect', index)}>
              <MdDeleteOutline className='delete_icon' />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
