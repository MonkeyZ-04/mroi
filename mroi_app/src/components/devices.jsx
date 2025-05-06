import React, { useState, useEffect } from "react";
import SelectDropdown from "./select_dropdown";
import TableComponent from "./table";
import { Button } from "antd";
import "../styles/devices.css";

function Devices({ onCameraSelect, onCustomerSelect, onSiteSelect }) {
  const [Customer, setCustomer] = useState([]);
  const [CustomerSite, setCustomerSite] = useState([]);
  const [CameraName, setCameraName] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerSite, setSelectedCustomerSite] = useState(null);
  const [selectedCameraName, setSelectedCameraName] = useState(null);
  const [deviceData, setDeviceData] = useState([]); 

  useEffect(() => {
    // Load customer options
    fetch("http://localhost:5000/api/schemas")
      .then((res) => res.json())
      .then((data) => {
        const customerOptions = data.map((schema) => ({
          value: schema.schema_name,
          label: schema.schema_name,
        }));
        setCustomer(customerOptions);
      });
  }, []);

  useEffect(() => {
    if (!selectedCustomer) return;

    const schema =
      typeof selectedCustomer === "string"
        ? selectedCustomer
        : selectedCustomer.value;

    const url = `http://localhost:5000/api/schemas/${schema}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDeviceData(data);

        const cameraSiteOptions = [
          ...new Map(
            (data || [])
              .filter((site) => site.camera_site?.trim() !== "")
              .map((site) => [
                site.camera_site,
                {
                  value: site.camera_site,
                  label: site.camera_site,
                },
              ])
          ).values(),
        ];

        setCustomerSite(cameraSiteOptions);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [selectedCustomer]);

  useEffect(() => {
    if (!selectedCustomer || !selectedCustomerSite) return;

    const schema =
      typeof selectedCustomer === "string"
        ? selectedCustomer
        : selectedCustomer.value;

    const site =
      typeof selectedCustomerSite === "string"
        ? selectedCustomerSite
        : selectedCustomerSite.value;

    const url = `http://localhost:5000/api/get/camera_name?customer=${schema}&customerSite=${site}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDeviceData(data);

        const cameraNameOptions = [
          ...new Map(
            (data || [])
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

        setCameraName(cameraNameOptions);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [selectedCustomer, selectedCustomerSite]);

  const handleClearFilter = () => {
    setSelectedCustomer(null);
    setSelectedCustomerSite(null);
    setSelectedCameraName(null);
    setCustomerSite([]);
    setCameraName([]);
    setDeviceData([]);
    onCustomerSelect?.(null);
    onSiteSelect?.(null);
    onCameraSelect?.(null);
  };
  

  const data = (deviceData || []).map((device, index) => {
    const rules = device.metthier_ai_config?.rule || [];

    return {
      key: device.device_id || index,
      workspace: selectedCustomer,
      department: device.camera_site,
      device_name: device.camera_name,
      device_type: device.camera_type,
      slugID: "intrusioncctv",
      amountActivate: rules.filter((item) => item.status === "ON").length,
      ROI_object: rules.length,
      ROI_status: rules.some((item) => item.status === "ON"),
      action: rules.length > 0,
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
            placeholder="Customer"
            onChange={(selected) => {
              setSelectedCustomer(selected);
              onCustomerSelect?.(selected);
            }}
          />
          <SelectDropdown
            className="customer-select"
            options={CustomerSite}
            placeholder="Customer Site"
            onChange={(selected) => {
              setSelectedCustomerSite(selected);
              onSiteSelect?.(selected);
            }}
          />
          <SelectDropdown
            className="custom-select"
            options={CameraName}
            placeholder="Camera Name"
            onChange={(selected) => {
              setSelectedCameraName(selected);
              onCameraSelect?.(selected);
            }}
          />
          <Button color="primary" variant="text" onClick={handleClearFilter}>
            Clear filter
          </Button>
        </div>
      </div>
      <div className="tabel">
        <TableComponent data={data} />
      </div>
    </div>
  );
}

export default Devices;
