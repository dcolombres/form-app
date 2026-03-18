"use client";

import { useState, useEffect } from "react";
import { Container, Alert, Table, Button, Card, Spinner, Tooltip, OverlayTrigger, Row, Col } from "react-bootstrap";
import { useParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faDownload, faInfoCircle, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Question {
  id: string;
  text: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "date";
  options?: string[];
  fixed?: boolean;
}

interface FormDefinition {
  id: string;
  title: string;
  questions: Question[];
}

interface FormResponse {
  [questionId: string]: string | string[] | number | boolean | null | undefined;
}

export default function ResultsPage() {
  const { isAdmin, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/login");
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formRes = await fetch(`/api/forms/${formId}`);
        if (!formRes.ok) {
          throw new Error(`Error al obtener definición: ${formRes.statusText}`);
        }
        const formDef: FormDefinition = await formRes.json();
        setFormDefinition(formDef);

        const responsesRes = await fetch(`/api/forms/${formId}/responses`);
        if (!responsesRes.ok) {
          throw new Error(`Error al obtener respuestas: ${responsesRes.statusText}`);
        }
        const fetchedResponses: FormResponse[] = await responsesRes.json();
        setResponses(fetchedResponses);

      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Error al cargar los resultados.";
        setError(message);
        toast.error("No se pudieron cargar los resultados del servidor.");
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchData();
    }
  }, [formId]);

  const exportToCsv = () => {
    if (!formDefinition || responses.length === 0) {
      toast.error("No hay datos para exportar.");
      return;
    }

    try {
      const allQuestionIds = new Set<string>();
      formDefinition.questions.forEach(q => allQuestionIds.add(q.id));
      responses.forEach(res => {
        Object.keys(res).forEach(key => allQuestionIds.add(key));
      });

      const headers = Array.from(allQuestionIds).map(id => {
        const question = formDefinition.questions.find(q => q.id === id);
        return question ? question.text : id;
      });

      const csvRows = [];
      csvRows.push(headers.join(','));

      responses.forEach(res => {
        const row = Array.from(allQuestionIds).map(id => {
          let value = res[id];
          if (Array.isArray(value)) {
            value = value.join(';');
          }
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return (value ?? '').toString();
        });
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${formDefinition.title.replace(/\s+/g, '_')}_respuestas.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Archivo CSV generado correctamente.");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Error al exportar los datos.");
    }
  };

  const renderTooltip = (text: string) => (
    <Tooltip id="help-tooltip">{text}</Tooltip>
  );

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Cargando respuestas...</p>
      </Container>
    );
  }

  if (error || !formDefinition) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger" className="border-0 shadow-sm">
          <h4>Ocurrió un problema</h4>
          <p>{error || "Formulario no encontrado."}</p>
          <Button onClick={() => router.back()} variant="outline-danger">Volver</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 pb-5">
      <div className="d-flex align-items-center mb-4">
        <Button variant="link" onClick={() => router.back()} className="text-muted p-0 me-3">
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </Button>
        <h1 className="mb-0">Resultados: {formDefinition.title}</h1>
      </div>

      <Row className="mb-4 g-4">
        <Col md={12}>
          <Card className="shadow-sm border-0 border-start border-info border-4">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title className="text-muted small text-uppercase fw-bold mb-1">Total de Respuestas</Card.Title>
                <Card.Text className="fs-3 fw-bold mb-0">{responses.length}</Card.Text>
              </div>
              <div className="text-info opacity-50">
                <FontAwesomeIcon icon={faDatabase} size="2x" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {responses.length === 0 ? (
        <Alert variant="info" className="text-center py-5 border-0 shadow-sm bg-white">
          <FontAwesomeIcon icon={faInfoCircle} size="3x" className="mb-3 opacity-25" />
          <h4 className="fw-bold">Sin respuestas aún</h4>
          <p className="mb-0 text-muted">Comparte el enlace del formulario para empezar a recibir datos.</p>
        </Alert>
      ) : (
        <Card className="shadow-sm border-0 overflow-hidden">
          <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
            <h5 className="mb-0 fw-bold">Detalle de Respuestas</h5>
            <OverlayTrigger overlay={renderTooltip("Descargar todas las respuestas en formato Excel/CSV")}>
              <Button variant="success" size="sm" onClick={exportToCsv} className="shadow-sm">
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                Exportar CSV
              </Button>
            </OverlayTrigger>
          </Card.Header>
          <Card.Body className="p-0">
            <Table striped hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  {formDefinition.questions.map((q) => (
                    <th key={q.id} className="py-3 px-4 small text-uppercase fw-bold text-muted border-0">
                      {q.text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((response, rowIndex) => (
                  <tr key={rowIndex}>
                    {formDefinition.questions.map((question) => (
                      <td key={question.id} className="py-3 px-4 border-0 border-bottom">
                        {Array.isArray(response[question.id]) ? (
                          <div className="d-flex flex-wrap gap-1">
                            {(response[question.id] as string[]).map((val: string, i: number) => (
                              <span key={i} className="badge bg-light text-dark border">{val}</span>
                            ))}
                          </div>
                        ) : (
                          (response[question.id] as string) || <span className="text-muted italic small">Sin respuesta</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
