import React, { useState, useEffect } from "react";
import TableComponent from "./table";
import SelectDropdown from "./Select_dropdown";
import { Button, Input } from "antd";
const { Search } = Input;
import "../styles/devices.css";

function Devices({ onCameraSelect, onCustomerSelect, onSiteSelect }) {
  const [Customer, setCustomer] = useState([]);
  const [CustomerSite, setCustomerSite] = useState([]);
  const [CameraName, setCameraName] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerSite, setSelectedCustomerSite] = useState(null);
  const [selectedCameraName, setSelectedCameraName] = useState(null);
  const [deviceData, setDeviceData] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
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
        const uniqueDevices = Array.from(
          new Map(data.map((item) => [item.iv_camera_uuid, item])).values()
        );

        setDeviceData(uniqueDevices);
        console.log(uniqueDevices)

        const cameraSiteOptions = [
          ...new Map(
            uniqueDevices
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
        const uniqueDevices = Array.from(
          new Map(data.map((item) => [item.iv_camera_uuid, item])).values()
        );

        setDeviceData(uniqueDevices);
        console.log(uniqueDevices)

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
    setSearchText("");
    onCustomerSelect?.(null);
    onSiteSelect?.(null);
    onCameraSelect?.(null);
  };

  const filteredData = deviceData
    .filter((device) =>
      device.camera_name?.toLowerCase().includes(searchText.toLowerCase())
    )
    .map((device, index) => {
      const rules = device.metthier_ai_config?.rule || [];

      return {
        key: `${device.device_id}-${index}`,
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

    useEffect(()=>{
      if(deviceData){
        console.log(deviceData.length)
      }
    },[deviceData])

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
