import React, { useState, useEffect, useMemo } from "react";
import TableComponent from "./table";
import SelectDropdown from "./Select_dropdown";
import { Button, Input, Modal } from "antd";
const { Search } = Input;
import "../styles/devices.css";

function Devices({ onCameraSelect, onCustomerSelect, onSiteSelect }) {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedSite, setSelectedSite] = useState(null);
  
  const [allDeviceData, setAllDeviceData] = useState([]);
  const [searchText, setSearchText] = useState("");

  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

  const showErrorModal = (title, error) => {
    Modal.error({
      title: title,
      content: (
        <div>
          <p style={{ marginBottom: '8px', color: '#ff4d4f' }}>
            {error.message || 'An error occurred'}
          </p>
          <small style={{ color: '#666' }}>
            Please try again or contact support if the problem persists.
          </small>
        </div>
      ),
    });
  };

  useEffect(() => {
    fetch(`${API_ENDPOINT}/schemas`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch schemas (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const options = [
          { value: 'all', label: 'All Workspaces' },
          ...data.map((schema) => ({ value: schema, label: schema }))
        ];
        setCustomerOptions(options);
      })
      .catch((err) => {
        console.error('Schema fetch error:', err);
        showErrorModal('Failed to Load Workspaces', err);
      });
  }, []);
  
  useEffect(() => {
    if (!selectedCustomer) {
      setAllDeviceData([]);
      setSiteOptions([]);
      setSelectedSite(null);
      return;
    }
  
    const url = selectedCustomer === 'all'
      ? `${API_ENDPOINT}/cameras/all`
      : `${API_ENDPOINT}/schemas/${selectedCustomer}`;
  
    fetch(url, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch device data (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setAllDeviceData(data);

        const sites = [...new Set(data.map(d => d.camera_site).filter(Boolean))].sort();
        const options = [
          { value: "all", label: "All Departments" },
          ...sites.map(site => ({ value: site, label: site }))
        ];
        setSiteOptions(options);
        setSelectedSite("all");
      })
      .catch((err) => {
        console.error('Device data fetch error:', err);
        showErrorModal('Failed to Load Devices', err);
        setAllDeviceData([]);
        setSiteOptions([]);
      });
  }, [selectedCustomer]);

  const finalTableData = useMemo(() => {
    let data = [...allDeviceData];

    if (selectedSite && selectedSite !== 'all') {
      data = data.filter(device => device.camera_site === selectedSite);
    }
    
    if (searchText) {
       const lowerSearchText = searchText.toLowerCase();
       data = data.filter(device => 
            (device.camera_name && device.camera_name.toLowerCase().includes(lowerSearchText)) || 
            (device.camera_name_display && device.camera_name_display.toLowerCase().includes(lowerSearchText))
       );
    }
    
    return data.map((device) => {
      const rules = device.metthier_ai_config?.rule || [];
      
      const activeRulesCount = rules.filter(
        (item) => item.roi_status === "ON" || item.status === "ON"
      ).length;

      const hasActiveRules = rules.some(
        (item) => item.roi_status === "ON" || item.status === "ON"
      );

      return {
        key: device.iv_camera_uuid,
        workspace: device.workspace || selectedCustomer,
        department: device.camera_site || '',
        device_name: device.camera_name_display || device.camera_name || '',
        device_type: device.camera_type,
        slugID: "intrusioncctv",
        amountActivate: activeRulesCount,
        ROI_object: rules.length,
        ROI_status: hasActiveRules,
        action: rules.length > 0,
        rtsp: device.rtsp,
        resolution: device.metthier_ai_config?.resolution // <-- **บรรทัดที่เพิ่มเข้ามา**
      };
    });
  }, [selectedSite, searchText, allDeviceData, selectedCustomer]);

  const handleClearFilter = () => {
    setSelectedCustomer(null);
    setSearchText("");
  };

  return (
    <div>
      <div className="control_table">
        <div className="title">Devices</div>
        <div className="box_dropdown_control_table">
          <SelectDropdown
            options={customerOptions}
            placeholder="Workspace"
            value={selectedCustomer}
            onChange={(selected) => setSelectedCustomer(selected)}
          />
          <SelectDropdown
            options={siteOptions}
            placeholder="Departments"
            value={selectedSite}
            onChange={(selected) => setSelectedSite(selected)}
          />
          <Search
            className="custom-search"
            placeholder="Device name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, height: 38 }}
          />
          <Button type="text" onClick={handleClearFilter}>
            Clear filter
          </Button>
        </div>
      </div>
      <div className="tabel">
        <TableComponent data={finalTableData} />
      </div>
    </div>
  );
}

export default Devices;