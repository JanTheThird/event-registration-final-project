import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../utils/context/AuthContext';

export default function AdminNavbar() {
  const { logout, user } = useAuth();

  return (
    <Navbar expand="lg" sticky="top" className="app-navbar border-bottom shadow-sm">
      <Container fluid="lg">
        <Navbar.Brand className="fw-semibold mb-0">Event Admin</Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-nav" className="border-secondary" />
        <Navbar.Collapse id="admin-nav">
          <Nav className="me-auto my-2 my-lg-0 gap-lg-1">
            <Nav.Link as={NavLink} to="/admin" end className="rounded px-3">
              Dashboard
            </Nav.Link>
          </Nav>
          <Nav className="align-items-lg-center gap-2">
            {user?.email && (
              <span className="text-muted small px-lg-2 d-none d-md-inline text-truncate" style={{ maxWidth: 220 }}>
                {user.email}
              </span>
            )}
            <Button variant="outline-danger" size="sm" onClick={logout}>
              Log out
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
