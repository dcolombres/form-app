"use client";

import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (login(password)) {
      toast.success("¡Bienvenido, Administrador!");
      router.push("/");
    } else {
      setError("Contraseña incorrecta. Por favor, intenta de nuevo.");
      toast.error("Acceso denegado.");
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "70vh" }}>
      <Card className="shadow border-0" style={{ maxWidth: "400px", width: "100%" }}>
        <Card.Body className="p-5 text-center">
          <div className="mb-4 text-primary">
            <FontAwesomeIcon icon={faLock} size="3x" />
          </div>
          <h2 className="fw-bold mb-4">Panel de Admin</h2>
          
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4 text-start" controlId="formPassword">
              <Form.Label className="text-muted small fw-bold text-uppercase">Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Introduce la contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-2"
                required
                autoFocus
              />
            </Form.Group>
            
            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm">
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
              Iniciar Sesión
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
