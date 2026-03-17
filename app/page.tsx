"use client";

import { useState, useEffect, useMemo } from "react";
import { Container, Button, Alert, Card, ListGroup, Row, Col, ButtonGroup, Dropdown, Table } from "react-bootstrap";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faThLarge, faList, faEye, faChartBar, faTrashAlt, faSort, faFileAlt, faEdit, faChartPie } from '@fortawesome/free-solid-svg-icons';

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  fixed?: boolean;
}

interface FormDefinition {
  id: string;
  title: string;
  questions: Question[];
  createdAt?: string;
}

type ViewType = "card" | "list";
type SortCriteria = "title-asc" | "title-desc" | "date-asc" | "date-desc";

export default function Home() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>("card");
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("date-desc");
  const [totalResponses, setTotalResponses] = useState(0);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FormDefinition[] = await response.json();
      const formsWithDate = data.map(form => ({
        ...form,
        createdAt: form.createdAt || new Date(parseInt(form.id.substring(0, 8), 16) * 1000).toISOString(),
      }));
      setForms(formsWithDate);

      // Fetch total responses
      const responsesCountResponse = await fetch('/api/responses/count');
      if (!responsesCountResponse.ok) {
        throw new Error(`HTTP error! status: ${responsesCountResponse.status}`);
      }
      const responsesCountData = await responsesCountResponse.json();
      setTotalResponses(responsesCountData.totalResponses);
    } catch (e: any) {
      setError(e.message || "Error al cargar los formularios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDeleteForm = async (formId: string, formTitle: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el formulario "${formTitle}"? Esta acción es irreversible y eliminará también todas sus respuestas.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert(`Formulario "${formTitle}" eliminado exitosamente.`);
        setForms(prevForms => prevForms.filter(form => form.id !== formId));
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar el formulario: ${errorData.message || response.statusText}`);
      }
    } catch (e: any) {
      console.error("Error deleting form:", e);
      alert("Ocurrió un error al intentar eliminar el formulario.");
    }
  };

  const sortedForms = useMemo(() => {
    let sorted = [...forms];
    switch (sortCriteria) {
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "date-asc":
        sorted.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case "date-desc":
        sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
    }
    return sorted;
  }, [forms, sortCriteria]);

  if (loading) {
    return (
      <Container className="pt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="pt-4 text-center">
        <Alert variant="danger">
          <h4>Error al cargar el dashboard</h4>
          <p>{error}</p>
          <Button onClick={fetchForms} variant="danger">Reintentar</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="pt-4 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Dashboard</h1>
        <Button as={Link} href="/create-form" variant="primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Crear Formulario
        </Button>
      </div>

      {/* Dashboard Stats */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faFileAlt} size="2x" className="text-primary me-3" />
                <div>
                  <Card.Title className="mb-0">Total de Formularios</Card.Title>
                  <Card.Text className="fs-2 fw-bold">{forms.length}</Card.Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faChartPie} size="2x" className="text-success me-3" />
                <div>
                  <Card.Title className="mb-0">Total de Respuestas</Card.Title>
                  <Card.Text className="fs-2 fw-bold">{totalResponses}</Card.Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Forms List Section */}
      {forms.length === 0 ? (
        <div className="text-center py-5 mt-4 border rounded bg-light">
          <FontAwesomeIcon icon={faFileAlt} size="3x" className="mb-3 text-muted" />
          <h2 className="h4">No hay formularios creados</h2>
          <p className="text-muted">¡Crea tu primer formulario para empezar!</p>
          <Button as={Link} href="/create-form" variant="primary" size="lg" className="mt-3">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Crear Nuevo Formulario
          </Button>
        </div>
      ) : (
        <Card className="shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Mis Formularios</h5>
            <div className="d-flex">
              <ButtonGroup className="me-2">
                <Button variant={viewType === "card" ? "dark" : "outline-secondary"} size="sm" onClick={() => setViewType("card")}>
                  <FontAwesomeIcon icon={faThLarge} />
                </Button>
                <Button variant={viewType === "list" ? "dark" : "outline-secondary"} size="sm" onClick={() => setViewType("list")}>
                  <FontAwesomeIcon icon={faList} />
                </Button>
              </ButtonGroup>
              <Dropdown as={ButtonGroup}>
                <Button variant="outline-secondary" size="sm">
                  <FontAwesomeIcon icon={faSort} className="me-1" />
                  Ordenar
                </Button>
                <Dropdown.Toggle split variant="outline-secondary" size="sm" />
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={() => setSortCriteria("title-asc")}>Título (A-Z)</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortCriteria("title-desc")}>Título (Z-A)</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortCriteria("date-desc")}>Fecha (Más Reciente)</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortCriteria("date-asc")}>Fecha (Más Antigua)</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Card.Header>
          <Card.Body>
            {viewType === "card" ? (
              <Row>
                {sortedForms.map((form) => (
                  <Col md={6} lg={4} key={form.id} className="mb-4">
                    <Card className="h-100">
                      <Card.Body className="d-flex flex-column">
                        <Card.Title>{form.title}</Card.Title>
                        <Card.Text className="text-muted">
                          {form.questions.length} preguntas
                        </Card.Text>
                        <div className="mt-auto">
                          <ButtonGroup className="w-100 mb-2">
                            <Button as={Link} href={`/forms/${form.id}`} variant="outline-primary">
                              <FontAwesomeIcon icon={faEye} className="me-2" />
                              Ver
                            </Button>
                            <Button as={Link} href={`/edit-form/${form.id}`} variant="outline-info">
                              <FontAwesomeIcon icon={faEdit} className="me-2" />
                              Editar
                            </Button>
                            <Button as={Link} href={`/results/${form.id}`} variant="outline-secondary">
                              <FontAwesomeIcon icon={faChartBar} className="me-2" />
                              Resultados
                            </Button>
                          </ButtonGroup>
                          <Button variant="outline-danger" className="w-100" onClick={() => handleDeleteForm(form.id, form.title)}>
                            <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                            Eliminar
                          </Button>
                        </div>
                      </Card.Body>
                      <Card.Footer className="text-muted fs-sm">
                        Creado: {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Preguntas</th>
                    <th>Fecha de Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedForms.map((form) => (
                    <tr key={form.id}>
                      <td>{form.title}</td>
                      <td>{form.questions.length}</td>
                      <td>{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <ButtonGroup>
                          <Button as={Link} href={`/forms/${form.id}`} variant="outline-primary" size="sm">
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button as={Link} href={`/edit-form/${form.id}`} variant="outline-info" size="sm">
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button as={Link} href={`/results/${form.id}`} variant="outline-secondary" size="sm">
                            <FontAwesomeIcon icon={faChartBar} />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteForm(form.id, form.title)}>
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
