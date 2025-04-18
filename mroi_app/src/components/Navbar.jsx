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

    //   for get customer site form DB and show in dropdown Customer Site
    useEffect(() => {
        if (!selectedCustomer) return;
      
        const value = typeof selectedCustomer === 'string' 
          ? selectedCustomer 
          : selectedCustomer.value;
      
        const url = `http://localhost:5000/api/schemas/${value}`;
        console.log("Fetching from:", url);
      
        fetch(url)
          .then(res => res.json())
          .then(data => {
            // CustomerSite get All customer site from DB
            // Remove duplicates from camera_site
            const siteOptions = [...new Map(
              (data || [])
                .filter(d => d.camera_site && d.camera_site.trim() !== '')
                .map(site => [site.camera_site, {
                  value: site.camera_site,
                  label: site.camera_site
                }])
            ).values()];
            setCustomerSite(siteOptions);
      
            // CameraName get All camera name from DB
            const cameraOptions = (data || [])
              .filter(d => d.camera_name && d.camera_name.trim() !== '')
              .map(cam => ({
                value: cam.camera_name,
                label: cam.camera_name
              }));
            setCameraName(cameraOptions);
          })
          .catch(err => console.error("Fetch error:", err));
      }, [selectedCustomer]);
    
    //   for control when setup all data
      useEffect(() =>{
        if(selectedCustomer && selectedCustomerSite && selectedCameraName){
            console.log("Customer : ",selectedCustomer,"Customer Site : ",selectedCustomerSite,"Camera Name : ",selectedCameraName);
        }
      })
          


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