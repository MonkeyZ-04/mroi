import React, { useEffect, useState } from 'react';
import '../styles/SideBar.css';
import { v4 as uuidv4 } from 'uuid';
import {  Button, Switch, Modal, Tag } from 'antd';
import {
  ExpandOutlined,
  PlusOutlined,
  VerticalAlignMiddleOutlined,
  ImportOutlined,
  SisternodeOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  TeamOutlined
} from '@ant-design/icons';

const Sidebar = ({
  selectedShape,
  setSelectedShape,
  handleDeleteShape,
  regionAIConfig,
  addShapeToRegionAIConfig,
  maxTotalRegion,
  handleChangeStatus
}) => {
  const rule = regionAIConfig?.rule || [];
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  useEffect(() => {
    if (selectedShape) {
        setSelectedItem(selectedShape.index);
    } else {
        setSelectedItem(null);
    }
  }, [selectedShape]);


  const showDeleteModal = (roi_type, index) => {
    setItemToDelete({ roi_type, index });
    setOpenModalDelete(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      handleDeleteShape(itemToDelete.roi_type, itemToDelete.index);
    }
    setOpenModalDelete(false);
    setItemToDelete(null);
  };

  return (
    <div className="side_bar">
      <div className="roi_list">
        <div className="roi_list_header">
          <p>Rule List</p>
        </div>
        <div className="roi_list_items">
          {rule?.length === 0 ? (
            <div className="still_not_drawed">
              <div>
                <SisternodeOutlined className="no_region_icon" />
              </div>
              <div>
                <p>The ROI has not yet been created... </p>
              </div>
              <div className="box_button_create_rule">
                {rule?.length < maxTotalRegion && (
                  <Button
                    onClick={() => {
                      addShapeToRegionAIConfig();
                    }}
                    className="button_create_rule"
                    variant="filled"
                  >
                    <PlusOutlined /> Create a New Rule
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {rule?.map((region, index) => (
                <div
                  key={uuidv4()}
                  className={
                    selectedItem === index
                      ? 'items_in_sidebar_focus'
                      : 'items_in_sidebar'
                  }
                  onClick={() => setSelectedShape({ roi_type: region.roi_type, index })}
                >
                  <span className="item_name">
                    {region.roi_type === 'intrusion' && <><ImportOutlined />{region.name}</>}
                    {region.roi_type === 'tripwire' && <><VerticalAlignMiddleOutlined />{region.name}</>}
                    {region.roi_type === 'zoom' && <><ExpandOutlined /> {region.name}</>}
                    {region.roi_type === 'density' && <><TeamOutlined /> {region.name}</>}
                  </span>
                  <span className="item_type">
                    {region.roi_type === 'intrusion' && (<Tag className='button_show_type' color="red"><ImportOutlined /> Intrusion</Tag>)}
                    {region.roi_type === 'tripwire' && (<Tag className='button_show_type' color="cyan"><VerticalAlignMiddleOutlined /> Tripwire</Tag>)}
                    {region.roi_type === 'zoom' && (<Tag className='button_show_type' color="gold"><ExpandOutlined />Zoom</Tag>)}
                    {region.roi_type === 'density' && (<Tag className='button_show_type' color="geekblue"><TeamOutlined /> Density</Tag>)}
                  </span>
                  <div className="tools_setup_item">
                    <span className="status_switch">
                      {/* --- **ส่วนที่แก้ไข** --- */}
                      <Switch
                        checked={region.roi_status === 'ON'}
                        onChange={(checked, event) => {
                          event.stopPropagation(); // หยุดไม่ให้ event click ลามไปถึง div แม่
                          const formValues = { roi_status: checked };
                          handleChangeStatus(index, formValues); // ส่งแค่ index และ formValues
                        }}
                        style={{ backgroundColor: region.roi_status === 'ON' ? '#4fce66' : '#adb4c1' }}
                      />
                      {/* --- จบส่วนที่แก้ไข --- */}
                    </span>
                    <span
                      className="bin"
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteModal(region.roi_type, index);
                      }}
                    >
                      <DeleteOutlined className="delete_icon" />
                    </span>
                  </div>
                </div>
              ))}
              <div className="box_button_create_rule">
                {rule.length < maxTotalRegion && (
                  <Button
                    onClick={() => {
                      addShapeToRegionAIConfig();
                    }}
                    className="button_create_rule"
                    variant="filled"
                  >
                    <PlusOutlined /> Create a New Rule
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        title={
          <span>
            <ExclamationCircleFilled style={{ color: '#faad14', marginRight: 8 }} />
            Are you sure you want to delete this Rule?
          </span>
        }
        open={openModalDelete}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setOpenModalDelete(false);
          setItemToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ className: 'custom-ok-button-delete' }}
        cancelButtonProps={{ className: 'custom-cancel-button' }}
      >
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default Sidebar;