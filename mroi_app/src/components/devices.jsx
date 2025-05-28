import React, { useState, useEffect } from "react";
import TableComponent from "./table";
import SelectDropdown from "./Select_dropdown";
import { Button, Input, Modal } from "antd";
const { Search } = Input;
import "../styles/devices.css";

function Devices({ onCameraSelect, onCustomerSelect, onSiteSelect }) {
  const [Customer, setCustomer] = useState([]);
  const [CustomerSite, setCustomerSite] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState();
  const [selectedCustomerSite, setSelectedCustomerSite] = useState(null);
  const [deviceData, setDeviceData] = useState([]);
  const [tableData, setTableData] = useState([]);
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
            Please try again or contact support if the problem persists
          </small>
        </div>
      ),
      okButtonProps: {
        className: 'custom-ok-button-error'
      }
    });
  };

  useEffect(() => {
    fetch(`${API_ENDPOINT}/schemas`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch schemas (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        const customerOptions = data.map((schema) => ({
          value: schema,
          label: schema,
        }));
        setCustomer(customerOptions);
      })
      .catch((err) => {
        console.error('Schema fetch error:', err);
        showErrorModal('Failed to Load Workspaces', err);
      });
  }, []);
  
  useEffect(() => {
    if (!selectedCustomer) return;
  
    const schema = typeof selectedCustomer === "string"
      ? selectedCustomer
      : selectedCustomer.value;
  
    const url = `${API_ENDPOINT}/schemas/${schema}`;
  
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch schema data (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        const uniqueDevices = Array.from(
          new Map(data.map((item) => [item.iv_camera_uuid, item])).values()
        );
        setDeviceData(uniqueDevices);
        setTableData(uniqueDevices);

        const custumerSiteOptions = [
          ...new Map(
            uniqueDevices
              .filter((site) => site.camera_site?.trim() !== "")
              .map((site) => [
                site.camera_site,
                {
                  value: site.camera_site === null ?  'null' : site.camera_site ,
                  label: site.camera_site === null ?  'null' : site.camera_site ,
                },
              ])
          ).values(),
        ];
        setCustomerSite(custumerSiteOptions);

      })
      .catch((err) => {
        console.error('Device data fetch error:', err);
        showErrorModal('Failed to Load Devices', err);
        setDeviceData([]);
        setTableData([]);
        setCustomerSite([]);
      });
  }, [selectedCustomer]);

  useEffect(() => {
    if (!selectedCustomerSite) return;

    const site = selectedCustomerSite;
    const uniqueDevices = deviceData.filter((datarows) => {
      const cameraSite = datarows.camera_site?.trim() || "null";
      return cameraSite === site;
    });

    
    setTableData(uniqueDevices)

    const cameraNameOptions = [
      ...new Map(
        uniqueDevices
          .filter((cam) => cam.camera_name?.trim() !== "")
          .map((cam) => [
            cam.camera_name,
            {
              value: cam.camera_name,
              label: cam.camera_name,
            },
          ])
      ).values(),
    ];


  }, [selectedCustomerSite]);

  const handleClearFilter = () => {
    sessionStorage.removeItem("deviceData");
    sessionStorage.removeItem("deviceFilters");

    setSelectedCustomer(null);
    setSelectedCustomerSite(null);
    setSelectedCameraName(null);
    setCustomerSite([]);
    setDeviceData([]);
    setTableData([]);
    setSearchText("");
    onCustomerSelect?.(null);
    onSiteSelect?.(null);
    onCameraSelect?.(null);
  };

  const filteredData = tableData
    .filter((device) =>
      device.camera_name?.toLowerCase().includes(searchText.toLowerCase())
    )
    .map((device, index) => {
      const rules = device.metthier_ai_config?.rule || [];

      return {
        key: device.iv_camera_uuid,
        workspace: selectedCustomer,
        department: device.camera_site,
        device_name: device.camera_name,
        device_type: device.camera_type,
        slugID: "intrusioncctv",
        amountActivate: rules.filter((item) => item.roi_status === "ON").length,
        ROI_object: rules.length,
        ROI_status: rules.some((item) => item.roi_status === "ON"),
        action: rules.length > 0,
        rtsp: device.rtsp,
      };
    });

  return (
    <div>
      <div className="control_table">
        <div className="title">Devices</div>
        <div className="box_dropdown_control_table">
          <SelectDropdown
            className="custom-select"
            options={Customer}
            placeholder="Workspace"
            onChange={(selected) => {
              setSelectedCustomer(selected);
              onCustomerSelect?.(selected);
            }}
          />
          <SelectDropdown
            className="customer-select"
            options={CustomerSite}
            placeholder="Departments"
            onChange={(selected) => {
              setSelectedCustomerSite(selected);
              onSiteSelect?.(selected);
            }}
          />
          <Search
            className="custom-search"
            placeholder="Device name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, height: 38 }}
          />
          <Button color="primary" variant="text" onClick={handleClearFilter}>
            Clear filter
          </Button>
        </div>
      </div>
      <div className="tabel">
        <TableComponent data={filteredData} />
      </div>
    </div>
  );
}

export default Devices;
