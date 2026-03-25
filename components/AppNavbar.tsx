"use client";

import { Navbar, Nav, Container } from "react-bootstrap";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faHome, faPlusCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AppNavbar({ className }: { className?: string }) {
  const { isAdmin, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.info("Sesión cerrada");
    router.push("/login");
  };

  return (
    <Navbar style={{ backgroundColor: '#0288D1' }} variant="dark" expand="lg" className={`shadow-sm mb-4 ${className || ''}`}>
      <Container>
        <Navbar.Brand as={Link} href={isAdmin ? "/" : "/login"} className="d-flex align-items-center fw-bold">
          <FontAwesomeIcon icon={faClipboardList} className="me-2 fs-3" />
          <span>FormMaster</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAdmin && (
              <>
                <Nav.Link as={Link} href="/" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faHome} className="me-1 small" />
                  Inicio
                </Nav.Link>
                <Nav.Link as={Link} href="/create-form" className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faPlusCircle} className="me-1 small" />
                  Crear Formulario
                </Nav.Link>
                <Nav.Link onClick={handleLogout} className="d-flex align-items-center cursor-pointer text-warning">
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-1 small" />
                  Cerrar Sesión
                </Nav.Link>
              </>
            )}
            {!isAdmin && (
              <Nav.Link as={Link} href="/login" className="d-flex align-items-center">
                Admin
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
