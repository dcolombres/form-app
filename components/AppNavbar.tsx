"use client";

import { Navbar, Nav, Container } from "react-bootstrap";
import Link from "next/link";

export default function AppNavbar() {
  return (
    <Navbar style={{ backgroundColor: '#0288D1' }} variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} href="/">
      {/* No title, just a clickable brand area */}
    </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/">
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} href="/create-form">
              Crear Formulario
            </Nav.Link>
            {/* Future: Add links for "Ver Formularios" and "Ver Resultados" if needed */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
