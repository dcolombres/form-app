"use client";

import { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Alert, Spinner, Tooltip, OverlayTrigger } from "react-bootstrap";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faPlus, faTrash, faSave, faArrowLeft, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/context/AuthContext";

// Define question types
type QuestionType = "text" | "textarea" | "radio" | "checkbox" | "date";

// Define question structure
interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  fixed?: boolean;
}

interface FormDefinition {
  id: string;
  title: string;
  questions: Question[];
  createdAt?: string;
}

export default function EditFormPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  const [formTitle, setFormTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentQuestionType, setCurrentQuestionType] = useState<QuestionType>("text");
  const [currentOptions, setCurrentOptions] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/login");
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FormDefinition = await response.json();
        setFormTitle(data.title);
        setQuestions(data.questions.filter(q => !q.fixed));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al cargar el formulario.");
        toast.error("No se pudo cargar el formulario para editar.");
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const handleAddQuestion = () => {
    if (!currentQuestionText.trim()) {
      toast.error("El texto de la pregunta no puede estar vacío.");
      return;
    }

    const newQuestion: Question = {
      id: uuidv4(),
      text: currentQuestionText.trim(),
      type: currentQuestionType,
    };

    if (currentQuestionType === "radio" || currentQuestionType === "checkbox") {
      const optionsArray = currentOptions.split(",").map((opt) => opt.trim()).filter(Boolean);
      if (optionsArray.length < 2) {
        toast.warning("Las preguntas de opción múltiple necesitan al menos dos opciones separadas por comas.");
        return;
      }
      newQuestion.options = optionsArray;
    }

    setQuestions([...questions, newQuestion]);
    setCurrentQuestionText("");
    setCurrentQuestionType("text");
    setCurrentOptions("");
    toast.success("Pregunta añadida.");
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.info("Pregunta eliminada del listado.");
  };

  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      toast.error("El título del formulario no puede estar vacío.");
      return;
    }

    const fixedContactFields: Question[] = [
      { id: "fixed_name", text: "Nombre", type: "text", fixed: true },
      { id: "fixed_surname", text: "Apellido", type: "text", fixed: true },
      { id: "fixed_email", text: "Email", type: "text", fixed: true },
      { id: "fixed_phone", text: "Teléfono", type: "text", fixed: true },
    ];

    const formDefinition = {
      id: formId,
      title: formTitle.trim(),
      questions: [...questions, ...fixedContactFields],
    };

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDefinition),
      });

      if (response.ok) {
        toast.success("¡Formulario actualizado exitosamente!");
        router.push(`/forms/${formId}`);
      } else {
        const errorData = await response.json();
        toast.error(`Error al actualizar: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error al actualizar el formulario:", error);
      toast.error("Ocurrió un error al intentar actualizar el formulario.");
    }
  };

  const renderHelpTooltip = (text: string) => (
    <Tooltip id="help-tooltip">
      {text}
    </Tooltip>
  );

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2 text-muted">Recuperando datos del formulario...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center">
        <Alert variant="danger" className="shadow-sm border-0">
          <h4 className="alert-heading">Error de Carga</h4>
          <p>{error}</p>
          <hr />
          <Button onClick={() => router.back()} variant="outline-danger">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Volver atrás
          </Button>
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
        <h1 className="mb-0 d-flex align-items-center">
          Editar Formulario
          <OverlayTrigger
            placement="right"
            overlay={renderHelpTooltip("Modifica las preguntas y el título de tu formulario.")}
          >
            <span className="ms-2 fs-5 text-muted cursor-help">
              <FontAwesomeIcon icon={faQuestionCircle} />
            </span>
          </OverlayTrigger>
        </h1>
      </div>

      <Form>
        <Form.Group className="mb-4" controlId="formTitle">
          <Form.Label className="fw-bold d-flex align-items-center">
            Título del Formulario
            <OverlayTrigger
              placement="top"
              overlay={renderHelpTooltip("Los usuarios verán este título al completar la encuesta.")}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-info" />
            </OverlayTrigger>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Introduce el título de tu formulario"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            size="lg"
          />
        </Form.Group>

        <Card className="bg-light border-0 mb-4 shadow-sm">
          <Card.Body>
            <h5 className="mb-3 text-primary d-flex align-items-center">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Añadir Nueva Pregunta
            </h5>
            <Row className="mb-3">
              <Col md={7}>
                <Form.Group controlId="questionText">
                  <Form.Label>Texto de la Pregunta</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: ¿Cómo calificaría nuestro servicio?"
                    value={currentQuestionText}
                    onChange={(e) => setCurrentQuestionText(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId="questionType">
                  <Form.Label>Tipo de Respuesta</Form.Label>
                  <Form.Select
                    value={currentQuestionType}
                    onChange={(e) => setCurrentQuestionType(e.target.value as QuestionType)}
                  >
                    <option value="text">Texto Corto (Línea única)</option>
                    <option value="textarea">Párrafo (Múltiples líneas)</option>
                    <option value="radio">Opción Única (Botones de selección)</option>
                    <option value="checkbox">Opción Múltiple (Casillas de verificación)</option>
                    <option value="date">Fecha</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {(currentQuestionType === "radio" || currentQuestionType === "checkbox") && (
              <Form.Group className="mb-3" controlId="questionOptions">
                <Form.Label className="d-flex align-items-center">
                  Opciones
                  <OverlayTrigger
                    placement="top"
                    overlay={renderHelpTooltip("Separa las opciones con comas.")}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="ms-1 text-info small" />
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Excelente, Bueno, Regular, Malo"
                  value={currentOptions}
                  onChange={(e) => setCurrentOptions(e.target.value)}
                />
              </Form.Group>
            )}

            <Button variant="primary" onClick={handleAddQuestion} className="w-100">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Añadir Pregunta
            </Button>
          </Card.Body>
        </Card>

        <h3 className="my-4 border-bottom pb-2 d-flex align-items-center">
          Preguntas Actuales
          <span className="ms-auto badge bg-primary fs-6">{questions.length} personalizadas</span>
        </h3>
        
        {questions.length === 0 ? (
          <Alert variant="warning" className="text-center py-4 border-0 shadow-sm bg-warning-subtle">
            <FontAwesomeIcon icon={faInfoCircle} size="2x" className="mb-3 text-warning" />
            <p className="mb-0 fw-bold">No hay preguntas personalizadas.</p>
            <p className="small mb-0">¡Añade al menos una para que el formulario sea útil!</p>
          </Alert>
        ) : (
          questions.map((q, index) => (
            <Card key={q.id} className="mb-3 border-start border-primary border-4 shadow-sm overflow-hidden">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">{index + 1}. {q.text}</h5>
                  <div className="text-muted small d-flex align-items-center flex-wrap gap-2">
                    <span className="badge bg-secondary-subtle text-secondary border">{q.type}</span>
                    {q.options && (
                      <div className="d-flex gap-1">
                        {q.options.map((opt, i) => (
                          <span key={i} className="badge bg-light text-dark border-0 border-bottom">{opt}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="link"
                  className="text-danger p-0 ms-2"
                  title="Eliminar pregunta"
                  onClick={() => handleRemoveQuestion(q.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </Card.Body>
            </Card>
          ))
        )}

        <div className="bg-white p-4 border-0 shadow-sm rounded mb-5 mt-5">
          <h5 className="text-secondary border-bottom pb-2 mb-3 d-flex align-items-center">
            Campos de Contacto (Protegidos)
            <OverlayTrigger
              placement="top"
              overlay={renderHelpTooltip("Estos campos son obligatorios y no se pueden modificar.")}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="ms-2 text-muted fs-6" />
            </OverlayTrigger>
          </h5>
          <p className="small text-muted mb-3">
            Estos campos se mantienen fijos para asegurar la integridad de las respuestas anteriores y el seguimiento de los usuarios.
          </p>
          <div className="d-flex flex-wrap gap-3">
            {["Nombre", "Apellido", "Email", "Teléfono"].map(f => (
              <div key={f} className="px-3 py-2 bg-light rounded-pill border small fw-bold text-secondary">
                {f} <span className="text-danger">*</span>
              </div>
            ))}
          </div>
        </div>

        <div className="d-grid gap-2 mb-5">
          <Button variant="success" onClick={handleSaveForm} size="lg" className="py-3 shadow-sm">
            <FontAwesomeIcon icon={faSave} className="me-2" />
            Guardar Todos los Cambios
          </Button>
          <Button variant="outline-secondary" onClick={() => router.back()} className="py-2">
            Cancelar y volver
          </Button>
        </div>
      </Form>
    </Container>
  );
}
