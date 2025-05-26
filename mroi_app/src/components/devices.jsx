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
  const [selectedCustomer, setSelectedCustomer] = useState();
  const [selectedCustomerSite, setSelectedCustomerSite] = useState(null);
  const [selectedCameraName, setSelectedCameraName] = useState(null);
  const [deviceData, setDeviceData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/schemas")
      .then((res) => res.json())
      .then((data) => {
        const customerOptions = data.map((schema) => ({
          value: schema,
          label: schema,
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
        console.log(custumerSiteOptions)
      })
      .catch((err) => console.error("Fetch error:", err));
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

    setCameraName(cameraNameOptions);

  }, [selectedCustomerSite]);

  const handleClearFilter = () => {
    setSelectedCustomer(null);
    setSelectedCustomerSite(null);
    setSelectedCameraName(null);
    setCustomerSite([]);
    setCameraName([]);
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
        rtsp: device.rtsp,
        regionAIconfig: device.metthier_ai_config || null
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
