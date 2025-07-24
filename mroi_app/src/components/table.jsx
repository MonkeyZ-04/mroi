import React from 'react';
import { Table, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function TableComponent({ data }) {
    const navigate = useNavigate();
  const columns = [
    {
      title: 'Workspace',
      dataIndex: 'workspace',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      render: (text) => {
        const str = String(text || '').trim();
        return str !== '' ? str : 'null';
      },      
      sorter: (a, b) => (a.department || '').localeCompare(b.department || ''),
    },
    {
      title: 'Device Name',
      dataIndex: 'device_name',
      render: (text) => {
        const str = String(text || '').trim();
        return str !== '' ? str : 'null';
      },   
      sorter: (a, b) => (a.device_name || '').localeCompare(b.device_name || ''),
    },
    {
      title: 'Device Type',
      dataIndex: 'device_type',
      render: (text) => {
        const str = String(text || '').trim();
        return str !== '' ? str : 'null';
      },   
      sorter: (a, b) => (a.device_type || '').localeCompare(b.device_type || ''),
    },
    {
      title: 'Slug ID',
      dataIndex: 'slugID',
      render: (text) => {
        const str = String(text || '').trim();
        return str !== '' ? str : 'null';
      },   
      sorter: (a, b) => a.slugID - b.slugID,
    },
    {
      title: 'ROI Objects',
      dataIndex: 'ROI_object',
      render: (text) => {
        const str = String(text || '').trim();
        return str !== '' ? str : 'null';
      },   
      sorter: (a, b) => a.ROI_object - b.ROI_object,
    },
    {
      title: 'ROI Status',
      dataIndex: 'ROI_status',
      render: (status, record) => {
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: status ? '#0cd408' : '#d9d7d7',
                display: 'inline-block',
              }}
            />
            {status ? 'Active' : 'Inactive'} ({record.amountActivate})
          </span>
        );
      }
    }
    ,           
    {
        title: 'Actions',
        dataIndex: 'action',
        render: (value, record) => (
          <Button
            type="link"
            style={{
              color: value ? '#1890ff' : '#fa8c16',
              fontWeight: 500,
            }}
            onClick={() => {
              const url = '/tools';
              const urlWithParams = `${url}?data=${encodeURIComponent(JSON.stringify(record))}`;
              navigate(urlWithParams);
            }}
          >
            {value ? ' Edit' : '+ Create ROI'}
          </Button>
        ),
      },
      
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table
        columns={columns}
        dataSource={data}
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
        rowKey="key"
      />
    </div>
  );
}

export default TableComponent;
