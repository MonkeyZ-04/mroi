import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/SideBar.css';
import {v4 as uuidv4} from 'uuid';
import { Collapse, Button, Input, Switch } from 'antd';
import { ExpandOutlined, PlusOutlined, VerticalAlignMiddleOutlined,ImportOutlined ,SisternodeOutlined,DeleteOutlined} from '@ant-design/icons';

const Sidebar = ({ selectedShape, setSelectedShape, handleDeleteShape, regionAIConfig, addShapeToRegionAIConfig, maxTotalRegion, handleChangeStatus}) => {

  const rule = regionAIConfig.rule;
  useEffect(() =>{
    if(selectedShape)
      setSelectedItem(selectedShape.index)
  },[selectedShape])

  const [configStatusButton,setConfigStatusButton] = useState({})
  const [selectedItem, setSelectedItem] = useState(null)
  
  const confirmDelete = async (type, index) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
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

  useEffect(() => {
    if (Object.keys(configStatusButton).length === 0 && regionAIConfig.rule.length > 0) {
      const initialStatus = {};
      regionAIConfig.rule.forEach((region, index) => {
        initialStatus[`${region.type}-${index}`] = region.status;
      });
      setConfigStatusButton(initialStatus);
    }
  }, [regionAIConfig.rule.length]); 


  return (
    <div className='side_bar'>
      <div className="roi_list">
        <div className="roi_list_header">
          <p>Rule List</p>
        </div>
        <div className="roi_list_items">
          {rule.length === 0 ? (
            <div className="still_not_drawed">
              <div>
                <SisternodeOutlined className='no_region_icon' />
              </div>
              <div>
                <p>The ROI has not yet been created... </p>
              </div>
              <div className="box_button_create_rule">
                {rule.length < maxTotalRegion && (
                  <Button onClick={()=>{
                    addShapeToRegionAIConfig();
                  }} className='button_create_rule'  variant="filled">
                    <PlusOutlined /> Create a New Rule
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {rule.map((region, index) => (
                <div key={uuidv4()} className={selectedItem === index ? "items_in_sidebar_focus" : "items_in_sidebar"} onClick={() => setSelectedShape({ type: region.type, index })}>
                  <span className='item_name'>
                    {region.type === 'intrusion' && <><ImportOutlined />{region.name}</>}
                    {region.type === 'tripwire' && <><VerticalAlignMiddleOutlined />{region.name}</>}
                    {region.type === 'zoom' && <><ExpandOutlined /> {region.name}</>}
                  </span>
                  <span className='item_type' >
                    {region.type === 'intrusion' && <>
                      <Button className='button_show_type' color='danger' variant="filled" style={{ borderColor:'#ff2e17' }}>
                        <ImportOutlined />  {region.type}
                      </Button></>}
                    {region.type === 'tripwire' && <>
                      <Button className='button_show_type' color='cyan' variant="filled" style={{ borderColor: '#00bcd4' }}>
                        <VerticalAlignMiddleOutlined /> {region.type}
                      </Button></>}
                    {region.type === 'zoom' && <>
                      <Button className='button_show_type' color='yellow' variant="filled" style={{ borderColor:'#f5c905'}}>
                        <ExpandOutlined /> {region.type}
                      </Button></>}
                  </span>
                  <div className="tools_setup_item">
                    <span className='status_switch'> 
                      <Switch
                        checked={region.status === 'ON'}
                        onChange={(checked) => {
                          const formValues = { status: checked };
                          handleChangeStatus(index, regionAIConfig, formValues);
                        }}
                        style={{
                          backgroundColor: region.status === 'ON' ? '#4fce66' : '#adb4c1',
                        }}
                      />
                    </span>
                    <span className='bin' onClick={() => confirmDelete(region.type , index)}>
                      <DeleteOutlined className='delete_icon' />
                    </span>
                  </div>
                </div>
              ))}
              <div className="box_button_create_rule">
                {rule.length < maxTotalRegion && (
                  <Button onClick={()=>{
                    addShapeToRegionAIConfig();
                  }} className='button_create_rule'  variant="filled">
                    <PlusOutlined /> Create a New Rule
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
