"use client";

import { useState, useEffect, useMemo } from "react";
import { Container, Button, Alert, Card, Row, Col, ButtonGroup, Dropdown, Table, Tooltip, OverlayTrigger } from "react-bootstrap";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faThLarge, faList, faEye, faChartBar, faTrashAlt, faSort, faFileAlt, faEdit, faChartPie, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>("card");
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("date-desc");
  const [totalResponses, setTotalResponses] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/login");
    }
  }, [isAdmin, isLoading, router]);

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar los formularios.");
      toast.error("Error al cargar los datos del servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDeleteForm = async (formId: string, formTitle: string) => {
    // Custom confirmation logic could be better, but keeping it simple for now
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el formulario "${formTitle}"? Esta acción es irreversible y eliminará también todas sus respuestas.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`Formulario "${formTitle}" eliminado.`);
        setForms(prevForms => prevForms.filter(form => form.id !== formId));
      } else {
        const errorData = await response.json();
        toast.error(`Error al eliminar: ${errorData.message || response.statusText}`);
      }
    } catch (e: unknown) {
      console.error("Error deleting form:", e);
      toast.error("Ocurrió un error al intentar eliminar el formulario.");
    }
  };

  const sortedForms = useMemo(() => {
    const sorted = [...forms];
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

  const renderTooltip = (text: string) => (
    <Tooltip id={`tooltip-${text.replace(/\s+/g, '-').toLowerCase()}`}>
      {text}
    </Tooltip>
  );

  if (loading) {
    return (
      <Container className="pt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="pt-4 text-center">
        <Alert variant="danger" className="border-0 shadow-sm">
          <h4>Error al cargar el dashboard</h4>
          <p>{error}</p>
          <Button onClick={fetchForms} variant="outline-danger">Reintentar</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="pt-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 d-flex align-items-center">
          Dashboard
          <OverlayTrigger
            placement="right"
            overlay={renderTooltip("Gestiona tus formularios y visualiza las respuestas.")}
          >
            <span className="ms-2 fs-5 text-muted cursor-help">
              <FontAwesomeIcon icon={faQuestionCircle} />
            </span>
          </OverlayTrigger>
        </h1>
        <Button as={Link} href="/create-form" variant="primary" className="shadow-sm">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Crear Formulario
        </Button>
      </div>

      <Row className="mb-4 g-4">
        <Col md={6}>
          <Card className="shadow-sm border-0 border-start border-primary border-4 h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="p-3 bg-primary bg-opacity-10 rounded me-3 text-primary">
                  <FontAwesomeIcon icon={faFileAlt} size="2x" />
                </div>
                <div>
                  <Card.Title className="mb-0 text-muted small text-uppercase fw-bold">Formularios</Card.Title>
                  <Card.Text className="fs-2 fw-bold mb-0">{forms.length}</Card.Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0 border-start border-success border-4 h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="p-3 bg-success bg-opacity-10 rounded me-3 text-success">
                  <FontAwesomeIcon icon={faChartPie} size="2x" />
                </div>
                <div>
                  <Card.Title className="mb-0 text-muted small text-uppercase fw-bold">Respuestas</Card.Title>
                  <Card.Text className="fs-2 fw-bold mb-0">{totalResponses}</Card.Text>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {forms.length === 0 ? (
        <div className="text-center py-5 mt-4 border rounded bg-white shadow-sm">
          <FontAwesomeIcon icon={faFileAlt} size="3x" className="mb-3 text-muted opacity-50" />
          <h2 className="h4">No hay formularios creados</h2>
          <p className="text-muted mb-4">¡Crea tu primer formulario para empezar a recopilar datos!</p>
          <Button as={Link} href="/create-form" variant="primary" size="lg">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Crear Nuevo Formulario
          </Button>
        </div>
      ) : (
        <Card className="shadow-sm border-0 overflow-hidden">
          <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
            <h5 className="mb-0 fw-bold">Mis Formularios</h5>
            <div className="d-flex align-items-center gap-2">
              <ButtonGroup className="shadow-sm">
                <OverlayTrigger overlay={renderTooltip("Vista de cuadrícula")}>
                  <Button variant={viewType === "card" ? "primary" : "outline-secondary"} size="sm" onClick={() => setViewType("card")}>
                    <FontAwesomeIcon icon={faThLarge} />
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger overlay={renderTooltip("Vista de lista")}>
                  <Button variant={viewType === "list" ? "primary" : "outline-secondary"} size="sm" onClick={() => setViewType("list")}>
                    <FontAwesomeIcon icon={faList} />
                  </Button>
                </OverlayTrigger>
              </ButtonGroup>
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle variant="outline-secondary" size="sm" className="shadow-sm">
                  <FontAwesomeIcon icon={faSort} className="me-1" />
                  Ordenar
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={() => setSortCriteria("title-asc")}>Título (A-Z)</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortCriteria("title-desc")}>Título (Z-A)</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setSortCriteria("date-desc")}>Fecha (Más Reciente)</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortCriteria("date-asc")}>Fecha (Más Antigua)</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Card.Header>
          <Card.Body className="p-4 bg-light bg-opacity-25">
            {viewType === "card" ? (
              <Row className="g-4">
                {sortedForms.map((form) => (
                  <Col md={6} lg={4} key={form.id}>
                    <Card className="h-100 border-0 shadow-sm hover-shadow transition">
                      <Card.Body className="d-flex flex-column p-4">
                        <Card.Title className="fw-bold h5 mb-2">{form.title}</Card.Title>
                        <Card.Text className="text-muted small mb-4">
                          <span className="badge bg-info bg-opacity-10 text-info border-info border-opacity-25 border">
                            {form.questions.length} preguntas
                          </span>
                        </Card.Text>
                        <div className="mt-auto pt-3 border-top">
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <OverlayTrigger overlay={renderTooltip("Ver formulario público")}>
                              <Button as={Link} href={`/forms/${form.id}`} variant="outline-primary" size="sm" className="flex-grow-1">
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={renderTooltip("Editar diseño")}>
                              <Button as={Link} href={`/edit-form/${form.id}`} variant="outline-info" size="sm" className="flex-grow-1 text-info">
                                <FontAwesomeIcon icon={faEdit} />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger overlay={renderTooltip("Ver respuestas")}>
                              <Button as={Link} href={`/results/${form.id}`} variant="outline-secondary" size="sm" className="flex-grow-1">
                                <FontAwesomeIcon icon={faChartBar} />
                              </Button>
                            </OverlayTrigger>
                          </div>
                          <OverlayTrigger overlay={renderTooltip("Eliminar permanentemente")}>
                            <Button variant="outline-danger" className="w-100 btn-sm" onClick={() => handleDeleteForm(form.id, form.title)}>
                              <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                              Eliminar
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </Card.Body>
                      <Card.Footer className="text-muted fs-xs bg-transparent border-0 px-4 pb-3">
                        <small>Creado: {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}</small>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Table borderless hover responsive className="bg-white rounded shadow-sm">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 ps-4">Título</th>
                    <th className="py-3">Preguntas</th>
                    <th className="py-3">Fecha de Creación</th>
                    <th className="py-3 pe-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="align-middle">
                  {sortedForms.map((form) => (
                    <tr key={form.id}>
                      <td className="ps-4 fw-bold">{form.title}</td>
                      <td>{form.questions.length}</td>
                      <td>{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="pe-4 text-center">
                        <ButtonGroup className="shadow-sm btn-group-sm">
                          <OverlayTrigger overlay={renderTooltip("Ver")}>
                            <Button as={Link} href={`/forms/${form.id}`} variant="outline-primary">
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={renderTooltip("Editar")}>
                            <Button as={Link} href={`/edit-form/${form.id}`} variant="outline-info">
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={renderTooltip("Resultados")}>
                            <Button as={Link} href={`/results/${form.id}`} variant="outline-secondary">
                              <FontAwesomeIcon icon={faChartBar} />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={renderTooltip("Eliminar")}>
                            <Button variant="outline-danger" onClick={() => handleDeleteForm(form.id, form.title)}>
                              <FontAwesomeIcon icon={faTrashAlt} />
                            </Button>
                          </OverlayTrigger>
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
