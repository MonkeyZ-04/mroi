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
  const rule = regionAIConfig.rule;

  useEffect(() => {
    if (selectedShape) setSelectedItem(selectedShape.index);
  }, [selectedShape]);

  const [configStatusButton, setConfigStatusButton] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const showDeleteModal = (type, index) => {
    setItemToDelete({ type, index });
    setOpenModalDelete(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      handleDeleteShape(itemToDelete.type, itemToDelete.index);
    }
    setOpenModalDelete(false);
    setItemToDelete(null);
  };

  useEffect(() => {
    if (
      Object.keys(configStatusButton).length === 0 &&
      regionAIConfig.rule.length > 0
    ) {
      const initialStatus = {};
      regionAIConfig.rule.forEach((region, index) => {
        initialStatus[`${region.type}-${index}`] = region.status;
      });
      setConfigStatusButton(initialStatus);
    }
  }, [regionAIConfig.rule.length]);

  return (
    <div className="side_bar">
      <div className="roi_list">
        <div className="roi_list_header">
          <p>Rule List</p>
        </div>
        <div className="roi_list_items">
          {rule.length === 0 ? (
            <div className="still_not_drawed">
              <div>
                <SisternodeOutlined className="no_region_icon" />
              </div>
              <div>
                <p>The ROI has not yet been created... </p>
              </div>
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
            </div>
          ) : (
            <>
              {rule.map((region, index) => (
                <div
                  key={uuidv4()}
                  className={
                    selectedItem === index
                      ? 'items_in_sidebar_focus'
                      : 'items_in_sidebar'
                  }
                  onClick={() => setSelectedShape({ type: region.type, index })}
                >
                  <span className="item_name">
                    {region.type === 'intrusion' && (
                      <>
                        <ImportOutlined />
                        {region.name}
                      </>
                    )}
                    {region.type === 'tripwire' && (
                      <>
                        <VerticalAlignMiddleOutlined />
                        {region.name}
                      </>
                    )}
                    {region.type === 'zoom' && (
                      <>
                        <ExpandOutlined /> {region.name}
                      </>
                    )}
                    {region.type === 'density' && (
                      <>
                        <TeamOutlined /> {region.name}
                      </>
                    )}
                  </span>
                  <span className="item_type">
                    {region.type === 'intrusion' && (
                      <Tag className='button_show_type' color="red"><ImportOutlined /> Intrusion</Tag>
                    )}
                    {region.type === 'tripwire' && (
                      <Tag className='button_show_type' color="cyan"><VerticalAlignMiddleOutlined /> Tripwire</Tag>
                    )}
                    {region.type === 'zoom' && (
                      <Tag className='button_show_type' color="gold"><ExpandOutlined />Zoom</Tag>
                    )}
                    {region.type === 'density' && (
                      <Tag className='button_show_type' color="geekblue"><TeamOutlined /> Density</Tag>
                    )}
                  </span>
                  <div className="tools_setup_item">
                    <span className="status_switch">
                      <Switch
                        checked={region.status === 'ON'}
                        onChange={(checked) => {
                          const formValues = { status: checked };
                          handleChangeStatus(index, regionAIConfig, formValues);
                        }}
                        style={{
                          backgroundColor:
                            region.status === 'ON' ? '#4fce66' : '#adb4c1'
                        }}
                      />
                    </span>
                    <span
                      className="bin"
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteModal(region.type, index);
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

      {/* Del modal  */}
      <Modal
        title={
          <span>
            <ExclamationCircleFilled
              style={{ color: '#faad14', marginRight: 8 }}
            />
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
        okButtonProps={{
          className: 'custom-ok-button-delete',
        }}
        cancelButtonProps={{
          className: 'custom-cancel-button',
        }}
      >
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default Sidebar;
