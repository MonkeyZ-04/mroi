import { Navbar, Nav, Container } from 'react-bootstrap';
import SelectDropdown from './Select_dropdown';
import '../styles/Select_dropdown.css';
const NavbarSearch = () =>{

    const customer_site = [
        { value: 'site_001', label: 'Bangkok HQ' },
        { value: 'site_002', label: 'Chiang Mai Branch' },
        { value: 'site_003', label: 'Phuket Warehouse' },
        { value: 'site_004', label: 'Rayong Plant' },
        { value: 'site_005', label: 'Khon Kaen Office' }
      ];
    const user_site = [
        { value: 'user_001', label: 'สมชาย - Bangkok HQ' },
        { value: 'user_002', label: 'สมปอง - Chiang Mai Branch' },
        { value: 'user_003', label: 'วิไล - Phuket Warehouse' },
        { value: 'user_004', label: 'ประสิทธิ์ - Rayong Plant' },
        { value: 'user_005', label: 'อารีย์ - Khon Kaen Office' }
      ];
    return (
        <Navbar bg='light' expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="/">MROI</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <SelectDropdown className="custom-select" options={customer_site} placeholder={"Customer Site"} />
                    <SelectDropdown className="custom-select" options={user_site} placeholder={"User Site"} />
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )

};

export default NavbarSearch;