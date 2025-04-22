import { Navbar, Nav, Container } from 'react-bootstrap';
import SelectDropdown from './Select_dropdown.jsx';
import React, {useState, useEffect} from 'react';
import '../styles/Select_dropdown.css';
const NavbarSearch = ({ onCameraSelect, onCustomerSelect, onSiteSelect }) =>{
    const [Customer, setCustomer] = useState(null);
    const [CustomerSite, setCustomerSite] = useState(null);
    const [CameraName, setCameraName] = useState(null);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomerSite, setSelectedCustomerSite] = useState(null);
    const [selectedCameraName, setSelectedCameraName] = useState(null); 

    useEffect(() => {
        fetch("http://localhost:5000/api/schemas")
          .then(res => res.json())
          .then(data => {
            const customerOptions = data.map(schema => ({
              value: schema.schema_name,
              label: schema.schema_name
            }));
            setCustomer(customerOptions);
          });
      }, []);

    //   for get customerSite
    useEffect(() => {
      if (!selectedCustomer) return;
    
      const schema = typeof selectedCustomer === 'string' 
        ? selectedCustomer 
        : selectedCustomer.value;
    
      const url = `http://localhost:5000/api/schemas/${schema}`;
    
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const cameraSiteOptions = [...new Map(
            (data || [])
              .filter(site => site.camera_site && site.camera_site.trim() !== '')
              .map(site => [site.camera_site, {
                value: site.camera_site,
                label: site.camera_site
              }])
          ).values()];
    
          setCustomerSite(cameraSiteOptions);
        })
        .catch(err => console.error("Fetch error:", err));
    }, [selectedCustomer]);

    useEffect(() => {
      if (!selectedCustomer || !selectedCustomerSite) return;
    
      const schema = typeof selectedCustomer === 'string' 
        ? selectedCustomer 
        : selectedCustomer.value;
    
      const site = typeof selectedCustomerSite === 'string'
        ? selectedCustomerSite
        : selectedCustomerSite.value;
    
      const url = `http://localhost:5000/api/get/camera_name?customer=${schema}&customerSite=${site}`;
    
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const cameraNameOptions = [...new Map(
            (data || [])
              .filter(cam => cam.camera_name && cam.camera_name.trim() !== '')
              .map(cam => [cam.camera_name, {
                value: cam.camera_name,
                label: cam.camera_name
              }])
          ).values()];
    
          setCameraName(cameraNameOptions);
        })
        .catch(err => console.error("Fetch error:", err));
    }, [selectedCustomer, selectedCustomerSite]);
          
    return (
        <Navbar bg='light' expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="/">MROI</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <SelectDropdown 
                        className="custom-select" 
                        options={Customer || []} 
                        placeholder={"Customer"} 
                        onChange={(selected) => {
                            setSelectedCustomer(selected);
                            onCustomerSelect?.(selected); // ส่งขึ้น App.jsx
                        }}
                        
                    />
                    <SelectDropdown 
                        className="customer-select" 
                        options={CustomerSite || []} 
                        placeholder={"Customer Site"} 
                        onChange={(selected) => {
                            setSelectedCustomerSite(selected);
                            onSiteSelect?.(selected); // ส่งขึ้น App.jsx
                        }}
                    />
                    <SelectDropdown 
                        className="custom-select" 
                        options={CameraName || []} 
                        placeholder={"Camera Name"} 
                        onChange={(selected) => {
                            setSelectedCameraName(selected);
                            onCameraSelect?.(selected); // ส่งขึ้น App.jsx
                        }}
                    />
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )

};

export default NavbarSearch;